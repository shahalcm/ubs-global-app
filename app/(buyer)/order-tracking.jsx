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
  Alert,
  Modal,
  TextInput,
  Linking
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { trackOrder, cancelOrder } from '../../services/orderService'
import { downloadOrderInvoice, downloadShippingLabel } from '../../services/shipmentService'

export default function OrderTrackingScreen() {
  const { orderId } = useLocalSearchParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    let isMounted = true
    if (orderId) {
      loadOrder()
    } else {
      setLoading(false)
      setError('Order ID is missing in navigation params')
    }
    return () => { isMounted = false }
  }, [orderId])

  const loadOrder = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await Promise.race([
        trackOrder(orderId),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Network request timed out')), 8000))
      ])

      if (res && res.success && res.order) {
        setOrder(res.order)
      } else {
        setError(res?.message || 'Unable to retrieve order tracking information.')
      }
    } catch (err) {
      console.log('Error tracking order:', err)
      setError(err.message || 'Network failure while fetching tracking details.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubmit = async () => {
    if (!cancelReason || cancelReason.trim().length < 5) {
      Alert.alert('Error', 'Please enter a valid reason (at least 5 characters).')
      return
    }

    try {
      setCancelling(true)
      const res = await cancelOrder(orderId, cancelReason.trim())
      if (res.success) {
        Alert.alert('Cancelled', 'Your order has been cancelled successfully.')
        setIsCancelModalVisible(false)
        setCancelReason('')
        loadOrder()
      } else {
        Alert.alert('Error', res.message || 'Failed to cancel order.')
      }
    } catch (err) {
      console.log('Error cancelling order:', err)
      Alert.alert('Error', 'An unexpected error occurred.')
    } finally {
      setCancelling(false)
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
    if (order?.trackingNumber || order?.awbCode) {
      Alert.alert('Copied', `Tracking number ${order.trackingNumber || order.awbCode} copied to clipboard!`)
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#1a237e" />
        <Text style={{ marginTop: 12, color: '#666', fontWeight: 'bold' }}>Loading shipment & tracking details...</Text>
      </SafeAreaView>
    )
  }

  if (error || !order) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <MaterialCommunityIcons name="alert-circle-outline" size={56} color="#ff4444" />
        <Text style={{ marginTop: 14, fontSize: 18, fontWeight: 'bold', color: '#333' }}>
          {error ? 'Unable to Load Tracking' : 'Order Not Found'}
        </Text>
        <Text style={{ marginTop: 8, fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 }}>
          {error || 'The requested order details could not be found or fetched.'}
        </Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity 
            style={{ backgroundColor: '#1a237e', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 }} 
            onPress={loadOrder}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={{ backgroundColor: '#f0f0f0', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 }} 
            onPress={() => router.replace('/(buyer)/orders')}
          >
            <Text style={{ color: '#333', fontWeight: 'bold' }}>My Orders</Text>
          </TouchableOpacity>
        </View>
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
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(buyer)/orders')} style={styles.backBtn}>
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
                <Text style={styles.etaLabel}>{order.orderStatus === 'cancelled' ? 'STATUS' : 'ESTIMATED\nARRIVAL'}</Text>
                <Text style={styles.etaTime}>
                  {order.orderStatus === 'cancelled' 
                    ? 'CANCELLED' 
                    : order.estimatedDelivery 
                      ? new Date(order.estimatedDelivery).toLocaleDateString()
                      : 'Expected Soon'}
                </Text>
              </View>
              {order.orderStatus !== 'cancelled' && (
                <TouchableOpacity style={styles.liveTrackBtn} activeOpacity={0.8}>
                  <MaterialCommunityIcons name="crosshairs-gps" size={20} color="#fff" />
                  <Text style={styles.liveTrackText}>Live{'\n'}Track</Text>
                </TouchableOpacity>
              )}
            </View>
          </ImageBackground>
        </View>

        {/* Pending Pickup Notice */}
        {!order.awbCode && !order.trackingNumber && order.orderStatus !== 'cancelled' && (
          <View style={{ backgroundColor: '#e3f2fd', padding: 14, borderRadius: 12, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#1976d2', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <MaterialCommunityIcons name="information" size={24} color="#1976d2" />
            <Text style={{ color: '#0d47a1', fontSize: 13, fontWeight: 'bold', flex: 1 }}>
              Tracking will be available once your shipment is picked up.
            </Text>
          </View>
        )}

        {/* Cancellation Info Banner */}
        {order.orderStatus === 'cancelled' && (
          <View style={styles.cancelledBanner}>
            <View style={styles.cancelledHeader}>
              <MaterialCommunityIcons name="close-circle" size={32} color="#c62828" />
              <View style={styles.cancelledTextContainer}>
                <Text style={styles.cancelledTitle}>Order Cancelled</Text>
                <Text style={styles.cancelledTime}>
                  {getTimelineTime('cancelled') || new Date(order.updatedAt).toLocaleString()}
                </Text>
              </View>
            </View>
            <View style={styles.cancelledBody}>
              <Text style={styles.cancelledLabel}>Reason for Cancellation:</Text>
              <Text style={styles.cancelledReason}>
                "{order.timeline?.find(t => t.status === 'cancelled')?.note || 'No reason provided.'}"
              </Text>
            </View>
          </View>
        )}

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
              <Text style={styles.trackingNumber}>{order.trackingNumber || order.awbCode || 'Pending Assignment'}</Text>
            </View>
            {(order.trackingNumber || order.awbCode) && (
              <TouchableOpacity style={styles.copyBtn} onPress={handleCopyTrackingNumber}>
                <MaterialCommunityIcons name="content-copy" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>

          {/* Shiprocket Documents: Invoice & Label */}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#1a237e',
                paddingVertical: 10,
                borderRadius: 8,
                gap: 6
              }}
              onPress={async () => {
                if (order.invoiceUrl) {
                  Linking.openURL(order.invoiceUrl)
                } else {
                  try {
                    const res = await downloadOrderInvoice(order._id)
                    if (res && res.invoiceUrl) {
                      Linking.openURL(res.invoiceUrl)
                    }
                  } catch (e) {
                    console.log('Invoice download error:', e)
                  }
                }
              }}
            >
              <MaterialCommunityIcons name="file-pdf-box" size={18} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>Download Invoice</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#008b8b',
                paddingVertical: 10,
                borderRadius: 8,
                gap: 6
              }}
              onPress={async () => {
                if (order.labelUrl) {
                  Linking.openURL(order.labelUrl)
                } else {
                  try {
                    const res = await downloadShippingLabel(order._id)
                    if (res && res.labelUrl) {
                      Linking.openURL(res.labelUrl)
                    }
                  } catch (e) {
                    console.log('Label download error:', e)
                  }
                }
              }}
            >
              <MaterialCommunityIcons name="barcode-scan" size={18} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>Shipping Label</Text>
            </TouchableOpacity>
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
                <Text style={styles.productPrice}>${Number(item.price || 0).toFixed(2)}</Text>
              </View>
            </View>
          ))}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${Number(order.subtotal || 0).toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={order.shippingFee === 0 ? styles.summaryValueGreen : styles.summaryValue}>
              {order.shippingFee === 0 ? 'Free' : `$${Number(order.shippingFee || 0).toFixed(2)}`}
            </Text>
          </View>
          {order.tax > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax (5%)</Text>
              <Text style={styles.summaryValue}>${Number(order.tax || 0).toFixed(2)}</Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>${Number(order.grandTotal || 0).toFixed(2)}</Text>
          </View>
        </View>

        {/* Cancel Order Card */}
        {['placed', 'confirmed', 'packed'].includes(order.orderStatus) && (
          <View style={styles.cancelCard}>
            <Text style={styles.cancelCardTitle}>Order Actions</Text>
            <Text style={styles.cancelCardDesc}>
              Changed your mind? You can cancel this order before it is shipped.
            </Text>
            <TouchableOpacity 
              style={styles.cancelOrderBtn}
              onPress={() => setIsCancelModalVisible(true)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="close-circle-outline" size={20} color="#fff" />
              <Text style={styles.cancelOrderBtnText}>Cancel Order</Text>
            </TouchableOpacity>
          </View>
        )}

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

      {/* Cancellation Reason Modal */}
      <Modal
        visible={isCancelModalVisible}
        transparent={true}
        animationType="slide"
        statusBarTranslucent={true}
        onRequestClose={() => setIsCancelModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cancel Order</Text>
              <TouchableOpacity onPress={() => {
                setIsCancelModalVisible(false)
                setCancelReason('')
              }}>
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              <Text style={styles.modalInstruction}>
                Please state your reason for cancelling this order. Your cancellation will update the stock levels and notify the seller/admin immediately.
              </Text>
              
              <TextInput
                style={styles.reasonInput}
                placeholder="Reason (minimum 5 characters)..."
                placeholderTextColor="#999"
                value={cancelReason}
                onChangeText={setCancelReason}
                multiline={true}
                numberOfLines={4}
                maxLength={250}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.modalCancelBtn} 
                onPress={() => {
                  setIsCancelModalVisible(false)
                  setCancelReason('')
                }}
                disabled={cancelling}
              >
                <Text style={styles.modalCancelBtnText}>Go Back</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.modalSubmitBtn, 
                  (!cancelReason || cancelReason.trim().length < 5) && styles.modalSubmitBtnDisabled
                ]} 
                onPress={handleCancelSubmit}
                disabled={cancelling || !cancelReason || cancelReason.trim().length < 5}
              >
                {cancelling ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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

  // Cancel Card & Modal Styles
  cancelledBanner: {
    backgroundColor: '#ffebee',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffcdd2',
    padding: 16,
    marginBottom: 20,
  },
  cancelledHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  cancelledTextContainer: {
    flex: 1,
  },
  cancelledTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#c62828',
  },
  cancelledTime: {
    fontSize: 12,
    color: '#b71c1c',
    marginTop: 2,
  },
  cancelledBody: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  cancelledLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#555',
    marginBottom: 4,
  },
  cancelledReason: {
    fontSize: 13,
    color: '#333',
    fontStyle: 'italic',
  },

  cancelCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ffebee',
  },
  cancelCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000040',
    marginBottom: 8,
  },
  cancelCardDesc: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    marginBottom: 16,
  },
  cancelOrderBtn: {
    backgroundColor: '#c62828',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  cancelOrderBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000040',
  },
  modalBody: {
    padding: 20,
  },
  modalInstruction: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 16,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 13,
    color: '#333',
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#fafafa',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtnText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '700',
  },
  modalSubmitBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#c62828',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubmitBtnDisabled: {
    backgroundColor: '#ef9a9a',
  },
  modalSubmitBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
})
