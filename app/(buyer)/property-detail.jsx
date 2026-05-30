import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image,
  Dimensions, ActivityIndicator, Alert, Share, Platform, Linking
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import api from '../../services/api'
import { Ionicons } from '@expo/vector-icons'

const { width } = Dimensions.get('window')

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams()
  const insets = useSafeAreaInsets()
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [chatLoading, setChatLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  useEffect(() => {
    if (id) {
      loadProperty()
      incrementViews()
    }
  }, [id])

  const loadProperty = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/properties/${id}`)
      if (res.data.success) {
        setProperty(res.data.property)
        // Check if user has saved this property (savedBy list containing current user)
        // Since we don't have user ID in this component easily without useAuth, we can manage toggles locally or initialize
        setIsSaved(res.data.property.savedBy?.length > 0)
      }
    } catch (err) {
      console.log(err)
      Alert.alert('Error', 'Failed to load property details')
    } finally {
      setLoading(false)
    }
  }

  const incrementViews = async () => {
    try {
      await api.patch(`/properties/${id}/views`)
    } catch (err) {
      console.log('Increment views error:', err)
    }
  }

  const handleSaveToggle = async () => {
    try {
      const res = await api.post(`/properties/${id}/save`)
      if (res.data.success) {
        setIsSaved(res.data.isSaved)
      }
    } catch (err) {
      console.log(err)
    }
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this property: ${property.title} for $${property.price?.toLocaleString()} on UBS Global Real Estate!`,
        title: property.title
      })
    } catch (err) {
      console.log(err)
    }
  }

  const handleStartChat = async () => {
    setChatLoading(true)
    try {
      const res = await api.post(`/properties/${id}/chat`)
      if (res.data.success && res.data.chatRoomId) {
        router.push({
          pathname: '/(buyer)/chat',
          params: { roomId: res.data.chatRoomId }
        })
      }
    } catch (err) {
      console.log(err)
      Alert.alert('Chat Error', err.response?.data?.message || 'Could not start chat with owner.')
    } finally {
      setChatLoading(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a237e" />
      </View>
    )
  }

  if (!property) {
    return (
      <SafeAreaView style={styles.notFoundContainer}>
        <Text style={styles.notFoundEmoji}>❌</Text>
        <Text style={styles.notFoundText}>Property not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  const images = property.images && property.images.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80']

  return (
    <View style={styles.container}>
      {/* Top Header Controls */}
      <View style={[styles.header, { top: insets.top > 0 ? insets.top + 8 : 12 }]}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleSaveToggle}>
            <Ionicons
              name={isSaved ? "heart" : "heart-outline"}
              size={24}
              color={isSaved ? "#ef4444" : "#333"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]} showsVerticalScrollIndicator={false}>
        {/* Image Slider */}
        <View style={styles.sliderContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const slide = Math.round(e.nativeEvent.contentOffset.x / width)
              if (slide !== activeImageIndex) {
                setActiveImageIndex(slide)
              }
            }}
            scrollEventThrottle={16}
          >
            {images.map((img, index) => (
              <Image
                key={index}
                source={{ uri: img }}
                style={styles.sliderImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {/* Dots Indicator */}
          <View style={styles.dotsContainer}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  activeImageIndex === index && styles.activeDot
                ]}
              />
            ))}
          </View>
        </View>

        {/* Basic Title/Pricing Details */}
        <View style={styles.detailsCard}>
          <View style={styles.badgeRow}>
            <View style={[
              styles.listingTypeBadge,
              property.listingType === 'sale'
                ? styles.saleBadge
                : property.listingType === 'rent'
                  ? styles.rentBadge
                  : styles.leaseBadge
            ]}>
              <Text style={styles.badgeText}>
                FOR {property.listingType?.toUpperCase()}
              </Text>
            </View>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>
                {property.propertyType?.toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={styles.price}>
            ${property.price?.toLocaleString()}
            {property.listingType !== 'sale' ? <Text style={styles.priceUnit}> /mo</Text> : null}
          </Text>

          {property.isNegotiable && (
            <Text style={styles.negotiableTag}>🤝 Price Negotiable</Text>
          )}

          <Text style={styles.title}>{property.title}</Text>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color="#777" />
            <Text style={styles.locationText}>
              {property.address?.street ? `${property.address.street}, ` : ''}
              {property.address?.city}, {property.address?.state}, {property.address?.country}
            </Text>
          </View>
        </View>

        {/* Quick specs overview (Beds, Baths, Area) */}
        <View style={styles.specsOverviewCard}>
          {property.bedrooms && (
            <View style={styles.overviewItem}>
              <Text style={styles.overviewEmoji}>🛏️</Text>
              <Text style={styles.overviewVal}>{property.bedrooms}</Text>
              <Text style={styles.overviewLbl}>Bedrooms</Text>
            </View>
          )}
          {property.bathrooms && (
            <View style={styles.overviewItem}>
              <Text style={styles.overviewEmoji}>🚿</Text>
              <Text style={styles.overviewVal}>{property.bathrooms}</Text>
              <Text style={styles.overviewLbl}>Bathrooms</Text>
            </View>
          )}
          {property.area && (
            <View style={styles.overviewItem}>
              <Text style={styles.overviewEmoji}>📐</Text>
              <Text style={styles.overviewVal}>{property.area}</Text>
              <Text style={styles.overviewLbl}>{property.areaUnit || 'sqft'}</Text>
            </View>
          )}
        </View>

        {/* Specs Table List */}
        <View style={styles.specsCard}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.specsTable}>
            <View style={styles.specTableRow}>
              <Text style={styles.specTableColLbl}>Furnishing</Text>
              <Text style={styles.specTableColVal}>{property.furnishing || 'Unfurnished'}</Text>
            </View>
            <View style={styles.specTableRow}>
              <Text style={styles.specTableColLbl}>Parking</Text>
              <Text style={styles.specTableColVal}>{property.parking ? 'Yes (Covered)' : 'No'}</Text>
            </View>
            {property.floor !== undefined && (
              <View style={styles.specTableRow}>
                <Text style={styles.specTableColLbl}>Floor</Text>
                <Text style={styles.specTableColVal}>{property.floor}</Text>
              </View>
            )}
            {property.yearBuilt !== undefined && (
              <View style={styles.specTableRow}>
                <Text style={styles.specTableColLbl}>Year Built</Text>
                <Text style={styles.specTableColVal}>{property.yearBuilt}</Text>
              </View>
            )}
            <View style={styles.specTableRow}>
              <Text style={styles.specTableColLbl}>Views Count</Text>
              <Text style={styles.specTableColVal}>{property.views || 0} views</Text>
            </View>
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.descCard}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descText}>{property.description}</Text>
        </View>

        {/* Amenities Section */}
        {property.amenities && property.amenities.length > 0 && (
          <View style={styles.amenitiesCard}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesList}>
              {property.amenities.map((item, index) => {
                const label = item.replace(/_/g, ' ')
                return (
                  <View key={index} style={styles.amenityBadge}>
                    <Text style={styles.amenityBadgeText}>✔️ {label}</Text>
                  </View>
                )
              })}
            </View>
          </View>
        )}

        {/* Address Location detail */}
        <View style={styles.descCard}>
          <Text style={styles.sectionTitle}>Address Details</Text>
          <View style={styles.specsTable}>
            {property.address?.street && (
              <View style={styles.specTableRow}>
                <Text style={styles.specTableColLbl}>Street</Text>
                <Text style={styles.specTableColVal}>{property.address.street}</Text>
              </View>
            )}
            <View style={styles.specTableRow}>
              <Text style={styles.specTableColLbl}>City</Text>
              <Text style={styles.specTableColVal}>{property.address?.city}</Text>
            </View>
            <View style={styles.specTableRow}>
              <Text style={styles.specTableColLbl}>State</Text>
              <Text style={styles.specTableColVal}>{property.address?.state}</Text>
            </View>
            <View style={styles.specTableRow}>
              <Text style={styles.specTableColLbl}>Country</Text>
              <Text style={styles.specTableColVal}>{property.address?.country}</Text>
            </View>
            {property.address?.zipCode && (
              <View style={styles.specTableRow}>
                <Text style={styles.specTableColLbl}>Zip Code</Text>
                <Text style={styles.specTableColVal}>{property.address.zipCode}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Seller Info details */}
        <View style={styles.ownerCard}>
          <Text style={styles.sectionTitle}>Listed By Owner</Text>
          <View style={styles.ownerRow}>
            <Image
              source={{
                uri: property.ownerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80'
              }}
              style={styles.bigOwnerAvatar}
            />
            <View style={styles.ownerInfoText}>
              <Text style={styles.bigOwnerName}>{property.ownerName || 'User'}</Text>
              <Text style={styles.ownerSubtitle}>Member since {new Date(property.createdAt).toLocaleDateString()}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Bar (Call & Chat with Seller) */}
      <View style={[styles.bottomActionsBar, { paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 16 }]}>
        {(property.ownerPhone || property.ownerId?.phone) && (
          <TouchableOpacity
            style={styles.callButton}
            onPress={() => Linking.openURL(`tel:${property.ownerPhone || property.ownerId?.phone}`)}
          >
            <Ionicons name="call" size={20} color="#1a237e" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.chatButton}
          onPress={handleStartChat}
          disabled={chatLoading}
        >
          {chatLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="chatbubbles" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.chatButtonText}>Chat with Seller</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fc'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 10,
    left: 10,
    right: 10,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },

  scrollContent: {
    paddingBottom: 100
  },

  // Slider
  sliderContainer: {
    width: width,
    height: 280,
    position: 'relative'
  },
  sliderImage: {
    width: width,
    height: 280
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 15,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)'
  },
  activeDot: {
    backgroundColor: '#fff',
    width: 12
  },

  // Card general
  detailsCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10
  },
  listingTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4
  },
  saleBadge: { backgroundColor: '#22c55e' },
  rentBadge: { backgroundColor: '#f59e0b' },
  leaseBadge: { backgroundColor: '#3b82f6' },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700'
  },
  typeBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  typeBadgeText: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '700'
  },
  price: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a237e',
    marginBottom: 4
  },
  priceUnit: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666'
  },
  negotiableTag: {
    fontSize: 12,
    color: '#1565c0',
    fontWeight: '600',
    marginBottom: 8
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 10,
    lineHeight: 24
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  locationText: {
    fontSize: 13,
    color: '#666',
    flex: 1
  },

  // Specs Overview
  specsOverviewCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginTop: 12,
    paddingVertical: 16,
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eef1f6'
  },
  overviewItem: {
    alignItems: 'center'
  },
  overviewEmoji: {
    fontSize: 22,
    marginBottom: 4
  },
  overviewVal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a237e'
  },
  overviewLbl: {
    fontSize: 11,
    color: '#777',
    marginTop: 2
  },

  // Specs Detail table
  specsCard: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eef1f6'
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a237e',
    marginBottom: 12
  },
  specsTable: {
    gap: 10
  },
  specTableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 8
  },
  specTableColLbl: {
    fontSize: 13,
    color: '#666'
  },
  specTableColVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#222'
  },

  // Description
  descCard: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eef1f6'
  },
  descText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 22
  },

  // Amenities
  amenitiesCard: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eef1f6'
  },
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  amenityBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  amenityBadgeText: {
    fontSize: 12,
    color: '#334155',
    textTransform: 'capitalize'
  },

  // Owner Card
  ownerCard: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eef1f6'
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  bigOwnerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25
  },
  ownerInfoText: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center'
  },
  bigOwnerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222'
  },
  ownerSubtitle: {
    fontSize: 12,
    color: '#777',
    marginTop: 2
  },

  // Floating bottom action bar
  bottomActionsBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eef1f6',
    padding: 16,
    flexDirection: 'row',
    zIndex: 99,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
  },
  callButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#1a237e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#fff',
  },
  chatButton: {
    flex: 1,
    backgroundColor: '#1a237e',
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1a237e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700'
  },

  // Error screen
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 32
  },
  notFoundEmoji: {
    fontSize: 48,
    marginBottom: 16
  },
  notFoundText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20
  },
  backBtn: {
    backgroundColor: '#1a237e',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8
  },
  backBtnText: {
    color: '#fff',
    fontWeight: '700'
  }
})
