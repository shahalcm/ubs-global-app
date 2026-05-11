// app/(buyer)/product-details.jsx
import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'

const { width } = Dimensions.get('window')

const PRODUCT = {
  category: 'RENEWABLE ENERGY • WHOLESALE',
  title: 'High-Efficiency Bifacial 600W Solar Module (Grade A)',
  rating: 4.9,
  reviewsCount: 128,
  soldCount: '5.2k',
  price: '$185.00',
  originalPrice: '$245.00',
  discount: '24% OFF',
  minOrder: '50 Units (1 Pallet)',
  description: 'Our premium bifacial modules offer up to 25% additional power gain from the back side. Optimized for large-scale commercial installations and extreme weather durability. Certified for international shipping standards.',
  capacities: ['600W', '550W', '500W'],
  colors: ['#1a1a2e', '#cfd8dc'], // black/dark navy, silver
  supplier: {
    name: 'SolarTrade Global Ltd.',
    years: 8,
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80',
  },
  images: [
    'https://images.unsplash.com/photo-1509391366360-1e97b524c08b?w=800&q=80',
    'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=300&q=80',
    'https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=300&q=80'
  ],
  reviews: [
    {
      id: 1,
      initials: 'JD',
      name: "J. D'Amico",
      date: '2 weeks ago',
      buyerType: 'Verified Bulk Buyer',
      rating: 5,
      text: "Excellent logistics. The pallet arrived in Italy 3 days ahead of schedule. Panels were packed securely with zero transit damage. Output tests match the 600W rating perfectly.",
      hasAttachment: true,
    },
    {
      id: 2,
      initials: 'AR',
      name: "A. Rodriguez",
      date: '1 month ago',
      buyerType: 'Verified Importer',
      rating: 4,
      text: "The vendor was very responsive regarding custom export documentation. Bifaciality is a game changer for our rooftop project. Highly recommend for enterprise-level sourcing.",
      hasAttachment: false,
    }
  ]
}

