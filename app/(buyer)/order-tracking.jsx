// app/(buyer)/order-tracking.jsx
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
  ActivityIndicator,
  Alert
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { trackOrder } from '../../services/orderService'

export default function OrderTrackingScreen() {
  const { orderId } = useLocalSearchParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderId) {
      loadOrder()
    }
  }, [orderId])

  const loadOrder = async () => {
    try {
      setLoading(true)
      const res = await trackOrder(orderId)
      if (res.success) {
        setOrder(res.order)
      }
    } catch (err) {
      console.log('Error tracking order:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStepState = (stepName) => {
    if (!order) return 'pending';
    const statusOrder = ['placed', 'confirmed', 'packed', 'shipped', 'delivered'];
    const currentIdx = statusOrder.indexOf(order.orderStatus);
    const stepIdx = statusOrder.indexOf(stepName);

    if (currentIdx >= stepIdx) {
      return 'completed';
    } else if (currentIdx + 1 === stepIdx) {
      return 'current';
    } else {
      return 'pending';
    }
  }

  const getTimelineTime = (status) => {
    if (!order || !order.timeline) return '';
    const event = order.timeline.find(t => t.status === status);
    if (!event) return '';
    return new Date(event.timestamp).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  const handleCopyTrackingNumber = () => {
    if (order?.trackingNumber) {
      Alert.alert('Copied', `Tracking number ${order.trackingNumber} copied to clipboard!`)
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#1a237e" />
        <Text style={{ marginTop: 12, color: '#666' }}>Loading order tracking...</Text>
      </SafeAreaView>
    )
  }

  if (!order) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#ff4444" />
        <Text style={{ marginTop: 12, fontSize: 16, fontWeight: 'bold', color: '#333' }}>Order Not Found</Text>
        <TouchableOpacity 
          style={{ marginTop: 20, backgroundColor: '#1a237e', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }} 
          onPress={() => router.replace('/(buyer)/home')}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Back to Home</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  const renderStep = (stepName, stepNum, titleText, iconName, defaultNote) => {
    const state = getStepState(stepName)
    const timeText = getTimelineTime(stepName)

    let circleStyle = styles.circleGray
    let lineStyle = styles.lineGray
    let titleStyle = styles.stepTitleGray
    let nameStyle = styles.stepNameGray
    let iconElement = <Text style={styles.boxIcon}>○</Text>

    if (state === 'completed') {
      circleStyle = styles.circleGreen
      lineStyle = styles.lineGreen
      titleStyle = styles.stepTitleGreen
      nameStyle = styles.stepName
      iconElement = <MaterialCommunityIcons name="check" size={16} color="#4caf50" />
    } else if (state === 'current') {
      circleStyle = styles.circleBlue
      lineStyle = styles.lineGray
      titleStyle = styles.stepTitleBlue
      nameStyle = styles.stepName
      iconElement = <MaterialCommunityIcons name={iconName} size={16} color="#008b8b" />
    }

    if (state === 'completed' && stepName === 'delivered') {
      iconElement = <Text style={styles.boxIcon}>📦</Text>
    }

    return (
      <View style={styles.timelineRow}>
        <View style={styles.timelineIconCol}>
          <View style={[styles.circle, circleStyle]}>
            {iconElement}
          </View>
          {stepNum < 5 && <View style={[styles.line, lineStyle, state === 'current' && { borderStyle: 'dashed' }]} />}
        </View>
        <View style={styles.timelineContent}>
          <Text style={titleStyle}>{state === 'completed' ? `Step 0${stepNum}` : state === 'current' ? 'In Progress' : 'Pending'}</Text>
          <Text style={nameStyle}>{titleText}</Text>
          {state === 'completed' && timeText ? (
            <Text style={styles.stepTime}>{timeText}</Text>
          ) : state === 'current' && defaultNote ? (
            <Text style={styles.stepNameBold}>{defaultNote}</Text>
          ) : !timeText && stepName === 'delivered' && order?.estimatedDelivery ? (
            <Text style={styles.stepTime}>Expected by {new Date(order.estimatedDelivery).toLocaleDateString()}</Text>
          ) : null}
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Track Order</Text>
            <Text style={styles.headerSubtitle}>{order.orderNumber}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.headerRight}>
          <MaterialCommunityIcons name="bell" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Map Header Card */}
        <View style={styles.mapCard}>
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1518242007632-15998a698188?w=800&q=80' }}
            style={styles.mapImage}
            imageStyle={{ borderRadius: 12 }}
          >
            <View style={styles.mapOverlay}>
              <View style={styles.etaBox}>
                <Text style={styles.etaLabel}>ESTIMATED{'\n'}ARRIVAL</Text>
                <Text style={styles.etaTime}>
                  {order.estimatedDelivery 
                    ? new Date(order.estimatedDelivery).toLocaleDateString()
                    : 'Expected Soon'}
                </Text>
              </View>
              <TouchableOpacity style={styles.liveTrackBtn} activeOpacity={0.8}>
                <MaterialCommunityIcons name="crosshairs-gps" size={20} color="#fff" />
                <Text style={styles.liveTrackText}>Live{'\n'}Track</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>

        {/* Delivery Progress */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery Progress</Text>
          
          <View style={styles.timeline}>
            {renderStep('placed', 1, 'Order Placed', 'check', 'Order created')}
            {renderStep('confirmed', 2, 'Order Confirmed', 'check-all', 'Order confirmed by seller')}
            {renderStep('packed', 3, 'Packed & Ready', 'package-variant', 'Your order is being packed')}
            {renderStep('shipped', 4, 'Out for Delivery', 'truck', 'Your order is on the way')}
            {renderStep('delivered', 5, 'Delivered', 'check-circle', 'Expected soon')}
          </View>
        </View>

        {/* Courier Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Courier Information</Text>
          <View style={styles.courierRow}>
            <View style={styles.courierLogoWrapper}>
              <Text style={styles.courierLogoText}>❖</Text>
            </View>
            <View style={styles.courierInfo}>
              <Text style={styles.courierName}>{order.courierName || 'Global Express Logistics'}</Text>
              <Text style={styles.courierId}>ID: {order.trackingNumber ? `Courier_${order.trackingNumber.substring(0, 5)}` : 'Courier_Pending'}</Text>
            </View>
          </View>

          <View style={styles.trackingBox}>
            <View>
              <Text style={styles.trackingLabel}>TRACKING NUMBER</Text>
              <Text style={styles.trackingNumber}>{order.trackingNumber || 'Pending Assignment'}</Text>
            </View>
            {order.trackingNumber && (
              <TouchableOpacity style={styles.copyBtn} onPress={handleCopyTrackingNumber}>
                <MaterialCommunityIcons name="content-copy" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <MaterialCommunityIcons name="map-marker" size={20} color="#666" />
            <Text style={styles.cardTitleLine}>Delivery Address</Text>
          </View>
          <View style={styles.addressBox}>
            <Text style={styles.addressName}>{order.deliveryAddress?.fullName}</Text>
            <Text style={styles.addressText}>{order.deliveryAddress?.street}</Text>
            <Text style={styles.addressText}>
              {order.deliveryAddress?.city}, {order.deliveryAddress?.state || ''} {order.deliveryAddress?.zipCode || ''}
            </Text>
            <Text style={styles.addressText}>{order.deliveryAddress?.country}</Text>
            {order.deliveryAddress?.phone && (
              <Text style={styles.addressPhone}>{order.deliveryAddress.phone}</Text>
            )}
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Summary</Text>
          {order.items?.map((item, idx) => (
            <View key={item._id || idx} style={[styles.productRow, idx > 0 && { marginTop: 12 }]}>
              <Image
                source={{ uri: item.productImage || 'https://via.placeholder.com/150' }}
                style={styles.productImg}
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.productName}</Text>
                <Text style={styles.productMeta}>Qty: {item.quantity}</Text>
                <Text style={styles.productPrice}>${(item.price || 0).toFixed(2)}</Text>
              </View>
            </View>
          ))}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${(order.subtotal || 0).toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={order.shippingFee === 0 ? styles.summaryValueGreen : styles.summaryValue}>
              {order.shippingFee === 0 ? 'Free' : `$${(order.shippingFee || 0).toFixed(2)}`}
            </Text>
          </View>
          {order.tax > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax (5%)</Text>
              <Text style={styles.summaryValue}>${(order.tax || 0).toFixed(2)}</Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>${(order.grandTotal || 0).toFixed(2)}</Text>
          </View>
        </View>

      </ScrollView>

      {/* Bottom Fixed Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.helpBtn}>
          <MaterialCommunityIcons name="help-circle" size={20} color="#666" />
          <Text style={styles.helpText}>Need{'\n'}Help?</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.contactBtn} onPress={() => router.push('/(buyer)/messages')}>
          <MaterialCommunityIcons name="message-text" size={20} color="#fff" />
          <Text style={styles.contactText}>Contact Seller</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fbfbfe',
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
    fontSize: 16,
    fontWeight: '800',
    color: '#000040',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  headerRight: {
    padding: 4,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 100, // Space for bottom bar
  },

  // Map Card
  mapCard: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    flex: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  etaBox: {
    backgroundColor: 'rgba(240, 245, 250, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  etaLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#000040',
    marginBottom: 4,
  },
  etaTime: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000040',
  },
  liveTrackBtn: {
    backgroundColor: '#000051',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  liveTrackText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },

  // Cards
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eaeaea',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000040',
    marginBottom: 20,
  },

  // Timeline
  timeline: {
    paddingLeft: 8,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timelineIconCol: {
    alignItems: 'center',
    width: 24,
    marginRight: 16,
    position: 'relative',
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  circleGreen: {
    backgroundColor: '#e8f5e9',
  },
  circleBlue: {
    backgroundColor: '#e1f5fe',
  },
  circleGray: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  
  line: {
    width: 2,
    flex: 1,
    position: 'absolute',
    top: 24,
    bottom: -24,
    zIndex: 1,
  },
  lineGreen: {
    backgroundColor: '#c8e6c9',
  },
  lineGray: {
    backgroundColor: '#eeeeee',
  },

  timelineContent: {
    flex: 1,
    paddingTop: 2,
  },
  stepTitleGreen: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4caf50',
    marginBottom: 2,
  },
  stepTitleBlue: {
    fontSize: 10,
    fontWeight: '700',
    color: '#008b8b', // Teal
    marginBottom: 2,
  },
  stepTitleGray: {
    fontSize: 10,
    fontWeight: '700',
    color: '#888',
    marginBottom: 2,
  },
  
  stepName: {
    fontSize: 13,
    color: '#333',
    marginBottom: 4,
  },
  stepNameBold: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000040',
    marginTop: 2,
  },
  stepNameGray: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
  },
  stepTime: {
    fontSize: 11,
    color: '#888',
  },

  // Courier
  courierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  courierLogoWrapper: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  courierLogoText: {
    fontSize: 20,
    color: '#0288d1',
  },
  courierInfo: {
    flex: 1,
  },
  courierName: {
    fontSize: 12,
    color: '#333',
    marginBottom: 2,
  },
  courierId: {
    fontSize: 11,
    color: '#666',
  },
  trackingBox: {
    backgroundColor: '#e1f5fe',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
  },
  trackingLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#008b8b',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  trackingNumber: {
    fontSize: 14,
    color: '#000040',
  },
  copyBtn: {
    padding: 4,
  },

  // Address
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitleLine: {
    fontSize: 12,
    color: '#000040',
  },
  addressBox: {
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 8,
    padding: 16,
  },
  addressName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#212121',
    marginBottom: 6,
  },
  addressText: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 12,
    color: '#555',
    marginTop: 6,
  },

  // Order Summary
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  productImg: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#000',
    marginRight: 16,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 12,
    color: '#333',
    marginBottom: 4,
  },
  productMeta: {
    fontSize: 11,
    color: '#666',
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#008b8b',
  },
  
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#555',
  },
  summaryValue: {
    fontSize: 12,
    color: '#333',
  },
  summaryValueGreen: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4caf50',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000040',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000040',
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eaeaea',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  helpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
    gap: 8,
  },
  helpText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#008b8b',
  },
  contactBtn: {
    flex: 1,
    backgroundColor: '#000040',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  contactText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
})
