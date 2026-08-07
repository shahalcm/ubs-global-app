import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  SafeAreaView
} from 'react-native'
import { Image } from 'expo-image'
import { useLocalSearchParams, router } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { trackOrder, updateOrderStatus } from '../../services/orderService'
import FormattedPrice from '../../components/common/FormattedPrice'
import { getProductImageUrl } from '../../utils/image'
import { colors } from '../../constants/colors'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function OrderDetailsScreen() {
  const insets = useSafeAreaInsets()
  const { orderId } = useLocalSearchParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails()
    } else {
      setLoading(false)
    }
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      const res = await trackOrder(orderId)
      if (res?.success && res.order) {
        setOrder(res.order)
      } else {
        Alert.alert('Error', 'Unable to retrieve order details.')
      }
    } catch (err) {
      console.log('Error fetching order details:', err)
      Alert.alert('Error', 'Network error fetching order details.')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true)
      const res = await updateOrderStatus(order._id, newStatus)
      if (res?.success) {
        Alert.alert('Success', `Order status updated to ${newStatus.toUpperCase()}`)
        fetchOrderDetails()
      } else {
        Alert.alert('Error', res?.message || 'Failed to update order status.')
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update status.')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#1a237e" />
        <Text style={{ marginTop: 12, color: '#64748b', fontWeight: 'bold' }}>Loading buyer & order details...</Text>
      </SafeAreaView>
    )
  }

  if (!order) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <MaterialCommunityIcons name="alert-circle-outline" size={56} color="#ef4444" />
        <Text style={{ marginTop: 14, fontSize: 18, fontWeight: 'bold', color: '#0f172a' }}>Order Not Found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/(seller)/seller-orders')}>
          <Text style={styles.backBtnText}>Back to Manage Orders</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  const buyer = order.deliveryAddress || {}
  const buyerUser = order.buyerId || {}

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(seller)/seller-orders')}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0f172a" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle}>Order #{order.orderNumber}</Text>
          <Text style={styles.headerSubtitle}>{new Date(order.createdAt).toLocaleString()}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: '#e0e7ff' }]}>
          <Text style={styles.statusBadgeText}>{order.orderStatus?.toUpperCase()}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* BUYER INFORMATION CARD */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <MaterialCommunityIcons name="account-details" size={22} color="#1a237e" />
            <Text style={styles.cardTitle}>Buyer Information</Text>
          </View>

          <View style={styles.buyerProfileRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{(buyer.fullName || buyerUser.name || 'C').charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.buyerNameText}>{buyer.fullName || buyerUser.name || 'Customer'}</Text>
              <Text style={styles.buyerSubText}>Buyer ID: #{String(buyerUser._id || order.buyerId).slice(-6)}</Text>
            </View>
          </View>

          {/* Quick Contact Buttons */}
          <View style={styles.contactRow}>
            {buyer.phone ? (
              <TouchableOpacity style={styles.contactBtn} onPress={() => Linking.openURL(`tel:${buyer.phone}`)}>
                <MaterialCommunityIcons name="phone" size={16} color="#16a34a" />
                <Text style={[styles.contactBtnText, { color: '#16a34a' }]}>{buyer.phone}</Text>
              </TouchableOpacity>
            ) : null}

            {(buyer.email || buyerUser.email) ? (
              <TouchableOpacity style={[styles.contactBtn, { backgroundColor: '#e0f2fe' }]} onPress={() => Linking.openURL(`mailto:${buyer.email || buyerUser.email}`)}>
                <MaterialCommunityIcons name="email-outline" size={16} color="#0284c7" />
                <Text style={[styles.contactBtnText, { color: '#0284c7' }]} numberOfLines={1}>{buyer.email || buyerUser.email}</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.divider} />

          {/* DELIVERY ADDRESS DETAILS */}
          <Text style={styles.subHeaderTitle}>Delivery Address</Text>
          <View style={styles.addressBox}>
            <MaterialCommunityIcons name="map-marker" size={18} color="#1a237e" style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.addressStreet}>{buyer.street || 'Address not specified'}</Text>
              <Text style={styles.addressRegion}>
                {buyer.city ? `${buyer.city}, ` : ''}{buyer.state ? `${buyer.state} ` : ''}{buyer.zipCode || ''}
              </Text>
              <Text style={styles.addressCountry}>{buyer.country || 'India'}</Text>

              {buyer.landmark ? (
                <View style={styles.landmarkChip}>
                  <Text style={styles.landmarkText}>Landmark: {buyer.landmark}</Text>
                </View>
              ) : null}

              {buyer.deliveryInstructions ? (
                <View style={[styles.landmarkChip, { backgroundColor: '#fef3c7' }]}>
                  <Text style={[styles.landmarkText, { color: '#92400e' }]}>Instructions: {buyer.deliveryInstructions}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {/* ORDERED ITEMS CARD */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <MaterialCommunityIcons name="package-variant-closed" size={22} color="#1a237e" />
            <Text style={styles.cardTitle}>Ordered Items ({order.items?.length || 0})</Text>
          </View>

          {order.items?.map((item, idx) => (
            <View key={item._id || idx} style={styles.itemCardRow}>
              <Image source={{ uri: getProductImageUrl(item.productImage) }} style={styles.itemThumb} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.itemTitle}>{item.productName}</Text>
                <Text style={styles.itemMeta}>Qty: {item.quantity} • SKU: {item.productSku || 'N/A'}</Text>
                <FormattedPrice amount={item.price || 0} style={styles.itemPriceText} />
              </View>
              <FormattedPrice amount={(item.price || 0) * (item.quantity || 1)} style={styles.itemTotalText} />
            </View>
          ))}

          <View style={styles.divider} />

          {/* Pricing Breakdown */}
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Items Subtotal</Text>
            <FormattedPrice amount={order.subtotal || 0} style={styles.priceValue} />
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Shipping Fee</Text>
            <FormattedPrice amount={order.shippingFee || 0} style={styles.priceValue} />
          </View>
          {order.tax > 0 ? (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tax</Text>
              <FormattedPrice amount={order.tax || 0} style={styles.priceValue} />
            </View>
          ) : null}

          <View style={[styles.priceRow, { marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#f1f5f9' }]}>
            <Text style={styles.grandTotalLabel}>Grand Total</Text>
            <FormattedPrice amount={order.grandTotal || 0} style={styles.grandTotalValue} />
          </View>
        </View>

        {/* SHIPMENT & TRACKING INFO CARD */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <MaterialCommunityIcons name="truck-fast" size={22} color="#1a237e" />
            <Text style={styles.cardTitle}>Shipment & Logistics</Text>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoGridItem}>
              <Text style={styles.infoGridLabel}>Courier Partner</Text>
              <Text style={styles.infoGridValue}>{order.courierName || 'Shiprocket Partner'}</Text>
            </View>
            <View style={styles.infoGridItem}>
              <Text style={styles.infoGridLabel}>AWB Code</Text>
              <Text style={styles.infoGridValue}>{order.awbCode || order.trackingNumber || 'Pending AWB'}</Text>
            </View>
          </View>

          {/* Document Download Buttons */}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
            {order.invoiceUrl ? (
              <TouchableOpacity style={[styles.docBtn, { backgroundColor: '#1a237e' }]} onPress={() => Linking.openURL(order.invoiceUrl)}>
                <MaterialCommunityIcons name="file-pdf-box" size={16} color="#fff" />
                <Text style={styles.docBtnText}>Invoice PDF</Text>
              </TouchableOpacity>
            ) : null}

            {order.labelUrl ? (
              <TouchableOpacity style={[styles.docBtn, { backgroundColor: '#008b8b' }]} onPress={() => Linking.openURL(order.labelUrl)}>
                <MaterialCommunityIcons name="barcode-scan" size={16} color="#fff" />
                <Text style={styles.docBtnText}>Label PDF</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* ORDER ACTIONS BAR */}
        <View style={styles.actionsCard}>
          <Text style={styles.cardTitle}>Order Management Status</Text>
          {updating ? (
            <ActivityIndicator size="small" color="#1a237e" style={{ marginVertical: 12 }} />
          ) : (
            <View style={styles.statusActionGrid}>
              {order.orderStatus === 'placed' ? (
                <TouchableOpacity style={[styles.statusBtn, { backgroundColor: '#1a237e' }]} onPress={() => handleStatusChange('confirmed')}>
                  <Text style={styles.statusBtnText}>Confirm Order</Text>
                </TouchableOpacity>
              ) : null}

              {order.orderStatus === 'confirmed' ? (
                <TouchableOpacity style={[styles.statusBtn, { backgroundColor: '#0284c7' }]} onPress={() => handleStatusChange('packed')}>
                  <Text style={styles.statusBtnText}>Mark Order Packed</Text>
                </TouchableOpacity>
              ) : null}

              {order.orderStatus === 'packed' ? (
                <TouchableOpacity style={[styles.statusBtn, { backgroundColor: '#7c4dff' }]} onPress={() => handleStatusChange('shipped')}>
                  <Text style={styles.statusBtnText}>Dispatch / Ship Order</Text>
                </TouchableOpacity>
              ) : null}

              {order.orderStatus === 'shipped' ? (
                <TouchableOpacity style={[styles.statusBtn, { backgroundColor: '#16a34a' }]} onPress={() => handleStatusChange('delivered')}>
                  <Text style={styles.statusBtnText}>Mark Delivered</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  headerSubtitle: { fontSize: 11, color: '#64748b', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusBadgeText: { fontSize: 11, fontWeight: '800', color: '#1a237e' },
  content: { padding: 16 },
  card: { backgroundColor: '#ffffff', borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0', elevation: 1 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#0f172a' },
  buyerProfileRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatarCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1a237e', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#ffffff', fontSize: 18, fontWeight: '800' },
  buyerNameText: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  buyerSubText: { fontSize: 12, color: '#64748b', marginTop: 2 },
  contactRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  contactBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f0fdf4', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  contactBtnText: { fontSize: 12, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 12 },
  subHeaderTitle: { fontSize: 12, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: 8 },
  addressBox: { flexDirection: 'row', gap: 10, backgroundColor: '#f8fafc', padding: 12, borderRadius: 12 },
  addressStreet: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  addressRegion: { fontSize: 12, color: '#475569', marginTop: 2 },
  addressCountry: { fontSize: 12, fontWeight: '700', color: '#1a237e', marginTop: 2 },
  landmarkChip: { backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 6, alignSelf: 'flex-start' },
  landmarkText: { fontSize: 11, fontWeight: '700', color: '#475569' },
  itemCardRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  itemThumb: { width: 48, height: 48, borderRadius: 10, backgroundColor: '#f1f5f9' },
  itemTitle: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  itemMeta: { fontSize: 11, color: '#64748b', marginTop: 2 },
  itemPriceText: { fontSize: 12, fontWeight: '700', color: '#475569', marginTop: 2 },
  itemTotalText: { fontSize: 13, fontWeight: '800', color: '#1a237e' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  priceLabel: { fontSize: 12, color: '#64748b' },
  priceValue: { fontSize: 12, fontWeight: '700', color: '#0f172a' },
  grandTotalLabel: { fontSize: 14, fontWeight: '800', color: '#0f172a' },
  grandTotalValue: { fontSize: 15, fontWeight: '800', color: '#1a237e' },
  infoGrid: { flexDirection: 'row', gap: 12, backgroundColor: '#f8fafc', padding: 12, borderRadius: 12 },
  infoGridItem: { flex: 1 },
  infoGridLabel: { fontSize: 10, fontWeight: '700', color: '#64748b', textTransform: 'uppercase' },
  infoGridValue: { fontSize: 13, fontWeight: '800', color: '#0f172a', marginTop: 2 },
  docBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 8 },
  docBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '800' },
  actionsCard: { backgroundColor: '#ffffff', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  statusActionGrid: { marginTop: 12 },
  statusBtn: { paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  statusBtnText: { color: '#ffffff', fontWeight: '800', fontSize: 14 },
  backBtn: { marginTop: 16, backgroundColor: '#1a237e', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  backBtnText: { color: '#ffffff', fontWeight: '800' }
})