export default function ProductDetailsScreen() {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedCapacity, setSelectedCapacity] = useState('600W')
  const [selectedColor, setSelectedColor] = useState('#1a1a2e')
  const [activeTab, setActiveTab] = useState('Reviews (128)')

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.push('/(buyer)/drawer')}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>UBS Global</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <TouchableOpacity onPress={() => router.push('/(buyer)/wishlist')}>
            <Text style={styles.cartIcon}>♡</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(buyer)/cart')}>
            <Text style={styles.cartIcon}>🛒</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Main Image */}
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: PRODUCT.images[selectedImage] }}
            style={styles.mainImage}
            resizeMode="cover"
          />
          <View style={styles.floatingActions}>
            <TouchableOpacity style={styles.iconBtn}>
              <Text style={styles.heartIcon}>❤️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Text style={styles.shareIcon}>🔗</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Thumbnails */}
        <View style={styles.thumbnailRow}>
          {PRODUCT.images.map((img, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.thumbnailWrapper,
                selectedImage === index && styles.thumbnailActive
              ]}
              onPress={() => setSelectedImage(index)}
            >
              <Image source={{ uri: img }} style={styles.thumbnail} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Product Details Section */}
        <View style={styles.detailsBox}>
          <Text style={styles.category}>{PRODUCT.category}</Text>
          <Text style={styles.title}>{PRODUCT.title}</Text>
          
          {/* Rating */}
          <View style={styles.ratingRow}>
            <Text style={styles.stars}>★★★★★</Text>
            <Text style={styles.reviewCount}>({PRODUCT.reviewsCount} Reviews)  | </Text>
            <Text style={styles.soldCount}>{PRODUCT.soldCount} Sold</Text>
          </View>

          {/* Pricing */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{PRODUCT.price}</Text>
            <Text style={styles.originalPrice}>{PRODUCT.originalPrice}</Text>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{PRODUCT.discount}</Text>
            </View>
          </View>
          <Text style={styles.minOrder}>Minimum Order: {PRODUCT.minOrder}</Text>

          <Text style={styles.description}>{PRODUCT.description}</Text>

          {/* Power Capacity */}
          <Text style={styles.sectionTitle}>Power Capacity</Text>
          <View style={styles.optionsRow}>
            {PRODUCT.capacities.map((cap) => {
              const isSelected = selectedCapacity === cap
              return (
                <TouchableOpacity
                  key={cap}
                  style={[styles.optionBtn, isSelected && styles.optionBtnActive]}
                  onPress={() => setSelectedCapacity(cap)}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>
                    {cap}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>

          {/* Frame Color */}
          <Text style={styles.sectionTitle}>Frame Color</Text>
          <View style={styles.colorRow}>
            {PRODUCT.colors.map((color) => {
              const isSelected = selectedColor === color
              return (
                <TouchableOpacity
                  key={color}
                  style={[styles.colorBtn, isSelected && styles.colorBtnActive]}
                  onPress={() => setSelectedColor(color)}
                >
                  <View style={[styles.colorInner, { backgroundColor: color }]} />
                </TouchableOpacity>
              )
            })}
          </View>

          {/* Supplier Card */}
          <View style={styles.supplierCard}>
            <Image source={{ uri: PRODUCT.supplier.avatar }} style={styles.supplierAvatar} />
            <View style={styles.supplierInfo}>
              <Text style={styles.supplierName}>{PRODUCT.supplier.name}</Text>
              <Text style={styles.supplierBadge}>🛡 GOLD SUPPLIER • {PRODUCT.supplier.years} YRS</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.chatBtn}>Chat Now</Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity style={styles.outlineBtn}>
            <Text style={styles.outlineBtnText}>♡ Add to Wishlist</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.outlineBtn} onPress={() => router.push('/(buyer)/cart')}>
            <Text style={styles.outlineBtnText}>🛒 Add to Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.solidBtn} onPress={() => router.push('/payment')}>
            <Text style={styles.solidBtnText}>Buy Now</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          {['Reviews (128)', 'Specifications', 'Shipping & Returns'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content (Reviews) */}
        {activeTab === 'Reviews (128)' && (
          <View style={styles.reviewsContainer}>
            {PRODUCT.reviews.map((rev) => (
              <View key={rev.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewerAvatar}>
                    <Text style={styles.reviewerInitials}>{rev.initials}</Text>
                  </View>
                  <View style={styles.reviewerInfo}>
                    <Text style={styles.reviewerName}>{rev.name}</Text>
                    <Text style={styles.reviewerMeta}>
                      {rev.date} • {rev.buyerType}
                    </Text>
                  </View>
                  <Text style={styles.reviewStars}>
                    {Array(rev.rating).fill('★').join('')}
                    {Array(5 - rev.rating).fill('☆').join('')}
                  </Text>
                </View>
                <Text style={styles.reviewText}>{rev.text}</Text>
                {rev.hasAttachment && (
                  <View style={styles.reviewAttachment}>
                    <Text style={styles.docIcon}>📄</Text>
                  </View>
                )}
              </View>
            ))}
            
            <TouchableOpacity style={styles.viewAllBtn}>
              <Text style={styles.viewAllText}>View All 128 Reviews</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(buyer)/home')}>
          <Text style={styles.navIcon}>⌂</Text>
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(buyer)/messages')}>
          <Text style={styles.navIcon}>✉</Text>
          <Text style={styles.navLabel}>Messages</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sellBtn} onPress={() => router.push('/(seller)/dashboard')}>
          <Text style={styles.sellIcon}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(buyer)/products')}>
          <Text style={styles.navIconActive}>▦</Text>
          <Text style={styles.navLabelActive}>Products</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(buyer)/profile')}>
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
    backgroundColor: '#f8f9fa',
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
    color: '#000033',
  },
  topTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000033',
  },
  cartIcon: {
    fontSize: 20,
    color: '#000033',
  },

  scrollContent: {
    paddingBottom: 20,
  },

  // Images
  imageWrapper: {
    width: '100%',
    height: 300,
    position: 'relative',
    backgroundColor: '#fff',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  floatingActions: {
    position: 'absolute',
    top: 16,
    right: 16,
    gap: 12,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  heartIcon: { fontSize: 16 },
  shareIcon: { fontSize: 16 },

  thumbnailRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: -25,
    gap: 12,
  },
  thumbnailWrapper: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  thumbnailActive: {
    borderColor: '#000033',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },

  // Details
  detailsBox: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  category: {
    fontSize: 10,
    fontWeight: '700',
    color: '#008b8b',
    letterSpacing: 1,
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#212121',
    lineHeight: 28,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stars: {
    color: '#fbc02d',
    fontSize: 14,
    marginRight: 6,
  },
  reviewCount: {
    fontSize: 12,
    color: '#555',
    fontWeight: '500',
  },
  soldCount: {
    fontSize: 12,
    color: '#008b8b',
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    marginBottom: 4,
  },
  price: {
    fontSize: 28,
    fontWeight: '800',
    color: '#008b8b', // Teal price
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    marginBottom: 5,
  },
  discountBadge: {
    backgroundColor: '#40c4ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  minOrder: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
  },
  description: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 12,
    color: '#333',
    marginBottom: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  optionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  optionBtnActive: {
    borderColor: '#3f51b5',
    backgroundColor: '#e8eaf6',
  },
  optionText: {
    fontSize: 12,
    color: '#555',
  },
  optionTextActive: {
    color: '#1a237e',
    fontWeight: '700',
  },

  colorRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  colorBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorBtnActive: {
    borderColor: '#3f51b5',
  },
  colorInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  // Supplier
  supplierCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f5fa', // very light purple/gray
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  supplierAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  supplierInfo: {
    flex: 1,
  },
  supplierName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 2,
  },
  supplierBadge: {
    fontSize: 10,
    color: '#008b8b',
    fontWeight: '600',
  },
  chatBtn: {
    color: '#1565c0',
    fontSize: 12,
    fontWeight: '700',
  },

  // Action Buttons
  outlineBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#64b5f6',
    borderRadius: 8,
    paddingVertical: 14,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  outlineBtnText: {
    color: '#0d47a1',
    fontSize: 14,
    fontWeight: '700',
  },
  solidBtn: {
    backgroundColor: '#1a237e', // Navy blue
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  solidBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

  // Tabs
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginHorizontal: 16,
    marginBottom: 20,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#1a237e',
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#1a237e',
  },

  // Reviews
  reviewsContainer: {
    paddingHorizontal: 16,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  reviewHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  reviewerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e8eaf6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  reviewerInitials: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a237e',
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#212121',
  },
  reviewerMeta: {
    fontSize: 10,
    color: '#888',
  },
  reviewStars: {
    color: '#fbc02d',
    fontSize: 12,
  },
  reviewText: {
    fontSize: 12,
    color: '#444',
    lineHeight: 18,
  },
  reviewAttachment: {
    width: 40,
    height: 40,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  docIcon: {
    fontSize: 16,
  },

  viewAllBtn: {
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  viewAllText: {
    color: '#1a237e',
    fontSize: 13,
    fontWeight: '700',
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
