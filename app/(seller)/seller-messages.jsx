import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SellerHeader from '../../components/seller/SellerHeader';
import { colors } from '../../constants/colors';
import { getChatRooms, getMessages, sendMessage, markAsRead } from '../../services/messageService';
import { onReceiveMessage, joinRoom, removeListener } from '../../services/socketService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SellerMessages() {
  const [search, setSearch] = useState('');
  const [rooms, setRooms] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState(null);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setMyId(user._id);
      }
      fetchRooms();
    };
    init();
  }, []);

  useEffect(() => {
    onReceiveMessage((newMessage) => {
      if (activeChat && newMessage.chatRoomId === activeChat._id) {
        setThreads((prev) => {
          if (!prev.find(m => m._id === newMessage._id)) return [...prev, newMessage];
          return prev;
        });
        markAsRead(activeChat._id).catch(console.error);
        fetchRooms();
      } else {
        fetchRooms();
      }
    });

    return () => {
      removeListener('receiveMessage');
    };
  }, [activeChat]);

  const fetchRooms = async () => {
    try {
      const res = await getChatRooms();
      if (res.success) {
        setRooms(res.rooms);
      }
    } catch (error) {
      console.error('Failed to fetch rooms', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (room) => {
    setActiveChat(room);
    joinRoom(room._id);
    try {
      const res = await getMessages(room._id);
      if (res.success) {
        setThreads(res.messages);
        if (room.sellerUnread > 0) {
          await markAsRead(room._id);
          fetchRooms();
        }
      }
    } catch (error) {
      console.error('Failed to fetch messages', error);
    }
  };

  const handleSend = async () => {
    if (!messageText.trim() || !activeChat) return;
    const text = messageText;
    setMessageText('');
    
    try {
      const res = await sendMessage(activeChat._id, { text });
      if (res.success) {
        setThreads(prev => {
           if (!prev.find(m => m._id === res.message._id)) return [...prev, res.message];
           return prev;
        });
        fetchRooms();
      }
    } catch (error) {
      console.error('Send error', error);
    }
  };

  const filtered = useMemo(() => {
    return rooms.filter((item) => {
      const name = item.buyerId?.name || 'User';
      return name.toLowerCase().includes(search.toLowerCase());
    });
  }, [search, rooms]);

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SellerHeader title="Messages" />
      <View style={styles.container}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={20} color="#7a7a7a" />
          <TextInput style={styles.searchInput} placeholder="Search conversations..." value={search} onChangeText={setSearch} />
        </View>

        <FlatList 
          data={filtered} 
          keyExtractor={(item) => item._id} 
          renderItem={({ item }) => {
            const name = item.buyerId?.name || 'User';
            const unread = item.sellerUnread || 0;
            return (
              <TouchableOpacity style={[styles.conversation, activeChat?._id === item._id && styles.activeConversation]} onPress={() => loadMessages(item)}>
                <View style={styles.avatar}><Text style={styles.avatarText}>{name.charAt(0)}</Text></View>
                <View style={styles.conversationInfo}>
                  <Text style={styles.conversationName} numberOfLines={1}>{name}</Text>
                  <Text style={styles.conversationLast} numberOfLines={1}>{item.lastMessage || 'No messages yet'}</Text>
                </View>
                <View style={styles.metaColumn}>
                  <Text style={styles.time}>{formatTime(item.lastMessageAt)}</Text>
                  {unread > 0 && <View style={styles.unreadBadge}><Text style={styles.unreadText}>{unread}</Text></View>}
                </View>
              </TouchableOpacity>
            );
          }} 
          style={styles.list} 
          ListEmptyComponent={loading ? <ActivityIndicator size="small" color={colors.primary} style={{marginTop: 20}} /> : <Text style={styles.empty}>No conversations found.</Text>} 
        />

        {activeChat ? (
        <View style={styles.chatCard}>
          <View style={styles.chatHeader}>
             <View>
                <Text style={styles.chatTitle}>{activeChat.buyerId?.name || 'User'}</Text>
             </View>
          </View>
          <ScrollView 
            style={styles.thread} 
            contentContainerStyle={{ paddingVertical: 12 }}
            ref={scrollViewRef}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {threads.map((message, index) => {
              const isMine = message.senderId === myId;
              return (
              <View key={message._id || index} style={[styles.bubble, isMine ? styles.rightBubble : styles.leftBubble]}>
                <Text style={[styles.bubbleText, isMine && styles.rightText]}>{message.text}</Text>
                <Text style={[styles.timeLabel, isMine && styles.rightText]}>{formatTime(message.createdAt)}</Text>
              </View>
            )})}
          </ScrollView>
          <View style={styles.inputRow}>
            <TouchableOpacity style={styles.iconButton}><MaterialCommunityIcons name="paperclip" size={22} color="#7a7a7a" /></TouchableOpacity>
            <TextInput style={styles.textInput} placeholder="Type a message" value={messageText} onChangeText={setMessageText} onSubmitEditing={handleSend} />
            <TouchableOpacity style={styles.sendButton} onPress={handleSend}><MaterialCommunityIcons name="send" size={20} color="#fff" /></TouchableOpacity>
          </View>
        </View>
        ) : (
          <View style={[styles.chatCard, { justifyContent: 'center', alignItems: 'center' }]}>
            <MaterialCommunityIcons name="message-text-outline" size={48} color="#e0e0e0" />
            <Text style={{ marginTop: 12, color: '#7a7a7a' }}>Select a conversation to start chatting</Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: 20, paddingBottom: 20 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 18, paddingHorizontal: 16, height: 48, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  searchInput: { marginLeft: 10, fontSize: 14, flex: 1 },
  list: { marginBottom: 16, flex: 0.8 },
  conversation: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 18, backgroundColor: '#fff', marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  activeConversation: { backgroundColor: '#eef6ff' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: '700' },
  conversationInfo: { flex: 1, marginLeft: 12 },
  conversationName: { fontSize: 15, fontWeight: '700', color: colors.text },
  conversationLast: { fontSize: 13, color: '#7a7a7a', marginTop: 4 },
  metaColumn: { alignItems: 'flex-end' },
  time: { fontSize: 12, color: '#8a8a8a' },
  unreadBadge: { marginTop: 8, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.accent, justifyContent: 'center', alignItems: 'center' },
  unreadText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  chatCard: { flex: 1.2, backgroundColor: '#fff', borderRadius: 24, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 14, elevation: 4 },
  chatHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  chatTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  online: { backgroundColor: colors.success },
  offline: { backgroundColor: '#ccc' },
  statusText: { fontSize: 12, color: '#7a7a7a' },
  thread: { flex: 1, marginVertical: 8 },
  bubble: { maxWidth: '80%', padding: 14, borderRadius: 20, marginBottom: 10 },
  leftBubble: { backgroundColor: '#f5f5f5', alignSelf: 'flex-start' },
  rightBubble: { backgroundColor: colors.primary, alignSelf: 'flex-end' },
  bubbleText: { color: '#333', fontSize: 14, lineHeight: 20 },
  rightText: { color: '#fff' },
  timeLabel: { marginTop: 6, fontSize: 10, color: '#8a8a8a', textAlign: 'right' },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, borderRadius: 18, backgroundColor: '#f4f6fe', paddingHorizontal: 12, paddingVertical: 8 },
  iconButton: { padding: 8 },
  textInput: { flex: 1, marginLeft: 8, fontSize: 14, paddingVertical: 8 },
  sendButton: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  empty: { textAlign: 'center', marginTop: 40, color: '#7a7a7a' },
});
