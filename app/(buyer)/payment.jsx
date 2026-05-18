import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ActivityIndicator } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import RazorpayCheckout from 'react-native-razorpay'
import { verifyPayment } from '../../services/paymentService'
import { useAuth } from '../../context/AuthContext'
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function PaymentScreen() {
  const { user } = useAuth()
  const { razorpayOrderId, amount, orderId, orderNumber, grandTotal, key } = useLocalSearchParams()
  const [loading, setLoading] = useState(false)

  const handlePayNow = async () => {
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

    setLoading(true)
    try {
      const data = await RazorpayCheckout.open(options)
      const verifyRes = await verifyPayment({
        razorpayOrderId: razorpayOrderId,
        razorpayPaymentId: data.razorpay_payment_id,
        razorpaySignature: data.razorpay_signature,
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

      <View style={styles.content}>
        <View style={styles.secureCard}>
          <MaterialCommunityIcons name="shield-lock" size={32} color="#4CAF50" />
          <Text style={styles.secureText}>Secure Payment via Razorpay</Text>
          <Text style={styles.subText}>256-bit SSL Encrypted</Text>
        </View>

        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Total Amount</Text>
          <Text style={styles.amountValue}>${grandTotal}</Text>
          <Text style={styles.currencyLabel}>USD</Text>
          <Text style={styles.orderLabel}>Order: #{orderNumber}</Text>
        </View>

        <View style={styles.methodCard}>
          <MaterialCommunityIcons name="credit-card-outline" size={32} color="#1a237e" />
          <Text style={styles.methodTitle}>Pay with Razorpay</Text>
          <Text style={styles.methodDesc}>Cards, UPI, Net Banking, Wallets</Text>
        </View>
      </View>

      <View style={styles.footer}>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff' },
  headerLogo: { fontSize: 18, fontWeight: '800', color: '#000040' },
  content: { padding: 20 },
  secureCard: { alignItems: 'center', backgroundColor: '#e8f5e9', padding: 20, borderRadius: 12, marginBottom: 20 },
  secureText: { fontSize: 16, fontWeight: '700', color: '#2e7d32', marginTop: 10 },
  subText: { fontSize: 12, color: '#4caf50' },
  amountCard: { alignItems: 'center', backgroundColor: '#fff', padding: 30, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#eaeaea' },
  amountLabel: { fontSize: 14, color: '#666', marginBottom: 10 },
  amountValue: { fontSize: 36, fontWeight: '800', color: '#1a237e' },
  currencyLabel: { fontSize: 14, fontWeight: '700', color: '#666', marginTop: 5 },
  orderLabel: { fontSize: 12, color: '#999', marginTop: 15 },
  methodCard: { alignItems: 'center', backgroundColor: '#fff', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#eaeaea' },
  methodTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginTop: 10 },
  methodDesc: { fontSize: 12, color: '#666', marginTop: 5 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#fff' },
  payBtn: { backgroundColor: '#1a237e', paddingVertical: 18, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  payBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  tosText: { textAlign: 'center', fontSize: 11, color: '#888' }
})
