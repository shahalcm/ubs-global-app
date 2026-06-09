// app/(auth)/login.jsx
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { sendOTP } from '../../services/authService'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import * as WebBrowser from 'expo-web-browser'
import * as Google from 'expo-auth-session/providers/google'
import * as AuthSession from 'expo-auth-session'
import { Ionicons } from '@expo/vector-icons'
import { getEnv } from '../../utils/env'
import Constants from 'expo-constants'

WebBrowser.maybeCompleteAuthSession()

const COUNTRIES = [
  { code: '+1', flag: '🇺🇸', name: 'US' },
  { code: '+44', flag: '🇬🇧', name: 'UK' },
  { code: '+91', flag: '🇮🇳', name: 'IN' },
  { code: '+971', flag: '🇦🇪', name: 'AE' },
  { code: '+966', flag: '🇸🇦', name: 'SA' },
  { code: '+92', flag: '🇵🇰', name: 'PK' },
  { code: '+60', flag: '🇲🇾', name: 'MY' },
  { code: '+65', flag: '🇸🇬', name: 'SG' },
  { code: '+86', flag: '🇨🇳', name: 'CN' },
  { code: '+81', flag: '🇯🇵', name: 'JP' },
  { code: '+49', flag: '🇩🇪', name: 'DE' },
  { code: '+33', flag: '🇫🇷', name: 'FR' },
]

