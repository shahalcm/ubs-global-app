import api from './api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { connectSocket, disconnectSocket } from './socketService'

// Send OTP
export const sendOTP = async (phone) => {
  const res = await api.post('/auth/send-otp', { phone })
  return res.data
}

// Verify OTP
export const verifyOTP = async (phone, otp) => {
  const res = await api.post('/auth/verify-otp', { phone, otp })
  return res.data
}

// Complete signup
export const signUp = async (userData) => {
  const res = await api.post('/auth/signup', userData)
  await saveUserData(res.data)
  return res.data
}

// Login with phone
export const loginWithPhone = async (phone) => {
  const res = await api.post('/auth/login', { phone })
  await saveUserData(res.data)
  return res.data
}

// Google auth
export const googleAuth = async (googleData) => {
  const res = await api.post('/auth/google/mobile', googleData)
  await saveUserData(res.data)
  return res.data
}

// Set role (buyer/seller)
export const setRole = async (role) => {
  const res = await api.patch('/auth/set-role', { role })
  const user = await AsyncStorage.getItem('user')
  const parsed = JSON.parse(user)
  parsed.role = role
  await AsyncStorage.setItem('user', JSON.stringify(parsed))
  return res.data
}

// Complete profile
export const completeProfile = async (profileData) => {
  const res = await api.patch(
    '/auth/complete-profile',
    profileData
  )
  return res.data
}

// Save user data to storage
const saveUserData = async (data) => {
  await AsyncStorage.setItem('token', data.token)
  await AsyncStorage.setItem('user', JSON.stringify(data.user))
  await AsyncStorage.setItem('userId', data.user._id)
  await connectSocket()
}

// Logout
export const logout = async () => {
  await AsyncStorage.multiRemove(['token', 'user', 'userId'])
  disconnectSocket()
}

// Get stored user
export const getStoredUser = async () => {
  const user = await AsyncStorage.getItem('user')
  return user ? JSON.parse(user) : null
}
