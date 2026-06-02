// app/(buyer)/products.jsx
import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const { width } = Dimensions.get('window')
const CARD_WIDTH = (width - 48) / 2

const CATEGORIES = [
  {
    id: '1',
    name: 'Fashion',
    count: '2.4k+ Products',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80',
  },
  {
    id: '2',
    name: 'Mobiles',
    count: '1.8k+ Products',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80',
  },
  {
    id: '3',
    name: 'Furniture',
    count: '950+ Products',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
  },
  {
    id: '4',
    name: 'Industrial',
    count: '3.2k+ Products',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&q=80',
  },
  {
    id: '5',
    name: 'Electronics',
    count: '4.5k+ Products',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80',
  },
  {
    id: '6',
    name: 'Home Decor',
    count: '1.1k+ Products',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80',
  },
  {
    id: '7',
    name: 'Grocery',
    count: '2.1k+ Products',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80',
  },
  {
    id: '8',
    name: 'Cosmetics',
    count: '1.3k+ Products',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80',
  },
  {
    id: '9',
    name: 'Medicines',
    count: '800+ Products',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80',
  },
  {
    id: '10',
    name: 'Real Estate',
    count: '500+ Listings',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=80',
  },
  {
    id: '11',
    name: 'Machinery',
    count: '1.6k+ Products',
    image: 'https://images.unsplash.com/photo-1565793979139-d2957e040c42?w=400&q=80',
  },
  {
    id: '12',
    name: 'Oils',
    count: '400+ Products',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80',
  },
]

export default function ProductsScreen() {
  const insets = useSafeAreaInsets()
  const handleCategoryPress = (item) => {
    if (item.name === 'Real Estate') {
      router.push('/(buyer)/real-estate')
    } else {
      router.push({
        pathname: '/(buyer)/product-listing',
        params: { category: item.name },
      })
    }
  }

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(item)}
      activeOpacity={0.85}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.categoryImage}
        resizeMode="cover"
      />
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>
          {item.name}
        </Text>
        <Text style={styles.categoryCount}>
          {item.count}
        </Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.push('/(buyer)/drawer')}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>UBS Global</Text>
        <TouchableOpacity
          onPress={() => router.push('/(buyer)/cart')}
        >
          <Text style={styles.bellIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={CATEGORIES}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={
          <View style={styles.pageHeader}>
            <Text style={styles.pageTitle}>
              All Categories
            </Text>
            <Text style={styles.pageSubtitle}>
              Explore a world of products curated for
              international logistics and global trade
              excellence.
            </Text>
          </View>
        }
        ListFooterComponent={
          <>
            {/* Can't find card */}
            <View style={styles.findCard}>
              <Text style={styles.findTitle}>
                Can't find what you're looking for?
              </Text>
              <Text style={styles.findDesc}>
                Our global network of verified vendors
                can source specific wholesale products
                for your business needs.
              </Text>
              <TouchableOpacity style={styles.findBtn}>
                <Text style={styles.findBtnText}>
                  Request a Quote
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ height: 20 }} />
          </>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

    </View>
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
  bellIcon: {
    fontSize: 22,
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },

  // Page Header
  pageHeader: {
    paddingTop: 20,
    paddingBottom: 16,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#1a237e',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },

  // Grid Row
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  // Category Card
  categoryCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  categoryImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#e8ecf4',
  },
  categoryInfo: {
    padding: 12,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a237e',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
    color: '#888',
  },

  // Find Card
  findCard: {
    backgroundColor: '#1a237e',
    borderRadius: 20,
    padding: 24,
    marginTop: 8,
    marginBottom: 16,
  },
  findTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 10,
    lineHeight: 28,
  },
  findDesc: {
    fontSize: 13,
    color: '#c5cae9',
    lineHeight: 20,
    marginBottom: 20,
  },
  findBtn: {
    backgroundColor: '#29b6f6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  findBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
})