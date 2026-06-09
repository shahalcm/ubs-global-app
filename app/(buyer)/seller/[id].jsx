import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
  FlatList
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getSellerPublicProfile } from "../../../services/productService";
import { getProductImageUrl, getSellerImageUrl } from "../../../utils/image";
import { colors } from "../../../constants/colors";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

export default function SellerStoreScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadSellerProfile();
    }
  }, [id]);

  const loadSellerProfile = async () => {
    try {
      setLoading(true);
      const res = await getSellerPublicProfile(id);
      if (res?.success) {
        setSeller(res.seller);
        setProducts(res.products || []);
      }
    } catch (err) {
      console.log("Failed to load seller profile:", err);
      Alert.alert("Error", "Could not load store details.");
    } finally {
      setLoading(false);
    }
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() =>
        router.push({
          pathname: '/(buyer)/product-details',
          params: { id: item._id || item.id },
        })
      }
      activeOpacity={0.9}
    >
      <View style={styles.imageBox}>
        <Image
          source={{ uri: getProductImageUrl(item.images?.[0] || item.image) }}
          style={styles.productImage}
          contentFit="cover"
          transition={200}
        />
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.title || item.name}
        </Text>
        <View style={styles.ratingRow}>
          <MaterialCommunityIcons name="star" size={13} color="#f59e0b" />
          <Text style={styles.ratingText}>
            {item.rating || 0} ({item.totalReviews || 0})
          </Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceText}>${item.price}</Text>
          <View style={styles.cartBtn}>
            <MaterialCommunityIcons name="arrow-right" size={16} color="#0d47a1" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={colors.primary || "#000033"} />
      </SafeAreaView>
    );
  }

  if (!seller) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={styles.errorText}>Store not found.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const hasGestureNav = insets.bottom > 0;

  return (
    <SafeAreaView 
      style={[
        styles.container,
        !hasGestureNav && { paddingBottom: 16 }
      ]} 
      edges={["top", "left", "right"]}
    >
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>{seller.shopName}</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => (item._id || item.id).toString()}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Store Profile Section */}
            <View style={styles.profileCard}>
              <View style={styles.headerInfoRow}>
                <Image
                  source={{ uri: getSellerImageUrl(seller.shopLogo) }}
                  style={styles.logo}
                  transition={200}
                />
                <View style={styles.metaInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.shopName}>{seller.shopName}</Text>
                    {seller.isVerified && (
                      <MaterialCommunityIcons name="check-decagram" size={18} color="#008b8b" />
                    )}
                  </View>
                  <Text style={styles.ownerText}>Owner: {seller.ownerName}</Text>
                  <Text style={styles.businessTypeBadge}>
                    {seller.businessType?.toUpperCase() || "SELLER"}
                  </Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{seller.rating || 0}</Text>
                  <Text style={styles.statLbl}>Rating</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{seller.totalReviews || 0}</Text>
                  <Text style={styles.statLbl}>Reviews</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{products.length}</Text>
                  <Text style={styles.statLbl}>Products</Text>
                </View>
              </View>

              {seller.description && (
                <View style={styles.descSection}>
                  <Text style={styles.descTitle}>About the Store</Text>
                  <Text style={styles.descText}>{seller.description}</Text>
                </View>
              )}
            </View>

            {/* Store Products Header */}
            <Text style={styles.listHeaderTitle}>All Store Listings ({products.length})</Text>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="package-variant-closed" size={48} color="#aaa" />
            <Text style={styles.emptyText}>No products listed by this store yet.</Text>
          </View>
        }
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: hasGestureNav ? insets.bottom + 16 : 24 }
        ]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fc"
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee"
  },
  topTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000033",
    flex: 1,
    textAlign: "center"
  },
  iconButton: {
    padding: 8
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3
  },
  headerInfoRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
    backgroundColor: "#eaeaea"
  },
  metaInfo: {
    flex: 1
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4
  },
  shopName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#212121"
  },
  ownerText: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6
  },
  businessTypeBadge: {
    fontSize: 10,
    fontWeight: "700",
    color: "#008b8b",
    backgroundColor: "#e0f2f1",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start"
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0"
  },
  statBox: {
    alignItems: "center"
  },
  statVal: {
    fontSize: 16,
    fontWeight: "800",
    color: "#008b8b"
  },
  statLbl: {
    fontSize: 11,
    color: "#888",
    marginTop: 2
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: "#e0e0e0"
  },
  descSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0"
  },
  descTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#212121",
    marginBottom: 6
  },
  descText: {
    fontSize: 13,
    color: "#555",
    lineHeight: 18
  },
  listHeaderTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a237e",
    marginLeft: 16,
    marginBottom: 12
  },
  scrollContent: {
    paddingBottom: 24
  },
  gridRow: {
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 16
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#eee"
  },
  imageBox: {
    position: "relative"
  },
  productImage: {
    width: "100%",
    height: 140,
    backgroundColor: "#e8ecf4"
  },
  productInfo: {
    padding: 10
  },
  productName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1a237e",
    marginBottom: 4,
    lineHeight: 16
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6
  },
  ratingText: {
    fontSize: 10,
    color: "#888"
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  priceText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1a237e"
  },
  cartBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "#e3f2fd",
    justifyContent: "center",
    alignItems: "center"
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40
  },
  emptyText: {
    marginTop: 8,
    color: "#888",
    fontSize: 13
  },
  errorText: {
    fontSize: 15,
    color: "#555",
    marginBottom: 12
  },
  backBtn: {
    backgroundColor: "#1a237e",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8
  },
  backBtnText: {
    color: "#fff",
    fontWeight: "700"
  }
});
