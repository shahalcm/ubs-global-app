import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Dimensions,
  RefreshControl,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getProductImageUrl } from "../../../utils/image";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import api from "../../../services/api";
import { CategoryCard } from "../../../components/shared/CategoryCard";
import * as Location from "expo-location";
import { useAuth } from "../../../context/AuthContext";
import { updateUserLocation } from "../../../services/userService";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const CATEGORIES = [
  {
    id: "1",
    name: "Fashion",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=200&q=80",
  },
  {
    id: "2",
    name: "Mobiles",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&q=80",
  },
  {
    id: "3",
    name: "Furniture",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&q=80",
  },
  {
    id: "4",
    name: "Cosmetics",
    image:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&q=80",
  },
  {
    id: "5",
    name: "Grocery",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80",
  },
  {
    id: "6",
    name: "Electronics",
    image:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&q=80",
  },
  {
    id: "7",
    name: "Medicines",
    image:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&q=80",
  },
  {
    id: "8",
    name: "Home & Kitchen",
    image:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&q=80",
  },
  {
    id: "9",
    name: "Spare Parts",
    image: "Spare Parts",
  },
  {
    id: "10",
    name: "Perfumes",
    image: "Perfumes",
  },
  {
    id: "11",
    name: "Service Portal",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&q=80",
  },
  {
    id: "12",
    name: "Real Estate",
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&q=80",
  },
  {
    id: "13",
    name: "Building Materials",
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200&q=80",
  },
  {
    id: "14",
    name: "Machinery",
    image:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&q=80",
  },
  {
    id: "15",
    name: "Oils",
    image: "Oils",
  },
  {
    id: "16",
    name: "Job Portal",
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=200&q=80",
  },
];
const FEATURED_PRODUCTS = [
  {
    id: "1",
    name: "Smartwatch X1",
    category: "Electronics",
    price: "$199.00",
    image:
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&q=80",
  },
  {
    id: "2",
    name: "Leather Handbag",
    category: "Fashion",
    price: "$149.00",
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80",
  },
  {
    id: "3",
    name: "Wireless Earbuds",
    category: "Electronics",
    price: "$89.00",
    image:
      "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&q=80",
  },
];

const BANNERS = [
  {
    id: "1",
    title: "Global Shipping & Logistics",
    subtitle: "LOGISTICS EXPERT",
    btn: "Get a Quote",
    image:
      "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=700&q=80",
  },
  {
    id: "2",
    title: "Premium Import Deals",
    subtitle: "LIMITED OFFER",
    btn: "Shop Now",
    image:
      "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=700&q=80",
  },
];



