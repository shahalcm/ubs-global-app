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
  Easing,
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

export default function BuyerChatScreen() {
  const { roomId, sellerName, productTitle } = useLocalSearchParams()
  const { user } = useAuth()
  const { startCall } = useCall()
  const router = useRouter()
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
        
        // If bot is active, but seller took over earlier (like we check bot active status)
        if (res.data.botActive === false) {
          setSellerTookOver(true)
        }
      }
      scrollToBottom()
    } catch (error) {
      console.log('Load messages error:', error)
    }
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

  const setupSocket = () => {
    joinRoom(roomId)

    // Receive messages
    onReceiveMessage((message) => {
      setMessages(prev => {
        // Avoid duplicates
        const exists = prev.find(m => m._id === message._id)
        if (exists) return prev
        return [...prev, message]
      })
      scrollToBottom()
    })

    // Bot typing indicator
    const socket = getSocket()
    socket?.on('botTyping', (data) => {
      if (data.roomId === roomId) {
        setBotTyping(data.isTyping)
        if (data.isTyping) {
          startTypingAnimation()
        }
      }
    })

    // Seller took over
    socket?.on('sellerTookOver', (data) => {
      if (data.roomId === roomId) {
        setBotActive(false)
        setSellerTookOver(true)
        // Show system message
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

    // User typing
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
          duration: 500,
          useNativeDriver: true
        }),
        Animated.timing(typingAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true
        })
      ])
    ).start()
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({
        animated: true
      })
    }, 100)
  }

  const handleCallPress = () => {
    if (!room) return
    if (!room.sellerId) {
      Linking.openURL('tel:9544755008').catch(() => {
        Alert.alert('Error', 'Unable to dial phone number.')
      })
      return
    }
    const avatar = room.meta?.sellerAvatar || ''
    startCall(room.sellerId, sellerName || 'Seller', avatar)
  }

  const handleSend = async () => {
    if (!inputText.trim()) return

    const sendText = inputText.trim()
    const tempId = 'temp_' + Date.now()

    const buyerMsgObj = {
      _id: tempId,
      senderId: user._id,
      senderType: 'buyer',
      senderName: user.name,
      senderAvatar: user.avatar,
      messageType: 'text',
      text: sendText,
      createdAt: new Date()
    }

    // Append buyer message to screen state instantly
    setMessages(prev => [...prev, buyerMsgObj])
    setInputText('')
    scrollToBottom()

    // Show bot typing animation
    setBotTyping(true)
    startTypingAnimation()

    // Socket emit
    socketSendMessage(roomId, buyerMsgObj)

    // Backup REST call to guarantee AI response delivery even if WebSockets disconnect
    try {
      const res = await api.post(`/chat/${roomId}/messages`, { text: sendText })
      setBotTyping(false)
      if (res.data && res.data.success && res.data.aiMessage) {
        const aiMsg = res.data.aiMessage
        setMessages(prev => {
          const exists = prev.find(m => m._id === aiMsg._id || m.text === aiMsg.text)
          if (exists) return prev
          return [...prev, aiMsg]
        })
        scrollToBottom()
      }
    } catch (err) {
      setBotTyping(false)
      console.log('REST send error:', err)
    }
  }

  const renderMessage = ({ item }) => {
    // System message
    if (item.senderType === 'system') {
      return (
        <View style={styles.systemMsg} key={item._id}>
          <Text style={styles.systemMsgText}>
            {item.text}
          </Text>
        </View>
      )
    }

    // Bot message
    if (item.isBot || item.senderType === 'bot') {
      return (
        <TouchableOpacity onLongPress={() => handleLongPressMessage(item)} activeOpacity={0.9} style={styles.botMsgRow} key={item._id}>
          {/* Bot avatar */}
          <View style={styles.botAvatar}>
            <Text style={styles.botAvatarIcon}>🤖</Text>
          </View>
          <View style={styles.botMsgContent}>
            {/* Bot label */}
            <View style={styles.botLabel}>
              <Text style={styles.botLabelText}>
                {item.senderName || 'UBS Assistant'}
              </Text>
              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>AI</Text>
              </View>
            </View>
            {/* Bot bubble */}
            <View style={[
              styles.msgBubble,
              styles.botBubble,
              item.isTakeover && styles.takeoverBubble
            ]}>
              <Text style={styles.botMsgText}>
                {item.text}
              </Text>
            </View>
            <Text style={styles.msgTime}>
              {formatTime(item.createdAt)}
            </Text>
          </View>
        </TouchableOpacity>
      )
    }

    // Buyer message (right side)
    if (item.senderType === 'buyer') {
      const isMe = item.senderId === user?._id
      if (isMe) {
        return (
          <TouchableOpacity onLongPress={() => handleLongPressMessage(item)} activeOpacity={0.9} style={styles.myMsgRow} key={item._id}>
            <View style={[
              styles.msgBubble,
              styles.myBubble
            ]}>
              <Text style={styles.myMsgText}>
                {item.text}
              </Text>
            </View>
            <Text style={[
              styles.msgTime,
              { textAlign: 'right' }
            ]}>
              {formatTime(item.createdAt)}
            </Text>
          </TouchableOpacity>
        )
      }
    }

    // Seller message (left side)
    return (
      <TouchableOpacity onLongPress={() => handleLongPressMessage(item)} activeOpacity={0.9} style={styles.sellerMsgRow} key={item._id}>
        <Image
          source={{
            uri: item.senderAvatar || 'https://via.placeholder.com/32'
          }}
          style={styles.sellerAvatar}
        />
        <View style={{ flex: 1 }}>
          <View style={[
            styles.msgBubble,
            styles.sellerBubble
          ]}>
            <Text style={styles.sellerMsgText}>
              {item.text}
            </Text>
          </View>
          <Text style={styles.msgTime}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* TOP BAR */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(buyer)/messages')}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1a237e" />
          </TouchableOpacity>
          <View style={styles.topInfo}>
            <Text style={styles.topName}>
              {sellerName || 'Chat'}
            </Text>
            <View style={styles.statusRow}>
              {botActive ? (
                <>
                  <View style={styles.botDot} />
                  <Text style={styles.statusText}>
                    AI Assistant Active
                  </Text>
                </>
              ) : (
                <>
                  <View style={styles.humanDot} />
                  <Text style={styles.statusText}>
                    Seller Online
                  </Text>
                </>
              )}
            </View>
          </View>
          {productTitle && (
            <View style={styles.productTag}>
              <Text style={styles.productTagText} numberOfLines={1}>
                📦 {productTitle}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.callButton}
            onPress={handleCallPress}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="phone" size={22} color="#1a237e" />
          </TouchableOpacity>
        </View>

        {/* AI STATUS BANNER */}
        {botActive && (
          <View style={styles.aiBanner}>
            <Text style={styles.aiBannerIcon}>🤖</Text>
            <Text style={styles.aiBannerText}>
              AI Assistant is handling this chat
            </Text>
          </View>
        )}

        {sellerTookOver && (
          <View style={styles.sellerBanner}>
            <Text style={styles.sellerBannerIcon}>👨‍💼</Text>
            <Text style={styles.sellerBannerText}>
              Seller has joined the conversation
            </Text>
          </View>
        )}

        {/* MESSAGES LIST */}
        <FlatList
          ref={flatListRef}
          data={messages.filter(m => !deletedMsgIds.includes(m._id))}
          renderItem={renderMessage}
          keyExtractor={item => item._id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={scrollToBottom}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Start a conversation...</Text>
          }
        />

        {/* BOT TYPING INDICATOR */}
        {botTyping && (
          <View style={styles.typingContainer}>
            <View style={styles.botAvatar}>
              <Text style={styles.botAvatarIcon}>🤖</Text>
            </View>
            <View style={styles.typingBubble}>
              <View style={styles.typingDots}>
                <Animated.View style={[
                  styles.dot,
                  { opacity: typingAnim }
                ]} />
                <Animated.View style={[
                  styles.dot,
                  { opacity: typingAnim }
                ]} />
                <Animated.View style={[
                  styles.dot,
                  { opacity: typingAnim }
                ]} />
              </View>
            </View>
          </View>
        )}

        {/* INPUT BAR */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor="#aaa"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              !inputText.trim() && styles.sendBtnDisabled
            ]}
            onPress={handleSend}
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
  container: {
    flex: 1,
    backgroundColor: '#f5f7fc'
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 10,
  },
  topInfo: { flex: 1 },
  topName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a237e',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  botDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#29b6f6',
  },
  humanDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  statusText: {
    fontSize: 12,
    color: '#888',
  },
  productTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    maxWidth: 120,
  },
  productTagText: {
    fontSize: 11,
    color: '#1a237e',
    fontWeight: '500',
  },
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#bbdefb',
  },
  aiBannerIcon: { fontSize: 16 },
  aiBannerText: {
    fontSize: 13,
    color: '#1565c0',
    fontWeight: '500',
  },
  sellerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  sellerBannerIcon: { fontSize: 16 },
  sellerBannerText: {
    fontSize: 13,
    color: '#2e7d32',
    fontWeight: '500',
  },
  messagesList: {
    padding: 16,
    gap: 12,
    paddingBottom: 20,
  },
  systemMsg: {
    alignItems: 'center',
    marginVertical: 8,
  },
  systemMsgText: {
    fontSize: 12,
    color: '#888',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    textAlign: 'center',
  },
  botMsgRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  botAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  botAvatarIcon: { fontSize: 18 },
  botMsgContent: { flex: 1 },
  botLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  botLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a237e',
  },
  aiBadge: {
    backgroundColor: '#1a237e',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  aiBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  msgBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  botBubble: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e3f2fd',
    borderTopLeftRadius: 4,
  },
  takeoverBubble: {
    backgroundColor: '#fff8e1',
    borderColor: '#ffe082',
  },
  botMsgText: {
    fontSize: 14,
    color: '#222',
    lineHeight: 20,
  },
  myMsgRow: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  myBubble: {
    backgroundColor: '#1a237e',
    borderTopRightRadius: 4,
    alignSelf: 'flex-end',
  },
  myMsgText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
  sellerMsgRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  sellerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  sellerBubble: {
    backgroundColor: '#f0f0f0',
    borderTopLeftRadius: 4,
  },
  sellerMsgText: {
    fontSize: 14,
    color: '#222',
    lineHeight: 20,
  },
  msgTime: {
    fontSize: 11,
    color: '#aaa',
    marginTop: 4,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  typingBubble: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e3f2fd',
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#29b6f6',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f5f7fc',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#e8ecf4',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1a237e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#c5cae9',
  },
  callButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f5f7fc',
    marginLeft: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#aaa',
    marginTop: 40
  }
})

// Helper
const formatTime = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })
}
