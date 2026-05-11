// app/(buyer)/wishlist.jsx
import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'

const INITIAL_WISHLIST = [
  {
    id: 1,
    title: 'High-Efficiency Bifacial 600W Solar Module',
    image: 'https://images.unsplash.com/photo-1509391366360-1e97b524c08b?w=400&q=80',
    price: '$185.00',
    minOrder: '50 Units',
    rating: 4.9,
    reviews: 128,
  },
  {
    id: 2,
    title: 'Bulk Industrial Lathes (Premium Steel)',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&q=80',
    price: '$4,150.00',
    minOrder: '1 Unit',
    rating: 4.7,
    reviews: 42,
  },
  {
    id: 3,
    title: 'Elite Series Pro Wireless Headphones',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
    price: '$299.00',
    minOrder: '100 Units',
    rating: 4.8,
    reviews: 350,
  },
]

export default function WishlistScreen() {
  const [wishlist, setWishlist] = useState(INITIAL_WISHLIST)

  const removeItem = (id) => {
    setWishlist(wishlist.filter(item => item.id !== id))
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Wishlist ({wishlist.length})</Text>
        <View style={{ width: 30 }} /> {/* spacer */}
      </View>

      {wishlist.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🤍</Text>
          <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
          <Text style={styles.emptyDesc}>Save items you want to review later or purchase in bulk.</Text>
          <TouchableOpacity style={styles.browseBtn} onPress={() => router.push('/(buyer)/home')}>
            <Text style={styles.browseBtnText}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.grid}>
            {wishlist.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.imageWrapper}>
                  <Image source={{ uri: item.image }} style={styles.image} />
                  <TouchableOpacity 
                    style={styles.heartBtn} 
                    onPress={() => removeItem(item.id)}
                  >
                    <Text style={styles.heartIcon}>❤️</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.infoBox}>
                  <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                  
                  <View style={styles.ratingRow}>
                    <Text style={styles.star}>★</Text>
                    <Text style={styles.ratingText}>{item.rating} ({item.reviews})</Text>
                  </View>
                  
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>{item.price}</Text>
                    <Text style={styles.minOrder}>Min: {item.minOrder}</Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.cartBtn}
                    onPress={() => router.push('/(buyer)/cart')}
                  >
                    <Text style={styles.cartBtnText}>Add to Cart</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#f5f6f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  backBtn: { padding: 4 },
  backIcon: { fontSize: 24, color: '#000040' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#000040' },

  scrollContent: {
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eaeaea',
  },
  imageWrapper: {
    width: '100%',
    height: 140,
    position: 'relative',
    backgroundColor: '#eee',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  heartIcon: { fontSize: 14 },
  
  infoBox: {
    padding: 12,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
    height: 34, // lock 2 lines
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  star: { fontSize: 12, color: '#fbc02d', marginRight: 4 },
  ratingText: { fontSize: 10, color: '#666' },
  
  priceRow: {
    marginBottom: 12,
  },
  price: {
    fontSize: 14,
    fontWeight: '800',
    color: '#008b8b', // Teal
  },
  minOrder: {
    fontSize: 10,
    color: '#888',
    marginTop: 2,
  },
  cartBtn: {
    backgroundColor: '#000040',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  cartBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000040',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  browseBtn: {
    backgroundColor: '#008b8b',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
  },
  browseBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
})
