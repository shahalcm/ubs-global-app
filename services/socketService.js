import { io } from 'socket.io-client'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

const baseApiUrl = process.env.EXPO_PUBLIC_API_URL ? process.env.EXPO_PUBLIC_API_URL.replace('/api', '') : ''
const SOCKET_URL = baseApiUrl || (__DEV__
  ? 'https://ubs-global-server.onrender.com'
  : 'https://your-production-url.railway.app')

let socket = null

export const connectSocket = async () => {
  const userId = await AsyncStorage.getItem('userId')
  
  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  })

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id)
    if (userId) {
      socket.emit('join', userId)
    }
  })

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected')
  })

  socket.on('connect_error', (error) => {
    console.log('Socket error:', error)
  })

  return socket
}

export const getSocket = () => socket

export const disconnectSocket = () => {
  if (socket) socket.disconnect()
}

// Emit events
export const joinRoom = (roomId) => {
  socket?.emit('joinRoom', roomId)
}

export const sendMessage = (roomId, message) => {
  socket?.emit('sendMessage', { roomId, message })
}

export const emitTyping = (roomId, userId, name) => {
  socket?.emit('typing', { roomId, userId, name })
}

export const emitStopTyping = (roomId, userId) => {
  socket?.emit('stopTyping', { roomId, userId })
}

// Listen events
export const onReceiveMessage = (callback) => {
  socket?.on('receiveMessage', callback)
}

export const onRequestApproved = (callback) => {
  socket?.on('requestApproved', callback)
}

export const onNewBuyerConnected = (callback) => {
  socket?.on('newBuyerConnected', callback)
}

export const onRequestRejected = (callback) => {
  socket?.on('requestRejected', callback)
}

export const onNewOrder = (callback) => {
  socket?.on('newOrder', callback)
}

export const onOrderStatusChanged = (callback) => {
  socket?.on('orderStatusChanged', callback)
}

export const removeListener = (event) => {
  socket?.off(event)
}
