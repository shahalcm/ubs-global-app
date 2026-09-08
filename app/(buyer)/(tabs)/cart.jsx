import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native'
import { Image } from 'expo-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getProductImageUrl } from '../../../utils/image'
import { router, useFocusEffect } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { getCart, removeFromCart, updateCartItem } from '../../../services/cartService'

export default function CartScreen() {
  const { t, i18n } = useTranslation()
  const [cartData, setCartData] = useState({
    items: [],
    subtotal: '0.00',
    shippingTotal: '0.00',
    tax: '0.00',
    grandTotal: '0.00',
    itemCount: 0,
    hasOutOfStockItems: false
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [updatingItemId, setUpdatingItemId] = useState(null)

  const loadCart = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true)
      const res = await getCart()
      if (res && res.success && res.cart) {
        const validItems = (res.cart.items || []).filter(item => item && item.productId)
        setCartData({ ...res.cart, items: validItems })
      } else {
        setCartData({
          items: [],
          subtotal: '0.00',
          shippingTotal: '0.00',
          tax: '0.00',
          grandTotal: '0.00',
          itemCount: 0,
          hasOutOfStockItems: false
        })
      }
    } catch (err) {
      console.log('Error loading cart:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadCart(true)
    }, [])
  )

  const onRefresh = () => {
    setRefreshing(true)
    loadCart(false)
  }

  const handleUpdateQuantity = async (productId, currentQty, change) => {
    const newQty = currentQty + change
    try {
      setUpdatingItemId(productId)
      await updateCartItem(productId, newQty)
      await loadCart(false)
    } catch (err) {
      console.log('Error updating quantity:', err)
      Alert.alert(t('Error'), err?.response?.data?.message || t('Failed to update quantity'))
    } finally {
      setUpdatingItemId(null)
    }
  }

  const handleRemove = async (productId) => {
    try {
      setUpdatingItemId(productId)
      await removeFromCart(productId)
      await loadCart(false)
    } catch (err) {
      console.log('Error removing item:', err)
      Alert.alert(t('Error'), t('Failed to remove item'))
    } finally {
      setUpdatingItemId(null)
    }
  }

  const handleCheckout = () => {
    if (cartData.items.length === 0) return

    // Check for out of stock items
    const outOfStockItems = cartData.items.filter(item => item.isOutOfStock || item.availableStock === 0)
    if (outOfStockItems.length > 0) {
      Alert.alert(
        t('Out of Stock Items'),
        t('Your cart contains out-of-stock items. Please remove them to proceed with checkout.')
      )
      return
    }

    const firstItem = cartData.items[0]
    router.push({
      pathname: '/(buyer)/order-summary',
      params: {
        productId: firstItem?.productId?._id,
        quantity: firstItem?.quantity,
        sellerId: firstItem?.productId?.sellerId?._id || firstItem?.sellerId
      }
    })
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(buyer)/home'))}
          style={styles.backBtn}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1a237e" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('Shopping Cart')} ({cartData.items.length})</Text>
        <View style={{ width: 32 }} />
      </View>

      {loading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color="#1a237e" />
        </View>
      ) : cartData.items.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconBg}>
            <MaterialCommunityIcons name="cart-outline" size={54} color="#1a237e" />
          </View>
          <Text style={styles.emptyTitle}>{t('Your Cart is Empty')}</Text>
          <Text style={styles.emptySubtitle}>{t('Find high-quality products from verified global suppliers and add them to your cart!')}</Text>
          <TouchableOpacity style={styles.browseBtn} onPress={() => router.push('/(buyer)/home')}>
            <Text style={styles.browseBtnText}>{t('Start Shopping')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1a237e']} />
            }
          >
            {/* Out of Stock Warning Banner */}
            {cartData.hasOutOfStockItems && (
              <View style={styles.warningBanner}>
                <MaterialCommunityIcons name="alert-circle" size={20} color="#d32f2f" />
                <Text style={styles.warningBannerText}>
                  {t('Some items in your cart are currently out of stock. Please remove them to checkout.')}
                </Text>
              </View>
            )}

            {/* Cart Items List */}
            {cartData.items.map((item) => {
              const product = item.productId
              if (!product) return null
              const isOutOfStock = item.isOutOfStock || product.stock === 0
              const isUpdating = updatingItemId === product._id

              return (
                <View key={item._id || product._id} style={styles.cartCard}>
                  {/* Vendor / Seller Header */}
                  <View style={styles.vendorHeader}>
                    <MaterialCommunityIcons name="storefront" size={18} color="#1a237e" />
                    <Text style={styles.vendorName} numberOfLines={1}>
                      {product.sellerId?.shopName || t('Verified Global Seller')}
                    </Text>
                    {product.sellerId?.isVerified && (
                      <MaterialCommunityIcons name="check-decagram" size={14} color="#0288d1" style={{ marginLeft: 4 }} />
                    )}
                  </View>

                  {/* Body */}
                  <View style={styles.cardBody}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => router.push(`/(buyer)/product-details?id=${product._id}`)}
                    >
                      <Image
                        source={{ uri: getProductImageUrl(product.images?.[0] || product.image) }}
                        style={styles.itemImage}
                        contentFit="cover"
                        transition={150}
                      />
                    </TouchableOpacity>

                    <View style={styles.itemDetails}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => router.push(`/(buyer)/product-details?id=${product._id}`)}
                      >
                        <Text style={styles.itemTitle} numberOfLines={2}>
                          {product.translations?.[i18n.language]?.title || t(product.title) || product.title}
                        </Text>
                      </TouchableOpacity>

                      {/* Stock status badge */}
                      {isOutOfStock ? (
                        <View style={styles.stockBadgeOut}>
                          <Text style={styles.stockBadgeOutText}>{t('OUT OF STOCK')}</Text>
                        </View>
                      ) : (
                        <View style={styles.stockBadgeIn}>
                          <Text style={styles.stockBadgeInText}>{t('IN STOCK')}</Text>
                        </View>
                      )}

                      <View style={styles.priceRow}>
                        <Text style={styles.itemPrice}>${Number(item.price || product.price || 0).toFixed(2)}</Text>
                        <TouchableOpacity
                          onPress={() => handleRemove(product._id)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          style={styles.trashBtn}
                        >
                          <MaterialCommunityIcons name="trash-can-outline" size={20} color="#ff3d00" />
                        </TouchableOpacity>
                      </View>

                      {/* Quantity Selector */}
                      <View style={styles.qtyRow}>
                        <View style={styles.qtyControl}>
                          <TouchableOpacity
                            style={[styles.qtyBtn, isUpdating && { opacity: 0.5 }]}
                            onPress={() => handleUpdateQuantity(product._id, item.quantity, -1)}
                            disabled={isUpdating}
                          >
                            <Text style={styles.qtyBtnSymbol}>-</Text>
                          </TouchableOpacity>

                          <Text style={styles.qtyValue}>{item.quantity}</Text>

                          <TouchableOpacity
                            style={[styles.qtyBtn, (isUpdating || isOutOfStock) && { opacity: 0.5 }]}
                            onPress={() => handleUpdateQuantity(product._id, item.quantity, 1)}
                            disabled={isUpdating || isOutOfStock}
                          >
                            <Text style={styles.qtyBtnSymbol}>+</Text>
                          </TouchableOpacity>
                        </View>

                        <Text style={styles.itemSubtotal}>
                          {t('Subtotal:')} ${(Number(item.price || product.price || 0) * item.quantity).toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              )
            })}

            {/* Price Breakdown Card */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>{t('Order Price Breakdown')}</Text>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('Items Subtotal')}</Text>
                <Text style={styles.summaryValue}>${cartData.subtotal}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('Estimated Shipping')}</Text>
                <Text style={styles.summaryValue}>${cartData.shippingTotal}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('Estimated Tax (5%)')}</Text>
                <Text style={styles.summaryValue}>${cartData.tax}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text style={styles.totalLabelBold}>{t('Total Amount')}</Text>
                <Text style={styles.totalValueBold}>${cartData.grandTotal}</Text>
              </View>
            </View>
          </ScrollView>

          {/* Checkout Bar */}
          <View style={styles.checkoutBar}>
            <View style={styles.totalBox}>
              <Text style={styles.checkoutTotalLabel}>{t('Grand Total')}</Text>
              <Text style={styles.checkoutTotalAmount}>${cartData.grandTotal}</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.checkoutBtn,
                (cartData.items.length === 0 || cartData.hasOutOfStockItems) && styles.checkoutBtnDisabled
              ]}
              onPress={handleCheckout}
            >
              <Text style={styles.checkoutBtnText}>{t('Proceed to Checkout')}</Text>
              <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fc' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1a237e' },

  scrollContent: { padding: 14, paddingBottom: 110 },

  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#ffcdd2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    gap: 10,
  },
  warningBannerText: { flex: 1, color: '#c62828', fontSize: 12, fontWeight: '600', lineHeight: 16 },

  cartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e8ecf4',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  vendorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#f5f7fb',
    borderBottomWidth: 1,
    borderBottomColor: '#edf0f7',
  },
  vendorName: { fontSize: 12, fontWeight: '700', color: '#1a237e', marginLeft: 6 },
  cardBody: { flexDirection: 'row', padding: 14 },
  itemImage: { width: 85, height: 85, borderRadius: 12, backgroundColor: '#f0f2f5', marginRight: 14 },
  itemDetails: { flex: 1 },
  itemTitle: { fontSize: 13, fontWeight: '700', color: '#1a237e', marginBottom: 4, lineHeight: 18 },

  stockBadgeOut: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffebee',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 6,
  },
  stockBadgeOutText: { color: '#d32f2f', fontSize: 10, fontWeight: '800' },

  stockBadgeIn: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 6,
  },
  stockBadgeInText: { color: '#2e7d32', fontSize: 10, fontWeight: '800' },

  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  itemPrice: { fontSize: 16, fontWeight: '800', color: '#008b8b' },
  trashBtn: { padding: 4 },

  qtyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cfd8dc',
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    overflow: 'hidden',
  },
  qtyBtn: { paddingHorizontal: 12, paddingVertical: 5, backgroundColor: '#eceff1' },
  qtyBtnSymbol: { fontSize: 16, fontWeight: '700', color: '#1a237e' },
  qtyValue: { paddingHorizontal: 14, fontSize: 13, fontWeight: '700', color: '#1a237e' },
  itemSubtotal: { fontSize: 11, fontWeight: '600', color: '#607d8b' },

  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#e8ecf4',
    elevation: 2,
  },
  summaryTitle: { fontSize: 15, fontWeight: '800', color: '#1a237e', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 13, color: '#666' },
  summaryValue: { fontSize: 13, fontWeight: '700', color: '#333' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 8 },
  totalLabelBold: { fontSize: 15, fontWeight: '800', color: '#1a237e' },
  totalValueBold: { fontSize: 18, fontWeight: '800', color: '#008b8b' },

  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eaeaea',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justify: 'space-between',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  totalBox: { flex: 1 },
  checkoutTotalLabel: { fontSize: 11, color: '#666', marginBottom: 2 },
  checkoutTotalAmount: { fontSize: 20, fontWeight: '800', color: '#008b8b' },
  checkoutBtn: {
    backgroundColor: '#1a237e',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 12,
  },
  checkoutBtnDisabled: { opacity: 0.5 },
  checkoutBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyIconBg: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#eef2ff',
    justify: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: '#1a237e', marginBottom: 8 },
  emptySubtitle: { fontSize: 13, color: '#666', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  browseBtn: { backgroundColor: '#1a237e', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 12 },
  browseBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
})
