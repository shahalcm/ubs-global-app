import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Alert
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { getSellerOrders, updateOrderStatus } from '../../../services/orderService'
import { onOrderStatusChanged, removeListener } from '../../../services/socketService'
import { colors } from '../../../constants/colors'
import { getProductImageUrl } from '../../../utils/image'
import SellerHeader from '../../../components/seller/SellerHeader'
import { useTranslation } from 'react-i18next'

export default function SellerOrdersScreen() {
  const { t } = useTranslation()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedTab, setSelectedTab] = useState('all')
  const [updatingOrderId, setUpdatingOrderId] = useState(null)

  const tabs = ['all', 'placed', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled']

  const loadOrders = async (isSilent = false) => {
    if (!isSilent) {
      setLoading(true)
    }
    try {
      const res = await getSellerOrders()
      if (res.success) {
        setOrders(res.orders)
      }
    } catch (err) {
      console.log('Error loading seller orders:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadOrders()
    }, 0)

    onOrderStatusChanged(loadOrders)

    return () => {
      clearTimeout(timer)
      removeListener('orderStatusChanged')
    }
  }, [])

  const onRefresh = () => {
    setRefreshing(true)
    loadOrders(true)
  }

  const handleUpdateStatus = async (orderId, status) => {
    try {
      setUpdatingOrderId(orderId)
      await updateOrderStatus(orderId, status)
      await loadOrders(true)
    } catch (err) {
      console.log('Error updating order status:', err)
      Alert.alert('Error', 'Failed to update order status.')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case 'placed': return { bg: '#fff3e0', text: '#f57c00', label: t('NEW') }
      case 'confirmed': return { bg: '#e1f5fe', text: '#0288d1', label: t('CONFIRMED') }
      case 'packed': return { bg: '#efebe9', text: '#5d4037', label: t('PACKED') }
      case 'shipped': return { bg: '#f3e5f5', text: '#7b1fa2', label: t('SHIPPED') }
      case 'delivered': return { bg: '#e8f5e9', text: '#2e7d32', label: t('DELIVERED') }
      case 'cancelled': return { bg: '#ffebee', text: '#c62828', label: t('CANCELLED') }
      case 'returned': return { bg: '#eceff1', text: '#455a64', label: t('RETURNED') }
      default: return { bg: '#f5f5f5', text: '#666', label: t(status?.toUpperCase() || 'UNKNOWN') }
    }
  }

  const getTabLabel = (tab) => {
    switch (tab) {
      case 'all': return t('All')
      case 'placed': return t('New')
      case 'confirmed': return t('Confirmed')
      case 'packed': return t('Packed')
      case 'shipped': return t('Shipped')
      case 'delivered': return t('Delivered')
      case 'cancelled': return t('Cancelled')
      default: return t(tab.toUpperCase())
    }
  }

  const renderActionButtons = (order) => {
    const isUpdating = updatingOrderId === order._id

    if (isUpdating) {
      return <ActivityIndicator size="small" color={colors.primary} />
    }

    const currentStatus = order.orderStatus

    return (
      <View style={{ gap: 8, marginTop: 8 }}>
        <View style={styles.actionRow}>
          {currentStatus === 'placed' && (
            <>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#ffebee', borderWidth: 1, borderColor: colors.error, marginRight: 8 }]}
                onPress={() => handleUpdateStatus(order._id, 'cancelled')}
              >
                <Text style={[styles.actionBtnText, { color: colors.error }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                onPress={() => handleUpdateStatus(order._id, 'confirmed')}
              >
                <Text style={styles.actionBtnText}>Confirm</Text>
              </TouchableOpacity>
            </>
          )}

          {currentStatus === 'confirmed' && (
            <>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#ffebee', borderWidth: 1, borderColor: colors.error, marginRight: 8 }]}
                onPress={() => handleUpdateStatus(order._id, 'cancelled')}
              >
                <Text style={[styles.actionBtnText, { color: colors.error }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.accent }]}
                onPress={() => handleUpdateStatus(order._id, 'packed')}
              >
                <Text style={styles.actionBtnText}>Pack Order</Text>
              </TouchableOpacity>
            </>
          )}

          {currentStatus === 'packed' && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#651fff' }]}
              onPress={() => handleUpdateStatus(order._id, 'shipped')}
            >
              <Text style={styles.actionBtnText}>Ship Order</Text>
            </TouchableOpacity>
          )}

          {currentStatus === 'shipped' && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.success }]}
              onPress={() => handleUpdateStatus(order._id, 'delivered')}
            >
              <Text style={styles.actionBtnText}>Mark Delivered</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Shiprocket Quick Document Download Buttons */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
          {order.invoiceUrl ? (
            <TouchableOpacity
              style={{ backgroundColor: '#1a237e', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }}
              onPress={() => Linking.openURL(order.invoiceUrl)}
            >
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>📄 Invoice PDF</Text>
            </TouchableOpacity>
          ) : null}

          {order.labelUrl ? (
            <TouchableOpacity
              style={{ backgroundColor: '#008b8b', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }}
              onPress={() => Linking.openURL(order.labelUrl)}
            >
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>🏷️ Label PDF</Text>
            </TouchableOpacity>
          ) : null}

          {order.manifestUrl ? (
            <TouchableOpacity
              style={{ backgroundColor: '#ff8f00', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }}
              onPress={() => Linking.openURL(order.manifestUrl)}
            >
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>📋 Manifest PDF</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    )
  }

  const filteredOrders = orders.filter(o => selectedTab === 'all' || o.orderStatus === selectedTab)

  if (loading) {
    return (
      <View style={styles.container}>
        <SellerHeader title={t("Manage Orders")} />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t("Loading orders...")}</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(seller)/dashboard')}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("Manage Orders")}</Text>
        <TouchableOpacity onPress={() => loadOrders(false)}>
          <MaterialCommunityIcons name="refresh" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Horizontal Scrollable Tabs */}
      <View style={{ height: 60 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabScroll}
          contentContainerStyle={styles.tabContentContainer}
        >
          {tabs.map((tab) => {
            const isActive = selectedTab === tab
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabPill, isActive && styles.activeTabPill]}
                onPress={() => setSelectedTab(tab)}
              >
                <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
                  {getTabLabel(tab)}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>

      {/* Scrollable Orders List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={48} color="#b0bec5" />
            <Text style={styles.emptyText}>
              {t("No orders found")}
            </Text>
          </View>
        ) : (
          filteredOrders.map((order) => {
            const statusStyle = getStatusStyle(order.orderStatus)
            return (
              <View key={order._id} style={styles.card}>
                {/* Card Header */}
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.orderId}>#{order.orderNumber}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                      <Text style={[styles.statusText, { color: statusStyle.text }]}>
                        {statusStyle.label}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={{ backgroundColor: '#e0e7ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}
                    onPress={() => router.push(`/(seller)/order-details?orderId=${order._id}`)}
                  >
                    <MaterialCommunityIcons name="eye-outline" size={14} color="#1a237e" />
                    <Text style={{ color: '#1a237e', fontWeight: 'bold', fontSize: 12 }}>{t("View Details")}</Text>
                  </TouchableOpacity>
                </View>

                {/* Items List Checklist */}
                <View style={styles.itemsList}>
                  {order.items.map((item, idx) => (
                    <View key={idx} style={styles.itemRow}>
                      <Image
                        source={{ uri: getProductImageUrl(item.productImage) }}
                        style={styles.itemImage}
                        contentFit="cover"
                        transition={200}
                      />
                      <View style={styles.itemDetails}>
                        <Text style={styles.itemName} numberOfLines={1}>
                          {item.productName}
                        </Text>
                        <Text style={styles.itemQtyPrice}>
                          Qty: {item.quantity}  •  ${Number(item.price || 0).toFixed(2)} each
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Buyer & Delivery Box */}
                <View style={styles.buyerContainer}>
                  <View style={styles.buyerHeaderRow}>
                    <View style={styles.buyerHeaderLeft}>
                      <MaterialCommunityIcons name="account-circle-outline" size={16} color="#757575" style={{ marginRight: 6 }} />
                      <Text style={styles.buyerLabel}>Buyer & Delivery Details</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      {order.deliveryAddress?.email && (
                        <TouchableOpacity
                          style={[styles.callBtn, { backgroundColor: '#e3f2fd' }]}
                          onPress={() => Linking.openURL(`mailto:${order.deliveryAddress.email}`)}
                        >
                          <MaterialCommunityIcons name="email-outline" size={12} color="#0288d1" />
                          <Text style={[styles.callBtnText, { color: '#0288d1' }]}>Email</Text>
                        </TouchableOpacity>
                      )}
                      {order.deliveryAddress?.phone && (
                        <TouchableOpacity
                          style={styles.callBtn}
                          onPress={() => Linking.openURL(`tel:${order.deliveryAddress.phone}`)}
                        >
                          <MaterialCommunityIcons name="phone" size={12} color={colors.primary} />
                          <Text style={styles.callBtnText}>Call</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                  <View style={styles.buyerDetailsCard}>
                    <Text style={styles.buyerName}>{order.deliveryAddress?.fullName || order.buyerId?.name || 'Customer'}</Text>
                    
                    <View style={styles.buyerAddressRow}>
                      <MaterialCommunityIcons name="map-marker-outline" size={14} color={colors.primary} style={{ marginRight: 4, marginTop: 2 }} />
                      <Text style={styles.buyerAddress}>
                        {order.deliveryAddress?.street}{order.deliveryAddress?.city ? `, ${order.deliveryAddress.city}` : ''}{order.deliveryAddress?.state ? `, ${order.deliveryAddress.state}` : ''}{order.deliveryAddress?.zipCode ? ` - ${order.deliveryAddress.zipCode}` : ''}{order.deliveryAddress?.country ? `, ${order.deliveryAddress.country}` : ''}
                      </Text>
                    </View>

                    {/* Landmark / Delivery Instructions */}
                    {(order.deliveryAddress?.landmark || order.deliveryAddress?.deliveryInstructions) && (
                      <View style={styles.infoChipRow}>
                        <MaterialCommunityIcons name="compass-outline" size={13} color="#f57c00" />
                        <Text style={styles.infoChipText}>
                          Landmark/Gate: {order.deliveryAddress.landmark || order.deliveryAddress.deliveryInstructions}
                        </Text>
                      </View>
                    )}

                    {/* Customer Seller Note */}
                    {order.sellerNote && (
                      <View style={[styles.infoChipRow, { backgroundColor: '#fff8e1', borderColor: '#ffe082' }]}>
                        <MaterialCommunityIcons name="note-text-outline" size={13} color="#b78103" />
                        <Text style={[styles.infoChipText, { color: '#795548' }]}>
                          Note: {order.sellerNote}
                        </Text>
                      </View>
                    )}

                    {/* Shipping Method Badge */}
                    <View style={styles.shippingSpeedRow}>
                      <MaterialCommunityIcons
                        name={order.shippingSpeed === 'express' ? 'truck-fast-outline' : 'truck-delivery-outline'}
                        size={13}
                        color={order.shippingSpeed === 'express' ? '#d32f2f' : '#2e7d32'}
                      />
                      <Text style={[styles.shippingSpeedText, order.shippingSpeed === 'express' && { color: '#d32f2f', fontWeight: '700' }]}>
                        {order.shippingSpeed === 'express' ? 'Express Delivery (1-2 Days)' : 'Standard Delivery'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Footer Section */}
                <View style={styles.footer}>
                  <View style={styles.totalContainer}>
                    <Text style={styles.earningsLabel}>EARNINGS</Text>
                    <Text style={styles.totalText}>
                      ${Number(order.sellerEarnings || 0).toFixed(2)}
                    </Text>
                  </View>
                  {renderActionButtons(order)}
                </View>
              </View>
            )
          })
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f6f7fb' 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 14, 
    backgroundColor: '#ffffff', 
    borderBottomWidth: 1, 
    borderColor: '#f0f0f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: '#1a237e' 
  },
  tabScroll: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  tabContentContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#f1f3f9',
    borderWidth: 1,
    borderColor: '#e8edf6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTabPill: {
    backgroundColor: '#1a237e',
    borderColor: '#1a237e',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#616e7c',
  },
  activeTabLabel: {
    color: '#ffffff',
  },
  scrollContent: { 
    padding: 16,
    paddingBottom: 30,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#757575',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    marginTop: 20,
  },
  emptyText: { 
    textAlign: 'center', 
    color: '#757575', 
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  card: { 
    backgroundColor: '#ffffff', 
    padding: 16, 
    borderRadius: 16, 
    marginBottom: 16, 
    borderWidth: 1, 
    borderColor: '#e8eef8',
    elevation: 3,
    shadowColor: '#1a237e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 14,
    borderBottomWidth: 1,
    borderColor: '#f5f7fa',
    paddingBottom: 8,
  },
  orderId: { 
    fontSize: 14, 
    fontWeight: '800', 
    color: '#1a237e' 
  },
  statusBadge: { 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 6 
  },
  statusText: { 
    fontSize: 10, 
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  itemsList: { 
    marginBottom: 14, 
    borderBottomWidth: 1, 
    borderColor: '#f5f7fa', 
    paddingBottom: 10 
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  itemQtyPrice: {
    fontSize: 11,
    color: '#757575',
    fontWeight: '500',
  },
  buyerContainer: {
    backgroundColor: '#f8fafc', 
    padding: 12, 
    borderRadius: 12, 
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#f0f4f8',
  },
  buyerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  buyerHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buyerLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#757575',
    textTransform: 'uppercase',
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8eaf6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  callBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1a237e',
    marginLeft: 3,
  },
  buyerDetailsCard: {
    paddingLeft: 2,
  },
  buyerName: { 
    fontSize: 13.5, 
    fontWeight: '700', 
    color: '#1a1a1a', 
    marginBottom: 4 
  },
  buyerAddressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  buyerAddress: { 
    fontSize: 11.5, 
    color: '#616e7c',
    lineHeight: 16,
    flex: 1,
  },
  footer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginTop: 2,
  },
  totalContainer: {
    flexDirection: 'column',
  },
  earningsLabel: {
    fontSize: 10,
    color: '#757575',
    fontWeight: '600',
  },
  totalText: { 
    fontSize: 15, 
    fontWeight: '850', 
    color: '#008b8b' 
  },
  actionRow: {
    flexDirection: 'row',
  },
  actionBtn: { 
    backgroundColor: '#1a237e', 
    paddingHorizontal: 14, 
    paddingVertical: 8, 
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1a237e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  actionBtnText: { 
    color: '#ffffff', 
    fontSize: 11.5, 
    fontWeight: '800' 
  },
  infoChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    borderWidth: 1,
    borderColor: '#ffe0b2',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 6,
    gap: 6,
  },
  infoChipText: {
    fontSize: 11,
    color: '#e65100',
    fontWeight: '600',
    flex: 1,
  },
  shippingSpeedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  shippingSpeedText: {
    fontSize: 11,
    color: '#2e7d32',
    fontWeight: '600',
  }
})
