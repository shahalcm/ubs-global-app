import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SellerHeader from '../../components/seller/SellerHeader';
import { useSeller } from '../../context/SellerContext';
import { colors } from '../../constants/colors';

const conversations = [
  { id: '1', name: 'Maya Singh', last: 'Can you confirm the shipping date?', unread: 2, online: true },
  { id: '2', name: 'Arjun Nair', last: 'Thanks for the quick response', unread: 0, online: false },
  { id: '3', name: 'Sara Ali', last: 'I need one more color variant', unread: 1, online: false },
];

const threads = [
  { fromSeller: false, text: 'Hello, your order is on the way.', time: '9:02 AM' },
  { fromSeller: true, text: 'Thanks for the update. Please share the tracking details.', time: '9:05 AM' },
  { fromSeller: false, text: 'Sure, will send shortly.', time: '9:08 AM' },
];

export default function SellerMessages() {
  const { messages } = useSeller();
  const [search, setSearch] = useState('');
  const [activeChat, setActiveChat] = useState(conversations[0]);
  const [messageText, setMessageText] = useState('');

  const filtered = useMemo(() => {
    return conversations.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SellerHeader title="Messages" />
      <View style={styles.container}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={20} color="#7a7a7a" />
          <TextInput style={styles.searchInput} placeholder="Search conversations..." value={search} onChangeText={setSearch} />
        </View>

        <FlatList data={filtered} keyExtractor={(item) => item.id} renderItem={({ item }) => (
          <TouchableOpacity style={[styles.conversation, activeChat?.id === item.id && styles.activeConversation]} onPress={() => setActiveChat(item)}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{item.name.charAt(0)}</Text></View>
            <View style={styles.conversationInfo}>
              <Text style={styles.conversationName}>{item.name}</Text>
              <Text style={styles.conversationLast}>{item.last}</Text>
            </View>
            <View style={styles.metaColumn}><Text style={styles.time}>3m</Text>{item.unread > 0 && <View style={styles.unreadBadge}><Text style={styles.unreadText}>{item.unread}</Text></View>}</View>
          </TouchableOpacity>
        )} style={styles.list} ListEmptyComponent={<Text style={styles.empty}>No conversations found.</Text>} />

        <View style={styles.chatCard}>
          <View style={styles.chatHeader}><View><Text style={styles.chatTitle}>{activeChat.name}</Text><View style={styles.statusRow}><View style={[styles.statusDot, activeChat.online ? styles.online : styles.offline]} /><Text style={styles.statusText}>{activeChat.online ? 'Online' : 'Offline'}</Text></View></View></View>
          <ScrollView style={styles.thread} contentContainerStyle={{ paddingVertical: 12 }}>
            {threads.map((message, index) => (
              <View key={index} style={[styles.bubble, message.fromSeller ? styles.rightBubble : styles.leftBubble]}>
                <Text style={[styles.bubbleText, message.fromSeller && styles.rightText]}>{message.text}</Text>
                <Text style={[styles.timeLabel, message.fromSeller && styles.rightText]}>{message.time}</Text>
              </View>
            ))}
          </ScrollView>
          <View style={styles.inputRow}>
            <TouchableOpacity style={styles.iconButton}><MaterialCommunityIcons name="paperclip" size={22} color="#7a7a7a" /></TouchableOpacity>
            <TextInput style={styles.textInput} placeholder="Type a message" value={messageText} onChangeText={setMessageText} />
            <TouchableOpacity style={styles.sendButton}><MaterialCommunityIcons name="send" size={20} color="#fff" /></TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: 20, paddingBottom: 100 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 18, paddingHorizontal: 16, height: 48, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  searchInput: { marginLeft: 10, fontSize: 14, flex: 1 },
  list: { marginBottom: 16 },
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
  chatCard: { flex: 1, backgroundColor: '#fff', borderRadius: 24, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 14, elevation: 4 },
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
