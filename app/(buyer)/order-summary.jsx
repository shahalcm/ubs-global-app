import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Image, TextInput, KeyboardAvoidingView, Platform } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { getProduct } from '../../services/productService'
import { createRazorpayOrder } from '../../services/paymentService'
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getProductImageUrl } from '../../utils/image'

export default function OrderSummaryScreen() {
  const insets = useSafeAreaInsets()
  const { productId, quantity, sellerId } = useLocalSearchParams()
  const [product, setProduct] = useState(null)
  const [address, setAddress] = useState({
    fullName: '', phone: '', email: '', street: '', city: '', state: '', country: '', zipCode: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadProduct()
  }, [])

  const loadProduct = async () => {
    try {
      const res = await getProduct(productId)
      setProduct(res.product)
    } catch(err) {
      console.log(err);
    }
  }

  const subtotal = product ? Number(product.price || 0) * Number(quantity) : 0
  const shipping = product?.freeShipping ? 0 : Number(product?.shippingFee || 0)
  const tax = subtotal * 0.05
  const grandTotal = subtotal + shipping + tax

  const handleContinueToPayment = async () => {
    if (!address.fullName || !address.phone || !address.street || !address.city || !address.country) {
      Alert.alert('Error', 'Please fill all required address fields (Name, Phone, Street, City, Country)')
      return
    }

    setLoading(true)
    try {
      const res = await createRazorpayOrder({
        items: [{ productId, quantity: Number(quantity) }],
        sellerId,
        deliveryAddress: address
      })

      router.push({
        pathname: '/(buyer)/payment',
        params: {
          razorpayOrderId: res.razorpayOrderId,
          amount: res.amount,
          orderId: res.orderId,
          orderNumber: res.orderNumber,
          grandTotal: grandTotal.toFixed(2),
          key: res.key
        }
      })
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create order')
    } finally {
      setLoading(false)
    }
  }

  if (!product) return <SafeAreaView style={styles.container}><Text style={{textAlign:'center', marginTop:50}}>Loading...</Text></SafeAreaView>

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(buyer)/home')}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Order Summary</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.card, { flexDirection: 'row', alignItems: 'center' }]}>
            <Image source={{ uri: getProductImageUrl(product.images?.[0] || product.image) }} style={styles.pImg} />
            <View style={styles.pInfo}>
              <Text style={styles.pTitle} numberOfLines={2}>{product.title}</Text>
              <Text style={styles.pQty}>Qty: {quantity}</Text>
              <Text style={styles.pPrice}>${Number(product.price || 0).toFixed(2)} each</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.card}>
            <TextInput style={styles.input} placeholder="Full Name *" value={address.fullName} onChangeText={t => setAddress({...address, fullName: t})} />
            <TextInput style={styles.input} placeholder="Phone Number *" value={address.phone} onChangeText={t => setAddress({...address, phone: t})} keyboardType="phone-pad" />
            <TextInput style={styles.input} placeholder="Email" value={address.email} onChangeText={t => setAddress({...address, email: t})} keyboardType="email-address" />
            <TextInput style={styles.input} placeholder="Street Address *" value={address.street} onChangeText={t => setAddress({...address, street: t})} />
            <View style={{flexDirection:'row', gap:10}}>
              <TextInput style={[styles.input, {flex:1}]} placeholder="City *" value={address.city} onChangeText={t => setAddress({...address, city: t})} />
              <TextInput style={[styles.input, {flex:1}]} placeholder="State" value={address.state} onChangeText={t => setAddress({...address, state: t})} />
            </View>
            <View style={{flexDirection:'row', gap:10}}>
              <TextInput style={[styles.input, {flex:1}]} placeholder="Country *" value={address.country} onChangeText={t => setAddress({...address, country: t})} />
              <TextInput style={[styles.input, {flex:1}]} placeholder="ZIP Code" value={address.zipCode} onChangeText={t => setAddress({...address, zipCode: t})} />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Price Details</Text>
          <View style={styles.card}>
            <View style={styles.row}><Text>Subtotal</Text><Text>${Number(subtotal).toFixed(2)}</Text></View>
            <View style={styles.row}><Text>Shipping</Text><Text>{shipping === 0 ? 'FREE' : `$${Number(shipping).toFixed(2)}`}</Text></View>
            <View style={styles.row}><Text>Tax (5%)</Text><Text>${Number(tax).toFixed(2)}</Text></View>
            <View style={[styles.row, {borderTopWidth:1, borderColor:'#eee', paddingTop:10, marginTop:10}]}>
              <Text style={styles.bold}>TOTAL</Text>
              <Text style={styles.totalBlue}>${Number(grandTotal).toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.noteBox}>
            <MaterialCommunityIcons name="lock" size={16} color="#4CAF50" />
            <Text style={styles.noteText}>Payment processed securely via Razorpay (256-bit SSL)</Text>
          </View>
        </ScrollView>

        <View style={[styles.bottomBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 16 }]}>
          <TouchableOpacity style={styles.payBtn} onPress={handleContinueToPayment} disabled={loading}>
            <Text style={styles.payBtnText}>{loading ? 'Processing...' : 'Continue to Payment →'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6f8' },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#eee" },
  topTitle: { fontSize: 18, fontWeight: "700", color: "#000033" },
  scrollContent: { padding: 16, paddingBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 10, marginTop: 10 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#eaeaea' },
  pImg: { width: 80, height: 80, borderRadius: 8, marginRight: 16 },
  pInfo: { flex: 1 },
  pTitle: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 4 },
  pQty: { fontSize: 12, color: '#666' },
  pPrice: { fontSize: 14, fontWeight: '700', color: '#008b8b', marginTop: 4 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 10, backgroundColor: '#fafafa', color: '#333' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  bold: { fontWeight: '800', fontSize: 16 },
  totalBlue: { fontWeight: '800', fontSize: 18, color: '#1a237e' },
  noteBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10 },
  noteText: { fontSize: 11, color: '#666', marginLeft: 6 },
  bottomBar: { backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderColor: '#eee' },
  payBtn: { backgroundColor: '#1a237e', padding: 16, borderRadius: 8, alignItems: 'center' },
  payBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 }
})
