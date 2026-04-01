import { useEffect, useMemo, useState } from "react";
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import Person from '../../icons/person.svg';
import Alarm from '../../icons/alarm.svg';
import Now from '../../icons/state.svg';
import Position from '../../icons/position.svg';
import Direction from '../../icons/direction.svg';
import Quick from '../../icons/quick.svg';
import Speech from '../../icons/speech.svg';
import {
  createSavedCafe,
  createSavedRestaurant,
  fetchCafeImages,
  fetchCafesByCity,
  fetchCitiesByNationality,
  fetchNationalities,
  fetchRestaurantImages,
  fetchRestaurantsByCity,
} from '../../services';

const CHIPS = [
  { id: 'restaurant', label: '#식당' },
  { id: 'cafe', label: '#카페' },
  { id: 'shopping', label: '#쇼핑' },
  { id: 'fun', label: '#놀거리' },
];

function ChipRow({ activeId, onSelect }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipRow}
    >
      {CHIPS.map((c) => {
        const active = c.id === activeId;
        return (
          <Pressable
            key={c.id}
            onPress={() => onSelect(c.id)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text
              style={[styles.chipText, active && styles.chipTextActive]}
              numberOfLines={1}
            >
              {c.label}
            </Text>
          </Pressable>
        );
      })}
      <Pressable style={styles.chip} accessibilityLabel="필터 추가">
        <Text style={styles.chipText}>+</Text>
      </Pressable>
    </ScrollView>
  );
}

