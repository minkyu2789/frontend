import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../auth";
import { decodeUserIdFromToken } from "../../auth/userId";
import {
  createQuickMatchSocketClient,
  publishCreateQuickMatch,
  subscribeUserQuickMatches,
} from "../../services/quickMatchSocketService";

const OPTION_ITEMS = [
  { key: "MINGLERS", title: "현지 밍글러", subtitle: "맛집 탐방" },
  { key: "LOCALS", title: "여행자 밍글러", subtitle: "여행지 공유" },
  { key: "ANY", title: "무관", subtitle: "상관없어요" },
];
const MIN_PROGRESS_VISIBLE_MS = 1200;

function formatElapsed(seconds) {
  const safe = Number.isFinite(seconds) && seconds >= 0 ? Math.floor(seconds) : 0;
  const minutes = String(Math.floor(safe / 60)).padStart(2, "0");
  const remainSeconds = String(safe % 60).padStart(2, "0");
  return `${minutes}:${remainSeconds}`;
}

export function QuickMatch({ navigation, route }) {
  const { token } = useAuth();
  const userId = useMemo(() => Number(decodeUserIdFromToken(token) || 0), [token]);
  const [selected, setSelected] = useState("MINGLERS");
  const [submitting, setSubmitting] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState(null);
  const [socketReady, setSocketReady] = useState(false);
  const startedAtRef = useRef(0);
  const elapsedTimerRef = useRef(null);
  const mountedRef = useRef(true);
  const pendingRequestRef = useRef({
    cityId: null,
    targetType: null,
    quickMatchId: null,
  });
  const clientRef = useRef(null);
  const userSubscriptionRef = useRef(null);
  const cityId = useMemo(() => Number(route?.params?.cityId || 1), [route?.params?.cityId]);
  const selectedLabel = useMemo(
    () => OPTION_ITEMS.find((item) => item.key === selected)?.title || selected,
    [selected],
  );

  useEffect(() => {
    if (!userId) {
      return undefined;
    }

    const client = createQuickMatchSocketClient({
      onConnect: () => {
        if (!mountedRef.current) {
          return;
        }
        setSocketReady(true);
      },
      onError: (message) => {
        if (!mountedRef.current) {
          return;
        }
        setSocketReady(false);
        setError(message || "소켓 연결 오류");
      },
    });

    clientRef.current = client;
    client.activate();

    return () => {
      userSubscriptionRef.current?.unsubscribe();
      userSubscriptionRef.current = null;
      client.deactivate();
      clientRef.current = null;
      if (mountedRef.current) {
        setSocketReady(false);
      }
    };
  }, [userId]);

  useEffect(() => {
    if (!socketReady || !clientRef.current || !userId) {
      return;
    }

    userSubscriptionRef.current?.unsubscribe();
    userSubscriptionRef.current = subscribeUserQuickMatches(clientRef.current, userId, (event) => {
      if (!mountedRef.current) {
        return;
      }

      const pending = pendingRequestRef.current;
      const match = event?.quickMatch;
      const quickMatchId = Number(match?.id || 0);
      const isPendingQuickMatch =
        (pending.quickMatchId && quickMatchId === pending.quickMatchId) ||
        (Number(match?.cityId) === pending.cityId &&
          String(match?.targetType || "") === pending.targetType &&
          Number(match?.requesterUserId) === userId);

      if (event?.eventType === "QUICK_MATCH_CREATED") {
        const isRequester = Number(match?.requesterUserId) === userId;
        if (isRequester && submitting && isPendingQuickMatch) {
          pendingRequestRef.current = {
            ...pending,
            quickMatchId,
          };
        }
      }

      if (event?.eventType === "QUICK_MATCH_ACCEPTED" && submitting && isPendingQuickMatch) {
        setSubmitting(false);
        pendingRequestRef.current = {
          cityId: null,
          targetType: null,
          quickMatchId: null,
        };
        navigation.goBack();
        return;
      }

      if (event?.eventType === "QUICK_MATCH_DECLINED" && submitting && isPendingQuickMatch) {
        setSubmitting(false);
        pendingRequestRef.current = {
          cityId: null,
          targetType: null,
          quickMatchId: null,
        };
        setError("빠른 매칭이 거절되었어요. 다시 시도해 주세요.");
        return;
      }

      if (event?.eventType === "QUICK_MATCH_ERROR" && submitting) {
        setSubmitting(false);
        pendingRequestRef.current = {
          cityId: null,
          targetType: null,
          quickMatchId: null,
        };
        setError(event?.reason || "빠른 매칭 요청 처리에 실패했습니다.");
      }
    });

    return () => {
      userSubscriptionRef.current?.unsubscribe();
      userSubscriptionRef.current = null;
    };
  }, [cityId, navigation, selected, socketReady, submitting, userId]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (elapsedTimerRef.current) {
        clearInterval(elapsedTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!submitting) {
      if (elapsedTimerRef.current) {
        clearInterval(elapsedTimerRef.current);
      }
      return;
    }

    startedAtRef.current = Date.now();
    setElapsedSeconds(0);
    if (elapsedTimerRef.current) {
      clearInterval(elapsedTimerRef.current);
    }

    elapsedTimerRef.current = setInterval(() => {
      if (!mountedRef.current) {
        return;
      }

      const nextElapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
      setElapsedSeconds(nextElapsed);
    }, 1000);

    return () => {
      if (elapsedTimerRef.current) {
        clearInterval(elapsedTimerRef.current);
      }
    };
  }, [submitting]);

  async function handleConfirm() {
    if (!Number.isFinite(cityId) || cityId <= 0) {
      setError("유효한 도시 정보가 없어 빠른 매칭을 생성할 수 없습니다.");
      navigation.goBack();
      return;
    }

    setSubmitting(true);
    setError(null);
    pendingRequestRef.current = {
      cityId,
      targetType: String(selected || "ANY"),
      quickMatchId: null,
    };
    const requestStartedAt = Date.now();
    try {
      if (!clientRef.current?.connected) {
        throw new Error("소켓 연결이 준비되지 않았습니다. 잠시 후 다시 시도해주세요.");
      }
      await publishCreateQuickMatch(clientRef.current, {
        cityId,
        message: null,
        targetType: String(selected || "ANY"),
      });
      const elapsedMs = Date.now() - requestStartedAt;
      if (elapsedMs < MIN_PROGRESS_VISIBLE_MS) {
        await new Promise((resolve) => setTimeout(resolve, MIN_PROGRESS_VISIBLE_MS - elapsedMs));
      }
      if (!mountedRef.current) {
        return;
      }
    } catch (requestError) {
      if (!mountedRef.current) {
        return;
      }
      const message = requestError?.message || "빠른 매칭 생성에 실패했습니다.";
      setError(message);
      setSubmitting(false);
      pendingRequestRef.current = {
        cityId: null,
        targetType: null,
        quickMatchId: null,
      };
      console.warn("[QM CREATE] FAILED", {
        cityId,
        targetType: selected,
        message,
      });
    }
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <View style={styles.topHandle} />
        <View style={styles.headerRow}>
          <Text style={styles.title}>원하는 밍글러를 선택해주세요!</Text>
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color="#111" />
          </Pressable>
        </View>

        <View style={styles.optionsRow}>
          {OPTION_ITEMS.map((option) => {
            const active = selected === option.key;
            return (
              <Pressable key={option.key} style={[styles.optionCard, active && styles.optionCardActive]} onPress={() => setSelected(option.key)}>
                <Text style={[styles.optionTitle, active && styles.optionTitleActive]}>{option.title}</Text>
                <Text style={[styles.optionSubtitle, active && styles.optionSubtitleActive]}>{option.subtitle}</Text>
              </Pressable>
            );
          })}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {!socketReady ? <Text style={styles.metaText}>실시간 연결 중...</Text> : null}

        <Pressable style={[styles.confirmBtn, submitting && styles.confirmBtnDisabled]} onPress={handleConfirm} disabled={submitting}>
          <Text style={styles.confirmText}>{submitting ? "확인 중..." : "확인"}</Text>
        </Pressable>
      </View>

      {submitting ? (
        <View style={styles.progressOverlay}>
          <View style={styles.progressCard}>
            <Pressable style={styles.progressCloseButton} onPress={() => navigation.goBack()}>
              <Ionicons name="close" size={18} color="#334155" />
            </Pressable>
            <Text style={styles.progressTitle}>빠른 매칭 요청 중</Text>
            <Text style={styles.progressTarget}>{selectedLabel}</Text>
            <Text style={styles.progressDescription}>요청이 완료될 때까지 잠시만 기다려 주세요.</Text>
            <Text style={styles.progressElapsedLabel}>경과 시간</Text>
            <Text style={styles.progressElapsedValue}>{formatElapsed(elapsedSeconds)}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.16)",
  },
  modal: {
    width: "90%",
    borderRadius: 16,
    backgroundColor: "#fff",
    padding: 14,
    paddingBottom: 16,
    gap: 12,
  },
  topHandle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D9D9D9",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    flex: 1,
    marginRight: 10,
  },
  optionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  optionCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E4E4E4",
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#F3F3F3",
  },
  optionCardActive: {
    borderColor: "#1C73F0",
    backgroundColor: "#1C73F0",
  },
  optionTitle: {
    color: "#666",
    fontWeight: "700",
    marginBottom: 2,
    fontSize: 13,
  },
  optionTitleActive: {
    color: "#fff",
  },
  optionSubtitle: {
    color: "#8B8B8B",
    fontSize: 11,
  },
  optionSubtitleActive: {
    color: "#EAF2FF",
  },
  confirmBtn: {
    marginTop: 6,
    borderRadius: 24,
    backgroundColor: "#1C73F0",
    height: 46,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmBtnDisabled: {
    opacity: 0.6,
  },
  confirmText: {
    color: "#fff",
    fontSize: 34 / 2,
    fontWeight: "700",
  },
  errorText: {
    color: "#C62828",
    fontSize: 12,
    lineHeight: 16,
  },
  metaText: {
    color: "#64748B",
    fontSize: 12,
  },
  progressOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },
  progressCard: {
    width: "82%",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    paddingTop: 18,
    paddingBottom: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  progressCloseButton: {
    position: "absolute",
    right: 10,
    top: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },
  progressTitle: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  progressTarget: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "700",
    color: "#1D4ED8",
  },
  progressDescription: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 17,
    color: "#475569",
    textAlign: "center",
  },
  progressElapsedLabel: {
    marginTop: 14,
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  progressElapsedValue: {
    marginTop: 2,
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: 1,
  },
});
