import React, { useEffect, useState, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams } from 'expo-router'
import { getMessages, sendMessage } from '../../services/messageService'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useAuth } from '../../context/AuthContext'

export default function BuyerChatScreen() {
  const { roomId } = useLocalSearchParams()
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const flatListRef = useRef(null)

  const loadMessages = async () => {
    if (!roomId) return
    try {
      setLoading(true)
      const res = await getMessages(roomId)
      setMessages(res.messages || [])
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100)
    } catch (error) {
      console.log('Load chat messages error', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMessages()
  }, [roomId])

  const handleSend = async () => {
    if (!input.trim() || !roomId) return
    try {
      const res = await sendMessage(roomId, { content: input.trim() })
      setMessages((prev) => [...prev, res.message])
      setInput('')
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100)
    } catch (error) {
      console.log('Send message error', error)
    }
  }

  const renderMessage = ({ item }) => {
    const isMine = item.senderId === user?._id
    return (
      <View style={[styles.messageBubble, isMine ? styles.myMessage : styles.theirMessage]}>
        <Text style={[styles.messageText, isMine ? styles.myMessageText : styles.theirMessageText]}>{item.content}</Text>
        <Text style={styles.timestamp}>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Seller Chat</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={<Text style={styles.emptyText}>{loading ? 'Loading chat…' : 'No messages yet.'}</Text>}
      />

      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} keyboardVerticalOffset={90}>
        <View style={styles.inputRow}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Write a message..."
            placeholderTextColor="#8e99af"
            style={styles.input}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <MaterialCommunityIcons name="send" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eef2ff' },
  topBar: { paddingHorizontal: 16, paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#d8dcf7', backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '800', color: '#1a237e' },
  chatList: { padding: 16, paddingBottom: 14 },
  messageBubble: { maxWidth: '78%', padding: 14, borderRadius: 20, marginBottom: 10 },
  myMessage: { alignSelf: 'flex-end', backgroundColor: '#1a237e' },
  theirMessage: { alignSelf: 'flex-start', backgroundColor: '#fff', borderWidth: 1, borderColor: '#d8dcf7' },
  messageText: { fontSize: 15, lineHeight: 22 },
  myMessageText: { color: '#fff' },
  theirMessageText: { color: '#1f2a3d' },
  timestamp: { marginTop: 6, fontSize: 11, color: '#8e99af', textAlign: 'right' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#d8dcf7' },
  input: { flex: 1, minHeight: 45, maxHeight: 120, backgroundColor: '#f6f7ff', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 16, fontSize: 15, color: '#1a1f3b' },
  sendButton: { marginLeft: 10, width: 50, height: 50, borderRadius: 16, backgroundColor: '#29b6f6', alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#7a7f93', textAlign: 'center', marginTop: 30 }
})
