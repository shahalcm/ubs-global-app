import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Modal,
  FlatList,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { applyAsSeller, getSellerProfile } from "../../services/sellerService";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const COUNTRIES = [
  { code: '+1', flag: '🇺🇸', name: 'US' },
  { code: '+44', flag: '🇬🇧', name: 'UK' },
  { code: '+91', flag: '🇮🇳', name: 'IN' },
  { code: '+971', flag: '🇦🇪', name: 'AE' },
  { code: '+966', flag: '🇸🇦', name: 'SA' },
  { code: '+92', flag: '🇵🇰', name: 'PK' },
  { code: '+880', flag: '🇧🇩', name: 'BD' },
  { code: '+60', flag: '🇲🇾', name: 'MY' },
  { code: '+65', flag: '🇸🇬', name: 'SG' },
  { code: '+86', flag: '🇨🇳', name: 'CN' },
  { code: '+81', flag: '🇯🇵', name: 'JP' },
  { code: '+49', flag: '🇩🇪', name: 'DE' },
  { code: '+33', flag: '🇫🇷', name: 'FR' },
  { code: '+34', flag: '🇪🇸', name: 'ES' },
  { code: '+55', flag: '🇧🇷', name: 'BR' },
];

export default function BecomeSellerScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [form, setForm] = useState({
    shopName: "",
    ownerName: "",
    phone: "",
    address: "",
    businessType: "",
    idProof: null,
    shopLogo: null,
    bankDetails: {
      bankName: "",
      accountNumber: "",
      ifscCode: "",
      upiId: ""
    }
  });
  const [loading, setLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    checkSellerStatus();
  }, []);

  const checkSellerStatus = async () => {
    try {
      const res = await getSellerProfile();
      if (res.success && res.seller) {
        if (res.seller.status === 'approved') {
          router.replace("/(seller)/dashboard");
        } else {
          Alert.alert(t("Notice"), t("Your seller application is pending approval."));
          router.replace("/(buyer)/home");
        }
      }
    } catch (err) {
      console.log('Error checking seller profile:', err);
    } finally {
      setCheckingProfile(false);
    }
  };

  if (checkingProfile) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0575E6" />
      </View>
    );
  }

  const pickImage = async (field) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setForm({ ...form, [field]: result.assets[0].uri });
    }
  };

  const businessTypes = [
    "Importer",
    "Exporter",
    "Both",
    "Retailer",
    "Wholesaler",
  ];
  const handleBusinessTypeSelect = () => {
    const currentIndex = businessTypes.indexOf(form.businessType);
    const nextIndex = (currentIndex + 1) % businessTypes.length;
    setForm({ ...form, businessType: businessTypes[nextIndex] });
  };

  const handleNextStep = () => {
    if (
      !form.shopName ||
      !form.ownerName ||
      !form.phone ||
      !form.businessType
    ) {
      Alert.alert(t("Error"), t("Please fill all required fields"));
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    if (
      !form.bankDetails.bankName ||
      !form.bankDetails.accountNumber ||
      !form.bankDetails.ifscCode
    ) {
      Alert.alert(t("Error"), t("Please fill all required payment fields"));
      return;
    }
    try {
      setLoading(true);
      const res = await applyAsSeller({
        ...form,
        phone: `${selectedCountry.code}${form.phone}`
      });
      if (res.success) {
        Alert.alert(
          t("Success"),
          t("Application submitted! Awaiting approval."),
        );
        router.replace("/(seller)/dashboard");
      } else {
        Alert.alert(
          t("Error"),
          res.message || t("Failed to submit application"),
        );
      }
    } catch (error) {
      console.log("Apply seller error:", error);
      Alert.alert(t("Error"), t("Something went wrong. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Blue Header Gradient */}
          <LinearGradient
            colors={["#021B79", "#0575E6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.headerArea, { paddingTop: Math.max(insets.top + 24, 70), paddingBottom: 70 }]}
          >
            <View style={styles.headerSafeArea}>
              <Text style={styles.headerTitle}>UBS Global</Text>
              <Text style={styles.headerSubtitle}>{t("Become a Seller")}</Text>

              <View style={styles.progressContainer}>
                <View style={styles.progressTextRow}>
                  <Text style={styles.stepTextBold}>
                    {step === 1 ? t("Step 1 of 2") : t("Step 2 of 2")}
                  </Text>
                  <Text style={styles.stepText}>
                    {step === 1 ? t("Business Details") : t("Payment Details")}
                  </Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: step === 1 ? "50%" : "100%" }]} />
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* White Form Card */}
          <View style={styles.formCard}>
            {step === 1 ? (
              <>
                {/* Logo Upload (Overlapping) */}
                <View style={styles.logoSection}>
                  <View style={styles.logoWrapper}>
                    <TouchableOpacity
                      style={styles.logoCircle}
                      onPress={() => pickImage("shopLogo")}
                    >
                      {form.shopLogo ? (
                        <Image
                          source={{ uri: form.shopLogo }}
                          style={styles.logoImage}
                        />
                      ) : (
                        <>
                          <MaterialCommunityIcons
                            name="camera-plus-outline"
                            size={24}
                            color="#888"
                          />
                          <Text style={styles.logoPlaceholder}>{t("LOGO")}</Text>
                        </>
                      )}
                    </TouchableOpacity>
                    <View style={styles.editIconBadge}>
                      <MaterialCommunityIcons
                        name="pencil"
                        size={12}
                        color="#fff"
                      />
                    </View>
                  </View>
                  <Text style={styles.logoLabel}>{t("UPLOAD SHOP LOGO")}</Text>
                </View>

                {/* Form Fields Step 1 */}
                <View style={styles.fieldsContainer}>
                  <Text style={styles.label}>{t("SHOP NAME")}</Text>
                  <View style={styles.inputContainer}>
                    <MaterialCommunityIcons
                      name="storefront-outline"
                      size={20}
                      color="#888"
                    />
                    <TextInput
                      style={styles.input}
                      placeholder={t("Global Trade Hub")}
                      placeholderTextColor="#bbb"
                      value={form.shopName}
                      onChangeText={(text) => setForm({ ...form, shopName: text })}
                    />
                  </View>

                  <Text style={styles.label}>{t("OWNER FULL NAME")}</Text>
                  <View style={styles.inputContainer}>
                    <MaterialCommunityIcons
                      name="account-outline"
                      size={20}
                      color="#888"
                    />
                    <TextInput
                      style={styles.input}
                      placeholder={t("John Doe")}
                      placeholderTextColor="#bbb"
                      value={form.ownerName}
                      onChangeText={(text) => setForm({ ...form, ownerName: text })}
                    />
                  </View>

                  <Text style={styles.label}>{t("PHONE NUMBER")}</Text>
                  <View style={styles.phoneContainer}>
                    <TouchableOpacity 
                      style={styles.countryPicker}
                      onPress={() => setShowCountryPicker(true)}
                    >
                      <Text style={styles.countryText}>{selectedCountry.flag} {selectedCountry.code}</Text>
                      <MaterialCommunityIcons
                        name="chevron-down"
                        size={18}
                        color="#555"
                      />
                    </TouchableOpacity>
                    <TextInput
                      style={styles.phoneInput}
                      placeholder={t("123-456-7890")}
                      placeholderTextColor="#bbb"
                      keyboardType="phone-pad"
                      value={form.phone}
                      onChangeText={(text) => setForm({ ...form, phone: text })}
                    />
                  </View>

                  <Text style={styles.label}>
                    {t("BUSINESS TYPE (Tap to change)")}
                  </Text>
                  <TouchableOpacity
                    style={styles.inputContainer}
                    onPress={handleBusinessTypeSelect}
                  >
                    <MaterialCommunityIcons
                      name="briefcase-outline"
                      size={20}
                      color="#888"
                    />
                    <Text
                      style={[
                        styles.input,
                        { color: form.businessType ? "#333" : "#bbb" },
                      ]}
                    >
                      {form.businessType || t("Select Business Type")}
                    </Text>
                    <MaterialCommunityIcons
                      name="chevron-down"
                      size={20}
                      color="#888"
                    />
                  </TouchableOpacity>

                  <Text style={styles.label}>{t("FULL ADDRESS")}</Text>
                  <View style={styles.inputContainer}>
                    <MaterialCommunityIcons
                      name="map-marker-outline"
                      size={20}
                      color="#888"
                    />
                    <TextInput
                      style={styles.input}
                      placeholder={t("123 Logistic Way, Suite 400, Port City")}
                      placeholderTextColor="#bbb"
                      value={form.address}
                      onChangeText={(text) => setForm({ ...form, address: text })}
                    />
                  </View>

                  <Text style={styles.label}>{t("UPLOAD ID PROOF")}</Text>
                  <TouchableOpacity
                    style={styles.uploadDashed}
                    onPress={() => pickImage("idProof")}
                  >
                    <View style={styles.uploadIconCircle}>
                      <MaterialCommunityIcons
                        name="file-upload-outline"
                        size={20}
                        color="#0575E6"
                      />
                    </View>
                    <Text style={styles.uploadTextBold}>
                      {t("Tap to upload your ID or Business License")}
                    </Text>
                    <Text style={styles.uploadTextSmall}>
                      {t("PDF, JPG, or PNG (Max 5MB)")}
                    </Text>
                  </TouchableOpacity>

                  {/* Continue to Step 2 Button */}
                  <TouchableOpacity
                    style={styles.submitBtn}
                    onPress={handleNextStep}
                  >
                    <Text style={styles.submitBtnText}>
                      {t("Continue to Payment Details")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              /* Step 2 payment details form */
              <View style={styles.fieldsContainer}>
                <Text style={styles.label}>{t("BANK NAME")}</Text>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons
                    name="bank-outline"
                    size={20}
                    color="#888"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder={t("Chase Bank")}
                    placeholderTextColor="#bbb"
                    value={form.bankDetails.bankName}
                    onChangeText={(text) => setForm({ ...form, bankDetails: { ...form.bankDetails, bankName: text } })}
                  />
                </View>

                <Text style={styles.label}>{t("ACCOUNT NUMBER")}</Text>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons
                    name="numeric"
                    size={20}
                    color="#888"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder={t("1234567890")}
                    placeholderTextColor="#bbb"
                    keyboardType="numeric"
                    value={form.bankDetails.accountNumber}
                    onChangeText={(text) => setForm({ ...form, bankDetails: { ...form.bankDetails, accountNumber: text } })}
                  />
                </View>

                <Text style={styles.label}>{t("IFSC / ROUTING CODE")}</Text>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons
                    name="barcode"
                    size={20}
                    color="#888"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder={t("CHAS0001234")}
                    placeholderTextColor="#bbb"
                    autoCapitalize="characters"
                    value={form.bankDetails.ifscCode}
                    onChangeText={(text) => setForm({ ...form, bankDetails: { ...form.bankDetails, ifscCode: text } })}
                  />
                </View>

                <Text style={styles.label}>{t("UPI ID / PAYMENT ALIAS (OPTIONAL)")}</Text>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons
                    name="qrcode"
                    size={20}
                    color="#888"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder={t("john@upi")}
                    placeholderTextColor="#bbb"
                    autoCapitalize="none"
                    value={form.bankDetails.upiId}
                    onChangeText={(text) => setForm({ ...form, bankDetails: { ...form.bankDetails, upiId: text } })}
                  />
                </View>

                {/* Submit Application Button */}
                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitBtnText}>
                      {t("Submit Seller Request")}
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Back to Step 1 Button */}
                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={() => setStep(1)}
                  disabled={loading}
                >
                  <Text style={styles.backBtnText}>
                    {t("Back to Step 1")}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.noticeRow}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={14}
                color="#888"
              />
              <Text style={styles.noticeText}>
                {t("Your application will be reviewed within 24 hours")}
              </Text>
            </View>
          </View>

          {/* Bottom Badges */}
          <View style={styles.badgesContainer}>
            <View style={styles.badgeRow}>
              <View style={styles.badgeItem}>
                <MaterialCommunityIcons
                  name="shield-check-outline"
                  size={18}
                  color="#666"
                />
                <Text style={styles.badgeText}>{t("VERIFIED SELLER")}</Text>
              </View>
              <View style={styles.badgeItem}>
                <MaterialCommunityIcons name="earth" size={18} color="#666" />
                <Text style={styles.badgeText}>{t("GLOBAL EXPORT")}</Text>
              </View>
            </View>
            <View style={styles.badgeRow}>
              <View style={styles.badgeItem}>
                <MaterialCommunityIcons
                  name="shield-lock-outline"
                  size={18}
                  color="#666"
                />
                <Text style={styles.badgeText}>{t("SECURE PAYMENTS")}</Text>
              </View>
              <View style={styles.badgeItem}>
                <MaterialCommunityIcons name="headset" size={18} color="#666" />
                <Text style={styles.badgeText}>{t("24/7 SUPPORT")}</Text>
              </View>
            </View>
          </View>
          <View style={{ height: 60 }} />
        </ScrollView>

        {/* Country Picker Modal */}
        <Modal
          visible={showCountryPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCountryPicker(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setShowCountryPicker(false)}
            activeOpacity={1}
          >
            <View style={styles.modalSheet}>
              <Text style={styles.modalTitle}>{t('Select Country')}</Text>
              <FlatList
                data={COUNTRIES}
                keyExtractor={(item) => item.code + item.name}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.countryRow}
                    onPress={() => {
                      setSelectedCountry(item)
                      setShowCountryPicker(false)
                    }}
                  >
                    <Text style={styles.countryFlag}>{item.flag}</Text>
                    <Text style={styles.countryName}>{item.name}</Text>
                    <Text style={styles.countryCode}>{item.code}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  headerArea: {
    paddingTop: 80,
    paddingBottom: 80,
    paddingHorizontal: 20,
  },
  headerSafeArea: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#E0F0FF",
    marginTop: 4,
    marginBottom: 24,
  },
  progressContainer: {
    width: "100%",
    paddingHorizontal: 10,
  },
  progressTextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  stepTextBold: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  stepText: {
    color: "#E0F0FF",
    fontSize: 12,
    fontWeight: "500",
  },
  progressBarBg: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
    width: "100%",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#33D1FF",
    borderRadius: 2,
  },
  formCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 16,
    marginTop: -30,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  logoSection: {
    alignItems: "center",
    marginTop: -60,
    marginBottom: 20,
  },
  logoWrapper: {
    position: "relative",
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EAEAEA",
    borderWidth: 3,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  logoPlaceholder: {
    fontSize: 10,
    color: "#888",
    fontWeight: "600",
    marginTop: 2,
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  editIconBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#021B79",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  logoLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#333",
    marginTop: 10,
    letterSpacing: 0.5,
  },
  fieldsContainer: {
    width: "100%",
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: "#222",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: "#333",
  },
  phoneContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  countryPicker: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginRight: 10,
  },
  countryText: {
    fontSize: 14,
    color: "#333",
    marginRight: 6,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    color: "#333",
  },
  uploadDashed: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#C0D4EB",
    borderRadius: 12,
    backgroundColor: "#F8FBFF",
    paddingVertical: 24,
    alignItems: "center",
    marginBottom: 20,
  },
  uploadIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#D6E9FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  uploadTextBold: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 4,
    lineHeight: 18,
  },
  uploadTextSmall: {
    fontSize: 11,
    color: "#777",
  },
  submitBtn: {
    backgroundColor: "#1a237e",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  backBtn: {
    borderWidth: 1.5,
    borderColor: "#1a237e",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "transparent",
  },
  backBtnText: {
    color: "#1a237e",
    fontSize: 15,
    fontWeight: "700",
  },
  noticeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  noticeText: {
    fontSize: 12,
    color: "#888",
    marginLeft: 6,
  },
  badgesContainer: {
    marginTop: 30,
    paddingHorizontal: 30,
  },
  badgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  badgeItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#666",
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '50%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a237e',
    marginBottom: 16,
    textAlign: 'center',
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  countryFlag: {
    fontSize: 20,
    marginRight: 12,
  },
  countryName: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  countryCode: {
    fontSize: 15,
    color: '#666',
    fontWeight: '600',
  },
});
