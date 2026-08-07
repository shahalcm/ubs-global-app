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
  Alert,
  FlatList,
  NativeModules,
} from "react-native";
import RazorpayCheckout from "react-native-razorpay";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import api from "../../services/api";
import { applyAsSeller, getSellerProfile } from "../../services/sellerService";
import FormattedPrice from "../../components/common/FormattedPrice";
import { useCurrency } from "../../context/CurrencyContext";

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
  let t = (str) => str;
  try {
    const { t: trans } = useTranslation();
    if (trans) t = trans;
  } catch (e) {
    // i18n fallback
  }
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [registrationFee, setRegistrationFee] = useState(10);
  const [selectedPayMethod, setSelectedPayMethod] = useState("card");
  const [form, setForm] = useState({
    shopName: "",
    ownerName: "",
    phone: "",
    address: "",
    businessType: "",
    gstNumber: "",
    website: "",
    categories: "",
    yearEstablished: "",
    description: "",
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
    fetchRegistrationFee();
  }, []);

  const fetchRegistrationFee = async () => {
    try {
      const res = await api.get('/sellers/registration-fee');
      if (res.data?.success && res.data?.registrationFee) {
        setRegistrationFee(res.data.registrationFee);
      }
    } catch (err) {
      console.log('Error fetching registration fee:', err);
    }
  };

  const checkSellerStatus = async () => {
    try {
      const res = await getSellerProfile();
      if (res.success && res.seller && res.seller.registrationFeePaid) {
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

  const handleStep2Next = () => {
    if (
      !form.bankDetails.bankName ||
      !form.bankDetails.accountNumber ||
      !form.bankDetails.ifscCode
    ) {
      Alert.alert(t("Error"), t("Please fill all required payment fields"));
      return;
    }
    setStep(3);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      let razorpayOrderId = '';
      let razorpayPaymentId = '';
      let razorpaySignature = '';

      // Step 1: Create Razorpay Subscription Order ($10 USD / year)
      try {
        const orderRes = await api.post('/sellers/create-subscription-order');
        if (orderRes.data?.success && orderRes.data?.razorpayOrderId) {
          razorpayOrderId = orderRes.data.razorpayOrderId;
          const key = orderRes.data.key;
          const rzpAmount = orderRes.data.amount;

          const isExpoGoApp = Constants.appOwnership === 'expo' || Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
          const isNativeModuleAvailable = !!(NativeModules?.RNRazorpayCheckout && typeof RazorpayCheckout?.open === 'function');

          if (isNativeModuleAvailable && key) {
            const options = {
              description: `UBS Global Seller Yearly Membership ($10/year)`,
              image: 'https://cdn-icons-png.flaticon.com/512/3143/3143212.png',
              currency: 'INR',
              key: key,
              amount: rzpAmount,
              name: 'UBS Global Seller Subscription',
              order_id: razorpayOrderId,
              prefill: {
                name: form.ownerName || '',
                phone: form.phone || ''
              },
              theme: { color: '#021B79' }
            };
            const rzpData = await RazorpayCheckout.open(options);
            razorpayPaymentId = rzpData?.razorpay_payment_id || '';
            razorpaySignature = rzpData?.razorpay_signature || '';
          } else if (isExpoGoApp) {
            console.log('ℹ️ Running in Expo Go environment: Native Razorpay SDK requires standalone APK / development build');
            Alert.alert(
              t("Expo Go Notice"),
              t("Native Razorpay checkout is not available inside Expo Go. Please build a Standalone APK or Development Build (npx expo run:android) to perform native Razorpay payments.")
            );
            setLoading(false);
            return;
          } else {
            console.warn('⚠️ Native Razorpay module (RNRazorpayCheckout) is missing from current app binary');
            Alert.alert(
              t("Native Build Required"),
              t("Razorpay native checkout module is missing from this app binary. Please ensure react-native-razorpay is linked.")
            );
            setLoading(false);
            return;
          }
        }
      } catch (rzpErr) {
        console.warn('Razorpay seller subscription checkout notice:', rzpErr);
        if (rzpErr?.code === 2 || rzpErr?.code === 0 || rzpErr?.description === 'Payment cancelled by user') {
          Alert.alert(t("Payment Cancelled"), t("Seller subscription payment was cancelled."));
          setLoading(false);
          return;
        }
      }

      // Step 2: Submit Application with Payment Verification
      const res = await applyAsSeller({
        ...form,
        phone: `${selectedCountry.code}${form.phone}`,
        registrationFeeAmount: registrationFee,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        paymentMethod: 'Razorpay ($10/Year Plan)'
      });

      if (res.success) {
        Alert.alert(
          t("Success"),
          t(`Application & $${registrationFee.toFixed(2)} Yearly Seller Membership Fee received! Valid for 1 year (Renews annually).`),
        );
        router.replace("/(seller)/dashboard");
      } else {
        Alert.alert(
          t("Notice"),
          res.message || t("Failed to submit application"),
        );
      }
    } catch (error) {
      console.log("Apply seller error:", error);
      const errMsg = error.response?.data?.message || error.message || t("Something went wrong. Please try again.");
      Alert.alert(t("Error"), errMsg);
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
                    {step === 1 ? t("Step 1 of 3") : step === 2 ? t("Step 2 of 3") : t("Step 3 of 3")}
                  </Text>
                  <Text style={styles.stepText}>
                    {step === 1 ? t("Business Details") : step === 2 ? t("Bank Details") : t("Store Fee Payment")}
                  </Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }]} />
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

                  <Text style={styles.label}>{t("TAX / GST / VAT ID (OPTIONAL)")}</Text>
                  <View style={styles.inputContainer}>
                    <MaterialCommunityIcons
                      name="text-box-check-outline"
                      size={20}
                      color="#888"
                    />
                    <TextInput
                      style={styles.input}
                      placeholder={t("22AAAAA0000A1Z5")}
                      placeholderTextColor="#bbb"
                      autoCapitalize="characters"
                      value={form.gstNumber}
                      onChangeText={(text) => setForm({ ...form, gstNumber: text })}
                    />
                  </View>

                  <Text style={styles.label}>{t("PRIMARY PRODUCT CATEGORIES")}</Text>
                  <View style={styles.inputContainer}>
                    <MaterialCommunityIcons
                      name="shape-outline"
                      size={20}
                      color="#888"
                    />
                    <TextInput
                      style={styles.input}
                      placeholder={t("Textiles, Electronics, Agriculture, Machinery")}
                      placeholderTextColor="#bbb"
                      value={form.categories}
                      onChangeText={(text) => setForm({ ...form, categories: text })}
                    />
                  </View>

                  <Text style={styles.label}>{t("YEAR ESTABLISHED")}</Text>
                  <View style={styles.inputContainer}>
                    <MaterialCommunityIcons
                      name="calendar-month-outline"
                      size={20}
                      color="#888"
                    />
                    <TextInput
                      style={styles.input}
                      placeholder={t("2018")}
                      placeholderTextColor="#bbb"
                      keyboardType="numeric"
                      maxLength={4}
                      value={form.yearEstablished}
                      onChangeText={(text) => setForm({ ...form, yearEstablished: text })}
                    />
                  </View>

                  <Text style={styles.label}>{t("COMPANY WEBSITE (OPTIONAL)")}</Text>
                  <View style={styles.inputContainer}>
                    <MaterialCommunityIcons
                      name="web"
                      size={20}
                      color="#888"
                    />
                    <TextInput
                      style={styles.input}
                      placeholder={t("https://www.yourcompany.com")}
                      placeholderTextColor="#bbb"
                      keyboardType="url"
                      autoCapitalize="none"
                      value={form.website}
                      onChangeText={(text) => setForm({ ...form, website: text })}
                    />
                  </View>

                  <Text style={styles.label}>{t("BUSINESS DESCRIPTION / ABOUT SHOP")}</Text>
                  <View style={[styles.inputContainer, { height: 80, alignItems: 'flex-start', paddingTop: 10 }]}>
                    <MaterialCommunityIcons
                      name="text-account"
                      size={20}
                      color="#888"
                    />
                    <TextInput
                      style={[styles.input, { textAlignVertical: 'top' }]}
                      placeholder={t("Briefly describe your export/import products and capabilities...")}
                      placeholderTextColor="#bbb"
                      multiline
                      numberOfLines={3}
                      value={form.description}
                      onChangeText={(text) => setForm({ ...form, description: text })}
                    />
                  </View>

                  <Text style={styles.label}>{t("UPLOAD ID PROOF")}</Text>
                  {form.idProof ? (
                    <View style={styles.uploadedIdBox}>
                      <View style={styles.uploadedHeader}>
                        <View style={styles.uploadedTitleRow}>
                          <MaterialCommunityIcons
                            name="check-circle"
                            size={20}
                            color="#2e7d32"
                          />
                          <Text style={styles.uploadedTextBold} numberOfLines={1}>
                            {t("ID Proof Uploaded")}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.changeIdBtn}
                          onPress={() => pickImage("idProof")}
                        >
                          <MaterialCommunityIcons name="pencil" size={13} color="#0575E6" />
                          <Text style={styles.changeIdBtnText}>{t("Change")}</Text>
                        </TouchableOpacity>
                      </View>

                      <View style={styles.idPreviewContainer}>
                        <Image
                          source={{ uri: form.idProof }}
                          style={styles.idPreviewImage}
                          resizeMode="cover"
                        />
                        <TouchableOpacity
                          style={styles.removeIdBtn}
                          onPress={() => setForm({ ...form, idProof: null })}
                        >
                          <MaterialCommunityIcons name="trash-can-outline" size={18} color="#d32f2f" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
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
                  )}

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
            ) : step === 2 ? (
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

                {/* Continue to Step 3 Button */}
                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleStep2Next}
                >
                  <Text style={styles.submitBtnText}>
                    {t("Continue to Registration Fee")}
                  </Text>
                </TouchableOpacity>

                {/* Back to Step 1 Button */}
                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={() => setStep(1)}
                >
                  <Text style={styles.backBtnText}>
                    {t("Back to Step 1")}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Step 3 Store Registration Fee Payment */
              <View style={styles.fieldsContainer}>
                {/* Fee Header Card */}
                <View style={styles.feeBannerCard}>
                  <View style={styles.feeBadgeContainer}>
                    <Text style={styles.feeBadgeText}>{t("YEARLY SUBSCRIPTION PLAN")}</Text>
                  </View>
                  <FormattedPrice amount={registrationFee} style={styles.feeAmountText} />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#0575E6', marginTop: 4 }}>
                    {t("$10.00 / Year • Valid for 1 Year (Renews Annually)")}
                  </Text>
                  <Text style={styles.feeTitleText}>{t("Annual Seller Store Membership & Verification")}</Text>
                  <Text style={styles.feeDescText}>
                    {t("Annual subscription fee ($10/year) to activate your verified global export store, seller dashboard, AI assistant, and international buyer network. Valid for 1 year and renews annually.")}
                  </Text>
                </View>

                {/* Payment Gateway Selector */}
                <Text style={styles.label}>{t("SECURE PAYMENT GATEWAY")}</Text>
                
                <View style={[styles.payMethodOption, styles.payMethodActive]}>
                  <MaterialCommunityIcons name="credit-card-outline" size={24} color="#0575E6" />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.payMethodTitle}>{t("Razorpay Payment Gateway")}</Text>
                    <Text style={styles.payMethodSub}>{t("UPI, Credit/Debit Cards, Net Banking & Wallets")}</Text>
                  </View>
                  <MaterialCommunityIcons name="check-circle" size={20} color="#0575E6" />
                </View>

                {/* Price Summary Breakdown */}
                <View style={styles.summaryCard}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>{t("Seller Membership (Yearly Plan)")}</Text>
                    <FormattedPrice amount={registrationFee} style={styles.summaryVal} />
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>{t("Validity Period")}</Text>
                    <Text style={[styles.summaryVal, { color: '#0575E6' }]}>{t("1 Year (Renews Annually)")}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>{t("Global Marketplace Access")}</Text>
                    <Text style={[styles.summaryVal, { color: '#4caf50' }]}>{t("INCLUDED")}</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryTotalLabel}>{t("Total Due Now")}</Text>
                    <FormattedPrice amount={registrationFee} style={styles.summaryTotalVal} />
                  </View>
                </View>

                {/* Pay & Submit Button */}
                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitBtnText}>
                      Pay $10 & Submit Application
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Back to Step 2 Button */}
                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={() => setStep(2)}
                  disabled={loading}
                >
                  <Text style={styles.backBtnText}>
                    {t("Back to Step 2")}
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
  uploadedIdBox: {
    borderWidth: 1.5,
    borderColor: "#4caf50",
    borderRadius: 14,
    padding: 14,
    backgroundColor: "#f1f8e9",
    marginBottom: 16,
  },
  uploadedHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    width: "100%",
  },
  uploadedTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  uploadedTextBold: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2e7d32",
    flexShrink: 1,
  },
  changeIdBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#e3f2fd",
    borderRadius: 6,
    shrink: 0,
  },
  changeIdBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0575E6",
  },
  idPreviewContainer: {
    position: "relative",
    width: "100%",
    height: 140,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#e0e0e0",
  },
  idPreviewImage: {
    width: "100%",
    height: "100%",
  },
  removeIdBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 6,
    borderRadius: 20,
    elevation: 2,
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
  // Step 3 Fee Payment Styles
  feeBannerCard: {
    backgroundColor: "#021B79",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  feeBadgeContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  feeBadgeText: {
    color: "#90caf9",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  feeAmountText: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 4,
  },
  feeTitleText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
  },
  feeDescText: {
    color: "#b0bec5",
    fontSize: 11,
    textAlign: "center",
    lineHeight: 16,
  },
  payMethodOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  payMethodActive: {
    borderColor: "#0575E6",
    backgroundColor: "#e3f2fd",
  },
  payMethodTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333",
  },
  payMethodSub: {
    fontSize: 11,
    color: "#666",
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginVertical: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  summaryVal: {
    fontSize: 12,
    color: "#333",
    fontWeight: "700",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 8,
  },
  summaryTotalLabel: {
    fontSize: 14,
    color: "#1a237e",
    fontWeight: "800",
  },
  summaryTotalVal: {
    fontSize: 16,
    color: "#1a237e",
    fontWeight: "900",
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
