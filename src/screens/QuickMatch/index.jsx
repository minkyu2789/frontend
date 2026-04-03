import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createQuickMatch } from "../../services/quickMatchService";

const OPTION_ITEMS = [
  { key: "MINGLERS", title: "현지 밍글러", subtitle: "맛집 탐방" },
  { key: "LOCALS", title: "여행자 밍글러", subtitle: "여행지 공유" },
  { key: "ANY", title: "무관", subtitle: "상관없어요" },
];

export function QuickMatch({ navigation, route }) {
  const [selected, setSelected] = useState("MINGLERS");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const cityId = useMemo(() => Number(route?.params?.cityId || 1), [route?.params?.cityId]);

  async function handleConfirm() {
    if (!Number.isFinite(cityId) || cityId <= 0) {
      setError("유효한 도시 정보가 없어 빠른 매칭을 생성할 수 없습니다.");
      navigation.goBack();
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await createQuickMatch({
        cityId,
        targetType: selected,
      });
      navigation.goBack();
    } catch (requestError) {
      const message = requestError?.message || "빠른 매칭 생성에 실패했습니다.";
      setError(message);
      console.warn("[QM CREATE] FAILED", {
        cityId,
        targetType: selected,
        message,
      });
    } finally {
      setSubmitting(false);
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

        <Pressable style={[styles.confirmBtn, submitting && styles.confirmBtnDisabled]} onPress={handleConfirm} disabled={submitting}>
          <Text style={styles.confirmText}>{submitting ? "확인 중..." : "확인"}</Text>
        </Pressable>
      </View>
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
});
