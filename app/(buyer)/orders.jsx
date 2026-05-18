// app/(buyer)/orders.jsx
import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'

const MOCK_ORDERS = [
  {
    id: 'UBS-00123',
    date: 'Oct 24, 2023',
    total: '$299.00',
    status: 'In Progress',
    items: 1,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80',
    title: 'Elite Series Pro Headphones',
  },
  {
    id: 'UBS-00122',
    date: 'Oct 20, 2023',
    total: '$1,250.00',
    status: 'Delivered',
    items: 5,
    image: 'https://images.unsplash.com/photo-1509391366360-1e97b524c08b?w=200&q=80',
    title: 'High-Efficiency Bifacial 600W Solar Module',
  },
  {
    id: 'UBS-00119',
    date: 'Oct 15, 2023',
    total: '$4,150.00',
    status: 'Processing',
    items: 1,
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&q=80',
    title: 'Bulk Industrial Lathes',
  },
  {
    id: 'UBS-00110',
    date: 'Oct 05, 2023',
    total: '$85.00',
    status: 'Cancelled',
    items: 2,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80',
    title: 'Smart Watch Series 5',
  }
]

export default function MyOrdersScreen() {
  const [activeTab, setActiveTab] = useState('All')
  
  const tabs = ['All', 'Processing', 'In Progress', 'Delivered', 'Cancelled']
  
  const filteredOrders = activeTab === 'All' 
    ? MOCK_ORDERS 
    : MOCK_ORDERS.filter(o => o.status === activeTab)

  const getStatusColor = (status) => {
    switch(status) {
      case 'Delivered': return { bg: '#e8f5e9', text: '#2e7d32' }
      case 'In Progress': return { bg: '#e1f5fe', text: '#0288d1' }
      case 'Processing': return { bg: '#fff3e0', text: '#f57c00' }
      case 'Cancelled': return { bg: '#ffebee', text: '#c62828' }
      default: return { bg: '#f5f5f5', text: '#666' }
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Orders</Text>
        </View>
        <TouchableOpacity style={styles.headerRight}>
          <MaterialCommunityIcons name="magnify" size={24} color="#333" />
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="package-variant-closed" size={48} color="#ccc" />
            <Text style={styles.emptyTitle}>No Orders Found</Text>
            <Text style={styles.emptyDesc}>You have no orders in this category.</Text>
          </View>
        ) : (
          filteredOrders.map((order) => {
            const statusStyle = getStatusColor(order.status)
            return (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View>
                    <Text style={styles.orderId}>Order #{order.id}</Text>
                    <Text style={styles.orderDate}>{order.date}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.statusText, { color: statusStyle.text }]}>{order.status}</Text>
                  </View>
                </View>

                <View style={styles.orderBody}>
                  <Image source={{ uri: order.image }} style={styles.orderImage} />
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderTitle} numberOfLines={2}>{order.title}</Text>
                    <Text style={styles.orderMeta}>Items: {order.items}</Text>
                    <Text style={styles.orderTotal}>Total: {order.total}</Text>
                  </View>
                </View>

                <View style={styles.orderFooter}>
                  <TouchableOpacity style={styles.outlineBtn}>
                    <Text style={styles.outlineBtnText}>Details</Text>
                  </TouchableOpacity>
                  {(order.status === 'In Progress' || order.status === 'Processing') ? (
                    <TouchableOpacity 
                      style={styles.primaryBtn}
                      onPress={() => router.push('/(buyer)/order-tracking')}
                    >
                      <Text style={styles.primaryBtnText}>Track Order</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.primaryBtn}>
                      <Text style={styles.primaryBtnText}>Buy Again</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )
          })
        )}
      </ScrollView>
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