export function MainScreen() {
  const [activeChip, setActiveChip] = useState('restaurant');
  const [places, setPlaces] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingPlaceId, setSavingPlaceId] = useState(null);
  const navigation = useNavigation();

  const activePlaceType = useMemo(() => {
    if (activeChip === 'cafe') {
      return 'cafe';
    }

    return 'restaurant';
  }, [activeChip]);

  async function loadBaseLocation() {
    const nationalitiesResponse = await fetchNationalities();
    const nationalities = nationalitiesResponse?.nationalities ?? [];

    if (nationalities.length === 0) {
      setSelectedCity(null);
      return null;
    }

    const nationalityId = nationalities[0].id;
    const citiesResponse = await fetchCitiesByNationality(nationalityId);
    const cities = citiesResponse?.cities ?? [];

    if (cities.length === 0) {
      setSelectedCity(null);
      return null;
    }

    const city = cities[0];
    setSelectedCity(city);
    return city;
  }

  async function enrichPlacesWithImages(items, type) {
    const imageRequests = items.map(async (item) => {
      try {
        const imageResponse = type === 'restaurant'
          ? await fetchRestaurantImages(item.id)
          : await fetchCafeImages(item.id);

        const images = imageResponse?.images ?? [];
        return {
          ...item,
          imageUrl: images[0]?.imageUrl || null,
        };
      } catch {
        return {
          ...item,
          imageUrl: null,
        };
      }
    });

    return Promise.all(imageRequests);
  }

  async function loadPlaces() {
    setLoading(true);
    setError(null);

    try {
      const city = selectedCity ?? await loadBaseLocation();

      if (!city?.id) {
        setPlaces([]);
        setLoading(false);
        return;
      }

      if (activePlaceType === 'cafe') {
        const cafeResponse = await fetchCafesByCity(city.id);
        const cafes = cafeResponse?.cafes ?? [];
        const mapped = await enrichPlacesWithImages(cafes, 'cafe');
        setPlaces(mapped);
      } else {
        const restaurantResponse = await fetchRestaurantsByCity(city.id);
        const restaurants = restaurantResponse?.restaurants ?? [];
        const mapped = await enrichPlacesWithImages(restaurants, 'restaurant');
        setPlaces(mapped);
      }
    } catch (requestError) {
      setError(requestError?.message ?? '메인 데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlaces();
  }, [activePlaceType]);

  async function handleSavePlace(placeId) {
    setSavingPlaceId(placeId);
    setError(null);

    try {
      if (activePlaceType === 'cafe') {
        await createSavedCafe(placeId);
      } else {
        await createSavedRestaurant(placeId);
      }
    } catch (requestError) {
      setError(requestError?.message ?? '저장에 실패했습니다. accessToken을 확인해주세요.');
    } finally {
      setSavingPlaceId(null);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.homeheader}>
        <Alarm />
        <Person />
      </View>

      <View style={{ marginBottom: 25 }}>
        <Now style={{ marginBottom: 10 }} />
        <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{selectedCity?.name || '도시 선택'}</Text>
          <Position width={18} height={18} />
        </View>
        <Text style={{ fontSize: 14, color: '#818181' }}>{selectedCity?.name || 'City not loaded'}</Text>
      </View>

      <View style={styles.quickmenu}>
        <TouchableWithoutFeedback onPress={() => navigation.navigate('Nearby', { cityId: selectedCity?.id })}>
          <View style={styles.nearbyMingler}>
            <LinearGradient
              colors={['rgba(1, 105, 254, 0.5)', 'rgb(1, 105, 254)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 20 }}>근처 밍글러</Text>
              <Direction width={18} height={18} />
            </View>
            <View>
              <Text style={{ color: 'white', fontSize: 16 }}>도시 밍글 모집글을{`\n`}바로 확인해보세요</Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
        <View style={{ width: 170, justifyContent: 'space-between' }}>
          <TouchableWithoutFeedback onPress={() => navigation.navigate('QuickMatch')}>
            <View style={styles.quickmenuRight}>
              <Quick />
              <Text style={styles.menuText}>빠른 매칭</Text>
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={() => navigation.navigate('Chats')}>
            <View style={styles.quickmenuRight}>
              <Speech />
              <Text style={styles.menuText}>로컬 커뮤니티</Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </View>

      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>실시간 인기</Text>
        <Text style={styles.sectionTime}>{activePlaceType === 'restaurant' ? 'restaurant' : 'cafe'}</Text>
      </View>

      <ChipRow activeId={activeChip} onSelect={setActiveChip} />

      <View style={styles.popularPanel}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {loading ? <Text style={styles.infoText}>로딩 중...</Text> : null}
        {!loading && places.length === 0 ? <Text style={styles.infoText}>표시할 장소가 없습니다.</Text> : null}

        <View style={styles.placesList}>
          {places.slice(0, 3).map((place, index) => (
            <Pressable key={place.id} style={styles.placeCard}>
              <ImageBackground
                source={place.imageUrl ? { uri: place.imageUrl } : require('../../images/bookmarkBackground.png')}
                style={styles.placeImage}
                imageStyle={styles.placeImageRadius}
              >
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>
                <Pressable
                  style={styles.bookmarkBtn}
                  hitSlop={12}
                  accessibilityLabel="저장"
                  onPress={() => handleSavePlace(place.id)}
                  disabled={savingPlaceId === place.id}
                >
                  <Ionicons name="bookmark-outline" size={22} color={'#ffffff'} />
                </Pressable>
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.75)']}
                  style={styles.placeGradient}
                />
                <View style={styles.placeFooter}>
                  <View style={styles.placeTextCol}>
                    <Text style={styles.placeNameKo}>{place.name}</Text>
                    <Text style={styles.placeNameEn}>{place.address || '-'}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={22} color={'#ffffff'} />
                </View>
              </ImageBackground>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={styles.morePlacesRow}
          accessibilityRole="button"
          accessibilityLabel="인기 장소 더보기"
          onPress={loadPlaces}
        >
          <Text style={styles.morePlacesText}>인기 장소 새로고침</Text>
          <Ionicons name="chevron-forward" size={16} color={'#818181'} />
        </Pressable>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 25,
    backgroundColor: '#f5f6f8'
  },
  homeheader: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 15,
    marginBottom: 30,
  },
  quickmenu: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  nearbyMingler: {
    width: 170,
    height: 170,
    padding: 14,
    justifyContent: 'space-between',
    borderRadius: 20,
    overflow: 'hidden',
  },
  quickmenuRight: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 14,
    height: 80,
    justifyContent: 'center',
  },
  menuText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  sectionTime: {
    fontSize: 14,
    color: '#818181',
    fontWeight: '500',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 4,
    marginBottom: 18,
  },
  chip: {
    borderRadius: 19,
    height: 26,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  chipActive: {
    backgroundColor: '#0169FE',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#818181',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  popularPanel: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    paddingBottom: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  errorText: {
    color: '#C62828',
    fontSize: 13,
    marginBottom: 8,
  },
  infoText: {
    color: '#818181',
    fontSize: 13,
    marginBottom: 8,
  },
  placesList: {
    flexDirection: 'column',
    gap: 14,
  },
  morePlacesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    paddingBottom: 6,
    gap: 2,
  },
  morePlacesText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#818181',
  },
  placeCard: {
    borderRadius: 18,
    overflow: 'hidden',
    height: 155,
  },
  placeImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  placeImageRadius: {
    borderRadius: 18,
  },
  rankBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#0169FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  bookmarkBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 108,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  placeFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 28,
  },
  placeTextCol: {
    flex: 1,
    marginRight: 8,
  },
  placeNameKo: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  placeNameEn: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '500',
  },
})
