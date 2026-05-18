import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getProduct } from "../../services/productService";
import { addToCart } from "../../services/cartService";
import { toggleWishlist } from "../../services/wishlistService";
import { useCart } from "../../context/CartContext";
import { useTranslation } from "react-i18next";
import ContactSellerModal from "../../components/buyer/ContactSellerModal";

const { width } = Dimensions.get("window");

export default function ProductDetailsScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState("Reviews");
  const [contactVisible, setContactVisible] = useState(false);

  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { refreshCart } = useCart();

  useEffect(() => {
    if (id) loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const res = await getProduct(id);
      if (res?.product) {
        setProduct(res.product);
        setSeller(res.product.sellerId);
      }
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      await addToCart(product._id, quantity);
      if (refreshCart) await refreshCart();
      Alert.alert('Success', 'Added to cart!');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add to cart');
    }
  };

  const handleBuyNow = () => {
    router.push({
      pathname: '/(buyer)/order-summary',
      params: {
        productId: product._id,
        quantity,
        sellerId: seller._id
      }
    });
  };

  const handleWishlist = async () => {
    try {
      const res = await toggleWishlist(product._id);
      setIsWishlisted(res.isWishlisted);
      Alert.alert('Success', res.message);
    } catch (error) {
      console.log(error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#000033" />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Product not found.</Text>
        <TouchableOpacity onPress={() => router.back()}><Text style={{ color: '#1a237e' }}>Go Back</Text></TouchableOpacity>
      </SafeAreaView>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : ['https://via.placeholder.com/400'];

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>{t('Product Details')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Main Image */}
        <View style={styles.imageWrapper}>
          <Image source={{ uri: images[selectedImage] }} style={styles.mainImage} resizeMode="cover" />
          <View style={styles.floatingActions}>
            <TouchableOpacity style={styles.iconBtn} onPress={handleWishlist}>
              <MaterialCommunityIcons name={isWishlisted ? "heart" : "heart-outline"} size={20} color="#ff4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Thumbnails */}
        {images.length > 1 && (
          <View style={styles.thumbnailRow}>
            {images.map((img, index) => (
              <TouchableOpacity key={index} style={[styles.thumbnailWrapper, selectedImage === index && styles.thumbnailActive]} onPress={() => setSelectedImage(index)}>
                <Image source={{ uri: img }} style={styles.thumbnail} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.detailsBox}>
          <Text style={styles.category}>{product.category?.name?.toUpperCase()}</Text>
          <Text style={styles.title}>{product.title}</Text>

          <View style={styles.ratingRow}>
            <MaterialCommunityIcons name="star" size={16} color="#fbc02d" />
            <Text style={styles.stars}> {product.rating || 0}</Text>
            <Text style={styles.reviewCount}> ({product.totalReviews || 0} {t("Reviews")}) | </Text>
            <Text style={styles.soldCount}>{product.totalSales || 0} {t("Sold")}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
            {product.comparePrice > product.price && (
              <Text style={styles.originalPrice}>${product.comparePrice.toFixed(2)}</Text>
            )}
          </View>

          <Text style={styles.description}>{product.description}</Text>
          
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 16}}>
            <Text style={{fontWeight: '700', marginRight: 16}}>Quantity:</Text>
            <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))} style={styles.qtyBtn}><Text>-</Text></TouchableOpacity>
            <Text style={{marginHorizontal: 16}}>{quantity}</Text>
            <TouchableOpacity onPress={() => setQuantity(quantity + 1)} style={styles.qtyBtn}><Text>+</Text></TouchableOpacity>
          </View>

          {/* Supplier Card */}
          {seller && (
            <View style={styles.supplierCard}>
              <Image source={{ uri: seller.shopLogo || 'https://via.placeholder.com/100' }} style={styles.supplierAvatar} />
              <View style={styles.supplierInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={styles.supplierName}>{seller.shopName}</Text>
                  {seller.isVerified && <MaterialCommunityIcons name="check-decagram" size={14} color="#008b8b" />}
                </View>
                <Text style={styles.supplierBadge}>
                  {seller.businessType?.toUpperCase() || 'SELLER'} • {seller.responseRate || 100}% Response
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                  <MaterialCommunityIcons name="star" size={12} color="#fbc02d" />
                  <Text style={{ fontSize: 10, color: '#666', marginLeft: 2 }}>{seller.rating || 0} ({seller.totalReviews || 0})</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => router.push(`/seller/${seller._id}`)}>
                <Text style={styles.chatBtn}>{t("Visit Store")}</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={styles.outlineBtn} onPress={handleAddToCart}>
            <Text style={styles.outlineBtnText}>🛒 {t("Add to Cart")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.solidBtn} onPress={handleBuyNow}>
            <Text style={styles.solidBtnText}>{t("Buy Now")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => setContactVisible(true)}>
            <Text style={styles.secondaryBtnText}>{t("Contact Seller")}</Text>
          </TouchableOpacity>
        </View>

        <ContactSellerModal
          visible={contactVisible}
          onClose={(success) => {
            setContactVisible(false)
            if (success) router.push('/(buyer)/my-requests')
          }}
          product={product}
          seller={seller}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#eee" },
  topTitle: { fontSize: 18, fontWeight: "700", color: "#000033" },
  scrollContent: { paddingBottom: 20 },
  imageWrapper: { width: "100%", height: 300, position: "relative", backgroundColor: "#fff" },
  mainImage: { width: "100%", height: "100%" },
  floatingActions: { position: "absolute", top: 16, right: 16, gap: 12 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#fff", justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 4 },
  thumbnailRow: { flexDirection: "row", paddingHorizontal: 16, marginTop: -25, gap: 12 },
  thumbnailWrapper: { width: 50, height: 50, borderRadius: 8, borderWidth: 2, borderColor: "transparent", overflow: "hidden", backgroundColor: "#fff" },
  thumbnailActive: { borderColor: "#000033" },
  thumbnail: { width: "100%", height: "100%" },
  detailsBox: { paddingHorizontal: 16, paddingTop: 16 },
  category: { fontSize: 10, fontWeight: "700", color: "#008b8b", letterSpacing: 1, marginBottom: 6 },
  title: { fontSize: 22, fontWeight: "800", color: "#212121", lineHeight: 28, marginBottom: 8 },
  ratingRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  stars: { color: "#333", fontSize: 14, marginRight: 6 },
  reviewCount: { fontSize: 12, color: "#555", fontWeight: "500" },
  soldCount: { fontSize: 12, color: "#008b8b", fontWeight: "700" },
  priceRow: { flexDirection: "row", alignItems: "flex-end", gap: 10, marginBottom: 4 },
  price: { fontSize: 28, fontWeight: "800", color: "#008b8b" },
  originalPrice: { fontSize: 14, color: "#999", textDecorationLine: "line-through", marginBottom: 5 },
  description: { fontSize: 13, color: "#555", lineHeight: 20, marginBottom: 20 },
  qtyBtn: { width: 30, height: 30, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center', borderRadius: 15 },
  supplierCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#f4f5fa", padding: 12, borderRadius: 8, marginBottom: 24 },
  supplierAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  supplierInfo: { flex: 1 },
  supplierName: { fontSize: 13, fontWeight: "700", color: "#212121", marginBottom: 2 },
  supplierBadge: { fontSize: 10, color: "#008b8b", fontWeight: "600" },
  chatBtn: { color: "#1565c0", fontSize: 12, fontWeight: "700" },
  outlineBtn: { flexDirection: "row", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#64b5f6", borderRadius: 8, paddingVertical: 14, marginBottom: 12, backgroundColor: "#fff" },
  outlineBtnText: { color: "#0d47a1", fontSize: 14, fontWeight: "700" },
  solidBtn: { backgroundColor: "#1a237e", borderRadius: 8, paddingVertical: 16, alignItems: "center", marginBottom: 12 },
  solidBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  secondaryBtn: { borderRadius: 8, paddingVertical: 16, alignItems: "center", backgroundColor: "#29b6f6", marginBottom: 24 },
  secondaryBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" }
});
