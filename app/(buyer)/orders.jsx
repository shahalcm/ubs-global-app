// app/(buyer)/orders.jsx
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { getMyOrders } from '../../services/orderService'
import { onOrderStatusChanged, removeListener } from '../../services/socketService'

export default function MyOrdersScreen() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  
  const tabs = ['All', 'Processing', 'In Progress', 'Delivered', 'Cancelled']
  
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
      const res = await getMyOrders()
      if (res.success) {
        setOrders(res.orders || [])
      }
    } catch (err) {
      console.log('Error loading orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const mapDbStatusToTabStatus = (dbStatus) => {
    switch(dbStatus) {
      case 'placed':
      case 'confirmed':
      case 'packed':
        return 'Processing'
      case 'shipped':
        return 'In Progress'
      case 'delivered':
        return 'Delivered'
      case 'cancelled':
      case 'returned':
        return 'Cancelled'
      default:
        return 'Processing'
    }
  }

  const getStatusDetails = (status) => {
    switch(status) {
      case 'placed': return { bg: '#e1f5fe', text: '#0288d1', label: 'Placed' }
      case 'confirmed': return { bg: '#e8f1ff', text: '#1a237e', label: 'Confirmed' }
      case 'packed': return { bg: '#fffde7', text: '#fbc02d', label: 'Packed' }
      case 'shipped': return { bg: '#e8f5e9', text: '#2e7d32', label: 'Shipped' }
      case 'delivered': return { bg: '#e8f5e9', text: '#2e7d32', label: 'Delivered' }
      case 'cancelled': return { bg: '#ffebee', text: '#c62828', label: 'Cancelled' }
      case 'returned': return { bg: '#eceff1', text: '#455a64', label: 'Returned' }
      default: return { bg: '#f5f5f5', text: '#666', label: status?.toUpperCase() || '' }
    }
  }

  const filteredOrders = activeTab === 'All' 
    ? orders 
    : orders.filter(o => mapDbStatusToTabStatus(o.orderStatus) === activeTab)

  const handleNavigateToDetails = (orderId) => {
    router.push({
      pathname: '/(buyer)/order-tracking',
      params: { orderId }
    })
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(buyer)/home')} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Orders</Text>
        </View>
        <TouchableOpacity style={styles.headerRight} onPress={loadOrders}>
          <MaterialCommunityIcons name="refresh" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {tabs.map((tab) => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Orders List */}
      {loading && orders.length === 0 ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#000040" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {filteredOrders.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="package-variant-closed" size={48} color="#ccc" />
              <Text style={styles.emptyTitle}>No Orders Found</Text>
              <Text style={styles.emptyDesc}>You have no orders in this category.</Text>
            </View>
          ) : (
            filteredOrders.map((order) => {
              const statusDetails = getStatusDetails(order.orderStatus)
              const firstItem = order.items?.[0]
              const totalItemsCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
              
              return (
                <View key={order._id} style={styles.orderCard}>
                  <View style={styles.orderHeader}>
                    <View>
                      <Text style={styles.orderId} numberOfLines={1}>Order #{order.orderNumber || order._id}</Text>
                      <Text style={styles.orderDate}>
                        {new Date(order.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusDetails.bg }]}>
                      <Text style={[styles.statusText, { color: statusDetails.text }]}>{statusDetails.label}</Text>
                    </View>
                  </View>

                  {/* Clicking the body routes to details/tracking screen */}
                  <TouchableOpacity 
                    style={styles.orderBody}
                    onPress={() => handleNavigateToDetails(order._id)}
                    activeOpacity={0.7}
                  >
                    <Image 
                      source={{ uri: firstItem?.productImage || 'https://via.placeholder.com/150' }} 
                      style={styles.orderImage} 
                    />
                    <View style={styles.orderInfo}>
                      <Text style={styles.orderTitle} numberOfLines={2}>
                        {firstItem?.productName || 'Order Item'}
                      </Text>
                      {order.items?.length > 1 && (
                        <Text style={styles.additionalItemsText}>
                          + {order.items.length - 1} other item{order.items.length - 1 > 1 ? 's' : ''}
                        </Text>
                      )}
                      <Text style={styles.orderMeta}>Total Items: {totalItemsCount}</Text>
                      <Text style={styles.orderTotal}>Total: ${Number(order.grandTotal || 0).toFixed(2)}</Text>
                    </View>
                  </TouchableOpacity>

                  <View style={styles.orderFooter}>
                    <TouchableOpacity 
                      style={styles.outlineBtn}
                      onPress={() => handleNavigateToDetails(order._id)}
                    >
                      <Text style={styles.outlineBtnText}>Details</Text>
                    </TouchableOpacity>
                    {(order.orderStatus === 'placed' || order.orderStatus === 'confirmed' || order.orderStatus === 'packed' || order.orderStatus === 'shipped') ? (
                      <TouchableOpacity 
                        style={styles.primaryBtn}
                        onPress={() => handleNavigateToDetails(order._id)}
                      >
                        <Text style={styles.primaryBtnText}>Track Order</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity 
                        style={styles.primaryBtn}
                        onPress={() => {
                          if (firstItem?.productId) {
                            router.push({
                              pathname: '/(buyer)/product-details',
                              params: { id: firstItem.productId }
                            })
                          }
                        }}
                      >
                        <Text style={styles.primaryBtnText}>Buy Again</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000040',
  },
  headerRight: {
    padding: 4,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  tabsScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  activeTab: {
    backgroundColor: '#000040',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },

  scrollContent: {
    padding: 16,
  },

  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eaeaea',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderId: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000040',
    marginBottom: 2,
    maxWidth: 200,
  },
  orderDate: {
    fontSize: 12,
    color: '#888',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },

  orderBody: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  orderImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginRight: 12,
  },
  orderInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  orderTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  additionalItemsText: {
    fontSize: 11,
    color: '#008b8b',
    fontWeight: '700',
    marginBottom: 4,
  },
  orderMeta: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#008b8b',
  },

  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  outlineBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#000040',
    alignItems: 'center',
  },
  outlineBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000040',
  },
  primaryBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#000040',
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },

  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000040',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#666',
  },
})
