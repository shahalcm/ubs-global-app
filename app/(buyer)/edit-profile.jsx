import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Switch,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../context/AuthContext";
import { updateProfile, updateAvatar, updatePrivacySettings } from "../../services/userService";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'hi', label: 'Hindi', flag: '🇮🇳' },
  { code: 'ml', label: 'Malayalam', flag: '🇮🇳' },
  { code: 'es', label: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', label: 'French', flag: '🇫🇷' },
  { code: 'de', label: 'German', flag: '🇩🇪' },
  { code: 'ar', label: 'Arabic', flag: '🇦🇪' },
  { code: 'zh', label: 'Chinese', flag: '🇨🇳' },
  { code: 'ru', label: 'Russian', flag: '🇷🇺' },
];

export default function EditProfileScreen() {
  const { t, i18n } = useTranslation();
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [avatarUri, setAvatarUri] = useState(user?.avatar || "https://via.placeholder.com/150");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Address state
  const [street, setStreet] = useState(user?.address?.street || "");
  const [city, setCity] = useState(user?.address?.city || user?.location?.city || "");
  const [state, setState] = useState(user?.address?.state || user?.location?.state || "");
  const [country, setCountry] = useState(user?.address?.country || user?.location?.country || "");
  const [zipCode, setZipCode] = useState(user?.address?.zipCode || "");

  // Preferences & Consents
  const [selectedLanguage, setSelectedLanguage] = useState(user?.language || i18n.language || 'en');
  const [marketingConsent, setMarketingConsent] = useState(user?.privacySettings?.marketingConsent ?? false);
  const [analyticsConsent, setAnalyticsConsent] = useState(user?.privacySettings?.analyticsConsent ?? true);

  const [saving, setSaving] = useState(false);

  const handlePickAvatar = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(t("Permission Required"), t("Permission to access photo library is required."));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        const pickedUri = result.assets[0].uri;
        setAvatarUri(pickedUri);
        setUploadingAvatar(true);

        const res = await updateAvatar(pickedUri);
        if (res.success && res.avatar) {
          setAvatarUri(res.avatar);
          await updateUser({ ...user, avatar: res.avatar });
          Alert.alert(t("Success"), t("Profile photo updated!"));
        }
      }
    } catch (err) {
      console.log("Avatar pick error:", err);
      Alert.alert(t("Error"), t("Failed to update profile image."));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t("Error"), t("Name is required"));
      return;
    }

    try {
      setSaving(true);

      // Save privacy consents if changed
      updatePrivacySettings({
        marketingConsent,
        dataProcessingConsent: true,
        analyticsConsent,
      }).catch(() => {});

      // Switch language if changed
      if (selectedLanguage !== i18n.language) {
        i18n.changeLanguage(selectedLanguage);
      }

      const res = await updateProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        language: selectedLanguage,
        address: {
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          country: country.trim(),
          zipCode: zipCode.trim(),
        },
      });

      if (res.success) {
        await updateUser(res.user);
        Alert.alert(t("Success"), t("Profile updated successfully."));
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(buyer)/profile');
        }
      } else {
        Alert.alert(t("Error"), res.message || t("Failed to update profile."));
      }
    } catch (err) {
      console.log("Error updating profile:", err);
      Alert.alert(t("Error"), t("An unexpected error occurred."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Top Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(buyer)/profile'))}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1a237e" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('Edit Profile')}</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* Avatar Hero Card */}
          <LinearGradient
            colors={['#1a237e', '#283593']}
            style={styles.avatarCard}
          >
            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: avatarUri }}
                style={styles.avatarImage}
                contentFit="cover"
                transition={200}
              />
              {uploadingAvatar ? (
                <View style={styles.avatarLoadingOverlay}>
                  <ActivityIndicator size="small" color="#fff" />
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.cameraBtn}
                  onPress={handlePickAvatar}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="camera" size={16} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.userName}>{name || user?.name}</Text>
            <View style={styles.roleBadge}>
              <MaterialCommunityIcons name="shield-check" size={14} color="#4caf50" />
              <Text style={styles.roleBadgeText}>
                {user?.role === 'seller' ? t('Approved Seller') : t('Verified Buyer')}
              </Text>
            </View>
          </LinearGradient>

          {/* Personal Details Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="account-circle-outline" size={22} color="#1a237e" />
              <Text style={styles.sectionTitle}>{t('Personal Details')}</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('Full Name')}</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="account-outline" size={20} color="#777" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder={t('Enter full name')}
                  placeholderTextColor="#999"
                  editable={!saving}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('Email Address')}</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="email-outline" size={20} color="#777" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder={t('Enter email')}
                  placeholderTextColor="#999"
                  editable={!saving}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('Phone Number')}</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="phone-outline" size={20} color="#777" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholder={t('Enter phone number')}
                  placeholderTextColor="#999"
                  editable={!saving}
                />
              </View>
            </View>
          </View>

          {/* Shipping Address Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="map-marker-outline" size={22} color="#1a237e" />
              <Text style={styles.sectionTitle}>{t('Delivery Address')}</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('Street Address')}</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="home-outline" size={20} color="#777" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={street}
                  onChangeText={setStreet}
                  placeholder={t('House, Street, Apartment')}
                  placeholderTextColor="#999"
                  editable={!saving}
                />
              </View>
            </View>

            <View style={styles.rowTwo}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>{t('City')}</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="city-variant-outline" size={18} color="#777" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={city}
                    onChangeText={setCity}
                    placeholder={t('City')}
                    placeholderTextColor="#999"
                    editable={!saving}
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>{t('State')}</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="map-outline" size={18} color="#777" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={state}
                    onChangeText={setState}
                    placeholder={t('State')}
                    placeholderTextColor="#999"
                    editable={!saving}
                  />
                </View>
              </View>
            </View>

            <View style={styles.rowTwo}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>{t('Country')}</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="earth" size={18} color="#777" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={country}
                    onChangeText={setCountry}
                    placeholder={t('Country')}
                    placeholderTextColor="#999"
                    editable={!saving}
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>{t('Zip Code')}</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="numeric" size={18} color="#777" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={zipCode}
                    onChangeText={setZipCode}
                    keyboardType="number-pad"
                    placeholder={t('Zip Code')}
                    placeholderTextColor="#999"
                    editable={!saving}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Preferred Language Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="translate" size={22} color="#1a237e" />
              <Text style={styles.sectionTitle}>{t('App Language')}</Text>
            </View>

            <View style={styles.langGrid}>
              {LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.langChip,
                    selectedLanguage === lang.code && styles.langChipActive,
                  ]}
                  onPress={() => setSelectedLanguage(lang.code)}
                >
                  <Text style={styles.langFlag}>{lang.flag}</Text>
                  <Text
                    style={[
                      styles.langText,
                      selectedLanguage === lang.code && styles.langTextActive,
                    ]}
                  >
                    {lang.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Privacy & Consents Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="shield-lock-outline" size={22} color="#1a237e" />
              <Text style={styles.sectionTitle}>{t('Privacy & Notifications')}</Text>
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchTitle}>{t('Marketing Updates')}</Text>
                <Text style={styles.switchSubtitle}>
                  {t('Receive promotional emails, sales & deal notifications.')}
                </Text>
              </View>
              <Switch
                value={marketingConsent}
                onValueChange={setMarketingConsent}
                trackColor={{ false: '#d0d0d0', true: '#c5cae9' }}
                thumbColor={marketingConsent ? '#1a237e' : '#f4f3f4'}
              />
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchTitle}>{t('App Analytics')}</Text>
                <Text style={styles.switchSubtitle}>
                  {t('Help improve app performance & user recommendations.')}
                </Text>
              </View>
              <Switch
                value={analyticsConsent}
                onValueChange={setAnalyticsConsent}
                trackColor={{ false: '#d0d0d0', true: '#c5cae9' }}
                thumbColor={analyticsConsent ? '#1a237e' : '#f4f3f4'}
              />
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Floating Footer Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.88}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <View style={styles.saveBtnContent}>
              <MaterialCommunityIcons name="content-save-check-outline" size={20} color="#fff" />
              <Text style={styles.saveBtnText}>{t('Save Changes')}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fd",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1a237e",
  },
  content: {
    padding: 16,
  },
  avatarCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#1a237e",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 12,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.9)",
  },
  avatarLoadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 48,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#ffab00",
    borderRadius: 18,
    padding: 7,
    borderWidth: 2,
    borderColor: "#fff",
  },
  userName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  roleBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eef1f8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1a237e",
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#444",
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f6fa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e8e8e8",
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  rowTwo: {
    flexDirection: "row",
    gap: 10,
  },
  langGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  langChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f6fa",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    gap: 6,
  },
  langChipActive: {
    backgroundColor: "#1a237e",
    borderColor: "#1a237e",
  },
  langFlag: {
    fontSize: 14,
  },
  langText: {
    fontSize: 12,
    color: "#555",
    fontWeight: "600",
  },
  langTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  switchSubtitle: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
    maxWidth: 240,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
  },
  saveBtn: {
    backgroundColor: "#1a237e",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1a237e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  saveBtnDisabled: {
    backgroundColor: "#9fa8da",
  },
  saveBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});
