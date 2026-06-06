// app/(buyer)/messages.jsx
import React, { useState, useEffect } from 'react'
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
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { getChatRooms } from '../../../services/messageService'
import { getSellerImageUrl } from '../../../utils/image'

export default function MessagesScreen() {
  const [searchQuery, setSearchQuery] = useState('')
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(false)

  const loadRooms = async () => {
    setLoading(true)
    try {
      const res = await getChatRooms()
      setRooms(res.rooms || [])
    } catch (error) {
      console.log('Load chat rooms error', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRooms()
  }, [])

  const filteredRooms = rooms.filter((room) => {
    const text = searchQuery.trim().toLowerCase()
    if (!text) return true
    const sellerName = room.sellerId?.shopName || room.sellerId?.name || room.sellerName || ''
    const productName = room.productId?.title || room.productName || room.meta?.propertyTitle || ''
    return sellerName.toLowerCase().includes(text) || productName.toLowerCase().includes(text)
  })

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(buyer)/home')} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Messages</Text>
        </View>
        <TouchableOpacity style={styles.headerRight} onPress={() => router.push('/(buyer)/help')}>
          <MaterialCommunityIcons name="headset" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <MaterialCommunityIcons name="magnify" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 90 }]}
      >
        {filteredRooms.length > 0 ? (
          filteredRooms.map((room) => {
            const sellerName = room.sellerId?.shopName || room.sellerId?.name || room.sellerName || 'Seller'
            const productName = room.productId?.title || room.productName || room.meta?.propertyTitle || 'Product'
            const lastMessage = room.lastMessage?.text || room.lastMessage || 'Tap to continue the conversation.'
            const timeLabel = room.lastMessage?.createdAt
              ? new Date(room.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : room.updatedAt
                ? new Date(room.updatedAt).toLocaleDateString()
                : ''
            const unreadCount = room.unreadCount || 0

            return (
              <TouchableOpacity
                key={room._id}
                style={styles.messageRow}
                activeOpacity={0.8}
                onPress={() => router.push({ pathname: '/(buyer)/chat', params: { roomId: room._id } })}
              >
                <View style={styles.avatarContainer}>
                  {(room.sellerId?.avatar || room.sellerId?.shopLogo || room.meta?.propertyImage) ? (
                    <Image
                      source={{ uri: getSellerImageUrl(room.sellerId?.avatar || room.sellerId?.shopLogo || room.meta?.propertyImage) }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={styles.avatarFallback}>
                      <Text style={styles.avatarFallbackText}>
                        {sellerName ? sellerName.trim().charAt(0).toUpperCase() : '?'}
                      </Text>
                    </View>
                  )}
                  <View style={styles.onlineDot} />
                </View>
                <View style={styles.messageContent}>
                  <View style={styles.messageHeader}>
                    <Text style={[styles.supplierName, unreadCount > 0 && styles.supplierNameUnread]} numberOfLines={1}>
                      {sellerName}
                    </Text>
                    <Text style={[styles.timeText, unreadCount > 0 && styles.timeTextUnread]}>{timeLabel}</Text>
                  </View>
                  <Text style={styles.productName} numberOfLines={1}>{productName}</Text>
                  <View style={styles.messageFooter}>
                    <Text style={[styles.lastMessage, unreadCount > 0 && styles.lastMessageUnread]} numberOfLines={1}>
                      {lastMessage}
                    </Text>
                    {unreadCount > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadCount}>{unreadCount}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            )
          })
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📨</Text>
            <Text style={styles.emptyStateTitle}>{loading ? 'Loading chats...' : 'No active conversations yet'}</Text>
            <Text style={styles.emptyStateDesc}>When your contact request is connected, chats will appear here.</Text>
          </View>
        )}
      </ScrollView>



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
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000040',
  },
  headerRight: {
    padding: 4,
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
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00838f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
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
  productName: {
    fontSize: 13,
    color: '#5f6370',
    marginBottom: 6,
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


})
