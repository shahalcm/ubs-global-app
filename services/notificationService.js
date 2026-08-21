import api from './api'
import { Platform } from 'react-native'

let Notifications = null
try {
  Notifications = require('expo-notifications')
} catch (e) {
  console.warn('expo-notifications module notice:', e.message)
}

// Get notifications
export const getNotifications = async () => {
  const res = await api.get('/notifications')
  return res.data
}

// Mark all read
export const markAllRead = async () => {
  const res = await api.patch('/notifications/mark-all-read')
  return res.data
}

// Mark single notification read
export const markAsRead = async (id) => {
  const res = await api.patch(`/notifications/${id}/read`)
  return res.data
}

// Update FCM token
export const updateFCMToken = async (fcmToken) => {
  const res = await api.patch('/users/fcm-token', { fcmToken })
  return res.data
}

// Register for Expo Push Notifications for background incoming calls
export const registerForPushNotificationsAsync = async () => {
  if (!Notifications) return null

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }
    if (finalStatus !== 'granted') {
      console.warn('[Expo Push] Permission not granted for push notifications')
      return null
    }

    const tokenData = await Notifications.getExpoPushTokenAsync()
    const pushToken = tokenData?.data

    if (pushToken) {
      console.log('[Expo Push Token Registered]', pushToken)
      await api.post('/calls/push-token', { pushToken })
    }
    return pushToken
  } catch (error) {
    console.warn('[Expo Push Registration Error]', error.message)
    return null
  }
}
