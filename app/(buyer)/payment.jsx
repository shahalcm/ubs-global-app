import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ActivityIndicator, ScrollView, NativeModules, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import RazorpayCheckout from 'react-native-razorpay'
import Constants, { ExecutionEnvironment } from 'expo-constants'
import { verifyPayment } from '../../services/paymentService'
import { useAuth } from '../../context/AuthContext'
import { useCurrency } from '../../context/CurrencyContext'
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function PaymentScreen() {
  const insets = useSafeAreaInsets()
  const { user } = useAuth()
  const { razorpayOrderId, amount, orderId, orderNumber, grandTotal, currency, currencySymbol, originalAmount, key } = useLocalSearchParams()
  const [loading, setLoading] = useState(false)

  const payCurrency = (currency || 'USD').toUpperCase()
  const paySymbol = currencySymbol || '$'
  const payAmount = Number(grandTotal || 0).toFixed(2)
  const inrAmountFormatted = (Number(amount || 0) / 100).toFixed(2)
  const isDifferentCurrency = payCurrency !== 'INR'
  const displayAmountText = `₹${inrAmountFormatted} INR`

  console.log('💳 [PaymentScreen Debug]:', {
    selectedCurrency: payCurrency,
    currencySymbol: paySymbol,
    convertedAmount: payAmount,
    inrChargedAmount: inrAmountFormatted,
    originalAmount: originalAmount || 'N/A',
    razorpayOrderId: razorpayOrderId,
    razorpayAmount: amount
  })

  const handlePayNow = async () => {
    setLoading(true)
    try {
      if (!razorpayOrderId || !key) {
        Alert.alert('Payment Error', 'Missing Razorpay order parameters. Please go back and retry checkout.')
        setLoading(false)
        return
      }

      console.log('💳 [Razorpay Pre-Checkout Setup]:', {
        key,
        amount,
        currency: 'INR',
        order_id: razorpayOrderId
      })

      const options = {
        description: `UBS Global Order #${orderNumber} • ₹${inrAmountFormatted} INR`,
        image: 'https://cdn-icons-png.flaticon.com/512/3143/3143212.png',
        currency: 'INR',
        key: key,
        amount: Number(amount),
        name: 'UBS Global',
        order_id: razorpayOrderId,
        prefill: {
          email: user?.email || '',
          contact: user?.phone || '',
          name: user?.name || ''
        },
        theme: { color: '#1a237e' }
      }

      const isExpoGoApp = Constants.appOwnership === 'expo' || Constants.executionEnvironment === ExecutionEnvironment.StoreClient
      const isNativeModuleAvailable = !!(NativeModules?.RNRazorpayCheckout && typeof RazorpayCheckout?.open === 'function')

      if (!isNativeModuleAvailable) {
        if (isExpoGoApp) {
          console.log('ℹ️ Running in Expo Go environment: Native Razorpay SDK requires standalone APK / development build')
          Alert.alert(
            'Expo Go Notice',
            'Razorpay native checkout overlay is not supported inside Expo Go. Please build a Standalone APK or Development Build ("npx expo run:android" or "eas build") to perform native payments.'
          )
        } else {
          console.warn('⚠️ Native Razorpay module (RNRazorpayCheckout) is missing from current app binary!')
          Alert.alert(
            'Native Build Required',
            'Razorpay native checkout module is missing from this app binary. Please ensure react-native-razorpay is linked.'
          )
        }
        setLoading(false)
        return
      }

      let data
      try {
        data = await RazorpayCheckout.open(options)
      } catch (rzpErr) {
        console.warn('⚠️ Razorpay Checkout Error:', rzpErr)
        if (rzpErr?.code === 2 || rzpErr?.code === 0 || rzpErr?.description === 'Payment cancelled by user') {
          Alert.alert('Payment Cancelled', 'You cancelled the payment transaction.')
          setLoading(false)
          return
        }
        Alert.alert('Payment Error', rzpErr?.description || rzpErr?.message || 'Payment initiation failed on device.')
        setLoading(false)
        return
      }

      console.log('💳 [Razorpay SDK Returned Credentials]:', {
        razorpay_order_id: data?.razorpay_order_id,
        razorpay_payment_id: data?.razorpay_payment_id,
        razorpay_signature: data?.razorpay_signature
      })

      const returnedOrderId = data?.razorpay_order_id || razorpayOrderId
      const returnedPaymentId = data?.razorpay_payment_id
      const returnedSignature = data?.razorpay_signature

      if (!returnedPaymentId || !returnedSignature) {
        Alert.alert('Payment Error', 'Incomplete payment credentials returned from Razorpay SDK.')
        setLoading(false)
        return
      }

      const verifyRes = await verifyPayment({
        razorpayOrderId: returnedOrderId,
        razorpayPaymentId: returnedPaymentId,
        razorpaySignature: returnedSignature,
        orderId: orderId
      })

      if (verifyRes && verifyRes.success) {
        Alert.alert('✅ Payment Successful!', `₹${inrAmountFormatted} INR paid successfully.`, [
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
      } else {
        Alert.alert('Payment Error', verifyRes?.message || 'Verification failed. Please try again.')
      }
    } catch (error) {
      console.error('Payment execution error:', error)
      const errorMsg = error?.response?.data?.message || error?.message || 'Payment failed. Please try again.'
      Alert.alert('Payment Status', errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(buyer)/home')}><MaterialCommunityIcons name="arrow-left" size={24} color="#333" /></TouchableOpacity>
        <Text style={styles.headerLogo}>Payment</Text>
        <View style={{width: 24}}/>
      </View>

      <View style={styles.mainContent}>
        <View style={styles.secureCard}>
          <MaterialCommunityIcons name="shield-check" size={20} color="#4CAF50" />
          <Text style={styles.secureText}>Secure 256-bit SSL Encrypted Payment</Text>
        </View>

        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Amount to be Charged via Razorpay</Text>
          <Text style={styles.amountValue}>₹{inrAmountFormatted} <Text style={styles.currencyLabel}>INR</Text></Text>
          {isDifferentCurrency && (
            <Text style={styles.approxText}>≈ {paySymbol}{payAmount} {payCurrency} (Estimated)</Text>
          )}
          <Text style={styles.orderLabel}>Order: #{orderNumber}</Text>
        </View>

        <View style={styles.methodCard}>
          <MaterialCommunityIcons name="credit-card-outline" size={24} color="#1a237e" />
          <View style={styles.methodTextContainer}>
            <Text style={styles.methodTitle}>Pay with Razorpay (₹{inrAmountFormatted} INR)</Text>
            <Text style={styles.methodDesc}>UPI, Cards, Net Banking, Wallets</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.payBtn} onPress={handlePayNow} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.payBtnText}>Pay ₹{inrAmountFormatted} INR →</Text>}
        </TouchableOpacity>
        <Text style={styles.tosText}>By paying you agree to our Terms of Service</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f5f8' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerLogo: { fontSize: 18, fontWeight: '800', color: '#000040' },
  mainContent: { flex: 1, padding: 16 },
  secureCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e8f5e9', padding: 10, borderRadius: 8, marginBottom: 12 },
  secureText: { fontSize: 12, fontWeight: '600', color: '#2e7d32', marginLeft: 6 },
  amountCard: { alignItems: 'center', backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#eaeaea' },
  amountLabel: { fontSize: 12, color: '#666', marginBottom: 2 },
  amountValue: { fontSize: 32, fontWeight: '800', color: '#1a237e' },
  currencyLabel: { fontSize: 16, fontWeight: '700', color: '#1a237e' },
  approxText: { fontSize: 13, fontWeight: '600', color: '#666', marginTop: 4 },
  orderLabel: { fontSize: 12, color: '#999', marginTop: 8 },
  methodCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#eaeaea' },
  methodTextContainer: { flex: 1, marginLeft: 10 },
  methodTitle: { fontSize: 14, fontWeight: '700', color: '#333' },
  methodDesc: { fontSize: 11, color: '#666', marginTop: 2 },
  footer: { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eaeaea' },
  payBtn: { backgroundColor: '#1a237e', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  payBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  tosText: { textAlign: 'center', fontSize: 10, color: '#888' }
})
