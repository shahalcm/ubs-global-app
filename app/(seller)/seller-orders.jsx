import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { getSellerOrders, updateOrderStatus } from '../../services/orderService'
import { onOrderStatusChanged, removeListener } from '../../services/socketService'

export default function SellerOrdersScreen() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrders()
    
    // Listen for order status updates dynamically
    onOrderStatusChanged(loadOrders)
    
    return () => {
      removeListener('orderStatusChanged')
    }
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const res = await getSellerOrders()
      if (res.success) setOrders(res.orders)
    } catch(err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status)
      loadOrders()
    } catch(err) {
      console.log(err)
    }
  }

  const getStatusStyle = (status) => {
    switch(status) {
      case 'placed': return { bg: '#fff3e0', text: '#f57c00' }
      case 'confirmed': return { bg: '#e1f5fe', text: '#0288d1' }
      case 'packed': return { bg: '#fffde7', text: '#fbc02d' }
      case 'shipped': return { bg: '#e8f5e9', text: '#2e7d32' }
      case 'delivered': return { bg: '#e8f5e9', text: '#2e7d32' }
      case 'cancelled': return { bg: '#ffebee', text: '#c62828' }
      case 'returned': return { bg: '#eceff1', text: '#455a64' }
      default: return { bg: '#f5f5f5', text: '#666' }
    }
  }

  if (loading) {
    return <SafeAreaView style={styles.container}><ActivityIndicator style={{marginTop:50}} size="large" /></SafeAreaView>
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><MaterialCommunityIcons name="arrow-left" size={24} color="#333" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Orders</Text>
        <TouchableOpacity onPress={loadOrders}><MaterialCommunityIcons name="refresh" size={24} color="#333" /></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {orders.length === 0 ? (
          <Text style={styles.emptyText}>No orders yet.</Text>
        ) : orders.map((order) => {
          const statusStyle = getStatusStyle(order.orderStatus)
          return (
            <View key={order._id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.orderId}>#{order.orderNumber}</Text>
                <View style={[styles.statusBadge, {backgroundColor: statusStyle.bg}]}>
                  <Text style={[styles.statusText, {color: statusStyle.text}]}>
                    {order.orderStatus.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.buyerInfo}>
                <Text style={styles.buyerName}>Buyer: {order.buyerId?.name}</Text>
                <Text style={styles.buyerContact}>{order.deliveryAddress?.phone} | {order.deliveryAddress?.city}, {order.deliveryAddress?.country}</Text>
              </View>

              <View style={styles.itemsList}>
                {order.items.map((item, idx) => (
                  <Text key={idx} style={styles.itemText}>{item.quantity}x {item.productName}</Text>
                ))}
              </View>

              <View style={styles.footer}>
                <Text style={styles.totalText}>Earnings: ${order.sellerEarnings}</Text>
                {order.orderStatus === 'placed' && (
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleUpdateStatus(order._id, 'shipped')}>
                    <Text style={styles.actionBtnText}>Mark as Shipped</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )
        })}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6f8' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eaeaea' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#000040' },
  scrollContent: { padding: 16 },
  emptyText: { textAlign: 'center', color: '#666', marginTop: 40 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#eaeaea' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  orderId: { fontSize: 14, fontWeight: '700', color: '#1a237e' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  buyerInfo: { backgroundColor: '#f9f9f9', padding: 10, borderRadius: 8, marginBottom: 12 },
  buyerName: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 4 },
  buyerContact: { fontSize: 11, color: '#666' },
  itemsList: { marginBottom: 12, borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 12 },
  itemText: { fontSize: 12, color: '#444', marginBottom: 4 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalText: { fontSize: 14, fontWeight: '800', color: '#008b8b' },
  actionBtn: { backgroundColor: '#000040', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  actionBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' }
})
