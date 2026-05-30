import { io } from 'socket.io-client'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

const SOCKET_URL = 'http://10.213.25.184:5000'

let socket = null

export const connectSocket = async () => {
  const userId = await AsyncStorage.getItem('userId')
  
  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'], // Enable polling fallback if websocket handshake fails
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000
  })

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id, 'using transport:', socket.io.engine.transport.name)
    if (userId) {
      socket.emit('join', userId)
    }
  })

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason)
  })

  socket.on('connect_error', (error) => {
    console.warn('⚠️ Socket connection error:', error.message || error)
    
    // Switch to polling if websocket fails and isn't active
    if (socket.io.opts.transports.includes('websocket')) {
      console.log('🔄 Attempting fallback transports configuration...');
    }
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
