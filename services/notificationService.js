import api from './api'

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
