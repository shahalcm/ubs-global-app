// app/(auth)/complete-profile.jsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as WebBrowser from 'expo-web-browser'
import * as Google from 'expo-auth-session/providers/google'
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { signUp } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { getEnv } from '../../utils/env';

WebBrowser.maybeCompleteAuthSession()

export default function CompleteProfileScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pincode, setPincode] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);
  const [locationDetails, setLocationDetails] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login, loginWithGoogle } = useAuth();
  const { phone: rawPhone } = useLocalSearchParams() || {};
  const phone = rawPhone ? rawPhone.replace(/ /g, '+') : '';
  const [googleLoading, setGoogleLoading] = useState(false)

  // Configure Google Auth Request (fall back to web client ID and force useProxy to make it work in Expo Go)
  const webClientId = getEnv('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID', '522208568376-placeholder.apps.googleusercontent.com')
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId,
    iosClientId: getEnv('EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID', webClientId),
    androidClientId: getEnv('EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID', webClientId),
    projectNameForProxy: '@shahalsonu1818/client',
    useProxy: true,
    redirectUri: 'https://auth.expo.io/@shahalsonu1818/client',
  })

  // Handle Google Auth Response
  React.useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.authentication?.idToken || response.params?.id_token
      if (idToken) {
        handleGoogleAuthSuccess(idToken)
      } else {
        setGoogleLoading(false)
        Alert.alert(t('Error'), t('Failed to retrieve authentication token from Google.'))
      }
    } else if (response?.type === 'error') {
      setGoogleLoading(false)
      Alert.alert(t('Error'), response.error?.message || t('Google sign in error.'))
    }
  }, [response])

  const handleGoogleAuthSuccess = async (idToken) => {
    setGoogleLoading(true)
    try {
      const result = await loginWithGoogle(idToken)
      if (result?.success) {
        router.replace('/(auth)/role-select')
      }
    } catch (error) {
      console.error('Firebase/Backend Google Login Error:', error)
      Alert.alert(t('Error'), t('Failed to authenticate with Google. Please try again.'))
    } finally {
      setGoogleLoading(false)
    }
  }

  const validate = () => {
    const newErrors = {};
    if (!fullName.trim()) newErrors.fullName = t("Full name is required");
    if (!email.trim()) newErrors.email = t("Email is required");
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = t("Invalid email");
    if (!password) newErrors.password = t("Password is required");
    else if (password.length < 6) newErrors.password = t("Min 6 characters");
    if (!confirmPassword) newErrors.confirmPassword = t("Please confirm password");
    else if (password !== confirmPassword)
      newErrors.confirmPassword = t("Passwords do not match");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const handleContinue = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      let locationToSave = locationDetails;
      if (!locationToSave && pincode) {
        locationToSave = await resolveLocationFromPincode(pincode);
      }
      const res = await signUp({
        name: fullName,
        email,
        password,
        phone: phone || `+91${Math.floor(Math.random() * 1000000000)}`,
        location: locationToSave
      });
      await login(res.user, res.token);
      router.push("/(auth)/role-select");
    } catch (error) {
      Alert.alert(t('Error'), error.response?.data?.message || t('Signup failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = loc.coords;
        
        // Reverse geocode
        const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (geocode && geocode.length > 0) {
          const first = geocode[0];
          const city = first.city || first.subregion || first.district || "";
          const state = first.region || "";
          const country = first.country || "";
          const fullAddress = [
            first.name,
            first.street,
            first.subregion,
            first.city,
            first.region,
            first.postalCode,
            first.country
          ].filter(Boolean).join(", ");
          
          setLocationDetails({
            latitude,
            longitude,
            city,
            state,
            country,
            fullAddress
          });
          setLocationGranted(true);
          if (first.postalCode) {
            setPincode(first.postalCode);
          }
        } else {
          // Fallback if reverse geocoding results empty but GPS available
          setLocationDetails({
            latitude,
            longitude,
            city: "",
            state: "",
            country: "",
            fullAddress: `GPS: ${latitude}, ${longitude}`
          });
          setLocationGranted(true);
        }
      } else {
        Alert.alert(t('Permission Denied'), t('Location permission is required to fetch your current location.'));
      }
    } catch (error) {
      console.log(error);
      Alert.alert(t('Error'), t('Failed to fetch location. Please enter pincode manually.'));
    } finally {
      setLocationLoading(false);
    }
  };

  const handleGoogleContinue = async () => {
    setGoogleLoading(true)
    try {
      const result = await promptAsync({
        useProxy: true,
        projectNameForProxy: '@shahalsonu1818/client',
      })
      if (result?.type !== 'success') {
        setGoogleLoading(false)
      }
    } catch (error) {
      console.error('Google login trigger error:', error)
      setGoogleLoading(false)
      Alert.alert(t('Error'), t('Failed to launch Google authentication.'))
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => router.canGoBack() ? router.back() : router.replace('/(auth)/login')}
            style={styles.menuBtn}
          >
          </TouchableOpacity>

          <Text style={styles.topTitle}>UBS Global</Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Page Title */}
          <Text style={styles.pageTitle}>{t('Complete Your Profile')}</Text>
          <Text style={styles.pageSubtitle}>
            {t('Join our global network of international traders.')}
          </Text>

          {/* Verification Notice */}
          <View style={styles.noticeCard}>
            <View style={styles.noticeIconBox}>
              <Text style={styles.noticeIconText}>i</Text>
            </View>
            <View style={styles.noticeTextBox}>
              <Text style={styles.noticeTitle}>{t('Verification Notice')}</Text>
              <Text style={styles.noticeDesc}>
                {t('Please ensure your Full Name matches the legal name on your government-issued identification to prevent delays in shipping and financial settlements.')}
              </Text>
            </View>
          </View>

          {/* Full Name */}
          <Text style={styles.label}>{t('Full Name')}</Text>
          <View style={[styles.inputBox, errors.fullName && styles.inputError]}>
            <Text style={styles.inputIcon}>👤</Text>
            <TextInput
              style={styles.input}
              placeholder={t('John Doe')}
              placeholderTextColor="#bbb"
              value={fullName}
              onChangeText={(v) => {
                setFullName(v);
                setErrors((e) => ({ ...e, fullName: null }));
              }}
              autoCapitalize="words"
            />
          </View>
          {errors.fullName && (
            <Text style={styles.errorText}>{errors.fullName}</Text>
          )}

          {/* Email */}
          <Text style={styles.label}>{t('Email Address')}</Text>
          <View style={[styles.inputBox, errors.email && styles.inputError]}>
            <Text style={styles.inputIcon}>✉️</Text>
            <TextInput
              style={styles.input}
              placeholder={t('email@ubsglobal.com')}
              placeholderTextColor="#bbb"
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                setErrors((e) => ({ ...e, email: null }));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          {/* Password */}
          <Text style={styles.label}>{t('Password')}</Text>
          <View style={[styles.inputBox, errors.password && styles.inputError]}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder={t('••••••••')}
              placeholderTextColor="#bbb"
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                setErrors((e) => ({ ...e, password: null }));
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeBtn}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#666"
              />
            </TouchableOpacity>
          </View>
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}

          {/* Confirm Password */}
          <Text style={styles.label}>{t('Confirm Password')}</Text>
          <View
            style={[
              styles.inputBox,
              errors.confirmPassword && styles.inputError,
            ]}
          >
            <Text style={styles.inputIcon}>🔄</Text>
            <TextInput
              style={styles.input}
              placeholder={t('••••••••')}
              placeholderTextColor="#bbb"
              value={confirmPassword}
              onChangeText={(v) => {
                setConfirmPassword(v);
                setErrors((e) => ({ ...e, confirmPassword: null }));
              }}
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowConfirm(!showConfirm)}
              style={styles.eyeBtn}
            >
              <Ionicons
                name={showConfirm ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#666"
              />
            </TouchableOpacity>
          </View>
          {errors.confirmPassword && (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          )}

          {/* Location */}
          <Text style={styles.label}>{t('Location')}</Text>
          <View style={styles.locationContainer}>
            <TouchableOpacity 
              style={[styles.locationBtn, locationGranted && styles.locationBtnSuccess]} 
              onPress={handleCurrentLocation}
              disabled={locationLoading}
            >
              <Ionicons name={locationGranted ? "checkmark-circle" : "location-outline"} size={20} color={locationGranted ? "#fff" : "#1a237e"} />
              <Text style={[styles.locationBtnText, locationGranted && styles.locationBtnTextSuccess]}>
                {locationLoading ? t('Fetching Location...') : locationGranted ? t('Location Added') : t('Use Current Location')}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.orRowLoc}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>{t('OR')}</Text>
              <View style={styles.orLine} />
            </View>

            <View style={styles.inputBox}>
              <Text style={styles.inputIcon}>📍</Text>
              <TextInput
                style={styles.input}
                placeholder={t('Enter Pincode')}
                placeholderTextColor="#bbb"
                value={pincode}
                onChangeText={setPincode}
                keyboardType="numeric"
                maxLength={6}
              />
            </View>
          </View>

          {/* OR Divider */}
          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>{t('OR')}</Text>
            <View style={styles.orLine} />
          </View>

          {/* Google Button */}
          <TouchableOpacity
            style={[styles.googleBtn, (googleLoading || loading) && { opacity: 0.6 }]}
            onPress={handleGoogleContinue}
            disabled={googleLoading || loading}
          >
            {googleLoading ? (
              <ActivityIndicator color="#1a237e" size="small" />
            ) : (
              <>
                <View style={styles.googleIconBox}>
                  <Text style={styles.googleIconText}>G</Text>
                </View>
                <Text style={styles.googleBtnText}>{t('Continue with Google')}</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Spacer for sticky button */}
          <View style={{ height: 110 }} />
        </ScrollView>

        {/* Sticky Continue Button */}
        <View style={[styles.stickyBottom, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TouchableOpacity
            style={[styles.continueBtn, loading && { opacity: 0.6 }]}
            onPress={handleContinue}
            disabled={loading}
          >
            <Text style={styles.continueBtnText}>
              {loading ? t('Please wait...') : t('Continue')}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef1f8",
  },

  // Top Bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#eef1f8",
    position: "relative",
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
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },

  // Page Title
  pageTitle: {
    fontSize: 30,
    fontWeight: "700",
    color: "#111",
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },

  // Notice Card
  noticeCard: {
    flexDirection: "row",
    backgroundColor: "#dbeafe",
    borderRadius: 14,
    padding: 16,
    marginBottom: 28,
    gap: 12,
    alignItems: "flex-start",
  },
  noticeIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#1565c0",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  noticeIconText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1565c0",
  },
  noticeTextBox: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1565c0",
    marginBottom: 4,
  },
  noticeDesc: {
    fontSize: 13,
    color: "#1e40af",
    lineHeight: 20,
  },

  // Form
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#dde3f0",
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 16,
    gap: 10,
  },
  inputError: {
    borderColor: "#f44336",
  },
  inputIcon: {
    fontSize: 18,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1a237e",
  },
  eyeBtn: {
    padding: 4,
  },
  eyeIcon: {
    fontSize: 18,
  },
  errorText: {
    fontSize: 12,
    color: "#f44336",
    marginTop: -12,
    marginBottom: 12,
    marginLeft: 4,
  },

  // OR Divider
  orRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    gap: 12,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#d0d5e8",
  },
  orText: {
    fontSize: 13,
    color: "#999",
    fontWeight: "500",
    letterSpacing: 1,
  },

  // Location
  locationContainer: {
    marginBottom: 8,
  },
  locationBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e0f7fe",
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    borderWidth: 1.5,
    borderColor: "#29b6f6",
  },
  locationBtnSuccess: {
    backgroundColor: "#4caf50",
    borderColor: "#4caf50",
  },
  locationBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a237e",
  },
  locationBtnTextSuccess: {
    color: "#fff",
  },
  orRowLoc: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 14,
    gap: 12,
  },

  // Google Button
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#dde3f0",
    borderRadius: 12,
    paddingVertical: 16,
    backgroundColor: "#fff",
    gap: 12,
  },
  googleIconBox: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: "#1a237e",
    justifyContent: "center",
    alignItems: "center",
  },
  googleIconText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  googleBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a237e",
  },

  // Sticky Bottom
  stickyBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  continueBtn: {
    backgroundColor: "#1a237e",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
  },
  continueBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
