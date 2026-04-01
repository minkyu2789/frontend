import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import More from "../../icons/more.svg";
import DirectionBlack from "../../icons/direction_black.svg";
import TravelIcon from "../../icons/travelIcon.svg";
import { useAuth } from "../../auth";
import { fetchTrips, fetchUser } from "../../services";

function decodeUserIdFromToken(token) {
  if (!token) {
    return 1;
  }

  if (token === "master") {
    return 1;
  }

  try {
    const decoded = globalThis.atob ? globalThis.atob(token) : null;
    if (!decoded) {
      return 1;
    }

    if (!decoded.startsWith("userId:")) {
      return 1;
    }

    const value = Number(decoded.replace("userId:", ""));
    return Number.isFinite(value) && value > 0 ? value : 1;
  } catch {
    return 1;
  }
}

function formatTripRange(startDate, endDate) {
  if (!startDate || !endDate) {
    return "-";
  }

  return `${startDate} ~ ${endDate}`;
}

export function MyPage() {
  const { token, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState([]);

  const userId = useMemo(() => decodeUserIdFromToken(token), [token]);

  useEffect(() => {
    async function load() {
      try {
        const [userResponse, tripsResponse] = await Promise.all([
          fetchUser(userId),
          fetchTrips(),
        ]);

        const loadedUser = userResponse?.user ?? null;
        const loadedTrips = (tripsResponse?.trips ?? []).filter((trip) => trip?.userId === userId);

        setUser(loadedUser);
        setTrips(loadedTrips);
      } catch {
        setUser(null);
        setTrips([]);
      }
    }

    load();
  }, [userId]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.blueTop}>
        <View style={styles.topBar}>
          <Pressable onPress={logout}>
            <More />
          </Pressable>
        </View>

        <View>
          <Text style={styles.userCode}>USER #{user?.id ?? "23941"}</Text>
          <Text style={styles.userName}>{user?.name || "야호호"}</Text>
          <View style={styles.tagsRow}>
            {(user?.keywords ?? []).slice(0, 2).map((keyword) => (
              <View key={keyword.id} style={styles.tagPill}><Text style={styles.tagText}>#{keyword.name}</Text></View>
            ))}
            {(user?.keywords ?? []).length === 0 ? (
              <>
                <View style={styles.tagPill}><Text style={styles.tagText}>#역동적인현지체험</Text></View>
                <View style={styles.tagPill}><Text style={styles.tagText}>#휴식</Text></View>
              </>
            ) : null}
          </View>
        </View>
      </View>

      <View style={styles.sheet}>
        <Text style={styles.sectionTitle}>나의 지역</Text>
        <Text style={styles.sectionSubtitle}>지금까지 3명의 밍글러와 함께 했어요!</Text>

        <View style={styles.locationCard}>
          <View style={styles.locationTopRow}>
            <Text style={styles.locationTitle}>서울특별시 마포구</Text>
            <DirectionBlack />
          </View>
          <Text style={styles.locationSub}>Mapo-gu</Text>
          <View style={styles.locationDivider} />
          <Text style={styles.locationMeta}>이 동네에서 102일째 밍글 중!</Text>
        </View>

        <Text style={[styles.sectionTitle, styles.travelSectionTitle]}>여행 기록</Text>
        <Text style={styles.sectionSubtitle}>최근 3개월간 {trips.length || 3}번의 여행을 함께 했어요!</Text>

        <View style={styles.tripList}>
          {(trips.length ? trips : [{ id: "a", title: "일본 오사카", startDate: "2026.03.21", endDate: "2026.03.25" }, { id: "b", title: "상하이", startDate: "2026.03.15", endDate: "2026.03.17" }, { id: "c", title: "싱가포르", startDate: "2026.03.02", endDate: "2026.03.11" }]).slice(0, 3).map((trip) => (
            <View key={trip.id} style={styles.tripCard}>
              <View style={styles.tripHead}>
                <TravelIcon />
                <DirectionBlack />
              </View>
              <Text style={styles.tripTitle}>{trip.title || "여행"}</Text>
              <Text style={styles.tripMeta}>{formatTripRange(trip.startDate, trip.endDate)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.moreRow}>
          <Text style={styles.moreText}>더보기</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1C73F0",
  },
  contentContainer: {
    minHeight: "100%",
  },
  blueTop: {
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 24,
    minHeight: 260,
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  userCode: {
    color: "#BFD6FF",
    fontSize: 22 / 2,
    marginBottom: 4,
    fontWeight: "600",
  },
  userName: {
    color: "#fff",
    fontSize: 44 / 2,
    fontWeight: "700",
    marginBottom: 10,
  },
  tagsRow: {
    flexDirection: "row",
    gap: 8,
  },
  tagPill: {
    backgroundColor: "#fff",
    borderRadius: 13,
    paddingHorizontal: 12,
    height: 26,
    justifyContent: "center",
  },
  tagText: {
    color: "#1C73F0",
    fontWeight: "700",
    fontSize: 12,
  },
  sheet: {
    backgroundColor: "#E7E7E9",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 28,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 36 / 2,
    fontWeight: "700",
    color: "#111",
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 28 / 2,
    color: "#8A8A8A",
    marginBottom: 12,
    fontWeight: "500",
  },
  locationCard: {
    backgroundColor: "#F2F2F3",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 26,
  },
  locationTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  locationTitle: {
    fontSize: 36 / 2,
    fontWeight: "700",
    color: "#111",
  },
  locationSub: {
    fontSize: 14,
    color: "#818181",
    marginBottom: 12,
  },
  locationDivider: {
    borderTopWidth: 1,
    borderTopColor: "#DFDFE2",
    marginBottom: 12,
  },
  locationMeta: {
    color: "#1C73F0",
    fontWeight: "700",
    fontSize: 30 / 2,
  },
  travelSectionTitle: {
    marginTop: 2,
  },
  tripList: {
    gap: 12,
  },
  tripCard: {
    backgroundColor: "#F2F2F3",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 15,
  },
  tripHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  tripTitle: {
    fontSize: 36 / 2,
    fontWeight: "700",
    color: "#111",
    marginBottom: 2,
  },
  tripMeta: {
    fontSize: 14,
    color: "#8A8A8A",
    fontWeight: "600",
  },
  moreRow: {
    alignItems: "center",
    marginTop: 14,
  },
  moreText: {
    color: "#A0A0A0",
    fontSize: 14,
    fontWeight: "700",
  },
});
