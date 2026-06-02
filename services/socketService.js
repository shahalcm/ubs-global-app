import { io } from 'socket.io-client'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform, AppState } from 'react-native'
import { getEnv } from '../utils/env'

const SOCKET_URL = getEnv('EXPO_PUBLIC_SOCKET_URL', 'https://api.ubsglobalapp.com')
console.log('🔌 [Socket Config] Active Socket URL:', SOCKET_URL)

let socket = null
let appStateSubscription = null

export const connectSocket = async () => {
  const userId = await AsyncStorage.getItem('userId')
  
  if (socket) {
    console.log('🔌 [Socket] Instance already exists. Status connected:', socket.connected)
    if (!socket.connected) {
      console.log('🔄 [Socket] Reconnecting existing socket instance...')
      socket.connect()
    }
    if (userId) {
      console.log('🔌 [Socket] Emitting join room for user:', userId)
      socket.emit('join', userId)
    }
    return socket
  }
  
  console.log('🔌 [Socket] Establishing new connection to:', SOCKET_URL)
  socket = io(SOCKET_URL, {
    transports: ['polling', 'websocket'], // Start with polling for maximum compatibility, then upgrade to websocket
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 30000 // 30 seconds connection timeout
  })

  socket.on('connect', () => {
    console.log('✅ [Socket] Connected successfully! Socket ID:', socket.id, 'Transport:', socket.io.engine.transport.name)
    if (userId) {
      console.log('🔌 [Socket] Emitting join room for user:', userId)
      socket.emit('join', userId)
    }
  })

  socket.on('disconnect', (reason) => {
    console.log('❌ [Socket] Disconnected. Reason:', reason)
    // If disconnected by the server or due to transport issues, force attempt manual reconnect
    if (reason === 'io server disconnect' || reason === 'transport close' || reason === 'ping timeout') {
      console.log('🔄 [Socket] Forcing reconnection attempt...')
      socket.connect()
    }
  })

  socket.on('connect_error', (error) => {
    console.warn('⚠️ [Socket] Connection error:', error.message || error)
  })

  socket.io.on('reconnect_attempt', (attempt) => {
    console.log(`🔄 [Socket] Reconnection attempt #${attempt}...`)
  })

  socket.io.on('reconnect', (attempt) => {
    console.log(`✅ [Socket] Reconnected successfully after ${attempt} attempts.`)
  })

  socket.io.on('reconnect_failed', () => {
    console.error('💥 [Socket] Reconnection failed completely.')
  })

  // Set up React Native AppState listener to reconnect automatically when app transitions to foreground
  if (Platform.OS !== 'web' && !appStateSubscription) {
    appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        console.log('📱 App entered foreground. Checking socket status...')
        if (socket) {
          if (!socket.connected) {
            console.log('🔄 Socket was disconnected. Triggering active reconnect...')
            socket.connect()
          } else {
            console.log('✅ Socket is already active and connected.')
          }
        }
      }
    })
  }

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
