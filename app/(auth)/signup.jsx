// app/(auth)/signup.jsx
import React, { useState } from 'react'
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
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { sendOTP } from '../../services/authService'
import { useTranslation } from 'react-i18next'

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
]

export default function SignupScreen() {
  const { t } = useTranslation()
  const [phone, setPhone] = useState('')
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0])
  const [showPicker, setShowPicker] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSendOTP = async () => {
    if (!phone || phone.length < 7) return
    setLoading(true)
    try {
      await sendOTP(selectedCountry.code + phone)
      router.push({
        pathname: '/(auth)/otp',
        params: { phone: selectedCountry.code + phone }
      })
    } catch (error) {
      Alert.alert(t('Error'), error.response?.data?.message || t('Failed to send OTP. Please try again.'))
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
        >
          {/* Header */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.canGoBack() ? router.back() : router.replace('/(auth)/login')}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>UBS Global</Text>

          {/* Logo Circle */}
          <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>🌐</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{t('Create Account')}</Text>
          <Text style={styles.subtitle}>
            {t('Enter your mobile number to get started')}
          </Text>

          {/* Mobile Number Label */}
          <Text style={styles.label}>{t('Mobile Number')}</Text>

          {/* Phone Input Row */}
          <View style={styles.phoneRow}>
            {/* Country Picker Button */}
            <TouchableOpacity
              style={styles.countryBtn}
              onPress={() => setShowPicker(true)}
            >
              <Text style={styles.countryText}>
                {selectedCountry.code} {selectedCountry.name}
              </Text>
              <Text style={styles.dropdownArrow}>▾</Text>
            </TouchableOpacity>

            {/* Phone Input */}
            <TextInput
              style={styles.phoneInput}
              placeholder={t('000-000-0000')}
              placeholderTextColor="#aaa"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={15}
            />
          </View>

          {/* Send OTP Button */}
          <TouchableOpacity
            style={[styles.otpBtn, loading && styles.otpBtnDisabled]}
            onPress={handleSendOTP}
            disabled={loading}
          >
            <Text style={styles.otpBtnText}>
              {loading ? t('Sending...') : t('Send OTP  →')}
            </Text>
          </TouchableOpacity>

          {/* Login Link */}
          <Text style={styles.loginText}>
            {t('Already have an account?')}{' '}
            <Text
              style={styles.loginLink}
              onPress={() => router.push('/(auth)/login')}
            >
              {t('Login')}
            </Text>
          </Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Trust Badges */}
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeIcon}>🛡️</Text>
              <Text style={styles.badgeText}>{t('SECURE TRADE')}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeIcon}>🌍</Text>
              <Text style={styles.badgeText}>{t('GLOBAL REACH')}</Text>
            </View>
          </View>

          {/* Terms */}
          <Text style={styles.terms}>
            {t('By continuing, you agree to UBS Global\'s Terms of Service and Privacy Policy regarding international trade and data handling.')}
          </Text>
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
          onPress={() => setShowPicker(false)}
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
                    setShowPicker(false)
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
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f8',
  },
  scroll: {
    padding: 24,
    paddingBottom: 40,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    marginBottom: 4,
  },
  backArrow: {
    fontSize: 22,
    color: '#1a237e',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a237e',
    textAlign: 'center',
    marginTop: -28,
    marginBottom: 32,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e8eaf6',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoIcon: {
    fontSize: 36,
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
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a237e',
    marginBottom: 8,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  countryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#c5cae9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#fff',
    gap: 6,
    minWidth: 100,
  },
  countryText: {
    fontSize: 14,
    color: '#1a237e',
    fontWeight: '500',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#1a237e',
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#c5cae9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1a237e',
    backgroundColor: '#fff',
  },
  otpBtn: {
    backgroundColor: '#1a237e',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 24,
  },
  otpBtnDisabled: {
    opacity: 0.6,
  },
  otpBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loginText: {
    textAlign: 'center',
    fontSize: 15,
    color: '#555',
    marginBottom: 28,
  },
  loginLink: {
    color: '#29b6f6',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginBottom: 24,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  badge: {
    flex: 1,
    backgroundColor: '#e8eaf6',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 8,
  },
  badgeIcon: {
    fontSize: 24,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1a237e',
    letterSpacing: 0.5,
  },
  terms: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    lineHeight: 18,
  },

  // Modal styles
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
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
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
  countryCode: {
    fontSize: 14,
    color: '#888',
  },
})