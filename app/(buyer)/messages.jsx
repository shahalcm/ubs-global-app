// app/(buyer)/messages.jsx
import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'

const MOCK_MESSAGES = [
  {
    id: 1,
    supplierName: 'SolarTrade Global Ltd.',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80',
    lastMessage: 'The shipping documents have been attached. Please review them at your earliest convenience.',
    time: '10:30 AM',
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: 2,
    supplierName: 'Guangzhou Industrial Supply',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&q=80',
    lastMessage: 'Yes, we can offer a 15% discount if you order more than 100 units.',
    time: 'Yesterday',
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: 3,
    supplierName: 'Apex Machinery & Tools',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&q=80',
    lastMessage: 'Your order #UBS-00123 has been shipped via Global Express Logistics.',
    time: 'Oct 24',
    unreadCount: 0,
    isOnline: true,
  },
  {
    id: 4,
    supplierName: 'EcoPackaging Solutions',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80',
    lastMessage: 'Thank you for your business! Looking forward to our next deal.',
    time: 'Oct 20',
    unreadCount: 0,
    isOnline: false,
  },
]

export default function MessagesScreen() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Messages</Text>
        </View>
        <TouchableOpacity style={styles.headerRight}>
          <Text style={styles.menuIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Messages List */}
        {MOCK_MESSAGES.map((msg) => (
          <TouchableOpacity 
            key={msg.id} 
            style={styles.messageRow} 
            activeOpacity={0.7}
            onPress={() => {
              // Usually would navigate to a specific chat window: router.push(`/chat/${msg.id}`)
              alert(`Opening chat with ${msg.supplierName}`)
            }}
          >
            <View style={styles.avatarContainer}>
              <Image source={{ uri: msg.avatar }} style={styles.avatar} />
              {msg.isOnline && <View style={styles.onlineDot} />}
            </View>
            
            <View style={styles.messageContent}>
              <View style={styles.messageHeader}>
                <Text style={[styles.supplierName, msg.unreadCount > 0 && styles.supplierNameUnread]}>
                  {msg.supplierName}
                </Text>
                <Text style={[styles.timeText, msg.unreadCount > 0 && styles.timeTextUnread]}>
                  {msg.time}
                </Text>
              </View>
              <View style={styles.messageFooter}>
                <Text 
                  style={[styles.lastMessage, msg.unreadCount > 0 && styles.lastMessageUnread]} 
                  numberOfLines={1}
                >
                  {msg.lastMessage}
                </Text>
                {msg.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadCount}>{msg.unreadCount}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {MOCK_MESSAGES.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📨</Text>
            <Text style={styles.emptyStateTitle}>No Messages Yet</Text>
            <Text style={styles.emptyStateDesc}>When you contact sellers, your conversations will appear here.</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(buyer)/home')}>
          <Text style={styles.navIcon}>⌂</Text>
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(buyer)/messages')}>
          <Text style={styles.navIconActive}>✉</Text>
          <Text style={styles.navLabelActive}>Messages</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sellBtn} onPress={() => router.push('/(seller)/dashboard')}>
          <Text style={styles.sellIcon}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(buyer)/products')}>
          <Text style={styles.navIcon}>▦</Text>
          <Text style={styles.navLabel}>Products</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(buyer)/profile')}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // clean white background for messaging list
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    marginRight: 16,
    padding: 4,
  },
  backIcon: {
    fontSize: 22,
    color: '#000040',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000040',
  },
  headerRight: {
    padding: 4,
  },
  menuIcon: {
    fontSize: 18,
    color: '#000040',
  },

  // Search
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f6f8',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    fontSize: 16,
    color: '#888',
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
  },

  scrollContent: {
    paddingBottom: 100, // Space for bottom bar
  },

  // Message Rows
  messageRow: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#eaeaea',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 2,
    width: 14,
    height: 14,
    backgroundColor: '#4caf50',
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  supplierName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  supplierNameUnread: {
    fontWeight: '800',
    color: '#000040',
  },
  timeText: {
    fontSize: 12,
    color: '#999',
  },
  timeTextUnread: {
    color: '#008b8b', // Teal
    fontWeight: '700',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: 13,
    color: '#777',
    paddingRight: 10,
  },
  lastMessageUnread: {
    color: '#333',
    fontWeight: '600',
  },
  unreadBadge: {
    backgroundColor: '#008b8b',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadCount: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 30,
  },
  emptyStateIcon: {
    fontSize: 50,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000040',
    marginBottom: 8,
  },
  emptyStateDesc: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Bottom Nav
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: 8,
  },
  navItem: {
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  navIcon: {
    fontSize: 22,
    color: '#999',
  },
  navIconActive: {
    fontSize: 22,
    color: '#1a237e',
  },
  navLabel: {
    fontSize: 10,
    color: '#999',
  },
  navLabelActive: {
    fontSize: 10,
    color: '#1a237e',
    fontWeight: '600',
  },
  sellBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1a237e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#1a237e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  sellIcon: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
    marginTop: -2,
  },
})
