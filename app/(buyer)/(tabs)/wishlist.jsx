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
import { getWishlist, toggleWishlist } from '../../../services/wishlistService'
import { addToCart } from '../../../services/cartService'

export default function WishlistScreen() {
  const { t } = useTranslation()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [cartLoadingId, setCartLoadingId] = useState(null)

  const loadWishlist = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true)
      const res = await getWishlist()
      if (res && res.success) {
        const validProducts = (res.products || []).filter(p => p && p.productId)
        setProducts(validProducts)
      }
    } catch (err) {
      console.log('Error loading wishlist:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadWishlist(true)
    }, [])
  )

  const onRefresh = () => {
    setRefreshing(true)
    loadWishlist(false)
  }

  const handleRemove = async (productId) => {
    try {
      // Optimistic update
      setProducts(prev => prev.filter(p => p.productId?._id !== productId))
      await toggleWishlist(productId)
    } catch (err) {
      console.log('Error removing wishlist item:', err)
      loadWishlist(false)
    }
  }

  const handleAddToCart = async (product) => {
    const prodId = product._id
    if (product.stock === 0) {
      Alert.alert(t('Out of Stock'), t('This product is currently out of stock.'))
      return
    }

    try {
      setCartLoadingId(prodId)
      const res = await addToCart(prodId, 1)
      if (res && res.success) {
        Alert.alert(t('Success'), t('Added to Cart! 🛒'))
      } else {
        Alert.alert(t('Error'), res?.message || t('Failed to add to cart'))
      }
    } catch (err) {
      console.log('Error adding to cart:', err)
      Alert.alert(t('Error'), err?.response?.data?.message || t('Failed to add to cart'))
    } finally {
      setCartLoadingId(null)
    }
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
        <Text style={styles.headerTitle}>{t('My Wishlist')} ({products.length})</Text>
        <View style={{ width: 32 }} />
      </View>

      {loading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color="#1a237e" />
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconBg}>
            <MaterialCommunityIcons name="heart-outline" size={54} color="#1a237e" />
          </View>
          <Text style={styles.emptyTitle}>{t('Your Wishlist is Empty')}</Text>
          <Text style={styles.emptySubtitle}>{t('Explore our vast international market and save your favorite items!')}</Text>
          <TouchableOpacity style={styles.browseBtn} onPress={() => router.push('/(buyer)/home')}>
            <Text style={styles.browseBtnText}>{t('Explore Products')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1a237e']} />
          }
        >
          <View style={styles.grid}>
            {products.map((item) => {
              const product = item.productId
              if (!product) return null
              const isOutOfStock = product.stock === 0 || product.stock === undefined

              return (
                <View key={item._id || product._id} style={styles.card}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => router.push(`/(buyer)/product-details?id=${product._id}`)}
                    style={styles.cardTouchable}
                  >
                    {/* Image & Badges */}
                    <View style={styles.imageWrapper}>
                      <Image
                        source={{ uri: getProductImageUrl(product.images?.[0] || product.image) }}
                        style={styles.image}
                        contentFit="cover"
                        transition={150}
                      />

                      {/* Out of stock badge */}
                      {isOutOfStock && (
                        <View style={styles.outOfStockBadge}>
                          <Text style={styles.outOfStockText}>{t('OUT OF STOCK')}</Text>
                        </View>
                      )}

                      {/* Heart remove button */}
                      <TouchableOpacity
                        style={styles.heartBtn}
                        onPress={() => handleRemove(product._id)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <MaterialCommunityIcons name="heart" size={20} color="#ff3d00" />
                      </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <View style={styles.infoBox}>
                      <Text style={styles.sellerName} numberOfLines={1}>
                        {product.sellerId?.shopName || t('Verified Seller')}
                      </Text>
                      <Text style={styles.title} numberOfLines={2}>
                        {t(product.title)}
                      </Text>

                      {/* Rating */}
                      <View style={styles.ratingRow}>
                        <MaterialCommunityIcons name="star" size={14} color="#ffa000" />
                        <Text style={styles.ratingText}>
                          {product.rating || '4.8'} ({product.totalReviews || 0})
                        </Text>
                      </View>

                      {/* Price */}
                      <View style={styles.priceRow}>
                        <Text style={styles.price}>${Number(product.price || 0).toFixed(2)}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Add to Cart button */}
                  <View style={styles.cardFooter}>
                    <TouchableOpacity
                      style={[
                        styles.cartBtn,
                        isOutOfStock && styles.cartBtnDisabled
                      ]}
                      onPress={() => handleAddToCart(product)}
                      disabled={isOutOfStock || cartLoadingId === product._id}
                    >
                      {cartLoadingId === product._id ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <>
                          <MaterialCommunityIcons
                            name={isOutOfStock ? 'cart-off' : 'cart-plus'}
                            size={16}
                            color="#fff"
                          />
                          <Text style={styles.cartBtnText}>
                            {isOutOfStock ? t('Out of Stock') : t('Add to Cart')}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )
            })}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fc' },
  header: {
    flexDirection: 'row',
    justify: 'space-between',
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

  scrollContent: { padding: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '48.5%',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e8ecf4',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  cardTouchable: { flex: 1 },
  imageWrapper: { width: '100%', height: 140, position: 'relative', backgroundColor: '#f0f2f5' },
  image: { width: '100%', height: '100%' },
  outOfStockBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(211, 47, 47, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  outOfStockText: { color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  infoBox: { padding: 10 },
  sellerName: { fontSize: 10, fontWeight: '700', color: '#78909c', marginBottom: 2 },
  title: { fontSize: 13, fontWeight: '700', color: '#1a237e', marginBottom: 6, height: 36, lineHeight: 18 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  ratingText: { fontSize: 11, color: '#666', marginLeft: 4, fontWeight: '600' },
  priceRow: { marginBottom: 4 },
  price: { fontSize: 16, fontWeight: '800', color: '#008b8b' },

  cardFooter: { paddingHorizontal: 10, paddingBottom: 10 },
  cartBtn: {
    backgroundColor: '#1a237e',
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBtnDisabled: {
    backgroundColor: '#b0bec5',
  },
  cartBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },

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
