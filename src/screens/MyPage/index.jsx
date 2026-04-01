import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import More from "../../icons/more.svg";
import DirectionBlack from "../../icons/direction_black.svg";
import TravelIcon from "../../icons/travelIcon.svg";
import { useAuth } from "../../auth";
import { decodeUserIdFromToken } from "../../auth/userId";
import { fetchTrips, fetchUser } from "../../services";
import { fetchAllCities } from "../../services/placeService";
import { pickCurrentTrip } from "../../utils/trip";

function formatTripRange(startDate, endDate) {
  if (!startDate || !endDate) {
    return "-";
  }

  return `${startDate} ~ ${endDate}`;
}

export function MyPage({ navigation }) {
  const { token, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [currentCity, setCurrentCity] = useState(null);

  const userId = useMemo(() => decodeUserIdFromToken(token), [token]);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        try {
          const [userResponse, tripsResponse, allCities] = await Promise.all([
            fetchUser(userId),
            fetchTrips(),
            fetchAllCities(),
          ]);

          const loadedUser = userResponse?.user ?? null;
          const loadedTrips = (tripsResponse?.trips ?? []).filter((trip) => trip?.userId === userId);
          const currentTrip = pickCurrentTrip(loadedTrips);
          const city = allCities.find((item) => item.id === currentTrip?.cityId) || null;

          setUser(loadedUser);
          setTrips(loadedTrips);
          setCurrentCity(city);
        } catch {
          setUser(null);
          setTrips([]);
          setCurrentCity(null);
        }
      }

      load();
    }, [userId]),
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.blueTop}>
        <View style={styles.topBar}>
          <Pressable onPress={logout}>
            <More />
          </Pressable>
        </View>

        <View>
          <Text style={styles.userCode}>USER #{user?.id ?? "-"}</Text>
          <Text style={styles.userName}>{user?.name || "-"}</Text>
          <View style={styles.tagsRow}>
            {(user?.keywords ?? []).slice(0, 2).map((keyword) => (
              <View key={keyword.id} style={styles.tagPill}><Text style={styles.tagText}>#{keyword.name}</Text></View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.sheet}>
        <Text style={styles.sectionTitle}>나의 지역</Text>
        <Text style={styles.sectionSubtitle}>현재 여행 기준 지역 정보입니다.</Text>

        <View style={styles.locationCard}>
          <View style={styles.locationTopRow}>
            <Text style={styles.locationTitle}>{currentCity?.name || "등록된 여행 지역 없음"}</Text>
            <DirectionBlack />
          </View>
          <Text style={styles.locationSub}>{currentCity?.name || "-"}</Text>
          <View style={styles.locationDivider} />
          <Text style={styles.locationMeta}>현재 여행의 도시를 메인 홈에서 사용합니다.</Text>
        </View>

        <View style={styles.tripHeaderRow}>
          <Text style={[styles.sectionTitle, styles.travelSectionTitle]}>여행 기록</Text>
          <Pressable style={styles.addTripButton} onPress={() => navigation.navigate("CreateTrip")}>
            <Text style={styles.addTripButtonText}>새 여행 추가</Text>
          </Pressable>
        </View>
        <Text style={styles.sectionSubtitle}>총 {trips.length}개의 여행</Text>

        <View style={styles.tripList}>
          {trips.map((trip) => (
            <View key={trip.id} style={styles.tripCard}>
              <View style={styles.tripHead}>
                <TravelIcon />
                <DirectionBlack />
              </View>
              <Text style={styles.tripTitle}>{trip.title || "여행"}</Text>
              <Text style={styles.tripMeta}>{formatTripRange(trip.startDate, trip.endDate)}</Text>
            </View>
          ))}
          {trips.length === 0 ? <Text style={styles.emptyText}>아직 생성된 여행이 없습니다.</Text> : null}
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
    flexWrap: "wrap",
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
  tripHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  addTripButton: {
    backgroundColor: "#1C73F0",
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 28,
    justifyContent: "center",
  },
  addTripButtonText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
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
  emptyText: {
    color: "#888",
    fontSize: 14,
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
