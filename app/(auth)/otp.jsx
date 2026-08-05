// app/(auth)/otp.jsx
import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { verifyOTP, sendOTP, loginWithPhone } from '../../services/authService'
import { useAuth } from '../../context/AuthContext'

export default function OTPScreen() {
  const { phone: rawPhone } = useLocalSearchParams()
  const phone = rawPhone ? rawPhone.replace(/ /g, '+') : ''
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [timer, setTimer] = useState(30)
  const [canResend, setCanResend] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputs = useRef([])
  const { login } = useAuth()

  // Countdown timer
  useEffect(() => {
    if (timer === 0) {
      setCanResend(true)
      return
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [timer])

  const handleOtpChange = (value, index) => {
    // only allow numbers
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // auto focus next
    if (value && index < 5) {
      inputs.current[index + 1]?.focus()
    }
  }

  const handleKeyPress = (e, index) => {
    // go back on backspace if empty
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async () => {
    const otpString = otp.join('')
    if (otpString.length < 6) return
    setLoading(true)
    try {
      await verifyOTP(phone, otpString)
      
      try {
        // Try to log in the user if they already exist
        const loginRes = await loginWithPhone(phone)
        if (loginRes.success) {
          await login(loginRes.user, loginRes.token)
          if (loginRes.user?.role === 'seller') {
            router.replace('/(seller)/home')
          } else if (loginRes.user?.role === 'buyer') {
            router.replace('/(buyer)/(tabs)/home')
          } else if (loginRes.user?.role) {
            router.replace('/(buyer)/(tabs)/home')
          } else {
            router.replace('/(auth)/role-select')
          }
          return
        }
      } catch (loginError) {
        // If user is not found (404), they are a new user
        if (loginError.response?.status === 404) {
          router.push({ pathname: '/(auth)/complete-profile', params: { phone } })
          return
        }
        throw loginError // If it's a different error, throw it to the outer catch
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Invalid OTP or network error')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!canResend) return
    setTimer(30)
    setCanResend(false)
    setOtp(['', '', '', '', '', ''])
    inputs.current[0]?.focus()
    try {
      await sendOTP(phone)
      Alert.alert('Success', 'A new OTP has been sent.')
    } catch (error) {
      console.log(error)
      Alert.alert('Error', 'Failed to resend OTP.')
    }
  }

  const maskedPhone = phone
    ? phone.slice(0, 3) + ' XXXXXX'
    : '+91 XXXXXX'

  const isComplete = otp.every((d) => d !== '')

  const scrollViewRef = useRef(null)

  const handleInputFocus = () => {
    // Scroll down so OTP boxes and Verify button remain cleanly visible above keyboard
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 160, animated: true })
    }, 100)
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets={true}
        >

          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.canGoBack() ? router.back() : router.replace('/(auth)/login')}
            >
              <Text style={styles.backArrow}>←</Text>
              <Text style={styles.topTitle}>UBS Global</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.helpBtn}>
              <Text style={styles.helpIcon}>?</Text>
            </TouchableOpacity>
          </View>

          {/* Globe Banner Image */}
          <View style={styles.bannerContainer}>
            <Image
              source={require('../../assets/images/ubs-otp-logo.jpg')}
              style={styles.bannerImage}
              resizeMode="cover"
              accessibilityLabel="UBS Global OTP banner"
            />
            {/* Secure Portal Badge */}
            <View style={styles.secureBadge}>
              <Text style={styles.secureBadgeIcon}>🛡</Text>
              <Text style={styles.secureBadgeText}>Secure Portal</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to{' '}
            <Text style={styles.phoneHighlight}>{maskedPhone}</Text>
          </Text>

          {/* OTP Boxes */}
          <View style={styles.otpRow}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputs.current[index] = ref)}
                style={[
                  styles.otpBox,
                  digit ? styles.otpBoxFilled : null,
                  index === otp.findIndex((d) => d === '') && !digit
                    ? styles.otpBoxActive
                    : null,
                ]}
                value={digit}
                onChangeText={(val) => handleOtpChange(val, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                onFocus={handleInputFocus}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
                selectTextOnFocus
                caretHidden
              />
            ))}
          </View>

          {/* Timer & Resend */}
          <View style={styles.resendRow}>
            <Text style={styles.timerText}>
              🕐  Resend OTP in 0:{timer < 10 ? `0${timer}` : timer}
            </Text>
            <TouchableOpacity onPress={handleResend} disabled={!canResend}>
              <Text style={[
                styles.resendText,
                !canResend && styles.resendDisabled
              ]}>
                Resend Code
              </Text>
            </TouchableOpacity>
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            style={[
              styles.verifyBtn,
              (!isComplete || loading) && styles.verifyBtnDisabled
            ]}
            onPress={handleVerify}
            disabled={!isComplete || loading}
          >
            <Text style={styles.verifyBtnText}>
              {loading ? 'Verifying...' : 'Verify  →'}
            </Text>
          </TouchableOpacity>

          {/* Data Privacy Card */}
          <View style={styles.privacyCard}>
            <Text style={styles.privacyIcon}>🔒</Text>
            <View style={styles.privacyTextBox}>
              <Text style={styles.privacyTitle}>Data Privacy Guaranteed</Text>
              <Text style={styles.privacyDesc}>
                Your transaction security is our priority. UBS Global uses
                end-to-end encryption for all international trade
                authentications.
              </Text>
            </View>
          </View>

          {/* Footer */}
          <Text style={styles.footer}>
            © 2024 UBS Global Importing & Exporting. All rights reserved.
          </Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef1f8',
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backArrow: {
    fontSize: 20,
    color: '#1a237e',
    fontWeight: '700',
  },
  topTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a237e',
  },
  helpBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: '#c5cae9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpIcon: {
    fontSize: 15,
    color: '#1a237e',
    fontWeight: '600',
  },

  // Banner
  bannerContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 28,
    height: 200,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  secureBadge: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  secureBadgeIcon: {
    fontSize: 13,
  },
  secureBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a237e',
  },

  // Title
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#555',
    marginBottom: 28,
  },
  phoneHighlight: {
    color: '#1565c0',
    fontWeight: '600',
  },

  // OTP Boxes
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
    gap: 8,
  },
  otpBox: {
    flex: 1,
    aspectRatio: 1,
    borderWidth: 1.5,
    borderColor: '#d0d5e8',
    borderRadius: 14,
    fontSize: 22,
    fontWeight: '700',
    color: '#1a237e',
    backgroundColor: '#fff',
    textAlign: 'center',
  },
  otpBoxActive: {
    borderColor: '#1a237e',
    borderWidth: 2,
  },
  otpBoxFilled: {
    borderColor: '#1a237e',
    backgroundColor: '#eef2ff',
  },

  // Resend
  resendRow: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  timerText: {
    fontSize: 14,
    color: '#444',
    fontWeight: '500',
  },
  resendText: {
    fontSize: 15,
    color: '#29b6f6',
    fontWeight: '600',
  },
  resendDisabled: {
    color: '#aaa',
  },

  // Verify Button
  verifyBtn: {
    backgroundColor: '#1a237e',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 24,
  },
  verifyBtnDisabled: {
    opacity: 0.5,
  },
  verifyBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Privacy Card
  privacyCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    gap: 14,
    alignItems: 'flex-start',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#e8ecf4',
  },
  privacyIcon: {
    fontSize: 26,
    marginTop: 2,
  },
  privacyTextBox: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a237e',
    marginBottom: 6,
  },
  privacyDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },

  // Footer
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#aaa',
  },
})