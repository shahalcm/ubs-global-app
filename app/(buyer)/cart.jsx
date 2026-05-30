import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Platform } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { getCart, removeFromCart, updateCartItem } from '../../services/cartService'

export default function CartScreen() {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const [cartData, setCartData] = useState({ items: [], subtotal: 0, shippingTotal: 0, tax: 0, grandTotal: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = async () => {
    try {
      setLoading(true)
      const res = await getCart()
      if (res.success) setCartData(res.cart)
    } catch(err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateQuantity = async (productId, currentQty, change) => {
    try {
      setLoading(true)
      await updateCartItem(productId, currentQty + change)
      await loadCart()
    } catch(err) {
      console.log(err)
    }
  }

  const handleRemove = async (productId) => {
    try {
      setLoading(true)
      await removeFromCart(productId)
      await loadCart()
    } catch(err) {
      console.log(err)
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><MaterialCommunityIcons name="arrow-left" size={24} color="#333" /></TouchableOpacity>
        <Text style={styles.headerTitle}>{t('Shopping Cart')} ({cartData.items.length})</Text>
        <View style={{width:24}}/>
      </View>

      {loading ? (
        <View style={styles.emptyState}><ActivityIndicator size="large" color="#000040" /></View>
      ) : cartData.items.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="shopping-cart" size={48} color="#ccc" />
          <Text style={styles.emptyTitle}>{t('Your Cart is Empty')}</Text>
          <TouchableOpacity style={styles.browseBtn} onPress={() => router.push('/(buyer)/home')}><Text style={styles.browseBtnText}>{t('Start Shopping')}</Text></TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {cartData.items.map((item) => (
              <View key={item._id} style={styles.cartCard}>
                <View style={styles.vendorHeader}>
                  <MaterialCommunityIcons name="storefront" size={20} color="#666" />
                  <Text style={styles.vendorName}>{item.productId?.sellerId?.shopName}</Text>
                </View>
                <View style={styles.cardBody}>
                  <Image source={{ uri: item.productId?.images?.[0] }} style={styles.itemImage} />
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemTitle} numberOfLines={2}>{item.productId?.title}</Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                      <TouchableOpacity onPress={() => handleRemove(item.productId?._id)}>
                        <MaterialCommunityIcons name="trash-can" size={20} color="#ff4444" />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.qtyControl}>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => handleUpdateQuantity(item.productId?._id, item.quantity, -1)}><Text>-</Text></TouchableOpacity>
                      <Text style={styles.qtyValue}>{item.quantity}</Text>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => handleUpdateQuantity(item.productId?._id, item.quantity, 1)}><Text>+</Text></TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ))}
            <View style={styles.summaryCard}>
              <Text style={{fontWeight: 'bold', marginBottom: 10}}>Price Breakdown</Text>
              <View style={{flexDirection:'row', justifyContent:'space-between'}}><Text>Subtotal</Text><Text>${cartData.subtotal}</Text></View>
              <View style={{flexDirection:'row', justifyContent:'space-between', marginTop: 5}}><Text>Shipping</Text><Text>${cartData.shippingTotal}</Text></View>
              <View style={{flexDirection:'row', justifyContent:'space-between', marginTop: 5}}><Text>Tax</Text><Text>${cartData.tax}</Text></View>
            </View>
          </ScrollView>
          <View style={styles.checkoutBar}>
            <View style={styles.totalBox}><Text style={styles.totalLabel}>{t('Total')}</Text><Text style={styles.totalAmount}>${cartData.grandTotal}</Text></View>
            <TouchableOpacity style={styles.checkoutBtn} onPress={() => router.push({ pathname: '/(buyer)/order-summary', params: { productId: cartData.items[0]?.productId?._id, quantity: cartData.items[0]?.quantity, sellerId: cartData.items[0]?.productId?.sellerId?._id }})} disabled={cartData.items.length === 0}><Text style={styles.checkoutBtnText}>{t('Checkout')}</Text></TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6f8' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eaeaea' },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#000040' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  cartCard: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#eaeaea', overflow: 'hidden' },
  vendorHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fbfbfe', borderBottomWidth: 1, borderBottomColor: '#eaeaea' },
  vendorName: { fontSize: 12, fontWeight: '700', color: '#1a237e', marginLeft: 8 },
  cardBody: { flexDirection: 'row', padding: 16 },
  itemImage: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#eee', marginRight: 16 },
  itemDetails: { flex: 1 },
  itemTitle: { fontSize: 13, fontWeight: '700', color: '#333', marginBottom: 4 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  itemPrice: { fontSize: 16, fontWeight: '800', color: '#008b8b' },
  qtyControl: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 6, alignSelf: 'flex-start' },
  qtyBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#f5f5f5' },
  qtyValue: { paddingHorizontal: 16, fontSize: 13, fontWeight: '700', color: '#000040' },
  summaryCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16 },
  checkoutBar: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eaeaea', padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalBox: { flex: 1 },
  totalLabel: { fontSize: 12, color: '#666', marginBottom: 4 },
  totalAmount: { fontSize: 20, fontWeight: '800', color: '#000040' },
  checkoutBtn: { backgroundColor: '#000040', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 8 },
  checkoutBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#000040', marginBottom: 8, marginTop: 16 },
  browseBtn: { backgroundColor: '#000040', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 8, marginTop: 24 },
  browseBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' }
})
