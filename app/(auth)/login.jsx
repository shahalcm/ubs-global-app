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
  ActivityIndicator,
  Linking,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { sendOTP, verifyOTP, loginWithPassword, forgotPasswordSendOTP, resetPasswordWithOTP } from '../../services/authService'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'

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
  const { updateUser } = useAuth()

  // Mode: 'otp' | 'password'
  const [loginMode, setLoginMode] = useState('otp')

  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0])
  const [showPicker, setShowPicker] = useState(false)
  const [loading, setLoading] = useState(false)

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotStep, setForgotStep] = useState(1) // 1: phone, 2: otp + new password
  const [forgotPhone, setForgotPhone] = useState('')
  const [forgotCountry, setForgotCountry] = useState(COUNTRIES[0])
  const [showForgotCountryPicker, setShowForgotCountryPicker] = useState(false)
  const [forgotOtp, setForgotOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)

  // Handle OTP Continue
  const handleOTPContinue = async () => {
    if (!phone || phone.length < 7) {
      Alert.alert(t('Error'), t('Please enter a valid phone number'))
      return
    }
    setLoading(true)
    try {
      const fullPhone = selectedCountry.code + phone.trim()
      await sendOTP(fullPhone)
      router.push({
        pathname: '/(auth)/otp',
        params: { phone: fullPhone }
      })
    } catch (error) {
      console.log(error)
      Alert.alert(t('Error'), error?.response?.data?.message || t('Failed to send OTP. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  // Handle Password Login
  const handlePasswordLogin = async () => {
    if (!phone || phone.length < 7) {
      Alert.alert(t('Error'), t('Please enter a valid phone number'))
      return
    }
    if (!password) {
      Alert.alert(t('Error'), t('Please enter your password'))
      return
    }

    setLoading(true)
    try {
      const fullPhone = selectedCountry.code + phone.trim()
      const res = await loginWithPassword({ phone: fullPhone, password })
      if (res?.success && res?.user && res?.token) {
        await login(res.user, res.token)
        if (res.user?.role === 'seller') {
          router.replace('/(seller)/home')
        } else if (res.user?.role === 'buyer') {
          router.replace('/(buyer)/(tabs)/home')
        } else if (res.user?.role) {
          router.replace('/(buyer)/(tabs)/home')
        } else {
          router.replace('/(auth)/role-select')
        }
      } else {
        Alert.alert(t('Incorrect Password'), res?.message || t('Please enter correct password.'))
      }
    } catch (error) {
      console.log('Password login error:', error)
      const errMsg = error?.response?.data?.message || t('Incorrect password. Please enter correct password.')
      Alert.alert(t('Incorrect Password'), errMsg)
    } finally {
      setLoading(false)
    }
  }

  // Open Forgot Password Modal
  const openForgotPassword = () => {
    setForgotPhone(phone)
    setForgotCountry(selectedCountry)
    setForgotStep(1)
    setForgotOtp('')
    setNewPassword('')
    setConfirmPassword('')
    setShowForgotModal(true)
  }

  // Forgot Password Step 1: Send OTP to registered number
  const handleForgotSendOTP = async () => {
    if (!forgotPhone || forgotPhone.length < 7) {
      Alert.alert(t('Error'), t('Please enter a valid phone number'))
      return
    }

    setForgotLoading(true)
    try {
      const fullPhone = forgotCountry.code + forgotPhone.trim()
      const res = await forgotPasswordSendOTP(fullPhone)
      if (res?.success) {
        Alert.alert(t('OTP Sent'), t('A 6-digit verification code has been sent to your registered phone number.'))
        setForgotStep(2)
      } else {
        Alert.alert(t('Error'), res?.message || t('No registered account found with this phone number.'))
      }
    } catch (error) {
      console.log('Forgot password OTP error:', error)
      Alert.alert(t('Error'), error?.response?.data?.message || t('No account found with this phone number. Please sign up.'))
    } finally {
      setForgotLoading(false)
    }
  }

  // Forgot Password Step 2: Verify OTP code
  const handleVerifyForgotOTP = async () => {
    if (!forgotOtp || forgotOtp.length < 4) {
      Alert.alert(t('Error'), t('Please enter the 6-digit verification code.'))
      return
    }

    setForgotLoading(true)
    try {
      const fullPhone = forgotCountry.code + forgotPhone.trim()
      const res = await verifyOTP(fullPhone, forgotOtp.trim())
      if (res?.success) {
        setForgotStep(3)
      } else {
        Alert.alert(t('Error'), res?.message || t('Invalid or expired OTP.'))
      }
    } catch (error) {
      console.log('Verify OTP error:', error)
      Alert.alert(t('Error'), error?.response?.data?.message || t('Invalid or expired OTP.'))
    } finally {
      setForgotLoading(false)
    }
  }

  // Forgot Password Step 3: Reset Password
  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert(t('Error'), t('New password must be at least 6 characters.'))
      return
    }
    if (newPassword !== confirmPassword) {
      Alert.alert(t('Error'), t('Passwords do not match.'))
      return
    }

    setForgotLoading(true)
    try {
      const fullPhone = forgotCountry.code + forgotPhone.trim()
      const res = await resetPasswordWithOTP({
        phone: fullPhone,
        otp: forgotOtp.trim(),
        newPassword: newPassword.trim()
      })

      if (res?.success && res?.user && res?.token) {
        await login(res.user, res.token)
        setShowForgotModal(false)
        Alert.alert(t('Success'), t('Password reset successfully! Logged in.'))
        if (res.user?.role === 'seller') {
          router.replace('/(seller)/home')
        } else if (res.user?.role === 'buyer') {
          router.replace('/(buyer)/(tabs)/home')
        } else if (res.user?.role) {
          router.replace('/(buyer)/(tabs)/home')
        } else {
          router.replace('/(auth)/role-select')
        }
      } else {
        Alert.alert(t('Error'), res?.message || t('Failed to reset password.'))
      }
    } catch (error) {
      console.log('Reset password error:', error)
      Alert.alert(t('Error'), error?.response?.data?.message || t('Failed to reset password.'))
    } finally {
      setForgotLoading(false)
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
          {/* Main Login Card */}
          <View style={styles.card}>
            {/* Title */}
            <Text style={styles.title}>{t('Welcome Back')}</Text>
            <Text style={styles.subtitle}>
              {t('Sign in to manage your global trade')}
            </Text>

            {/* Mode Switcher Tabs */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tabBtn, loginMode === 'otp' && styles.tabBtnActive]}
                onPress={() => setLoginMode('otp')}
              >
                <Ionicons
                  name="keypad-outline"
                  size={16}
                  color={loginMode === 'otp' ? '#fff' : '#1a237e'}
                />
                <Text style={[styles.tabText, loginMode === 'otp' && styles.tabTextActive]}>
                  {t('OTP Login')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabBtn, loginMode === 'password' && styles.tabBtnActive]}
                onPress={() => setLoginMode('password')}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={16}
                  color={loginMode === 'password' ? '#fff' : '#1a237e'}
                />
                <Text style={[styles.tabText, loginMode === 'password' && styles.tabTextActive]}>
                  {t('Password Login')}
                </Text>
              </TouchableOpacity>
            </View>

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

            {/* Password Field (Only when in Password Login Mode) */}
            {loginMode === 'password' && (
              <View style={styles.passwordGroup}>
                <Text style={styles.label}>{t('Password')}</Text>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder={t('Enter your password')}
                    placeholderTextColor="#aab"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>

                {/* Forgot Password Link */}
                <TouchableOpacity
                  style={styles.forgotBtn}
                  onPress={openForgotPassword}
                >
                  <Text style={styles.forgotText}>{t('Forgot Password?')}</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Action Submit Button */}
            <TouchableOpacity
              style={[styles.continueBtn, loading && { opacity: 0.6 }]}
              onPress={loginMode === 'otp' ? handleOTPContinue : handlePasswordLogin}
              disabled={loading}
              activeOpacity={0.88}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.continueBtnText}>
                  {loginMode === 'otp' ? t('Continue with OTP') : t('Sign In')}
                </Text>
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
            <TouchableOpacity onPress={() => Linking.openURL('https://www.ubsglobalapp.com/privacy-policy').catch(() => Alert.alert(t('Error'), t('Unable to open Privacy Policy.')))}>
              <Text style={styles.footerLink}>{t('Privacy Policy')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL('https://www.ubsglobalapp.com/terms-and-conditions').catch(() => Alert.alert(t('Error'), t('Unable to open Terms of Service.')))}>
              <Text style={styles.footerLink}>{t('Terms of Service')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL('mailto:ubsimportingexporting@gmail.com').catch(() => Alert.alert(t('Contact Support'), 'ubsimportingexporting@gmail.com'))}>
              <Text style={styles.footerLink}>{t('Contact Support')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Main Country Picker Modal */}
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

      {/* Forgot Password Modal */}
      <Modal
        visible={showForgotModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowForgotModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowForgotModal(false)}
        >
          <View style={[styles.modalSheet, { maxHeight: '80%' }]} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {forgotStep === 1 ? t('Forgot Password') : (forgotStep === 2 ? t('Enter Verification Code') : t('Create New Password'))}
              </Text>
              <TouchableOpacity onPress={() => setShowForgotModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {forgotStep === 1 && (
              // Step 1: Phone input & OTP dispatch
              <View>
                <Text style={styles.modalSubtitle}>
                  {t('Enter your registered phone number to receive a verification code.')}
                </Text>

                <Text style={styles.label}>{t('Phone number')}</Text>
                <View style={styles.phoneRow}>
                  <TouchableOpacity
                    style={styles.countryBtn}
                    onPress={() => setShowForgotCountryPicker(true)}
                  >
                    <Text style={styles.countryCode}>{forgotCountry.code}</Text>
                    <Text style={styles.dropdownArrow}>⌄</Text>
                  </TouchableOpacity>

                  <TextInput
                    style={styles.phoneInput}
                    placeholder={t('Enter mobile number')}
                    placeholderTextColor="#aab"
                    keyboardType="phone-pad"
                    value={forgotPhone}
                    onChangeText={setForgotPhone}
                    maxLength={15}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.continueBtn, forgotLoading && { opacity: 0.6 }]}
                  onPress={handleForgotSendOTP}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.continueBtnText}>{t('Send Verification Code')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {forgotStep === 2 && (
              // Step 2: Enter & Verify OTP
              <View>
                <Text style={styles.modalSubtitle}>
                  {t('Enter the 6-digit OTP code sent to')} {forgotCountry.code} {forgotPhone}.
                </Text>

                <Text style={styles.label}>{t('Verification Code (OTP)')}</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder={t('Enter 6-digit OTP')}
                  placeholderTextColor="#aab"
                  keyboardType="number-pad"
                  value={forgotOtp}
                  onChangeText={setForgotOtp}
                  maxLength={6}
                />

                <TouchableOpacity
                  style={[styles.continueBtn, { marginTop: 12 }, forgotLoading && { opacity: 0.6 }]}
                  onPress={handleVerifyForgotOTP}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.continueBtnText}>{t('Verify Code')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {forgotStep === 3 && (
              // Step 3: Create New Password
              <View>
                <Text style={styles.modalSubtitle}>
                  {t('Enter your new account password below.')}
                </Text>

                <Text style={styles.label}>{t('New Password')}</Text>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder={t('Enter new password')}
                    placeholderTextColor="#aab"
                    secureTextEntry={!showNewPassword}
                    value={newPassword}
                    onChangeText={setNewPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    <Ionicons
                      name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.label}>{t('Confirm New Password')}</Text>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder={t('Confirm new password')}
                    placeholderTextColor="#aab"
                    secureTextEntry={!showNewPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.continueBtn, { marginTop: 18 }, forgotLoading && { opacity: 0.6 }]}
                  onPress={handleResetPassword}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.continueBtnText}>{t('Set New Password & Sign In')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Forgot Phone Country Picker Modal */}
      <Modal
        visible={showForgotCountryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowForgotCountryPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowForgotCountryPicker(false)}
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
                    setForgotCountry(item)
                    setShowForgotCountryPicker(false)
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
    marginBottom: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f7fc',
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#dde3f0',
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: '#1a237e',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a237e',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a237e',
    marginBottom: 10,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
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
  passwordGroup: {
    marginBottom: 18,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#dde3f0',
    borderRadius: 12,
    backgroundColor: '#f5f7fc',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 15,
    color: '#1a237e',
  },
  eyeBtn: {
    padding: 8,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
  },
  forgotText: {
    color: '#1565c0',
    fontSize: 13,
    fontWeight: '700',
  },
  continueBtn: {
    backgroundColor: '#1a237e',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  continueBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  signupText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#555',
  },
  signupLink: {
    color: '#29b6f6',
    fontWeight: '700',
  },
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
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a237e',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
    lineHeight: 18,
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: '#dde3f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1a237e',
    backgroundColor: '#f5f7fc',
    marginBottom: 14,
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