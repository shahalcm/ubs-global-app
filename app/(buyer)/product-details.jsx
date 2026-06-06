import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Alert, TextInput, Modal } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { getProductImageUrl, getSellerImageUrl } from "../../utils/image";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getProduct } from "../../services/productService";
import { addToCart } from "../../services/cartService";
import { toggleWishlist } from "../../services/wishlistService";
import { useCart } from "../../context/CartContext";
import { useTranslation } from "react-i18next";
import ContactSellerModal from "../../components/buyer/ContactSellerModal";
import { getProductReviews, submitReview } from "../../services/reviewService";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import * as DocumentPicker from "expo-document-picker";

const { width } = Dimensions.get("window");

export default function ProductDetailsScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState("Reviews");
  const [contactVisible, setContactVisible] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { refreshCart } = useCart();
  const { user } = useAuth();

  // Reviews states
  const [reviews, setReviews] = useState([]);
  const [ratingInput, setRatingInput] = useState(0);
  const [commentInput, setCommentInput] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Job application states
  const [applyModalVisible, setApplyModalVisible] = useState(false);
  const [applyName, setApplyName] = useState("");
  const [applyEmail, setApplyEmail] = useState("");
  const [applyPhone, setApplyPhone] = useState("");
  const [applyExperience, setApplyExperience] = useState("");
  const [applyCoverLetter, setApplyCoverLetter] = useState("");
  const [selectedCV, setSelectedCV] = useState(null);
  const [submittingApplication, setSubmittingApplication] = useState(false);

  useEffect(() => {
    if (user && applyModalVisible) {
      setApplyName(user.name || "");
      setApplyEmail(user.email || "");
      setApplyPhone(user.phone || "");
    }
  }, [user, applyModalVisible]);

  const handlePickCV = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const file = res.assets[0];
        setSelectedCV(file);
      }
    } catch (err) {
      console.log("Pick CV Error:", err);
      Alert.alert(t("Error"), t("Failed to select file."));
    }
  };

  const handleApplySubmit = async () => {
    if (!applyName.trim() || !applyEmail.trim() || !applyPhone.trim() || !applyExperience.trim()) {
      Alert.alert(t("Validation Error"), t("Please fill in Name, Email, Phone, and Experience."));
      return;
    }
    try {
      setSubmittingApplication(true);

      const formData = new FormData();
      formData.append("jobId", product._id);
      formData.append("name", applyName.trim());
      formData.append("email", applyEmail.trim());
      formData.append("phone", applyPhone.trim());
      formData.append("experience", applyExperience.trim());
      formData.append("coverLetter", applyCoverLetter.trim());

      if (selectedCV) {
        // Expo document picker returns document URI.
        // On React Native we pass object with uri, name, and type for Multer upload.
        formData.append("resume", {
          uri: selectedCV.uri,
          name: selectedCV.name || "resume.pdf",
          type: "application/pdf"
        });
      }

      const res = await api.post("/job-applications/apply", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      if (res.data?.success) {
        Alert.alert(t("Success"), t("Your job application has been submitted successfully!"));
        setApplyModalVisible(false);
        setApplyExperience("");
        setApplyCoverLetter("");
        setSelectedCV(null);
      }
    } catch (error) {
      Alert.alert(t("Error"), error.response?.data?.message || t("Failed to submit job application."));
    } finally {
      setSubmittingApplication(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadProduct();
      loadReviews();
    }
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

  const loadReviews = async () => {
    try {
      const res = await getProductReviews(id);
      if (res?.success) {
        setReviews(res.reviews);
      }
    } catch (err) {
      console.log("Error loading reviews:", err);
    }
  };

  const handleSubmitReview = async () => {
    if (ratingInput === 0) {
      Alert.alert('Validation Error', 'Please select a star rating');
      return;
    }
    try {
      setSubmittingReview(true);
      const res = await submitReview({
        productId: product._id,
        rating: ratingInput,
        comment: commentInput
      });
      if (res?.success) {
        Alert.alert('Success', 'Thank you for your review!');
        setCommentInput('');
        setRatingInput(0);
        
        // Refresh product to see updated rating
        const updatedProd = await getProduct(id);
        if (updatedProd?.product) {
          setProduct(updatedProd.product);
          setSeller(updatedProd.product.sellerId);
        }
        loadReviews();
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
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

  const handleStartChat = async () => {
    setChatLoading(true);
    try {
      const res = await api.post(`/products/${product._id}/chat`);
      if (res.data.success && res.data.chatRoomId) {
        router.push({
          pathname: '/(buyer)/chat',
          params: { roomId: res.data.chatRoomId }
        });
      }
    } catch (err) {
      console.log(err);
      Alert.alert('Chat Error', err.response?.data?.message || 'Could not start chat with seller.');
    } finally {
      setChatLoading(false);
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
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(buyer)/home')}><Text style={{ color: '#1a237e' }}>Go Back</Text></TouchableOpacity>
      </SafeAreaView>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : ['https://via.placeholder.com/400'];

  const categoryName = product.category?.name?.toLowerCase().trim() || "";
  const isJobPortal = categoryName === "job portal";
  const isServicePortal = categoryName === "service portal";
  const isJobOrService = isJobPortal || isServicePortal;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(buyer)/home')}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>{t('Product Details')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Main Image */}
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: getProductImageUrl(images[selectedImage]) }}
            style={styles.mainImage}
            contentFit="cover"
            transition={200}
          />
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
                <Image
                  source={{ uri: getProductImageUrl(img) }}
                  style={styles.thumbnail}
                  transition={100}
                />
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

          {!isJobOrService && (
            <View style={styles.priceRow}>
              <Text style={styles.price}>${product.price.toFixed(2)}</Text>
              {product.comparePrice > product.price && (
                <Text style={styles.originalPrice}>${product.comparePrice.toFixed(2)}</Text>
              )}
            </View>
          )}

          <Text style={styles.description}>{product.description}</Text>
          
          {!isJobOrService && (
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 16}}>
              <Text style={{fontWeight: '700', marginRight: 16}}>{t("Quantity:")}</Text>
              <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))} style={styles.qtyBtn}><Text>-</Text></TouchableOpacity>
              <Text style={{marginHorizontal: 16}}>{quantity}</Text>
              <TouchableOpacity onPress={() => setQuantity(quantity + 1)} style={styles.qtyBtn}><Text>+</Text></TouchableOpacity>
            </View>
          )}

          {/* Supplier Card */}
          {!isJobOrService && seller && (
            <View style={styles.supplierCard}>
              <Image
                source={{ uri: getSellerImageUrl(seller.shopLogo) }}
                style={styles.supplierAvatar}
                transition={100}
              />
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

          {isJobOrService && (
            <View style={styles.supplierCard}>
              <Image
                source={{ uri: "https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=100&q=80" }}
                style={styles.supplierAvatar}
                transition={100}
              />
              <View style={styles.supplierInfo}>
                <Text style={styles.supplierName}>{t("UBS Global Admin Panel")}</Text>
                <Text style={styles.supplierBadge}>{t("ubsimportingexporting@gmail.com • 9544755008")}</Text>
                <Text style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
                  {t("Careers & services managed directly by UBS Administration.")}
                </Text>
              </View>
            </View>
          )}

          {!isJobOrService && (
            <>
              <TouchableOpacity style={styles.outlineBtn} onPress={handleAddToCart}>
                <Text style={styles.outlineBtnText}>🛒 {t("Add to Cart")}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.solidBtn} onPress={handleBuyNow}>
                <Text style={styles.solidBtnText}>{t("Buy Now")}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.secondaryBtn, chatLoading && { opacity: 0.7 }]} 
                onPress={handleStartChat}
                disabled={chatLoading}
              >
                {chatLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.secondaryBtnText}>{t("Contact Seller")}</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {isJobPortal && (
            <TouchableOpacity style={styles.solidBtn} onPress={() => setApplyModalVisible(true)}>
              <Text style={styles.solidBtnText}>{t("Apply Now")}</Text>
            </TouchableOpacity>
          )}

          {isServicePortal && (
            <TouchableOpacity 
              style={[styles.solidBtn, chatLoading && { opacity: 0.7 }]} 
              onPress={handleStartChat}
              disabled={chatLoading}
            >
              {chatLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.solidBtnText}>{t("Contact Admin")}</Text>
              )}
            </TouchableOpacity>
          )}

          {/* Categories & Tags Display Section */}
          <View style={styles.sectionDivider} />
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{t("Category & Tags")}</Text>
            <View style={styles.tagsContainer}>
              <View style={styles.categoryChip}>
                <MaterialCommunityIcons name="tag" size={14} color="#008b8b" />
                <Text style={styles.categoryChipText}>{product.category?.name || t("General")}</Text>
              </View>
              {product.tags && product.tags.map((tag, i) => (
                <View key={i} style={styles.tagChip}>
                  <Text style={styles.tagChipText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Write a Review Form Section */}
          <View style={styles.sectionDivider} />
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{t("Write a Review")}</Text>
            <View style={styles.ratingInputRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRatingInput(star)}>
                  <MaterialCommunityIcons 
                    name={star <= ratingInput ? "star" : "star-outline"} 
                    size={30} 
                    color="#fbc02d" 
                    style={{ marginRight: 6 }}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput 
              style={styles.reviewTextInput}
              placeholder={t("Share your thoughts about this product...")}
              placeholderTextColor="#999"
              value={commentInput}
              onChangeText={setCommentInput}
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity 
              style={[styles.submitReviewBtn, submittingReview && { opacity: 0.7 }]} 
              onPress={handleSubmitReview}
              disabled={submittingReview}
            >
              {submittingReview ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitReviewBtnText}>{t("Submit Review")}</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Customer Reviews Section */}
          <View style={styles.sectionDivider} />
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{t("Customer Reviews")} ({reviews.length})</Text>
            {reviews.length === 0 ? (
              <Text style={styles.noReviewsText}>{t("No reviews yet. Be the first to review this product!")}</Text>
            ) : (
              reviews.map((rev) => (
                <View key={rev._id} style={styles.reviewCard}>
                  <Image 
                    source={{ uri: rev.buyerId?.avatar || 'https://via.placeholder.com/150' }} 
                    style={styles.reviewAvatar} 
                  />
                  <View style={styles.reviewContent}>
                    <View style={styles.reviewHeaderRow}>
                      <Text style={styles.reviewBuyerName}>{rev.buyerId?.name || t("Anonymous")}</Text>
                      <Text style={styles.reviewDate}>{new Date(rev.createdAt).toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.reviewStarsRow}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <MaterialCommunityIcons 
                          key={star} 
                          name={star <= rev.rating ? "star" : "star-outline"} 
                          size={12} 
                          color="#fbc02d" 
                          style={{ marginRight: 2 }}
                        />
                      ))}
                    </View>
                    {rev.comment ? (
                      <Text style={styles.reviewComment}>{rev.comment}</Text>
                    ) : null}
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        <ContactSellerModal
          visible={contactVisible}
          onClose={(success) => {
            setContactVisible(false)
            if (success) router.push('/(buyer)/my-requests')
          }}
          product={product}
          seller={isServicePortal ? null : seller}
        />

        {/* Job Application Modal */}
        <Modal
          visible={applyModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setApplyModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t("Job Application")}</Text>
                <TouchableOpacity onPress={() => setApplyModalVisible(false)}>
                  <Text style={styles.modalCloseBtn}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalInputLabel}>{t("Full Name")}</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder={t("Your Name")}
                  value={applyName}
                  onChangeText={setApplyName}
                />

                <Text style={styles.modalInputLabel}>{t("Email")}</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder={t("Your Email")}
                  value={applyEmail}
                  onChangeText={setApplyEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Text style={styles.modalInputLabel}>{t("Phone Number")}</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder={t("Your Phone Number")}
                  value={applyPhone}
                  onChangeText={setApplyPhone}
                  keyboardType="phone-pad"
                />

                <Text style={styles.modalInputLabel}>{t("Years of Experience / Key Skills")}</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder={t("e.g. 5 Years in Logistics / Sales")}
                  value={applyExperience}
                  onChangeText={setApplyExperience}
                />

                <Text style={styles.modalInputLabel}>{t("Cover Letter / Additional Info")}</Text>
                <TextInput
                  style={[styles.modalInput, { height: 100 }]}
                  placeholder={t("Why are you a good fit for this role?")}
                  value={applyCoverLetter}
                  onChangeText={setApplyCoverLetter}
                  multiline
                  numberOfLines={4}
                />

                <Text style={styles.modalInputLabel}>{t("Resume / CV (PDF format)")}</Text>
                <View style={styles.fileUploadRow}>
                  <TouchableOpacity style={styles.fileUploadBtn} onPress={handlePickCV}>
                    <MaterialCommunityIcons name="file-pdf-box" size={20} color="#ff4444" />
                    <Text style={styles.fileUploadBtnText}>
                      {selectedCV ? t("Change PDF") : t("Upload PDF")}
                    </Text>
                  </TouchableOpacity>
                  {selectedCV && (
                    <View style={styles.selectedFileContainer}>
                      <Text style={styles.selectedFileName} numberOfLines={1}>
                        {selectedCV.name}
                      </Text>
                      <TouchableOpacity onPress={() => setSelectedCV(null)}>
                        <MaterialCommunityIcons name="close-circle" size={18} color="#888" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                <TouchableOpacity 
                  style={[styles.modalSubmitBtn, submittingApplication && { opacity: 0.7 }]} 
                  onPress={handleApplySubmit}
                  disabled={submittingApplication}
                >
                  {submittingApplication ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.modalSubmitText}>{t("Submit Application")}</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
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
  secondaryBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  // New review and category styles
  sectionDivider: { height: 1, backgroundColor: '#eef0f2', marginVertical: 16 },
  sectionContainer: { marginBottom: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1a237e', marginBottom: 12 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e0f2f1', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, gap: 4 },
  categoryChipText: { fontSize: 12, color: '#008b8b', fontWeight: '600' },
  tagChip: { backgroundColor: '#f0f0f5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  tagChipText: { fontSize: 12, color: '#666', fontWeight: '500' },
  ratingInputRow: { flexDirection: 'row', marginBottom: 12 },
  reviewTextInput: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 12, fontSize: 14, color: '#212121', backgroundColor: '#fff', textAlignVertical: 'top', minHeight: 80, marginBottom: 12 },
  submitReviewBtn: { backgroundColor: '#1a237e', borderRadius: 8, paddingVertical: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
  submitReviewBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  noReviewsText: { fontSize: 13, color: '#888', fontStyle: 'italic', marginVertical: 8 },
  reviewCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#f0f0f5', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 12, backgroundColor: '#eee' },
  reviewContent: { flex: 1 },
  reviewHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  reviewBuyerName: { fontSize: 13, fontWeight: '600', color: '#212121' },
  reviewDate: { fontSize: 10, color: '#999' },
  reviewStarsRow: { flexDirection: 'row', marginBottom: 6 },
  reviewComment: { fontSize: 13, color: '#444', lineHeight: 18 },

  // Job application modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a237e",
  },
  modalCloseBtn: {
    fontSize: 20,
    color: "#333",
  },
  modalInputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginBottom: 6,
    marginTop: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#333",
    backgroundColor: "#fff",
  },
  modalSubmitBtn: {
    backgroundColor: "#1a237e",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 12,
  },
  modalSubmitText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  fileUploadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 6,
    marginBottom: 6,
  },
  fileUploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fafafa",
    gap: 6,
  },
  fileUploadBtnText: {
    fontSize: 12,
    fontWeight: "650",
    color: "#333",
  },
  selectedFileContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#a5d6a7",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#e8f5e9",
  },
  selectedFileName: {
    fontSize: 12,
    color: "#2e7d32",
    fontWeight: "600",
    maxWidth: "85%",
  }
});
