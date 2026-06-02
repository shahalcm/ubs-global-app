import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ActivityIndicator, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import RazorpayCheckout from 'react-native-razorpay'
import { verifyPayment } from '../../services/paymentService'
import { useAuth } from '../../context/AuthContext'
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function PaymentScreen() {
  const insets = useSafeAreaInsets()
  const { user } = useAuth()
  const { razorpayOrderId, amount, orderId, orderNumber, grandTotal, key } = useLocalSearchParams()
  const [loading, setLoading] = useState(false)

  const handlePayNow = async () => {
    setLoading(true)
    try {
      let paymentId = 'pay_mock_' + Math.random().toString(36).substring(7)
      let signature = 'sig_mock_' + Math.random().toString(36).substring(7)

      if (key && key !== 'rzp_test_your_key_id' && razorpayOrderId && !razorpayOrderId.startsWith('order_mock_')) {
        const options = {
          description: `UBS Global Order #${orderNumber}`,
          image: 'https://cdn-icons-png.flaticon.com/512/3143/3143212.png',
          currency: 'USD',
          key: key,
          amount: amount,
          name: 'UBS Global',
          order_id: razorpayOrderId,
          prefill: {
            email: user?.email || '',
            contact: user?.phone || '',
            name: user?.name || ''
          },
          theme: { color: '#1a237e' }
        }
        const data = await RazorpayCheckout.open(options)
        paymentId = data.razorpay_payment_id
        signature = data.razorpay_signature
      }

      const verifyRes = await verifyPayment({
        razorpayOrderId: razorpayOrderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        orderId: orderId
      })

      if (verifyRes.success) {
        Alert.alert('✅ Payment Successful!', `$${grandTotal} paid successfully`, [
          {
            text: 'OK',
            onPress: () => {
              Alert.alert('🎉 Order Placed!', `Your order #${orderNumber} has been placed successfully.`, [
                { text: 'Track Order', onPress: () => router.push({ pathname: '/(buyer)/order-tracking', params: { orderId } }) },
                { text: 'Continue Shopping', onPress: () => router.replace('/(buyer)/home') }
              ])
            }
          }
        ])
      }
    } catch (error) {
      if (error.code === 2 || error.code === 0) {
        Alert.alert('Cancelled', 'Payment was cancelled')
      } else {
        console.log('Payment error details:', error)
        Alert.alert('Failed', 'Payment failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><MaterialCommunityIcons name="arrow-left" size={24} color="#333" /></TouchableOpacity>
        <Text style={styles.headerLogo}>Payment</Text>
        <View style={{width: 24}}/>
      </View>

      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.secureCard}>
          <MaterialCommunityIcons name="shield-check" size={20} color="#4CAF50" />
          <Text style={styles.secureText}>Secure 256-bit SSL Encrypted Payment</Text>
        </View>

        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Total Amount</Text>
          <Text style={styles.amountValue}>${grandTotal} <Text style={styles.currencyLabel}>USD</Text></Text>
          <Text style={styles.orderLabel}>Order: #{orderNumber}</Text>
        </View>

        <View style={styles.methodCard}>
          <MaterialCommunityIcons name="credit-card-outline" size={24} color="#1a237e" />
          <View style={styles.methodTextContainer}>
            <Text style={styles.methodTitle}>Pay with Razorpay</Text>
            <Text style={styles.methodDesc}>Cards, UPI, Net Banking, Wallets</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom > 0 ? insets.bottom + 12 : 20 }]}>
        <TouchableOpacity style={styles.payBtn} onPress={handlePayNow} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.payBtnText}>Pay Now ${grandTotal}</Text>}
        </TouchableOpacity>
        <Text style={styles.tosText}>By paying you agree to our Terms of Service</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f5f8' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerLogo: { fontSize: 18, fontWeight: '800', color: '#000040' },
  scrollContent: { padding: 16, paddingBottom: 16 },
  secureCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e8f5e9', padding: 10, borderRadius: 8, marginBottom: 12 },
  secureText: { fontSize: 12, fontWeight: '600', color: '#2e7d32', marginLeft: 6 },
  amountCard: { alignItems: 'center', backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#eaeaea' },
  amountLabel: { fontSize: 12, color: '#666', marginBottom: 2 },
  amountValue: { fontSize: 28, fontWeight: '800', color: '#1a237e' },
  currencyLabel: { fontSize: 14, fontWeight: '600', color: '#666' },
  orderLabel: { fontSize: 12, color: '#999', marginTop: 6 },
  methodCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#eaeaea' },
  methodTextContainer: { flex: 1, marginLeft: 10 },
  methodTitle: { fontSize: 14, fontWeight: '700', color: '#333' },
  methodDesc: { fontSize: 11, color: '#666', marginTop: 2 },
  footer: { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eaeaea' },
  payBtn: { backgroundColor: '#1a237e', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  payBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  tosText: { textAlign: 'center', fontSize: 10, color: '#888' }
})
