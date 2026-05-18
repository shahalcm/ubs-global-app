import React, { useEffect, useState, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { getMyRequests } from '../../services/contactService'
import { MaterialCommunityIcons } from '@expo/vector-icons'

const filters = ['All', 'Pending', 'Connected', 'Rejected']

export default function MyRequestsScreen() {
  const [requests, setRequests] = useState([])
  const [activeFilter, setActiveFilter] = useState('All')
  const [loading, setLoading] = useState(false)

  const loadRequests = async () => {
    setLoading(true)
    try {
      const res = await getMyRequests()
      setRequests(res.requests || [])
    } catch (error) {
      console.log('Load requests error', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  const filteredRequests = useMemo(() => {
    if (activeFilter === 'All') return requests
    return requests.filter((item) => {
      if (activeFilter === 'Pending') return item.status === 'pending'
      if (activeFilter === 'Connected') return item.status === 'connected'
      if (activeFilter === 'Rejected') return item.status === 'rejected'
      return true
    })
  }, [activeFilter, requests])

  const renderStatus = (status) => {
    if (status === 'pending') return { label: 'Under Review', color: '#f9a825', icon: 'clock-outline' }
    if (status === 'connected') return { label: 'Connected - Chat Now', color: '#2e7d32', icon: 'check-circle-outline' }
    if (status === 'rejected') return { label: 'Not Approved', color: '#d32f2f', icon: 'close-circle-outline' }
    return { label: status, color: '#1976d2', icon: 'information-outline' }
  }

  const renderItem = ({ item }) => {
    const status = renderStatus(item.status)
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Image source={{ uri: item.productImage || item.productId?.images?.[0] || 'https://via.placeholder.com/80' }} style={styles.productImage} />
          <View style={styles.cardInfo}>
            <Text style={styles.shopName}>{item.sellerShop}</Text>
            <Text style={styles.productName} numberOfLines={1}>{item.productName || item.productId?.title}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{item.requestType?.replace('_', ' ')}</Text>
              </View>
              {item.isUrgent && (
                <View style={styles.urgentBadge}>
                  <Text style={styles.urgentText}>URGENT</Text>
                </View>
              )}
              {item.isBulkOrder && (
                <View style={styles.bulkBadge}>
                  <Text style={styles.bulkText}>BULK ORDER</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.cardMeta}>
          <View style={styles.statusPill}>
            <MaterialCommunityIcons name={status.icon} size={16} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
          <Text style={styles.subText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>

        <View style={styles.messagePreviewRow}>
          <Text style={styles.messagePreview} numberOfLines={2}>{item.message}</Text>
        </View>

        <View style={styles.cardActions}>
          {item.status === 'connected' ? (
            <TouchableOpacity
              style={styles.openChatBtn}
              onPress={() => router.push({ pathname: '/(buyer)/chat', params: { roomId: item.chatRoomId || item.chatRoomId?._id } })}
            >
              <Text style={styles.openChatText}>Open Chat →</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1a237e" />
        </TouchableOpacity>
        <Text style={styles.title}>My Contact Requests</Text>
      </View>

      <View style={styles.filterRow}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>{filter}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredRequests}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadRequests} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>No contact requests found.</Text>}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fb' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  backButton: { marginRight: 14 },
  title: { fontSize: 22, fontWeight: '800', color: '#1a237e' },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10, marginBottom: 8 },
  filterChip: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: '#dfe3ee', marginRight: 10, marginBottom: 10 },
  filterChipActive: { backgroundColor: '#1a237e', borderColor: '#1a237e' },
  filterText: { color: '#4f5f8a' },
  filterTextActive: { color: '#fff', fontWeight: '700' },
  listContent: { paddingBottom: 24, paddingHorizontal: 16 },
  card: { backgroundColor: '#fff', borderRadius: 22, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  productImage: { width: 60, height: 60, borderRadius: 16, marginRight: 14, backgroundColor: '#e8eaf6' },
  cardInfo: { flex: 1 },
  shopName: { fontSize: 15, fontWeight: '700', color: '#1a237e', marginBottom: 4 },
  productName: { fontSize: 13, color: '#5f6370' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 6 },
  typeBadge: { backgroundColor: '#e8eaf6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  typeBadgeText: { color: '#1a237e', fontSize: 11, fontWeight: '700' },
  urgentBadge: { backgroundColor: '#ffebee', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  urgentText: { color: '#c62828', fontSize: 11, fontWeight: '700' },
  bulkBadge: { backgroundColor: '#e1f5fe', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  bulkText: { color: '#0288d1', fontSize: 11, fontWeight: '700' },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusText: { fontSize: 12, fontWeight: '700' },
  subText: { fontSize: 12, color: '#7a7f93' },
  messagePreviewRow: { marginTop: 10 },
  messagePreview: { fontSize: 13, color: '#52565f', lineHeight: 20 },
  cardActions: { marginTop: 14, flexDirection: 'row', justifyContent: 'flex-end' },
  openChatBtn: { backgroundColor: '#1a237e', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 16 },
  openChatText: { color: '#fff', fontWeight: '700' },
  emptyText: { textAlign: 'center', color: '#7a7f93', marginTop: 40, fontSize: 14 }
})
