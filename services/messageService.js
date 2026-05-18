import api from './api'

// Get chat rooms
export const getChatRooms = async () => {
  const res = await api.get('/chat/my-rooms')
  return res.data
}

// Get messages in room
export const getMessages = async (roomId) => {
  const res = await api.get(`/chat/${roomId}/messages`)
  return res.data
}

// Send message
export const sendMessage = async (roomId, message) => {
  const res = await api.post(
    `/chat/${roomId}/messages`,
    message
  )
  return res.data
}

// Mark as read
export const markAsRead = async (roomId) => {
  const res = await api.patch(`/chat/${roomId}/read`)
  return res.data
}
