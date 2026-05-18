// app/(buyer)/order-tracking.jsx
import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function OrderTrackingScreen() {
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
            <Text style={styles.headerSubtitle}>#UBS-00123</Text>
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
                <Text style={styles.etaTime}>14:30 - 15:00</Text>
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
            
            {/* Step 1 */}
            <View style={styles.timelineRow}>
              <View style={styles.timelineIconCol}>
                <View style={[styles.circle, styles.circleGreen]}>
                  <MaterialCommunityIcons name="check" size={16} color="#fff" />
                </View>
                <View style={[styles.line, styles.lineGreen]} />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.stepTitleGreen}>Step 01</Text>
                <Text style={styles.stepName}>Order Placed</Text>
                <Text style={styles.stepTime}>Oct 24, 2023 • 09:15 AM</Text>
              </View>
            </View>

            {/* Step 2 */}
            <View style={styles.timelineRow}>
              <View style={styles.timelineIconCol}>
                <View style={[styles.circle, styles.circleGreen]}>
                  <MaterialCommunityIcons name="check" size={16} color="#fff" />
                </View>
                <View style={[styles.line, styles.lineGreen]} />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.stepTitleGreen}>Step 02</Text>
                <Text style={styles.stepName}>Order Confirmed</Text>
                <Text style={styles.stepTime}>Oct 24, 2023 • 10:30 AM</Text>
              </View>
            </View>

            {/* Step 3 */}
            <View style={styles.timelineRow}>
              <View style={styles.timelineIconCol}>
                <View style={[styles.circle, styles.circleGreen]}>
                  <MaterialCommunityIcons name="check" size={16} color="#fff" />
                </View>
                <View style={[styles.line, styles.lineGray]} />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.stepTitleGreen}>Step 03</Text>
                <Text style={styles.stepName}>Packed & Ready</Text>
                <Text style={styles.stepTime}>Oct 25, 2023 • 08:00 AM</Text>
              </View>
            </View>

            {/* Step 4 (Current) */}
            <View style={styles.timelineRow}>
              <View style={styles.timelineIconCol}>
                <View style={[styles.circle, styles.circleBlue]}>
                  <MaterialCommunityIcons name="truck" size={20} color="#fff" />
                </View>
                <View style={[styles.line, styles.lineGray, { borderStyle: 'dashed' }]} />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.stepTitleBlue}>In Progress</Text>
                <Text style={styles.stepName}>Out for Delivery</Text>
                <Text style={styles.stepNameBold}>Your order is on the way</Text>
              </View>
            </View>

            {/* Step 5 */}
            <View style={[styles.timelineRow, { marginBottom: 0 }]}>
              <View style={styles.timelineIconCol}>
                <View style={[styles.circle, styles.circleGray]}>
                  <Text style={styles.boxIcon}>📦</Text>
                </View>
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.stepTitleGray}>Pending</Text>
                <Text style={styles.stepNameGray}>Delivered</Text>
                <Text style={styles.stepTime}>Expected by today, 05:00 PM</Text>
              </View>
            </View>

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
              <Text style={styles.courierName}>Global Express Logistics</Text>
              <Text style={styles.courierId}>ID: Courier_9942</Text>
            </View>
          </View>

          <View style={styles.trackingBox}>
            <View>
              <Text style={styles.trackingLabel}>TRACKING NUMBER</Text>
              <Text style={styles.trackingNumber}>UBS7729910023</Text>
            </View>
            <TouchableOpacity style={styles.copyBtn}>
              <MaterialCommunityIcons name="content-copy" size={20} color="#666" />
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
            <Text style={styles.addressName}>Sarah Jenkins</Text>
            <Text style={styles.addressText}>482 Tech Valley Boulevard, Suite 900</Text>
            <Text style={styles.addressText}>San Francisco, CA 94105</Text>
            <Text style={styles.addressPhone}>+1 (555) 012-3456</Text>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Summary</Text>
          <View style={styles.productRow}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80' }}
              style={styles.productImg}
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>Elite Series Pro Headphones</Text>
              <Text style={styles.productMeta}>Midnight Black • Qty: 1</Text>
              <Text style={styles.productPrice}>$299.00</Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>$299.00</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValueGreen}>Free</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>$299.00</Text>
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
