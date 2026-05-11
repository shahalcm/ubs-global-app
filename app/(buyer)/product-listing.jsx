// app/(buyer)/product-listing.jsx
import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ScrollView,
  Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'

const { width } = Dimensions.get('window')
const CARD_WIDTH = (width - 48) / 2

const getCategoryData = (category) => {
  const normalized = (category || 'Machinery').toLowerCase()
  if (normalized.includes('fashion') || normalized.includes('cosmetics')) {
    return {
      subcategories: ['All Fashion', 'Men', 'Women', 'Kids', 'Accessories'],
      products: [
        { id: '1', name: 'Premium Cotton T-Shirt', rating: 4.8, reviews: 120, price: '$25.00', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80' },
        { id: '2', name: 'Classic Denim Jacket', rating: 4.9, reviews: 85, price: '$65.00', image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&q=80' },
        { id: '3', name: 'Leather Crossbody Bag', rating: 4.7, reviews: 210, price: '$110.00', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80' },
        { id: '4', name: 'Running Sneakers', rating: 4.6, reviews: 340, price: '$85.00', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80' },
      ]
    }
  }
  if (normalized.includes('electronic') || normalized.includes('mobile')) {
    return {
      subcategories: ['All Electronics', 'Smartphones', 'Laptops', 'Audio', 'Accessories'],
      products: [
        { id: '1', name: 'Pro Smartwatch Series 8', rating: 4.9, reviews: 520, price: '$299.00', image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&q=80' },
        { id: '2', name: 'Noise Cancelling Headphones', rating: 4.8, reviews: 890, price: '$199.00', image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&q=80' },
        { id: '3', name: 'Ultra HD 4K Monitor', rating: 4.7, reviews: 150, price: '$350.00', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&q=80' },
        { id: '4', name: 'Wireless Charging Pad', rating: 4.5, reviews: 320, price: '$45.00', image: 'https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?w=400&q=80' },
      ]
    }
  }
  if (normalized.includes('furniture') || normalized.includes('decor')) {
    return {
      subcategories: ['All Furniture', 'Living Room', 'Bedroom', 'Office', 'Outdoor'],
      products: [
        { id: '1', name: 'Modern Velvet Sofa', rating: 4.9, reviews: 45, price: '$899.00', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80' },
        { id: '2', name: 'Ergonomic Office Chair', rating: 4.8, reviews: 112, price: '$150.00', image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=400&q=80' },
        { id: '3', name: 'Oak Wood Dining Table', rating: 4.7, reviews: 60, price: '$450.00', image: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=400&q=80' },
        { id: '4', name: 'Minimalist Bed Frame', rating: 4.6, reviews: 88, price: '$320.00', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&q=80' },
      ]
    }
  }

  // Default fallback
  const fallbackLabel = category || 'Logistics'
  return {
    subcategories: ['All Items', 'Top Rated', 'New Arrivals', 'Discounted'],
    products: [
      { id: '1', name: `${fallbackLabel} Pro Item 1`, rating: 4.9, reviews: 124, price: '$12,499.00', image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&q=80' },
      { id: '2', name: `Smart Modular ${fallbackLabel}`, rating: 4.7, reviews: 89, price: '$4,250.00', image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&q=80' },
      { id: '3', name: `Electric ${fallbackLabel} 3000`, rating: 4.8, reviews: 215, price: '$2,899.00', image: 'https://images.unsplash.com/photo-1581092160562-40aa08e49be4?w=400&q=80' },
      { id: '4', name: `Heavy Duty ${fallbackLabel}`, rating: 5.0, reviews: 56, price: '$850.00', image: 'https://images.unsplash.com/photo-1565793979139-d2957e040c42?w=400&q=80' },
    ]
  }
}

export default function ProductListingScreen() {
  const { category } = useLocalSearchParams()
  const categoryData = getCategoryData(category)
  const [activeTab, setActiveTab] = useState(categoryData.subcategories[0])
  const [wishlist, setWishlist] = useState({})

  const toggleWishlist = (id) => {
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() =>
        router.push({
          pathname: '/(buyer)/product-details',
          params: { id: item.id },
        })
      }
      activeOpacity={0.9}
    >
      {/* Image */}
      <View style={styles.imageBox}>
        <Image
          source={{ uri: item.image }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.wishlistBtn}
          onPress={() => toggleWishlist(item.id)}
        >
          <Text style={styles.wishlistIcon}>
            {wishlist[item.id] ? '❤️' : '🤍'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.ratingRow}>
          <Text style={styles.starIcon}>☆</Text>
          <Text style={styles.ratingText}>
            {item.rating} ({item.reviews} reviews)
          </Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceText}>{item.price}</Text>
          <TouchableOpacity style={styles.cartBtn}>
            <Text style={styles.cartBtnIcon}>🛒</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle} numberOfLines={1}>
          {category || 'Logistics Equipment'}
        </Text>
        <View style={styles.topRight}>
          <TouchableOpacity style={styles.topIconBtn}>
            <Text style={styles.topIcon}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.topIconBtn}
            onPress={() => router.push('/(buyer)/wishlist')}
          >
            <Text style={styles.topIcon}>♡</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.topIconBtn}
            onPress={() => router.push('/(buyer)/cart')}
          >
            <Text style={styles.topIcon}>🛒</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Subcategory Tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          {categoryData.subcategories.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabChip,
                activeTab === tab && styles.tabChipActive,
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results Count + Sort */}
      <View style={styles.resultsRow}>
        <Text style={styles.resultsText}>Showing {categoryData.products.length} items</Text>
        <TouchableOpacity style={styles.sortBtn}>
          <Text style={styles.sortIcon}>≡</Text>
          <Text style={styles.sortText}>Sort</Text>
        </TouchableOpacity>
      </View>

      {/* Product Grid */}
      <FlatList
        data={categoryData.products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      />

      {/* Sort & Filter Floating Button */}
      <View style={styles.fabWrapper}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/(buyer)/product-filter')}
        >
          <Text style={styles.fabIcon}>≡</Text>
          <Text style={styles.fabText}>Sort & Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/(buyer)/home')}
        >
          <Text style={styles.navIcon}>⌂</Text>
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/(buyer)/messages')}
        >
          <Text style={styles.navIcon}>✉</Text>
          <Text style={styles.navLabel}>Messages</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sellBtn}
          onPress={() => router.push('/(seller)/dashboard')}
        >
          <Text style={styles.sellIcon}>+</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/(buyer)/products')}
        >
          <Text style={styles.navIconActive}>▦</Text>
          <Text style={styles.navLabelActive}>Products</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/(buyer)/profile')}
        >
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fc',
  },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 8,
  },
  backArrow: {
    fontSize: 22,
    color: '#1a237e',
    fontWeight: '700',
  },
  topTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#1a237e',
  },
  topRight: {
    flexDirection: 'row',
    gap: 10,
  },
  topIconBtn: {
    padding: 2,
  },
  topIcon: {
    fontSize: 20,
    color: '#1a237e',
  },

  // Tabs
  tabsWrapper: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabsScroll: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  tabChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#dde3f0',
    backgroundColor: '#fff',
  },
  tabChipActive: {
    backgroundColor: '#29b6f6',
    borderColor: '#29b6f6',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#555',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '700',
  },

  // Results Row
  resultsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  resultsText: {
    fontSize: 13,
    color: '#666',
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortIcon: {
    fontSize: 16,
    color: '#1a237e',
  },
  sortText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a237e',
  },

  // Grid
  grid: {
    paddingHorizontal: 16,
    paddingBottom: 160,
    paddingTop: 8,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  // Product Card
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  imageBox: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#e8ecf4',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wishlistIcon: {
    fontSize: 15,
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a237e',
    marginBottom: 6,
    lineHeight: 18,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  starIcon: {
    fontSize: 13,
    color: '#f59e0b',
  },
  ratingText: {
    fontSize: 11,
    color: '#888',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a237e',
  },
  cartBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBtnIcon: {
    fontSize: 15,
  },

  // FAB
  fabWrapper: {
    position: 'absolute',
    bottom: 82,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a237e',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 30,
    gap: 8,
    shadowColor: '#1a237e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 18,
    color: '#fff',
  },
  fabText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },

  // Bottom Nav
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: 8,
  },
  navItem: {
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  navIcon: {
    fontSize: 22,
    color: '#999',
  },
  navIconActive: {
    fontSize: 22,
    color: '#1a237e',
  },
  navLabel: {
    fontSize: 10,
    color: '#999',
  },
  navLabelActive: {
    fontSize: 10,
    color: '#1a237e',
    fontWeight: '600',
  },
  sellBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1a237e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#1a237e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  sellIcon: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
    marginTop: -2,
  },
})