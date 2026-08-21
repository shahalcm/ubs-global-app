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
  const token = await AsyncStorage.getItem('userToken')

  if (socket) {
    console.log('🔌 [Socket] Instance already exists. Status connected:', socket.connected)
    if (!socket.connected) {
      console.log('🔄 [Socket] Reconnecting existing socket instance...')
      socket.auth = { token }
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
    auth: { token },
    query: { token, userId },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 30000
  })

  socket.on('connect', () => {
    console.log('[Socket Connected] Connected successfully! Socket ID:', socket.id)
    if (userId) {
      console.log('🔌 [Socket] Emitting join room for user:', userId)
      socket.emit('join', userId)
    }
  })

  socket.on('disconnect', (reason) => {
    console.log('[Socket Disconnected] Reason:', reason)
    if (reason === 'io server disconnect' || reason === 'transport close' || reason === 'ping timeout') {
      console.log('🔄 [Socket] Forcing reconnection attempt...')
      socket.connect()
    }
  })

  socket.on('connect_error', (error) => {
    console.warn('⚠️ [Socket] Connection error:', error.message || error)
  })

  // Reconnect automatically when app returns to foreground
  if (Platform.OS !== 'web' && !appStateSubscription) {
    appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        console.log('📱 App entered foreground. Checking socket status...')
        if (socket) {
          if (!socket.connected) {
            console.log('🔄 Socket was disconnected. Triggering active reconnect...')
            socket.connect()
          } else if (userId) {
            socket.emit('join', userId)
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

export const joinRoom = (roomId) => {
  socket?.emit('joinRoom', roomId)
}

export const sendMessage = (roomId, message) => {
  socket?.emit('sendMessage', { roomId, message })
}

export const removeListener = (event) => {
  socket?.off(event)
}

export const onOrderStatusChanged = async (callback) => {
  try {
    let s = getSocket()
    if (!s) {
      s = await connectSocket()
    }
    if (s) {
      s.off('orderStatusChanged')
      s.on('orderStatusChanged', (data) => {
        if (callback) callback(data)
      })
    }
  } catch (e) {
    console.warn('Socket orderStatusChanged error:', e)
  }
}

export const onReceiveMessage = (callback) => {
  if (socket) {
    socket.off('receiveMessage')
    socket.on('receiveMessage', (data) => {
      if (callback) callback(data)
    })
  }
}
