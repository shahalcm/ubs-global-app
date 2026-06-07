import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Image } from 'expo-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getProductImageUrl } from '../../../utils/image'
import { router } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { getWishlist, toggleWishlist } from '../../../services/wishlistService'

export default function WishlistScreen() {
  const { t } = useTranslation()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWishlist()
  }, [])

  const loadWishlist = async () => {
    try {
      setLoading(true)
      const res = await getWishlist()
      if (res && res.success) {
        const validProducts = (res.products || []).filter(p => p && p.productId);
        setProducts(validProducts);
      }
    } catch(err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (productId) => {
    try {
      await toggleWishlist(productId)
      setProducts(products.filter(p => p.productId?._id !== productId))
    } catch(err) {
      console.log(err)
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(buyer)/home')} style={styles.backBtn}><MaterialCommunityIcons name="arrow-left" size={24} color="#333" /></TouchableOpacity>
        <Text style={styles.headerTitle}>{t('My Wishlist')} ({products.length})</Text>
        <View style={{ width: 30 }} />
      </View>

      {loading ? (
        <View style={styles.emptyState}><ActivityIndicator size="large" color="#000040" /></View>
      ) : products.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="heart-outline" size={48} color="#ccc" />
          <Text style={styles.emptyTitle}>{t('Your Wishlist is Empty')}</Text>
          <TouchableOpacity style={styles.browseBtn} onPress={() => router.push('/(buyer)/home')}><Text style={styles.browseBtnText}>{t('Browse Products')}</Text></TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 90 }]}
        >
          <View style={styles.grid}>
            {products.map((item) => (
              <View key={item._id} style={styles.card}>
                <View style={styles.imageWrapper}>
                  <Image
                    source={{ uri: getProductImageUrl(item.productId?.images?.[0] || item.productId?.image) }}
                    style={styles.image}
                    contentFit="cover"
                    transition={150}
                  />
                  <TouchableOpacity style={styles.heartBtn} onPress={() => handleRemove(item.productId?._id)}>
                    <MaterialCommunityIcons name="heart" size={20} color="#ff4444" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.infoBox}>
                  <Text style={styles.title} numberOfLines={2}>{t(item.productId?.title)}</Text>
                  <View style={styles.ratingRow}>
                    <MaterialCommunityIcons name="star" size={14} color="#ffa000" />
                    <Text style={styles.ratingText}>{item.productId?.rating} ({item.productId?.totalReviews || 0})</Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>${item.productId?.price}</Text>
                    <Text style={styles.minOrder}>{item.productId?.sellerId?.shopName}</Text>
                  </View>
                  <TouchableOpacity style={styles.cartBtn} onPress={() => router.push(`/(buyer)/product-details?id=${item.productId?._id}`)}>
                    <Text style={styles.cartBtnText}>{t('View Product')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6f8' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eaeaea' },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#000040' },
  scrollContent: { padding: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: '#fff', borderRadius: 12, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#eaeaea' },
  imageWrapper: { width: '100%', height: 140, position: 'relative', backgroundColor: '#eee' },
  image: { width: '100%', height: '100%' },
  heartBtn: { position: 'absolute', top: 8, right: 8, backgroundColor: '#fff', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  infoBox: { padding: 12 },
  title: { fontSize: 12, fontWeight: '700', color: '#333', marginBottom: 6, height: 34 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  ratingText: { fontSize: 10, color: '#666', marginLeft: 4 },
  priceRow: { marginBottom: 12 },
  price: { fontSize: 14, fontWeight: '800', color: '#008b8b' },
  minOrder: { fontSize: 10, color: '#888', marginTop: 2, fontWeight: 'bold' },
  cartBtn: { backgroundColor: '#000040', paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  cartBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#000040', marginBottom: 8, marginTop: 16 },
  browseBtn: { backgroundColor: '#008b8b', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 8, marginTop: 20 },
  browseBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' }
})
