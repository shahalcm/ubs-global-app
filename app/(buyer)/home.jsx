// app/(buyer)/home.jsx
import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'

const { width } = Dimensions.get('window')

const CATEGORIES = [
  { id: '1', name: 'Fashion', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=200&q=80' },
  { id: '2', name: 'Mobiles', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&q=80' },
  { id: '3', name: 'Furniture', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&q=80' },
  { id: '4', name: 'Cosmetics', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&q=80' },
  { id: '5', name: 'Grocery', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80' },
  { id: '6', name: 'Electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&q=80' },
  { id: '7', name: 'Medicines', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&q=80' },
  { id: '8', name: 'Home &\nKitchen', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&q=80' },
  { id: '9', name: 'Job Portal', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=200&q=80' },
  { id: '10', name: 'Service Portal', image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&q=80' },
  { id: '11', name: 'Real Estate', image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&q=80' },
  { id: '12', name: 'Building\nMaterials', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200&q=80' },
  { id: '13', name: 'Machinery', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&q=80' },
  { id: '14', name: 'Oils', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&q=80' },
]

const FEATURED_PRODUCTS = [
  {
    id: '1',
    name: 'Smartwatch X1',
    category: 'Electronics',
    price: '$199.00',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&q=80',
  },
  {
    id: '2',
    name: 'Leather Handbag',
    category: 'Fashion',
    price: '$149.00',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80',
  },
  {
    id: '3',
    name: 'Wireless Earbuds',
    category: 'Electronics',
    price: '$89.00',
    image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&q=80',
  },
]

const BANNERS = [
  {
    id: '1',
    title: 'Global Shipping & Logistics',
    subtitle: 'LOGISTICS EXPERT',
    btn: 'Get a Quote',
    image: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=700&q=80',
  },
  {
    id: '2',
    title: 'Premium Import Deals',
    subtitle: 'LIMITED OFFER',
    btn: 'Shop Now',
    image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=700&q=80',
  },
]

export default function HomeScreen() {
  const [search, setSearch] = useState('')
  const [activeBanner, setActiveBanner] = useState(0)

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => router.push({
        pathname: '/(buyer)/product-listing',
        params: { category: item.name }
      })}
    >
      <View style={styles.categoryCircle}>
        <Image
          source={{ uri: item.image }}
          style={styles.categoryImage}
        />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  )

  const renderFeaturedProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push({
        pathname: '/(buyer)/product-details',
        params: { id: item.id }
      })}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <Text style={styles.productCategory}>{item.category}</Text>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price}</Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>

      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.push('/(buyer)/drawer')}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>UBS Global</Text>
        <View style={styles.topRight}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push('/(buyer)/wishlist')}
          >
            <Text style={styles.topIcon}>♡</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push('/(buyer)/cart')}
          >
            <Text style={styles.topIcon}>🛒</Text>
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>2</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Search Bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search products, jobs, real estate..."
              placeholderTextColor="#aaa"
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Text style={styles.filterIcon}>⚙</Text>
          </TouchableOpacity>
        </View>

        {/* Browse by Category */}
        <Text style={styles.sectionTitle}>Browse by Category</Text>
        <FlatList
          data={CATEGORIES}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          numColumns={4}
          scrollEnabled={false}
          columnWrapperStyle={styles.categoryRow}
          contentContainerStyle={styles.categoryGrid}
        />

        {/* Banner Slider */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(
              e.nativeEvent.contentOffset.x / (width - 40)
            )
            setActiveBanner(index)
          }}
          style={styles.bannerScroll}
        >
          {BANNERS.map((banner) => (
            <View key={banner.id} style={styles.bannerCard}>
              <Image
                source={{ uri: banner.image }}
                style={styles.bannerImage}
                resizeMode="cover"
              />
              <View style={styles.bannerOverlay}>
                <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
                <Text style={styles.bannerTitle}>{banner.title}</Text>
                <TouchableOpacity style={styles.bannerBtn}>
                  <Text style={styles.bannerBtnText}>{banner.btn}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Banner Dots */}
        <View style={styles.dotsRow}>
          {BANNERS.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, activeBanner === i && styles.dotActive]}
            />
          ))}
        </View>

        {/* Featured Products */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Featured Products</Text>
          <TouchableOpacity onPress={() => router.push('/(buyer)/products')}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={FEATURED_PRODUCTS}
          renderItem={renderFeaturedProduct}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredList}
        />

        {/* Secure Payments Card */}
        <View style={styles.secureCard}>
          <Text style={styles.secureTitle}>Secure Global Payments</Text>
          <Text style={styles.secureDesc}>
            Our trade assurance guarantees protection from payment to delivery
            for all international orders. Safe, secure, and fully tracked.
          </Text>
          <View style={styles.secureBadgeRow}>
            <View style={styles.secureBadge}>
              <Text style={styles.secureBadgeIcon}>✅</Text>
              <Text style={styles.secureBadgeText}>Verified Vendors</Text>
            </View>
            <View style={styles.secureBadge}>
              <Text style={styles.secureBadgeIcon}>🔒</Text>
              <Text style={styles.secureBadgeText}>Escrow Support</Text>
            </View>
          </View>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&q=80',
            }}
            style={styles.secureImage}
            resizeMode="cover"
          />
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIconActive}>⌂</Text>
          <Text style={styles.navLabelActive}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/(buyer)/messages')}
        >
          <Text style={styles.navIcon}>✉</Text>
          <Text style={styles.navLabel}>Messages</Text>
        </TouchableOpacity>

        {/* Center Sell Button */}
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
          <Text style={styles.navIcon}>▦</Text>
          <Text style={styles.navLabel}>Products</Text>
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

const ITEM_WIDTH = (width - 40) / 4

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
  },
  menuIcon: {
    fontSize: 22,
    color: '#1a237e',
  },
  topTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a237e',
  },
  topRight: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  iconBtn: {
    position: 'relative',
  },
  topIcon: {
    fontSize: 22,
    color: '#1a237e',
  },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#29b6f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    fontSize: 9,
    color: '#fff',
    fontWeight: '700',
  },

  scroll: {
    flexGrow: 1,
    paddingBottom: 20,
  },

  // Search
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    backgroundColor: '#fff',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f7fc',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e8ecf4',
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  filterBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#f5f7fc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e8ecf4',
  },
  filterIcon: {
    fontSize: 18,
    color: '#1a237e',
  },

  // Section
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a237e',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  viewAll: {
    fontSize: 13,
    color: '#29b6f6',
    fontWeight: '600',
  },

  // Categories
  categoryGrid: {
    paddingHorizontal: 16,
  },
  categoryRow: {
    justifyContent: 'flex-start',
    gap: 0,
  },
  categoryItem: {
    width: ITEM_WIDTH,
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: '#e8ecf4',
    marginBottom: 6,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryName: {
    fontSize: 11,
    color: '#444',
    textAlign: 'center',
    lineHeight: 15,
  },

  // Banner
  bannerScroll: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  bannerCard: {
    width: width - 40,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  bannerSubtitle: {
    fontSize: 10,
    color: '#29b6f6',
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  bannerBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#29b6f6',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bannerBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ccc',
  },
  dotActive: {
    backgroundColor: '#1a237e',
    width: 16,
  },

  // Featured Products
  featuredList: {
    paddingHorizontal: 16,
    gap: 14,
  },
  productCard: {
    width: 180,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  productImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#f5f5f5',
  },
  productInfo: {
    padding: 10,
  },
  productCategory: {
    fontSize: 11,
    color: '#888',
    marginBottom: 2,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#29b6f6',
  },

  // Secure Card
  secureCard: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  secureTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a237e',
    marginBottom: 10,
  },
  secureDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    marginBottom: 14,
  },
  secureBadgeRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  secureBadgeIcon: {
    fontSize: 14,
  },
  secureBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a237e',
  },
  secureImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
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