export default function LoginScreen() {
  const { t } = useTranslation()
  const [phone, setPhone] = useState('')
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0])
  const [showPicker, setShowPicker] = useState(false)
  const [loading, setLoading] = useState(false)

  const { loginWithGoogle } = useAuth()
  const [googleLoading, setGoogleLoading] = useState(false)

  const owner = Constants.expoConfig?.owner || 'ubsglobalapp923'
  const slug = Constants.expoConfig?.slug || 'client'
  const projectNameForProxy = `@${owner}/${slug}`
  
  // Dynamically determine redirect URI and proxy requirements based on environment
  const isGo = Constants.appOwnership === 'expo'
  const redirectUri = isGo 
    ? `https://auth.expo.io/@${owner}/${slug}` 
    : AuthSession.makeRedirectUri({ scheme: 'client' })

  // Configure Google Auth Request (fall back to web client ID and use proxy only in Expo Go)
  const webClientId = getEnv('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID', '522208568376-placeholder.apps.googleusercontent.com')
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId,
    iosClientId: isGo ? webClientId : getEnv('EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID', webClientId),
    androidClientId: isGo ? webClientId : getEnv('EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID', webClientId),
    projectNameForProxy,
    useProxy: isGo,
    redirectUri,
  })

  // Log the redirect URI so the developer can copy-paste it into Google Cloud Console
  useEffect(() => {
    if (request?.redirectUri) {
      console.log('====== GOOGLE OAUTH REDIRECT URI ======')
      console.log(request.redirectUri)
      console.log('=======================================')
    }
  }, [request])

  // Handle Google Auth Response
  useEffect(() => {
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

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    try {
      const result = await promptAsync({
        useProxy: isGo,
        projectNameForProxy,
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

  const handleContinue = async () => {
    if (!phone || phone.length < 7) return
    setLoading(true)
    try {
      const fullPhone = selectedCountry.code + phone
      await sendOTP(fullPhone)
      router.push({
        pathname: '/(auth)/otp',
        params: { phone: fullPhone }
      })
    } catch (error) {
      console.log(error)
      Alert.alert(t('Error'), t('Failed to send OTP. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* White Card */}
          <View style={styles.card}>

            {/* Title */}
            <Text style={styles.title}>{t('Welcome Back')}</Text>
            <Text style={styles.subtitle}>
              {t('Sign in to manage your global trade')}
            </Text>

            {/* Phone Label */}
            <Text style={styles.label}>{t('Phone number')}</Text>

            {/* Phone Input Row */}
            <View style={styles.phoneRow}>
              <TouchableOpacity
                style={styles.countryBtn}
                onPress={() => setShowPicker(true)}
              >
                <Text style={styles.countryCode}>{selectedCountry.code}</Text>
                <Text style={styles.dropdownArrow}>⌄</Text>
              </TouchableOpacity>

              <TextInput
                style={styles.phoneInput}
                placeholder={t('Enter mobile number')}
                placeholderTextColor="#aab"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                maxLength={15}
              />
            </View>

            {/* Continue Button */}
            <TouchableOpacity
              style={[styles.continueBtn, loading && { opacity: 0.6 }]}
              onPress={handleContinue}
              disabled={loading}
            >
              <Text style={styles.continueBtnText}>
                {loading ? t('Please wait...') : t('Continue')}
              </Text>
            </TouchableOpacity>

            {/* OR Divider */}
            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>{t('OR')}</Text>
              <View style={styles.orLine} />
            </View>

            {/* Google Button */}
            <TouchableOpacity
              style={[styles.googleBtn, (googleLoading || loading) && { opacity: 0.6 }]}
              onPress={handleGoogleLogin}
              disabled={googleLoading || loading}
            >
              {googleLoading ? (
                <ActivityIndicator color="#1a237e" size="small" />
              ) : (
                <>
                  <Ionicons name="logo-google" size={18} color="#4285F4" />
                  <Text style={styles.googleBtnText}>{t('Continue with Google')}</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Sign Up Link */}
            <Text style={styles.signupText}>
              {t("Don't have an account?")}{' '}
              <Text
                style={styles.signupLink}
                onPress={() => router.push('/(auth)/signup')}
              >
                {t('Sign Up')}
              </Text>
            </Text>

          </View>

          {/* Footer Links */}
          <View style={styles.footer}>
            <TouchableOpacity>
              <Text style={styles.footerLink}>{t('Privacy Policy')}</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.footerLink}>{t('Terms of Service')}</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.footerLink}>{t('Contact Support')}</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Country Picker Modal */}
      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPicker(false)}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{t('Select Country Code')}</Text>
            <FlatList
              data={COUNTRIES}
              keyExtractor={(item) => item.code + item.name}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryRow}
                  onPress={() => {
                    setSelectedCountry(item)
                    setShowPicker(false)
                  }}
                >
                  <Text style={styles.countryFlag}>{item.flag}</Text>
                  <Text style={styles.countryName}>{item.name}</Text>
                  <Text style={styles.countryCodeRight}>{item.code}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8eef8',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },

  // Card
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a237e',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 28,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a237e',
    marginBottom: 10,
  },

  // Phone Row
  phoneRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  countryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#dde3f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 16,
    backgroundColor: '#f5f7fc',
    gap: 6,
    minWidth: 85,
  },
  countryCode: {
    fontSize: 15,
    color: '#1a237e',
    fontWeight: '600',
  },
  dropdownArrow: {
    fontSize: 16,
    color: '#1a237e',
    marginTop: -2,
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#dde3f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 15,
    color: '#1a237e',
    backgroundColor: '#f5f7fc',
  },

  // Continue Button
  continueBtn: {
    backgroundColor: '#1a237e',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 24,
  },
  continueBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // OR Divider
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  orText: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
    letterSpacing: 1,
  },

  // Google Button
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#dde3f0',
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 24,
    gap: 12,
    backgroundColor: '#fff',
  },
  googleIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIconText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4285F4',
  },
  googleBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a237e',
  },

  // Sign Up
  signupText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#555',
  },
  signupLink: {
    color: '#29b6f6',
    fontWeight: '700',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    flexWrap: 'wrap',
  },
  footerLink: {
    fontSize: 13,
    color: '#888',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '65%',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a237e',
    marginBottom: 16,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
    gap: 12,
  },
  countryFlag: {
    fontSize: 22,
  },
  countryName: {
    flex: 1,
    fontSize: 15,
    color: '#1a237e',
    fontWeight: '500',
  },
  countryCodeRight: {
    fontSize: 14,
    color: '#888',
  },
})