import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SellerHeader from '../../../components/seller/SellerHeader';
import { colors } from '../../../constants/colors';
import { getChatRooms, getMessages, sendMessage, markAsRead, deleteChatRoom } from '../../../services/messageService';
import { onReceiveMessage, joinRoom, removeListener, getSocket } from '../../../services/socketService';
import { useCall } from '../../../context/CallContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SellerMessages() {
  const { startCall } = useCall();
  const [search, setSearch] = useState('');
  const [rooms, setRooms] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [deletedRoomIds, setDeletedRoomIds] = useState([]);
  const [deletedMsgIds, setDeletedMsgIds] = useState([]);

  const handleDeleteChat = (room) => {
    Alert.alert(
      'Delete Conversation',
      'Are you sure you want to permanently delete this conversation? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // 1. Save locally to AsyncStorage for instant/offline fallback
              if (myId) {
                const key = 'deleted_rooms_' + myId;
                const stored = await AsyncStorage.getItem(key);
                let deletedIds = stored ? JSON.parse(stored) : [];
                if (!deletedIds.includes(room._id)) {
                  deletedIds.push(room._id);
                  await AsyncStorage.setItem(key, JSON.stringify(deletedIds));
                  setDeletedRoomIds(deletedIds);
                }
              }

              // 2. Hide immediately in local state
              setRooms((prev) => prev.filter((r) => r._id !== room._id));

              // 3. Make API call to delete permanently on the server
              await deleteChatRoom(room._id);
            } catch (err) {
              console.log('Delete chat error:', err);
              if (err.response?.status !== 404) {
                Alert.alert('Error', 'Failed to delete conversation from server. Please try again.');
              }
            }
          }
        }
      ]
    );
  };

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
              if (myId) {
                const key = 'deleted_messages_' + myId;
                const stored = await AsyncStorage.getItem(key);
                let deletedIds = stored ? JSON.parse(stored) : [];
                if (!deletedIds.includes(message._id)) {
                  deletedIds.push(message._id);
                  await AsyncStorage.setItem(key, JSON.stringify(deletedIds));
                  setDeletedMsgIds(deletedIds);
                }
              }
            } catch (err) {
              console.log('Delete message error:', err);
            }
          }
        }
      ]
    );
  };

  const handleCallPress = () => {
    if (!activeChat || !activeChat.buyerId) {
      Alert.alert('Call Failed', 'Unable to resolve buyer contact details.');
      return;
    }
    startCall(
      activeChat.buyerId._id,
      activeChat.buyerId.name || 'Buyer',
      activeChat.buyerId.avatar || ''
    );
  };
  const [messageText, setMessageText] = useState('');
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState(null);
  const [botActive, setBotActive] = useState(true);
  const scrollViewRef = useRef(null);

  const handleTakeover = () => {
    const socket = getSocket();
    if (socket && activeChat) {
      socket.emit('sellerTakeover', { roomId: activeChat._id });
      setBotActive(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setMyId(user._id);
        const storedRooms = await AsyncStorage.getItem('deleted_rooms_' + user._id);
        if (storedRooms) {
          setDeletedRoomIds(JSON.parse(storedRooms));
        }
        const storedMsgs = await AsyncStorage.getItem('deleted_messages_' + user._id);
        if (storedMsgs) {
          setDeletedMsgIds(JSON.parse(storedMsgs));
        }
      }
      fetchRooms();
    };
    init();
  }, []);

  useEffect(() => {
    const socket = getSocket();

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

    socket?.on('sellerTookOver', (data) => {
      if (activeChat && data.roomId === activeChat._id) {
        setBotActive(false);
      }
    });

    socket?.on('botHandover', (data) => {
      if (activeChat && data.roomId === activeChat._id) {
        setBotActive(false);
        setThreads(prev => {
          if (prev.find(m => m.text === data.message && m.senderType === 'system')) return prev;
          return [...prev, {
            _id: Date.now().toString(),
            senderType: 'system',
            text: `AI Bot Handover: ${data.reason === 'keyword_triggered' ? 'Takeover keyword used' : 'Message limit reached'}.`,
            createdAt: new Date()
          }];
        });
      }
      alert(`⚠️ Chat handed over! ${data.message}`);
      fetchRooms();
    });

    return () => {
      removeListener('receiveMessage');
      socket?.off('sellerTookOver');
      socket?.off('botHandover');
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
        const userStr = await AsyncStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          const storedMsgs = await AsyncStorage.getItem('deleted_messages_' + user._id);
          if (storedMsgs) {
            setDeletedMsgIds(JSON.parse(storedMsgs));
          }
        }
        setThreads(res.messages);
        setBotActive(res.botActive ?? true);
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
    setBotActive(false);
    
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
      if (deletedRoomIds.includes(item._id)) return false;
      const name = item.buyerId?.name || 'User';
      return name.toLowerCase().includes(search.toLowerCase());
    });
  }, [search, rooms, deletedRoomIds]);

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.flex} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {!activeChat ? (
        <>
          <SellerHeader title="Messages" />
          <View style={styles.container}>
            <View style={styles.searchBar}>
              <MaterialCommunityIcons name="magnify" size={20} color="#7a7a7a" />
              <TextInput 
                style={styles.searchInput} 
                placeholder="Search conversations..." 
                value={search} 
                onChangeText={setSearch} 
              />
            </View>

            <FlatList 
              data={filtered} 
              keyExtractor={(item) => item._id} 
              renderItem={({ item }) => {
                const name = item.buyerId?.name || 'User';
                const unread = item.sellerUnread || 0;
                return (
                  <TouchableOpacity style={styles.conversation} onPress={() => loadMessages(item)} onLongPress={() => handleDeleteChat(item)}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={styles.conversationInfo}>
                      <Text style={styles.conversationName} numberOfLines={1}>{name}</Text>
                      <Text style={styles.conversationLast} numberOfLines={1}>{item.lastMessage || 'No messages yet'}</Text>
                    </View>
                    <View style={styles.metaColumn}>
                      <Text style={styles.time}>{formatTime(item.lastMessageAt)}</Text>
                      {unread > 0 && (
                        <View style={styles.unreadBadge}>
                          <Text style={styles.unreadText}>{unread}</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }} 
              style={styles.list} 
              ListEmptyComponent={
                loading ? (
                  <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 40 }} />
                ) : (
                  <Text style={styles.empty}>No conversations found.</Text>
                )
              } 
            />
          </View>
        </>
      ) : (
        <>
          <View style={styles.customHeader}>
            <TouchableOpacity onPress={() => setActiveChat(null)} style={styles.backButton}>
              <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primary} />
            </TouchableOpacity>
            <View style={styles.avatarSmall}>
              <Text style={styles.avatarSmallText}>{(activeChat.buyerId?.name || 'U').charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle} numberOfLines={1}>{activeChat.buyerId?.name || 'User'}</Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>{activeChat.roomName || 'Connected Buyer'}</Text>
            </View>
            <TouchableOpacity
              style={styles.callButton}
              onPress={handleCallPress}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="phone" size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.chatContainer}>
            {botActive && (
              <View style={styles.aiBanner}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                  <Text style={{ fontSize: 16 }}>🤖</Text>
                  <Text style={styles.aiBannerText}>AI Assistant is handling this chat</Text>
                </View>
                <TouchableOpacity style={styles.takeoverBtn} onPress={handleTakeover}>
                  <Text style={styles.takeoverBtnText}>Take Over</Text>
                </TouchableOpacity>
              </View>
            )}
            <ScrollView 
              style={styles.thread} 
              contentContainerStyle={{ paddingVertical: 16 }}
              ref={scrollViewRef}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
              {threads.length > 0 ? (
                threads.filter(m => !deletedMsgIds.includes(m._id)).map((message, index) => {
                  if (message.senderType === 'system') {
                    return (
                      <View style={styles.systemMsg} key={message._id || index}>
                        <Text style={styles.systemMsgText}>{message.text}</Text>
                      </View>
                    );
                  }

                  if (message.isBot || message.senderType === 'bot') {
                    return (
                      <TouchableOpacity key={message._id || index} onLongPress={() => handleLongPressMessage(message)} activeOpacity={0.9} style={[styles.bubble, styles.leftBubble, { backgroundColor: '#fff8e1', borderColor: '#ffe082', borderWidth: 1 }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                          <Text style={{ fontSize: 10, fontWeight: '750', color: colors.primary }}>UBS AI Assistant</Text>
                          <View style={{ backgroundColor: colors.primary, paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3 }}>
                            <Text style={{ color: '#fff', fontSize: 8, fontWeight: '800' }}>AI</Text>
                          </View>
                        </View>
                        <Text style={styles.bubbleText}>{message.text}</Text>
                        <Text style={styles.timeLabel}>{formatTime(message.createdAt)}</Text>
                      </TouchableOpacity>
                    );
                  }

                  const msgSenderId = typeof message.senderId === 'object' ? message.senderId?._id : message.senderId;
                  const isMine = (msgSenderId && myId && msgSenderId.toString() === myId.toString()) || message.senderType === 'seller';
                  const buyerName = activeChat?.buyerId?.name || 'Buyer';

                  return (
                    <TouchableOpacity 
                      key={message._id || index} 
                      onLongPress={() => handleLongPressMessage(message)} 
                      activeOpacity={0.9} 
                      style={[styles.bubble, isMine ? styles.rightBubble : styles.leftBubble]}
                    >
                      {!isMine && (
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#1565c0', marginBottom: 3 }}>
                          👤 {buyerName}
                        </Text>
                      )}
                      <Text style={[styles.bubbleText, isMine && styles.rightText]}>{message.text}</Text>
                      <Text style={[styles.timeLabel, isMine && styles.rightTimeLabel]}>{formatTime(message.createdAt)}</Text>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.emptyChat}>
                  <MaterialCommunityIcons name="message-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyChatText}>No messages yet. Send a message to start the conversation!</Text>
                </View>
              )}
            </ScrollView>
            <View style={styles.inputRow}>
              <TouchableOpacity style={styles.iconButton}>
                <MaterialCommunityIcons name="paperclip" size={22} color="#7a7a7a" />
              </TouchableOpacity>
              <TextInput 
                style={styles.textInput} 
                placeholder="Type a message" 
                value={messageText} 
                onChangeText={setMessageText} 
                onSubmitEditing={handleSend} 
              />
              <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                <MaterialCommunityIcons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: 20 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 18, paddingHorizontal: 16, height: 48, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  searchInput: { marginLeft: 10, fontSize: 14, flex: 1 },
  list: { flex: 1 },
  conversation: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 18, backgroundColor: '#fff', marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  conversationInfo: { flex: 1, marginLeft: 12 },
  conversationName: { fontSize: 15, fontWeight: '700', color: colors.text },
  conversationLast: { fontSize: 13, color: '#7a7a7a', marginTop: 4 },
  metaColumn: { alignItems: 'flex-end', justifyContent: 'center' },
  time: { fontSize: 12, color: '#8a8a8a' },
  unreadBadge: { marginTop: 6, minWidth: 20, height: 20, borderRadius: 10, backgroundColor: colors.accent, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
  unreadText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  customHeader: {
    height: 64,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  backButton: {
    padding: 8,
    marginRight: 4,
  },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarSmallText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#7a7a7a',
    marginTop: 2,
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fc',
  },
  emptyChat: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyChatText: {
    marginTop: 12,
    color: '#7a7a7a',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 30,
    lineHeight: 20,
  },
  thread: { flex: 1 },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  leftBubble: {
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e8ebf3',
  },
  rightBubble: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    color: '#2d3748',
    fontSize: 15,
    lineHeight: 21,
  },
  rightText: {
    color: '#ffffff',
  },
  timeLabel: {
    marginTop: 4,
    fontSize: 10,
    color: '#a0aec0',
    textAlign: 'right',
  },
  rightTimeLabel: {
    color: '#e2e8f0',
    marginTop: 4,
    fontSize: 10,
    textAlign: 'right',
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 20, borderRadius: 18, backgroundColor: '#f4f6fe', paddingHorizontal: 12, paddingVertical: 8 },
  iconButton: { padding: 8 },
  textInput: { flex: 1, marginLeft: 8, fontSize: 14, paddingVertical: 8 },
  sendButton: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  empty: { textAlign: 'center', marginTop: 40, color: '#7a7a7a' },
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#bbdefb',
    borderRadius: 8,
    marginTop: 8
  },
  aiBannerText: {
    fontSize: 12,
    color: '#1565c0',
    fontWeight: '600',
  },
  takeoverBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  takeoverBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
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
  callButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f4f6fe',
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