export default function HomeScreen() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [activeBanner, setActiveBanner] = useState(0);
  const [categories, setCategories] = useState(CATEGORIES);
  const [banners, setBanners] = useState(BANNERS);
  const [featuredProducts, setFeaturedProducts] = useState(FEATURED_PRODUCTS);
  const [refreshing, setRefreshing] = useState(false);

  const { user, updateUser } = useAuth();
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [pincode, setPincode] = useState("");
  const [manualCity, setManualCity] = useState("");
  const [manualState, setManualState] = useState("");
  const [manualCountry, setManualCountry] = useState("");
  const [manualAddress, setManualAddress] = useState("");

  React.useEffect(() => {
    if (locationModalVisible && user?.location) {
      setManualCity(user.location.city || "");
      setManualState(user.location.state || "");
      setManualCountry(user.location.country || "");
      setManualAddress(user.location.fullAddress || "");
    }
  }, [locationModalVisible, user]);

  const resolveLocationFromPincode = async (code) => {
    try {
      const geocoded = await Location.geocodeAsync(code);
      if (geocoded && geocoded.length > 0) {
        const { latitude, longitude } = geocoded[0];
        const rev = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (rev && rev.length > 0) {
          const first = rev[0];
          return {
            latitude,
            longitude,
            city: first.city || first.subregion || first.district || "",
            state: first.region || "",
            country: first.country || "",
            fullAddress: [
              first.name,
              first.street,
              first.subregion,
              first.city,
              first.region,
              code,
              first.country
            ].filter(Boolean).join(", ")
          };
        }
      }
    } catch (e) {
      console.log("Geocoding pincode error:", e);
    }
    return null;
  };

  const handleGPSUpdate = async () => {
    setLocLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = loc.coords;
        const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (geocode && geocode.length > 0) {
          const first = geocode[0];
          const resolvedLoc = {
            latitude,
            longitude,
            city: first.city || first.subregion || first.district || "",
            state: first.region || "",
            country: first.country || "",
            fullAddress: [
              first.name,
              first.street,
              first.subregion,
              first.city,
              first.region,
              first.postalCode,
              first.country
            ].filter(Boolean).join(", ")
          };
          const res = await updateUserLocation(resolvedLoc);
          if (res.success) {
            updateUser(res.user);
            Alert.alert(t('Success'), t('Location updated successfully'));
            setLocationModalVisible(false);
          }
        } else {
          Alert.alert(t('Error'), t('Failed to reverse geocode GPS location.'));
        }
      } else {
        Alert.alert(t('Permission Denied'), t('Location permission is required to fetch GPS coordinates.'));
      }
    } catch (error) {
      console.log("GPS update error:", error);
      Alert.alert(t('Error'), t('Failed to get current location.'));
    } finally {
      setLocLoading(false);
    }
  };

  const handleManualUpdate = async () => {
    setLocLoading(true);
    try {
      let resolvedLoc = null;
      if (pincode.trim()) {
        resolvedLoc = await resolveLocationFromPincode(pincode.trim());
      }
      
      if (!resolvedLoc) {
        if (!manualCity.trim() || !manualCountry.trim()) {
          Alert.alert(t('Validation Error'), t('City and Country are required for manual editing.'));
          setLocLoading(false);
          return;
        }
        
        let latitude = 0;
        let longitude = 0;
        try {
          const searchString = `${manualAddress || ''} ${manualCity} ${manualState || ''} ${manualCountry}`.trim();
          const geocoded = await Location.geocodeAsync(searchString);
          if (geocoded && geocoded.length > 0) {
            latitude = geocoded[0].latitude;
            longitude = geocoded[0].longitude;
          }
        } catch (e) {
          console.log("Geocoding manual address error:", e);
        }

        resolvedLoc = {
          latitude,
          longitude,
          city: manualCity.trim(),
          state: manualState.trim(),
          country: manualCountry.trim(),
          fullAddress: manualAddress.trim() || `${manualCity}, ${manualState ? manualState + ', ' : ''}${manualCountry}`
        };
      }

      const res = await updateUserLocation(resolvedLoc);
      if (res.success) {
        updateUser(res.user);
        Alert.alert(t('Success'), t('Location updated successfully'));
        setLocationModalVisible(false);
        setPincode("");
      }
    } catch (error) {
      console.log("Manual update error:", error);
      Alert.alert(t('Error'), t('Failed to update location.'));
    } finally {
      setLocLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  }, []);

  const handleSearch = () => {
    if (!search.trim()) return;
    router.push({
      pathname: "/(buyer)/product-listing",
      params: { search: search.trim() },
    });
  };
  React.useEffect(() => {
    const loadCachedData = async () => {
      try {
        const cachedCats = await AsyncStorage.getItem('ubs_categories');
        const cachedBanners = await AsyncStorage.getItem('ubs_banners');
        if (cachedCats) {
          setCategories(JSON.parse(cachedCats));
        }
        if (cachedBanners) {
          setBanners(JSON.parse(cachedBanners));
        }
      } catch (err) {
        console.log('Error loading cached home data:', err);
      }
    };

    loadCachedData();
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      const [categoriesRes, productsRes, bannersRes] = await Promise.all([
        api.get('/categories'),
        api.get('/products?limit=10&sort=newest'),
        api.get('/banners').catch(() => null)
      ]);

      if (categoriesRes?.data?.categories) {
        const apiCategories = categoriesRes.data.categories;
        const merged = [...CATEGORIES];
        apiCategories.forEach(apiCat => {
          const index = merged.findIndex(c => 
            c.name.replace(/\s+/g, ' ').toLowerCase() === apiCat.name.replace(/\s+/g, ' ').toLowerCase()
          );
          if (index !== -1) {
            merged[index] = { ...merged[index], ...apiCat, name: merged[index].name };
          } else {
            merged.push(apiCat);
          }
        });
        setCategories(merged);
        await AsyncStorage.setItem('ubs_categories', JSON.stringify(merged)).catch(() => {});
      }
      
      if (productsRes?.data?.products) {
        setFeaturedProducts(productsRes.data.products);
      }

      if (bannersRes?.data?.banners && bannersRes.data.banners.length > 0) {
        const apiBanners = bannersRes.data.banners;
        setBanners(apiBanners);
        await AsyncStorage.setItem('ubs_banners', JSON.stringify(apiBanners)).catch(() => {});
      }
    } catch (error) {
      console.log("Home load error:", error);
    }
  };



  const renderFeaturedProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() =>
        router.push({
          pathname: "/(buyer)/product-details",
          params: { id: item._id || item.id },
        })
      }
    >
      <Image
        source={{ uri: getProductImageUrl(item.images?.[0] || item.image) }}
        style={styles.productImage}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productCategory} numberOfLines={1}>{t(item.category?.name || item.category)}</Text>
        <Text style={styles.productName} numberOfLines={1}>{t(item.title || item.name)}</Text>
        {!(
          (item.category?.name || item.category || '').toLowerCase().trim() === 'job portal' ||
          (item.category?.name || item.category || '').toLowerCase().trim() === 'service portal'
        ) && <Text style={styles.productPrice}>${item.price}</Text>}
        {item.sellerId && (
          <Text style={{ fontSize: 10, color: '#888', marginTop: 2 }} numberOfLines={1}>
            Sold by: {item.sellerId.shopName}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.push("/(buyer)/drawer")}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>UBS Global</Text>
        <View style={styles.topRight}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push("/(buyer)/notifications")}
          >
            <MaterialCommunityIcons name="bell-outline" size={24} color="#1a237e" />
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1a237e']}
            tintColor="#1a237e"
          />
        }
      >
        {/* Search Bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <TouchableOpacity onPress={handleSearch}>
              <Text style={styles.searchIcon}>🔍</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.searchInput}
              placeholder={t('search_placeholder')}
              placeholderTextColor="#aaa"
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>
        </View>

        {/* Location Display Row */}
        <TouchableOpacity 
          style={styles.locationContainer} 
          onPress={() => setLocationModalVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.locationPin}>📍</Text>
          <View style={styles.locationTextCol}>
            <Text style={styles.locationLabel}>{t('Current Location')}</Text>
            <Text style={styles.locationValue} numberOfLines={1}>
              {user?.location?.fullAddress || 
               (user?.location?.city ? `${user.location.city}, ${user.location.state || ''}, ${user.location.country || ''}`.replace(/,\s*,/, ',').trim() : t('Set Location'))}
            </Text>
          </View>
          <Text style={styles.locationArrow}>›</Text>
        </TouchableOpacity>

        {/* Location Update Modal */}
        <Modal
          visible={locationModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setLocationModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('Update Location')}</Text>
                <TouchableOpacity onPress={() => setLocationModalVisible(false)}>
                  <Text style={styles.modalCloseBtn}>✕</Text>
                </TouchableOpacity>
              </View>

              {locLoading ? (
                <View style={styles.modalLoading}>
                  <ActivityIndicator size="large" color="#1a237e" />
                  <Text style={styles.loadingText}>{t('Updating Location...')}</Text>
                </View>
              ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* GPS Button */}
                  <TouchableOpacity style={styles.gpsBtn} onPress={handleGPSUpdate}>
                    <Text style={styles.gpsBtnIcon}>📡</Text>
                    <Text style={styles.gpsBtnText}>{t('Use GPS / Current Location')}</Text>
                  </TouchableOpacity>

                  <View style={styles.modalOrRow}>
                    <View style={styles.orLine} />
                    <Text style={styles.modalOrText}>{t('OR')}</Text>
                    <View style={styles.orLine} />
                  </View>

                  {/* Pincode Input */}
                  <Text style={styles.modalInputLabel}>{t('Enter Pincode')}</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. 682024"
                    value={pincode}
                    onChangeText={setPincode}
                    keyboardType="numeric"
                    maxLength={6}
                  />

                  <Text style={styles.modalOrTextSmall}>{t('or enter details completely:')}</Text>

                  {/* Manual Fields */}
                  <Text style={styles.modalInputLabel}>{t('City')}</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder={t('City')}
                    value={manualCity}
                    onChangeText={setManualCity}
                  />

                  <Text style={styles.modalInputLabel}>{t('State')}</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder={t('State')}
                    value={manualState}
                    onChangeText={setManualState}
                  />

                  <Text style={styles.modalInputLabel}>{t('Country')}</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder={t('Country')}
                    value={manualCountry}
                    onChangeText={setManualCountry}
                  />

                  <Text style={styles.modalInputLabel}>{t('Full Address')}</Text>
                  <TextInput
                    style={[styles.modalInput, { height: 60 }]}
                    placeholder={t('Full Address')}
                    value={manualAddress}
                    onChangeText={setManualAddress}
                    multiline
                  />

                  <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleManualUpdate}>
                    <Text style={styles.modalSubmitText}>{t('Save Location')}</Text>
                  </TouchableOpacity>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>

        {/* Browse by Category */}
        <Text style={styles.sectionTitle}>{t('browse_category')}</Text>
        <View style={styles.categoryGridContainer}>
          {categories.map((item) => (
            <CategoryCard
              key={item._id || item.id || item.name}
              label={t(item.name)}
              image={item.image}
              onPress={() => {
                if (item.name && item.name.toLowerCase() === 'real estate') {
                  router.push("/(buyer)/real-estate");
                } else {
                  router.push({
                    pathname: "/(buyer)/product-listing",
                    params: { category: item.name },
                  });
                }
              }}
            />
          ))}
        </View>

        {/* Banner Slider */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(
              e.nativeEvent.contentOffset.x / (width - 32),
            );
            setActiveBanner(index);
          }}
          style={styles.bannerScroll}
        >
          {banners.map((banner) => (
            <View key={banner._id || banner.id} style={styles.bannerCard}>
              <Image
                source={{ uri: banner.image }}
                style={styles.bannerImage}
                contentFit="cover"
                transition={200}
              />
              <View style={styles.bannerOverlay}>
                {banner.subtitle ? (
                  <Text style={styles.bannerSubtitle}>{t(banner.subtitle)}</Text>
                ) : (
                  <Text style={styles.bannerSubtitle}>{t('LIMITED OFFER')}</Text>
                )}
                <Text style={styles.bannerTitle}>{t(banner.title)}</Text>
                <TouchableOpacity 
                  style={styles.bannerBtn}
                  onPress={() => router.push(banner.linkUrl || "/(buyer)/products")}
                >
                  <Text style={styles.bannerBtnText}>{t(banner.btn || 'Shop Now')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Banner Dots */}
        <View style={styles.dotsRow}>
          {banners.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, activeBanner === i && styles.dotActive]}
            />
          ))}
        </View>

        {/* Featured Products */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>{t('featured_products')}</Text>
          <TouchableOpacity onPress={() => router.push("/(buyer)/products")}>
            <Text style={styles.viewAll}>{t('view_all')}</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={featuredProducts}
          renderItem={renderFeaturedProduct}
          keyExtractor={(item, index) => (item._id || item.id || index).toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredList}
        />

        {/* Secure Payments Card */}
        <View style={styles.secureCard}>
          <Text style={styles.secureTitle}>{t('secure_payments')}</Text>
          <Text style={styles.secureDesc}>
            {t('secure_payments_desc')}
          </Text>
          <View style={styles.secureBadgeRow}>
            <View style={styles.secureBadge}>
              <Text style={styles.secureBadgeIcon}>✅</Text>
              <Text style={styles.secureBadgeText}>{t('verified_vendors')}</Text>
            </View>
            <View style={styles.secureBadge}>
              <Text style={styles.secureBadgeIcon}>🔒</Text>
              <Text style={styles.secureBadgeText}>{t('escrow_support')}</Text>
            </View>
          </View>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&q=80",
            }}
            style={styles.secureImage}
            contentFit="cover"
            transition={200}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fc",
  },

  // Top Bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  menuIcon: {
    fontSize: 22,
    color: "#1a237e",
  },
  topTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a237e",
  },
  topRight: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  iconBtn: {
    position: "relative",
  },
  topIcon: {
    fontSize: 22,
    color: "#1a237e",
  },
  cartBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#29b6f6",
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    fontSize: 9,
    color: "#fff",
    fontWeight: "700",
  },

  scroll: {
    flexGrow: 1,
    paddingBottom: 90,
  },

  // Search
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    backgroundColor: "#fff",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f7fc",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: "#e8ecf4",
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  filterBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#f5f7fc",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e8ecf4",
  },
  filterIcon: {
    fontSize: 18,
    color: "#1a237e",
  },

  // Section
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a237e",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  viewAll: {
    fontSize: 13,
    color: "#29b6f6",
    fontWeight: "600",
  },

  // Categories
  categoryGridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    justifyContent: "flex-start",
  },
  categoryItem: {
    width: "25%",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  categoryCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: "hidden",
    backgroundColor: "#e8ecf4",
    marginBottom: 6,
  },
  categoryImage: {
    width: "100%",
    height: "100%",
  },
  categoryName: {
    fontSize: 11,
    color: "#444",
    textAlign: "center",
    lineHeight: 15,
  },

  // Banner
  bannerScroll: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  bannerCard: {
    width: width - 32,
    height: 160,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  bannerOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  bannerSubtitle: {
    fontSize: 10,
    color: "#29b6f6",
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 4,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  bannerBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#29b6f6",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bannerBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ccc",
  },
  dotActive: {
    backgroundColor: "#1a237e",
    width: 16,
  },

  // Featured Products
  featuredList: {
    paddingHorizontal: 16,
    gap: 14,
  },
  productCard: {
    width: 180,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#eee",
  },
  productImage: {
    width: "100%",
    height: 160,
    backgroundColor: "#f5f5f5",
  },
  productInfo: {
    padding: 10,
  },
  productCategory: {
    fontSize: 11,
    color: "#888",
    marginBottom: 2,
  },
  productName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#222",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#29b6f6",
  },

  // Secure Card
  secureCard: {
    margin: 16,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#eee",
  },
  secureTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a237e",
    marginBottom: 10,
  },
  secureDesc: {
    fontSize: 13,
    color: "#666",
    lineHeight: 20,
    marginBottom: 14,
  },
  secureBadgeRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  secureBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  secureBadgeIcon: {
    fontSize: 14,
  },
  secureBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1a237e",
  },
  secureImage: {
    width: "100%",
    height: 160,
    borderRadius: 12,
  },

  // Location Styles
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  locationPin: {
    fontSize: 18,
    marginRight: 10,
  },
  locationTextCol: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 10,
    color: '#888',
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  locationValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a237e',
  },
  locationArrow: {
    fontSize: 18,
    color: '#ccc',
    marginLeft: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a237e',
  },
  modalCloseBtn: {
    fontSize: 18,
    color: '#666',
    padding: 4,
  },
  modalLoading: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  gpsBtn: {
    backgroundColor: '#e8eaf6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#c5cae9',
  },
  gpsBtnIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  gpsBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a237e',
  },
  modalOrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  modalOrText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  modalOrTextSmall: {
    fontSize: 11,
    color: '#999',
    marginTop: 8,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  modalInputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: '#f5f6fa',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  modalSubmitBtn: {
    backgroundColor: '#1a237e',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  modalSubmitText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
