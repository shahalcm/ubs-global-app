// app/(auth)/complete-profile.jsx
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
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'

export default function CompleteProfileScreen() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}
    if (!fullName.trim()) newErrors.fullName = 'Full name is required'
    if (!email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email'
    if (!password) newErrors.password = 'Password is required'
    else if (password.length < 6) newErrors.password = 'Min 6 characters'
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm password'
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleContinue = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      // await api.post('/auth/complete-profile', { fullName, email, password })
      router.push('/(auth)/role-select')
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleContinue = async () => {
    try {
      // google sign in logic
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.topTitle}>UBS Global</Text>
          <TouchableOpacity>
            <Text style={styles.cartIcon}>🛒</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Page Title */}
          <Text style={styles.pageTitle}>Complete Your Profile</Text>
          <Text style={styles.pageSubtitle}>
            Join our global network of international traders.
          </Text>

          {/* Verification Notice */}
          <View style={styles.noticeCard}>
            <View style={styles.noticeIconBox}>
              <Text style={styles.noticeIconText}>i</Text>
            </View>
            <View style={styles.noticeTextBox}>
              <Text style={styles.noticeTitle}>Verification Notice</Text>
              <Text style={styles.noticeDesc}>
                Please ensure your Full Name matches the legal name on your
                government-issued identification to prevent delays in shipping
                and financial settlements.
              </Text>
            </View>
          </View>

          {/* Full Name */}
          <Text style={styles.label}>Full Name</Text>
          <View style={[styles.inputBox, errors.fullName && styles.inputError]}>
            <Text style={styles.inputIcon}>👤</Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              placeholderTextColor="#bbb"
              value={fullName}
              onChangeText={(v) => {
                setFullName(v)
                setErrors((e) => ({ ...e, fullName: null }))
              }}
              autoCapitalize="words"
            />
          </View>
          {errors.fullName && (
            <Text style={styles.errorText}>{errors.fullName}</Text>
          )}

          {/* Email */}
          <Text style={styles.label}>Email Address</Text>
          <View style={[styles.inputBox, errors.email && styles.inputError]}>
            <Text style={styles.inputIcon}>✉️</Text>
            <TextInput
              style={styles.input}
              placeholder="email@ubsglobal.com"
              placeholderTextColor="#bbb"
              value={email}
              onChangeText={(v) => {
                setEmail(v)
                setErrors((e) => ({ ...e, email: null }))
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          {errors.email && (
            <Text style={styles.errorText}>{errors.email}</Text>
          )}

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View style={[styles.inputBox, errors.password && styles.inputError]}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#bbb"
              value={password}
              onChangeText={(v) => {
                setPassword(v)
                setErrors((e) => ({ ...e, password: null }))
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeBtn}
            >
              <Text style={styles.eyeIcon}>
                {showPassword ? '🙈' : '👁️'}
              </Text>
            </TouchableOpacity>
          </View>
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}

          {/* Confirm Password */}
          <Text style={styles.label}>Confirm Password</Text>
          <View style={[styles.inputBox, errors.confirmPassword && styles.inputError]}>
            <Text style={styles.inputIcon}>🔄</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#bbb"
              value={confirmPassword}
              onChangeText={(v) => {
                setConfirmPassword(v)
                setErrors((e) => ({ ...e, confirmPassword: null }))
              }}
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowConfirm(!showConfirm)}
              style={styles.eyeBtn}
            >
              <Text style={styles.eyeIcon}>
                {showConfirm ? '🙈' : '👁️'}
              </Text>
            </TouchableOpacity>
          </View>
          {errors.confirmPassword && (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          )}

          {/* OR Divider */}
          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.orLine} />
          </View>

          {/* Google Button */}
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={handleGoogleContinue}
          >
            <View style={styles.googleIconBox}>
              <Text style={styles.googleIconText}>G</Text>
            </View>
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Spacer for sticky button */}
          <View style={{ height: 90 }} />

        </ScrollView>

        {/* Sticky Continue Button */}
        <View style={styles.stickyBottom}>
          <TouchableOpacity
            style={[styles.continueBtn, loading && { opacity: 0.6 }]}
            onPress={handleContinue}
            disabled={loading}
          >
            <Text style={styles.continueBtnText}>
              {loading ? 'Please wait...' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef1f8',
  },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#eef1f8',
  },
  menuIcon: {
    fontSize: 22,
    color: '#1a237e',
  },
  topTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a237e',
  },
  cartIcon: {
    fontSize: 22,
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
    fontWeight: '700',
    color: '#111',
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },

  // Notice Card
  noticeCard: {
    flexDirection: 'row',
    backgroundColor: '#dbeafe',
    borderRadius: 14,
    padding: 16,
    marginBottom: 28,
    gap: 12,
    alignItems: 'flex-start',
  },
  noticeIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#1565c0',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  noticeIconText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1565c0',
  },
  noticeTextBox: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1565c0',
    marginBottom: 4,
  },
  noticeDesc: {
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 20,
  },

  // Form
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#dde3f0',
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 16,
    gap: 10,
  },
  inputError: {
    borderColor: '#f44336',
  },
  inputIcon: {
    fontSize: 18,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1a237e',
  },
  eyeBtn: {
    padding: 4,
  },
  eyeIcon: {
    fontSize: 18,
  },
  errorText: {
    fontSize: 12,
    color: '#f44336',
    marginTop: -12,
    marginBottom: 12,
    marginLeft: 4,
  },

  // OR Divider
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#d0d5e8',
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
    borderRadius: 12,
    paddingVertical: 16,
    backgroundColor: '#fff',
    gap: 12,
  },
  googleIconBox: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: '#1a237e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIconText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  googleBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a237e',
  },

  // Sticky Bottom
  stickyBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  continueBtn: {
    backgroundColor: '#1a237e',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  continueBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
})