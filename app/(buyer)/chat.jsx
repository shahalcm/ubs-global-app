import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Linking
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  joinRoom,
  sendMessage as socketSendMessage,
  onReceiveMessage,
  removeListener,
  getSocket
} from '../../services/socketService'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useCall } from '../../context/CallContext'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'

export default function BuyerChatScreen() {
  const { t } = useTranslation()
  const { roomId, sellerName, productTitle } = useLocalSearchParams()
  const { user } = useAuth()
  const { startCall } = useCall()
  const router = useRouter()
  const [supportPhone, setSupportPhone] = useState('9544755008')

  const [messages, setMessages] = useState([])
  const [room, setRoom] = useState(null)
  const [inputText, setInputText] = useState('')
  const [botTyping, setBotTyping] = useState(false)
  const [sellerOnline, setSellerOnline] = useState(false)
  const [botActive, setBotActive] = useState(true)
  const [sellerTookOver, setSellerTookOver] = useState(false)
  const [deletedMsgIds, setDeletedMsgIds] = useState([])
  const flatListRef = useRef(null)
  const typingAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    loadMessages()
    setupSocket()

    const fetchSupport = async () => {
      try {
        const res = await api.get('/public-settings');
        if (res.data?.success && res.data.settings?.contactPhone) {
          setSupportPhone(res.data.settings.contactPhone);
        }
      } catch (err) {
        console.log("Failed to load public support settings:", err);
      }
    };
    fetchSupport();

    return () => {
      removeListener('receiveMessage')
      removeListener('botTyping')
      removeListener('sellerTookOver')
      removeListener('userTyping')
    }
  }, [roomId])

  const loadMessages = async () => {
    try {
      const res = await api.get(`/chat/${roomId}/messages`)
      if (res.data && res.data.success) {
        setRoom(res.data.room)
        
        let deletedIds = []
        if (user?._id) {
          const stored = await AsyncStorage.getItem('deleted_messages_' + user._id)
          if (stored) {
            deletedIds = JSON.parse(stored)
          }
        }
        setDeletedMsgIds(deletedIds)

        setMessages(res.data.messages || [])
        setBotActive(res.data.botActive ?? true)
        
        if (res.data.botActive === false) {
          setSellerTookOver(true)
        }
      }
      scrollToBottom()
    } catch (error) {
      console.log('Load messages error:', error)
    }
  }

  const setupSocket = () => {
    joinRoom(roomId)

    onReceiveMessage((message) => {
      setMessages(prev => {
        const exists = prev.find(m => m._id === message._id)
        if (exists) return prev
        return [...prev, message]
      })
      scrollToBottom()
    })

    const socket = getSocket()
    socket?.on('botTyping', (data) => {
      if (data.roomId === roomId) {
        setBotTyping(data.isTyping)
        if (data.isTyping) {
          startTypingAnimation()
        }
      }
    })

    socket?.on('sellerTookOver', (data) => {
      if (data.roomId === roomId) {
        setBotActive(false)
        setSellerTookOver(true)
        setMessages(prev => {
          const exists = prev.find(m => m.text === data.message && m.senderType === 'system')
          if (exists) return prev
          return [...prev, {
            _id: Date.now().toString(),
            senderType: 'system',
            text: data.message,
            createdAt: new Date()
          }]
        })
        scrollToBottom()
      }
    })

    socket?.on('userTyping', (data) => {
      if (data.roomId === roomId) {
        setSellerOnline(true)
      }
    })
  }

  const startTypingAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(typingAnim, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true
        }),
        Animated.timing(typingAnim, {
          toValue: 0,
          duration: 450,
          useNativeDriver: true
        })
      ])
    ).start()
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true })
    }, 100)
  }

  const handleLongPressMessage = (message) => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message? This will only remove it from your device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (user?._id) {
                const key = 'deleted_messages_' + user._id
                const stored = await AsyncStorage.getItem(key)
                let deletedIds = stored ? JSON.parse(stored) : []
                if (!deletedIds.includes(message._id)) {
                  deletedIds.push(message._id)
                  await AsyncStorage.setItem(key, JSON.stringify(deletedIds))
                  setDeletedMsgIds(deletedIds)
                }
              }
            } catch (err) {
              console.log('Delete message error:', err)
            }
          }
        }
      ]
    )
  }

  const handleCallPress = () => {
    if (!room) return
    if (!room.sellerId) {
      Linking.openURL(`tel:${supportPhone}`).catch(() => {
        Alert.alert('Error', 'Unable to dial phone number.')
      })
      return
    }
    const avatar = room.meta?.sellerAvatar || ''
    startCall(room.sellerId, sellerName || 'Seller', avatar)
  }

  const isMyMessage = (item) => {
    if (!item || !user?._id) return false
    const msgSenderId = typeof item.senderId === 'object' ? item.senderId?._id : item.senderId
    if (msgSenderId && msgSenderId.toString() === user._id.toString()) {
      return true
    }
    if (user.role === 'buyer' && item.senderType === 'buyer') {
      if (!msgSenderId || msgSenderId.toString() === user._id.toString()) {
        return true
      }
    }
    if (user.role === 'seller' && item.senderType === 'seller') {
      return true
    }
    return false
  }

  const handleSend = async (customText = null) => {
    const sendText = (customText || inputText).trim()
    if (!sendText) return

    if (!customText) setInputText('')

    try {
      const socket = getSocket()
      const senderType = user?.role === 'seller' ? 'seller' : 'buyer'

      const msgData = {
        roomId,
        message: {
          senderId: user._id,
          senderType,
          senderName: user.name,
          senderAvatar: user.avatar,
          messageType: 'text',
          text: sendText,
          createdAt: new Date()
        }
      }

      if (socket && socket.connected) {
        socket.emit('sendMessage', msgData)
      } else {
        const res = await api.post(`/chat/${roomId}/messages`, { text: sendText })
        if (res.data?.success && res.data?.message) {
          setMessages(prev => {
            const exists = prev.find(m => m._id === res.data.message._id)
            if (exists) return prev
            return [...prev, res.data.message]
          })
        }
      }
      scrollToBottom()
    } catch (err) {
      console.log('Send message error:', err)
      Alert.alert('Error', 'Failed to send message')
    }
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const d = new Date(timestamp)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const renderMessage = ({ item }) => {
    if (deletedMsgIds.includes(item._id)) return null

    // System Message
    if (item.senderType === 'system') {
      return (
        <View style={styles.systemMsg} key={item._id}>
          <Text style={styles.systemMsgText}>{item.text}</Text>
        </View>
      )
    }

    // Bot / AI Assistant Message (LEFT SIDE)
    if (item.isBot || item.senderType === 'bot') {
      return (
        <TouchableOpacity
          onLongPress={() => handleLongPressMessage(item)}
          activeOpacity={0.9}
          style={styles.leftMsgRow}
          key={item._id}
        >
          <View style={styles.botAvatar}>
            <Text style={styles.botAvatarIcon}>🤖</Text>
          </View>
          <View style={styles.leftMsgContent}>
            <View style={styles.botLabelHeader}>
              <Text style={styles.botNameText}>{item.senderName || 'UBS Assistant'}</Text>
              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>AI</Text>
              </View>
            </View>
            <View style={[styles.msgBubble, styles.botBubble]}>
              <Text style={styles.botMsgText}>{item.text}</Text>
            </View>
            <Text style={styles.msgTimeLeft}>{formatTime(item.createdAt)}</Text>
          </View>
        </TouchableOpacity>
      )
    }

    // My Message (RIGHT SIDE)
    if (isMyMessage(item)) {
      return (
        <TouchableOpacity
          onLongPress={() => handleLongPressMessage(item)}
          activeOpacity={0.9}
          style={styles.rightMsgRow}
          key={item._id}
        >
          <View style={styles.rightMsgContent}>
            <View style={[styles.msgBubble, styles.myBubble]}>
              <Text style={styles.myMsgText}>{item.text}</Text>
            </View>
            <Text style={styles.msgTimeRight}>{formatTime(item.createdAt)}</Text>
          </View>
        </TouchableOpacity>
      )
    }

    // Other User / Seller Message (LEFT SIDE)
    return (
      <TouchableOpacity
        onLongPress={() => handleLongPressMessage(item)}
        activeOpacity={0.9}
        style={styles.leftMsgRow}
        key={item._id}
      >
        <Image
          source={{
            uri: item.senderAvatar || 'https://via.placeholder.com/36'
          }}
          style={styles.sellerAvatar}
        />
        <View style={styles.leftMsgContent}>
          <Text style={styles.senderNameText}>{item.senderName || sellerName || 'Seller'}</Text>
          <View style={[styles.msgBubble, styles.sellerBubble]}>
            <Text style={styles.sellerMsgText}>{item.text}</Text>
          </View>
          <Text style={styles.msgTimeLeft}>{formatTime(item.createdAt)}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* TOP BAR */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace('/(buyer)/messages'))}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1a237e" />
          </TouchableOpacity>

          <View style={styles.topInfo}>
            <Text style={styles.topName} numberOfLines={1}>{sellerName || 'UBS Global Support'}</Text>
            <View style={styles.statusRow}>
              {botActive ? (
                <>
                  <View style={styles.botDot} />
                  <Text style={styles.statusText}>{t("AI Assistant Active")}</Text>
                </>
              ) : (
                <>
                  <View style={[styles.botDot, { backgroundColor: sellerOnline ? '#4caf50' : '#ffa000' }]} />
                  <Text style={styles.statusText}>{sellerOnline ? t('Online') : t('Seller Active')}</Text>
                </>
              )}
            </View>
          </View>

          <TouchableOpacity style={styles.callBtn} onPress={handleCallPress}>
            <MaterialCommunityIcons name="phone" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* AI BANNER */}
        {botActive && (
          <View style={styles.aiBanner}>
            <Text style={styles.aiBannerIcon}>🤖</Text>
            <Text style={styles.aiBannerText}>{t("UBS AI Assistant is handling this chat for instant responses")}</Text>
          </View>
        )}

        {/* MESSAGES LIST */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item, index) => item._id || index.toString()}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
        />

        {/* BOT TYPING INDICATOR */}
        {botTyping && (
          <View style={styles.typingRow}>
            <View style={styles.botAvatarSmall}>
              <Text style={{ fontSize: 12 }}>🤖</Text>
            </View>
            <Animated.View style={[styles.typingBubble, { opacity: typingAnim }]}>
              <Text style={styles.typingText}>{t("UBS Assistant is typing...")}</Text>
            </Animated.View>
          </View>
        )}

        {/* QUICK SUGGESTION CHIPS */}
        <View style={styles.chipRow}>
          <TouchableOpacity style={styles.chip} onPress={() => handleSend('What is the price & minimum order?')}>
            <Text style={styles.chipText}>🏷️ {t("Price & Quotes")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chip} onPress={() => handleSend('Is this item in stock?')}>
            <Text style={styles.chipText}>📦 {t("Stock Availability")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chip} onPress={() => handleSend('What are the shipping details?')}>
            <Text style={styles.chipText}>✈️ {t("Shipping Info")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chip} onPress={() => handleSend('I want to speak to human agent')}>
            <Text style={styles.chipText}>👤 {t("Speak to Agent")}</Text>
          </TouchableOpacity>
        </View>

        {/* INPUT BAR */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={t("Type a message...")}
            placeholderTextColor="#888"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={() => handleSend()}
            disabled={!inputText.trim()}
          >
            <MaterialCommunityIcons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fc' },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  topInfo: { flex: 1, marginLeft: 14 },
  topName: { fontSize: 16, fontWeight: '800', color: '#1a237e' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  botDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#0288d1', marginRight: 6 },
  statusText: { fontSize: 11, color: '#666', fontWeight: '600' },
  callBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#1a237e', justifyContent: 'center', alignItems: 'center' },

  // AI Banner
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#bbdefb',
    gap: 8,
  },
  aiBannerIcon: { fontSize: 14 },
  aiBannerText: { fontSize: 12, color: '#0d47a1', fontWeight: '600' },

  // Messages List
  messagesList: { paddingHorizontal: 14, paddingVertical: 16 },

  // System Message
  systemMsg: { alignSelf: 'center', backgroundColor: '#eef2ff', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12, marginVertical: 8 },
  systemMsgText: { fontSize: 11, color: '#1a237e', fontWeight: '600' },

  // Left Message (Bot / Seller)
  leftMsgRow: { flexDirection: 'row', alignItems: 'flex-start', marginVertical: 6, maxWidth: '82%', alignSelf: 'flex-start' },
  botAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#e3f2fd', justifyContent: 'center', alignItems: 'center', marginRight: 8, marginTop: 2 },
  botAvatarIcon: { fontSize: 18 },
  sellerAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 8, marginTop: 2, backgroundColor: '#ddd' },
  leftMsgContent: { flex: 1 },
  botLabelHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 6 },
  botNameText: { fontSize: 11, fontWeight: '700', color: '#1a237e' },
  senderNameText: { fontSize: 11, fontWeight: '700', color: '#666', marginBottom: 4 },
  aiBadge: { backgroundColor: '#1a237e', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6 },
  aiBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  botBubble: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e3f2fd' },
  sellerBubble: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e0e0e0' },
  botMsgText: { fontSize: 14, color: '#1a237e', lineHeight: 20 },
  sellerMsgText: { fontSize: 14, color: '#333', lineHeight: 20 },
  msgTimeLeft: { fontSize: 10, color: '#999', marginTop: 4, marginLeft: 2 },

  // Right Message (Current User)
  rightMsgRow: { flexDirection: 'row', justifyContent: 'flex-end', marginVertical: 6, maxWidth: '82%', alignSelf: 'flex-end' },
  rightMsgContent: { alignItems: 'flex-end' },
  myBubble: { backgroundColor: '#1a237e' },
  myMsgText: { fontSize: 14, color: '#ffffff', lineHeight: 20 },
  msgTimeRight: { fontSize: 10, color: '#999', marginTop: 4, textAlign: 'right', marginRight: 2 },

  // Generic Bubble
  msgBubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16 },

  // Typing
  typingRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 6 },
  botAvatarSmall: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#e3f2fd', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  typingBubble: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#e3f2fd' },
  typingText: { fontSize: 12, color: '#0d47a1', fontStyle: 'italic' },

  // Quick Chips
  chipRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 6, flexWrap: 'wrap', gap: 6, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  chip: { backgroundColor: '#f0f4fe', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#d0e0fc' },
  chipText: { fontSize: 11, fontWeight: '700', color: '#1a237e' },

  // Input Container
  inputContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eaeaea' },
  input: { flex: 1, backgroundColor: '#f5f7fc', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: '#333', maxHeight: 100 },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#1a237e', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  sendBtnDisabled: { backgroundColor: '#c5cae9' },
})
