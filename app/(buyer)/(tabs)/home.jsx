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
import { router, useFocusEffect } from "expo-router";
import { useTranslation } from "react-i18next";
import api from "../../../services/api";
import { CategoryCard } from "../../../components/shared/CategoryCard";
import * as Location from "expo-location";
import { useAuth } from "../../../context/AuthContext";
import { updateUserLocation } from "../../../services/userService";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getRecentlyViewed } from "../../../services/recentlyViewed";
import { useCart } from "../../../context/CartContext";
import { toggleWishlist } from "../../../services/wishlistService";

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
  const { t, i18n } = useTranslation();
  const { addToCart } = useCart();
  const [search, setSearch] = useState("");
  const [activeBanner, setActiveBanner] = useState(0);
  const [categories, setCategories] = useState(CATEGORIES);
  const [banners, setBanners] = useState(BANNERS);
  const [featuredProducts, setFeaturedProducts] = useState(FEATURED_PRODUCTS);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadRecentlyViewed = React.useCallback(async () => {
    try {
      const items = await getRecentlyViewed();
      setRecentlyViewed(items || []);
    } catch (e) {
      console.log('Error loading recently viewed on home:', e);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadRecentlyViewed();
    }, [loadRecentlyViewed])
  );

  const { user, updateUser } = useAuth();
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [pincode, setPincode] = useState("");
  const [manualCity, setManualCity] = useState("");
  const [manualState, setManualState] = useState("");
  const [manualCountry, setManualCountry] = useState("");
  const [manualAddress, setManualAddress] = useState("");

  const bannerRef = React.useRef(null);

  const openLocationModal = () => {
    if (user?.location) {
      setManualCity(user.location.city || "");
      setManualState(user.location.state || "");
      setManualCountry(user.location.country || "");
      setManualAddress(user.location.fullAddress || "");
    } else {
      setManualCity("");
      setManualState("");
      setManualCountry("");
      setManualAddress("");
    }
    setPincode("");
    setLocationModalVisible(true);
  };

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

  const loadHomeData = React.useCallback(async () => {
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
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  }, [loadHomeData]);

  const handleSearch = () => {
    if (!search.trim()) return;
    router.push({
      pathname: "/(buyer)/product-listing",
      params: { search: search.trim() },
    });
  };

  React.useEffect(() => {
    let active = true;
    const initData = async () => {
      try {
        const cachedCats = await AsyncStorage.getItem('ubs_categories');
        const cachedBanners = await AsyncStorage.getItem('ubs_banners');
        if (active) {
          if (cachedCats) {
            setCategories(JSON.parse(cachedCats));
          }
          if (cachedBanners) {
            setBanners(JSON.parse(cachedBanners));
          }
        }
      } catch (err) {
        console.log('Error loading cached home data:', err);
      }
      
      if (active) {
        await loadHomeData();
      }
    };

    initData();
    return () => {
      active = false;
    };
  }, [loadHomeData]);

  // Autoplay banner logic
  React.useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      const nextIndex = (activeBanner + 1) % banners.length;
      setActiveBanner(nextIndex);
      bannerRef.current?.scrollTo({
        x: nextIndex * (width - 32),
        animated: true,
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [activeBanner, banners.length]);



  const renderFeaturedProduct = ({ item }) => {
    const isOutOfStock = Number(item.stock ?? 0) <= 0;
    const hasDiscount = Boolean(item.comparePrice && Number(item.comparePrice) > Number(item.price));
    const discountPercent = hasDiscount
      ? Math.round(((Number(item.comparePrice) - Number(item.price)) / Number(item.comparePrice)) * 100)
      : 0;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() =>
          router.push({
            pathname: "/(buyer)/product-details",
            params: { id: item._id || item.id },
          })
        }
        activeOpacity={0.9}
      >
        <View style={{ position: 'relative' }}>
          <Image
            source={{ uri: getProductImageUrl(item.images?.[0] || item.image) }}
            style={styles.productImage}
            contentFit="cover"
            transition={200}
          />
          {hasDiscount ? (
            <View style={styles.recentDiscountBadge}>
              <Text style={styles.recentDiscountText}>-{discountPercent}%</Text>
            </View>
          ) : null}
          {isOutOfStock ? (
            <View style={styles.outOfStockBadgeOverlay}>
              <Text style={styles.outOfStockBadgeOverlayText}>{t('Out of Stock')}</Text>
            </View>
          ) : null}
          <TouchableOpacity
            style={styles.recentFavBtn}
            onPress={(e) => {
              e.stopPropagation();
              toggleWishlist(item._id || item.id);
              Alert.alert(t('Wishlist'), t('Updated wishlist!'));
            }}
          >
            <MaterialCommunityIcons name="heart-outline" size={14} color="#d32f2f" />
          </TouchableOpacity>
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productCategory} numberOfLines={1}>
            {t(item.category?.name || item.category || 'General')}
          </Text>
          <Text style={styles.productName} numberOfLines={1}>
            {t(item.title || item.name)}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 4 }}>
            <MaterialCommunityIcons name="star" size={11} color="#ffb300" />
            <Text style={{ fontSize: 10, fontWeight: '700', color: '#444' }}>
              {item.rating || 4.5}
            </Text>
            {Number(item.totalSales) > 0 ? (
              <Text style={{ fontSize: 10, color: '#888' }}>
                • {item.totalSales} {t('sold')}
              </Text>
            ) : null}
          </View>

          {!(
            (item.category?.name || item.category || '').toLowerCase().trim() === 'job portal' ||
            (item.category?.name || item.category || '').toLowerCase().trim() === 'service portal'
          ) ? (
            <View style={styles.priceRow}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
                <Text style={styles.productPrice}>
                  ${item.price}{item.priceUnit ? ` ${item.priceUnit}` : ''}
                </Text>
                {hasDiscount ? (
                  <Text style={{ fontSize: 10, color: '#999', textDecorationLine: 'line-through' }}>
                    ${item.comparePrice}
                  </Text>
                ) : null}
              </View>
            </View>
          ) : null}

          {item.sellerId ? (
            <View style={styles.sellerRow}>
              <MaterialCommunityIcons name="storefront" size={10} color="#888" style={{ marginRight: 2 }} />
              <Text style={styles.sellerText} numberOfLines={1}>
                {item.sellerId.shopName}
              </Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  const renderRecentlyViewedProduct = ({ item }) => {
    const isOutOfStock = Number(item.stock ?? 0) <= 0;
    const hasDiscount = Boolean(item.comparePrice && Number(item.comparePrice) > Number(item.price));
    const discountPercent = hasDiscount
      ? Math.round(((Number(item.comparePrice) - Number(item.price)) / Number(item.comparePrice)) * 100)
      : 0;

    return (
      <TouchableOpacity
        style={styles.recentProductCard}
        onPress={() =>
          router.push({
            pathname: "/(buyer)/product-details",
            params: { id: item._id || item.id },
          })
        }
        activeOpacity={0.9}
      >
        <View style={{ position: 'relative' }}>
          <Image
            source={{ uri: getProductImageUrl(item.images?.[0] || item.image) }}
            style={styles.recentProductImage}
            contentFit="cover"
            transition={200}
          />
          {hasDiscount ? (
            <View style={styles.recentDiscountBadge}>
              <Text style={styles.recentDiscountText}>-{discountPercent}%</Text>
            </View>
          ) : null}
          {isOutOfStock ? (
            <View style={styles.outOfStockBadgeOverlay}>
              <Text style={styles.outOfStockBadgeOverlayText}>{t('Out of Stock')}</Text>
            </View>
          ) : null}
          <TouchableOpacity
            style={styles.recentFavBtn}
            onPress={(e) => {
              e.stopPropagation();
              toggleWishlist(item._id || item.id);
              Alert.alert(t('Wishlist'), t('Updated wishlist!'));
            }}
          >
            <MaterialCommunityIcons name="heart-outline" size={16} color="#d32f2f" />
          </TouchableOpacity>
        </View>

        <View style={styles.recentProductInfo}>
          <Text style={styles.productCategory} numberOfLines={1}>
            {t(item.category?.name || item.category || 'General')}
          </Text>
          <Text style={styles.recentProductName} numberOfLines={2}>
            {t(item.title || item.name)}
          </Text>

          <View style={styles.recentRatingSellerRow}>
            <View style={styles.recentRatingContainer}>
              <MaterialCommunityIcons name="star" size={12} color="#ffb300" />
              <Text style={styles.recentRatingText}>{item.rating || 4.5}</Text>
            </View>
            {item.sellerId?.shopName ? (
              <Text style={styles.recentSellerText} numberOfLines={1}>
                {item.sellerId.shopName}
              </Text>
            ) : null}
          </View>

          <View style={styles.recentFooterRow}>
            <View>
              <Text style={styles.productPrice}>${item.price}{item.priceUnit ? ` ${item.priceUnit}` : ''}</Text>
              {hasDiscount ? (
                <Text style={styles.recentComparePrice}>${item.comparePrice}</Text>
              ) : null}
            </View>
            <TouchableOpacity
              style={[styles.recentAddToCartBtn, isOutOfStock && { opacity: 0.5 }]}
              disabled={isOutOfStock}
              onPress={(e) => {
                e.stopPropagation();
                if (!isOutOfStock) {
                  addToCart(item);
                  Alert.alert(t('Success'), t('Added to cart!'));
                }
              }}
            >
              <MaterialCommunityIcons name="cart-plus" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.push("/(buyer)/drawer")} style={styles.menuButton}>
          <MaterialCommunityIcons name="menu" size={26} color="#1a237e" />
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
        {/* Welcome Header & Integrated Search Bar */}
        <LinearGradient
          colors={['#1a237e', '#283593']}
          style={styles.headerBlock}
        >
          <View style={styles.welcomeRow}>
            <View>
              <Text style={styles.greetingText}>{t('Welcome back,')}</Text>
              <Text style={styles.userNameText}>{user?.name || t('Guest')}</Text>
            </View>
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={() => router.push("/(buyer)/drawer")}
            >
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {(user?.name || 'G').charAt(0).toUpperCase()}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Integrated Search Bar */}
          <View style={styles.searchBar}>
            <MaterialCommunityIcons name="magnify" size={20} color="#888" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('Search products, jobs, real estate...')}
              placeholderTextColor="#999"
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {search.trim().length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")} style={styles.searchClearBtn}>
                <MaterialCommunityIcons name="close-circle" size={18} color="#aaa" />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        {/* Location Display Row */}
        <TouchableOpacity 
          style={styles.locationContainer} 
          onPress={openLocationModal}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="map-marker" size={18} color="#1a237e" style={styles.locationPin} />
          <View style={styles.locationTextCol}>
            <Text style={styles.locationLabel}>{t('Current Location')}</Text>
            <Text style={styles.locationValue} numberOfLines={1}>
              {user?.location?.fullAddress || 
               (user?.location?.city ? `${user.location.city}, ${user.location.state || ''}, ${user.location.country || ''}`.replace(/,\s*,/, ',').trim() : t('Set Location'))}
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={18} color="#999" style={styles.locationArrow} />
        </TouchableOpacity>

        {/* Location Update Modal */}
        <Modal
          visible={locationModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setLocationModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity 
              style={StyleSheet.absoluteFillObject} 
              activeOpacity={1} 
              onPress={() => setLocationModalVisible(false)} 
            />
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('Update Location')}</Text>
                <TouchableOpacity onPress={() => setLocationModalVisible(false)} style={styles.modalCloseBtn}>
                  <MaterialCommunityIcons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              {locLoading ? (
                <View style={styles.modalLoading}>
                  <ActivityIndicator size="large" color="#1a237e" />
                  <Text style={styles.loadingText}>{t('Updating Location...')}</Text>
                </View>
              ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                  {/* GPS Button */}
                  <TouchableOpacity style={styles.gpsBtn} onPress={handleGPSUpdate}>
                    <MaterialCommunityIcons name="crosshairs-gps" size={18} color="#1a237e" style={styles.gpsBtnIcon} />
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
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>{t('Browse by Category')}</Text>
        </View>
        <View style={styles.categoryGridContainer}>
          {categories.map((item) => (
            <CategoryCard
              key={item._id || item.id || item.name}
              label={item.translations?.[i18n.language]?.name || t(item.name) || item.name}
              categoryName={item.name}
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
          ref={bannerRef}
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
          {banners.map((banner) => {
            const bannerImg = banner.imageByLang?.[i18n.language] || banner.image;
            const bannerTitle = banner.translations?.[i18n.language]?.title || t(banner.title);
            const bannerSub = banner.translations?.[i18n.language]?.subtitle || t(banner.subtitle || 'LIMITED OFFER');
            const bannerBtn = banner.translations?.[i18n.language]?.buttonText || t(banner.buttonText || banner.btn || 'Shop Now');

            return (
              <View key={banner._id || banner.id} style={styles.bannerCard}>
                <Image
                  source={{ uri: bannerImg }}
                  style={styles.bannerImage}
                  contentFit="cover"
                  transition={200}
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.85)']}
                  style={styles.bannerOverlay}
                >
                  <Text style={styles.bannerSubtitle}>{bannerSub}</Text>
                  <Text style={styles.bannerTitle}>{bannerTitle}</Text>
                  <TouchableOpacity 
                    style={styles.bannerBtn}
                    onPress={() => router.push(banner.linkUrl || "/(buyer)/products")}
                  >
                    <Text style={styles.bannerBtnText}>{bannerBtn}</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            );
          })}
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
          <Text style={styles.sectionTitle}>{t('Featured Products')}</Text>
          <TouchableOpacity onPress={() => router.push("/(buyer)/products")}>
            <Text style={styles.viewAll}>{t('View All')}</Text>
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

        {/* Recently Viewed Section */}
        {recentlyViewed && recentlyViewed.length > 0 && (
          <View style={{ marginTop: 24, marginBottom: 8 }}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>{t('Recently Viewed')}</Text>
              <TouchableOpacity onPress={() => router.push("/(buyer)/recently-viewed")}>
                <Text style={styles.viewAll}>{t('View All')} &gt;</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={recentlyViewed}
              renderItem={renderRecentlyViewedProduct}
              keyExtractor={(item, index) => (item._id || item.id || index).toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredList}
            />
          </View>
        )}

        {/* Real Estate Category Promotional Banner */}
        {(() => {
          const realestateBanner = banners.find(b => b.position === 'realestate') || {
            title: 'Find Your Dream Luxury Property',
            subtitle: 'Explore villas, apartments, plots & commercial spaces worldwide.',
            image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
            linkUrl: '/(buyer)/real-estate'
          };
          return (
            <TouchableOpacity
              style={styles.realEstateBannerCard}
              onPress={() => router.push(realestateBanner.linkUrl || "/(buyer)/real-estate")}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: realestateBanner.image }}
                style={styles.realEstateBannerImage}
                contentFit="cover"
                transition={200}
              />
              <LinearGradient
                colors={['transparent', 'rgba(15, 23, 42, 0.92)']}
                style={styles.realEstateBannerOverlay}
              >
                <View style={styles.realEstateBadge}>
                  <MaterialCommunityIcons name="home-city" size={14} color="#ffd700" />
                  <Text style={styles.realEstateBadgeText}>{t('REAL ESTATE MARKETPLACE')}</Text>
                </View>
                <Text style={styles.realEstateTitle}>{t(realestateBanner.title)}</Text>
                {realestateBanner.subtitle ? (
                  <Text style={styles.realEstateSubtitle}>{t(realestateBanner.subtitle)}</Text>
                ) : null}
                <View style={styles.realEstateBtn}>
                  <Text style={styles.realEstateBtnText}>{t('Browse Properties →')}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          );
        })()}

        {/* Secure Payments Card */}
        <View style={styles.secureCard}>
          <Text style={styles.secureTitle}>{t('Secure Global Payments')}</Text>
          <Text style={styles.secureDesc}>
            {t('Our trade assurance guarantees protection from payment to delivery for all international orders. Safe, secure, and fully tracked.')}
          </Text>
          <View style={styles.secureBadgeRow}>
            <View style={styles.secureBadge}>
              <MaterialCommunityIcons name="shield-check" size={16} color="#4caf50" />
              <Text style={styles.secureBadgeText}>{t('Verified Vendors')}</Text>
            </View>
            <View style={styles.secureBadge}>
              <MaterialCommunityIcons name="lock" size={16} color="#1a237e" />
              <Text style={styles.secureBadgeText}>{t('Escrow Support')}</Text>
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
  menuButton: {
    padding: 4,
  },
  topTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1a237e",
    letterSpacing: 0.5,
  },
  topRight: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  iconBtn: {
    position: "relative",
    padding: 4,
  },
  cartBadge: {
    position: "absolute",
    top: 0,
    right: 0,
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

  // Welcome Header & Search Block
  headerBlock: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  welcomeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.75)",
    fontWeight: "500",
  },
  userNameText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    marginTop: 2,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  avatarPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    padding: 0,
  },
  searchClearBtn: {
    padding: 2,
  },

  // Location Selector
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -12,
    marginBottom: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  locationPin: {
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
    marginLeft: 6,
  },

  // Section
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1a237e",
  },
  viewAll: {
    fontSize: 13,
    color: "#29b6f6",
    fontWeight: "700",
  },

  // Categories
  categoryGridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    justifyContent: "flex-start",
    marginTop: 8,
  },

  // Banners Carousel
  bannerScroll: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 10,
  },
  bannerCard: {
    width: width - 32,
    height: 170,
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
    justifyContent: "flex-end",
    height: "100%",
  },
  bannerSubtitle: {
    fontSize: 10,
    color: "#29b6f6",
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 10,
    lineHeight: 22,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  bannerBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#29b6f6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: "#29b6f6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  bannerBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
    marginBottom: 16,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ccc",
  },
  dotActive: {
    backgroundColor: "#1a237e",
    width: 18,
  },

  // Featured Products
  featuredList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 14,
  },
  productCard: {
    width: 170,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#eef1f8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  productImage: {
    width: "100%",
    height: 150,
    backgroundColor: "#f5f5f5",
  },
  productInfo: {
    padding: 12,
  },
  productCategory: {
    fontSize: 10,
    color: "#888",
    marginBottom: 2,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  productName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#222",
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1a237e",
  },
  sellerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#f5f5f5",
    paddingTop: 6,
  },
  sellerText: {
    fontSize: 10,
    color: '#888',
    flex: 1,
  },

  // Secure Payments Card
  secureCard: {
    margin: 16,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#eef1f8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  secureTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1a237e",
    marginBottom: 8,
  },
  secureDesc: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
    marginBottom: 16,
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
    backgroundColor: "#f5f7fc",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eef1f8",
  },
  secureBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1a237e",
  },
  secureImage: {
    width: "100%",
    height: 150,
    borderRadius: 12,
    marginTop: 4,
  },

  // Location Modal Styles
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
    paddingBottom: 30,
    maxHeight: '85%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
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
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#eee',
  },
  modalOrText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: '#999',
    fontWeight: '700',
  },
  modalOrTextSmall: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    marginBottom: 12,
    fontWeight: "600",
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
    shadowColor: '#1a237e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  outOfStockBadgeOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(211, 47, 47, 0.9)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  outOfStockBadgeOverlayText: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#f5f5f5",
    paddingTop: 6,
  },
  sellerText: {
    fontSize: 10,
    color: '#888',
    flex: 1,
  },

  // Secure Payments Card
  secureCard: {
    margin: 16,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#eef1f8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  secureTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1a237e",
    marginBottom: 8,
  },
  secureDesc: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
    marginBottom: 16,
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
    backgroundColor: "#f5f7fc",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eef1f8",
  },
  secureBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1a237e",
  },
  secureImage: {
    width: "100%",
    height: 150,
    borderRadius: 12,
    marginTop: 4,
  },

  // Location Modal Styles
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
    paddingBottom: 30,
    maxHeight: '85%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
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
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#eee',
  },
  modalOrText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: '#999',
    fontWeight: '700',
  },
  modalOrTextSmall: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    marginBottom: 12,
    fontWeight: "600",
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
    shadowColor: '#1a237e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  outOfStockBadgeOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(211, 47, 47, 0.9)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  outOfStockBadgeOverlayText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  modalSubmitText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  recentProductCard: {
    width: 165,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  recentProductImage: {
    width: '100%',
    height: 125,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  recentDiscountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#d32f2f',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  recentDiscountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  recentFavBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 5,
  },
  recentProductInfo: {
    padding: 10,
  },
  recentProductName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a237e',
    marginTop: 2,
    lineHeight: 17,
    height: 34,
  },
  recentRatingSellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  recentRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  recentRatingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#555',
  },
  recentSellerText: {
    fontSize: 10,
    color: '#888',
    maxWidth: 80,
  },
  recentFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  recentComparePrice: {
    fontSize: 10,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  recentAddToCartBtn: {
    backgroundColor: '#1a237e',
    borderRadius: 10,
    padding: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  realEstateBannerCard: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 16,
    height: 190,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4
  },
  realEstateBannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute'
  },
  realEstateBannerOverlay: {
    flex: 1,
    padding: 18,
    justifyContent: 'flex-end'
  },
  realEstateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 6,
    gap: 6
  },
  realEstateBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  realEstateTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800'
  },
  realEstateSubtitle: {
    color: '#e2e8f0',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500'
  },
  realEstateBtn: {
    marginTop: 12,
    backgroundColor: '#1a237e',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10
  },
  realEstateBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 12
  },
});
