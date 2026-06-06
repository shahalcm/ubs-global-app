import React, { useState, useEffect, useRef } from 'react'
import {
  View, Text, StyleSheet,
  FlatList, TouchableOpacity,
  TextInput, Image,
  Dimensions, ScrollView, ActivityIndicator, Alert
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import api from '../../services/api'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../context/AuthContext'

const { width } = Dimensions.get('window')

const PROPERTY_TYPES = [
  { label: 'All Types', value: '' },
  { label: 'Apartment', value: 'apartment' },
  { label: 'House', value: 'house' },
  { label: 'Villa', value: 'villa' },
  { label: 'Plot/Land', value: 'plot' },
  { label: 'Commercial', value: 'commercial' },
  { label: 'Office', value: 'office' },
  { label: 'Shop', value: 'shop' },
  { label: 'Warehouse', value: 'warehouse' },
  { label: 'Farm', value: 'farm' }
]

const LISTING_TYPES = [
  { label: 'All Deals', value: '' },
  { label: 'For Sale', value: 'sale' },
  { label: 'For Rent', value: 'rent' },
  { label: 'For Lease', value: 'lease' },
  { label: 'My Properties', value: 'my' }
]

const getTimeAgo = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now - date) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function RealEstateScreen() {
  const { user } = useAuth()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [activeType, setActiveType] = useState('')
  const [activeListing, setActiveListing] = useState('')
  const searchTimeout = useRef(null)

  useEffect(() => {
    loadProperties()
  }, [activeType, activeListing])

  const loadProperties = async () => {
    try {
      setLoading(true)
      let res
      if (activeListing === 'my') {
        res = await api.get('/properties/user/my-properties')
      } else {
        res = await api.get('/properties', {
          params: {
            propertyType: activeType || undefined,
            listingType: activeListing || undefined
          }
        })
      }
      if (res.data.success) {
        setProperties(res.data.properties)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsSold = async (id) => {
    Alert.alert(
      'Mark as Sold',
      'Are you sure you want to mark this property as sold? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Sold',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true)
              const res = await api.put(`/properties/${id}`, { status: 'sold' })
              if (res.data.success) {
                Alert.alert('Success', 'Property marked as sold!')
                loadProperties()
              }
            } catch (err) {
              console.log(err)
              Alert.alert('Error', 'Failed to update property status')
            } finally {
              setLoading(false)
            }
          }
        }
      ]
    )
  }

  const handleDeleteProperty = async (id) => {
    Alert.alert(
      'Delete Property',
      'Are you sure you want to delete this property listing permanently?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true)
              const res = await api.delete(`/properties/${id}`)
              if (res.data.success) {
                Alert.alert('Success', 'Property deleted successfully!')
                loadProperties()
              }
            } catch (err) {
              console.log(err)
              Alert.alert('Error', 'Failed to delete property')
            } finally {
              setLoading(false)
            }
          }
        }
      ]
    )
  }

  const handleSearch = (text) => {
    setSearch(text)

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }

    if (!text.trim()) {
      setIsSearching(false)
      setNotFound(false)
      setSearchResults([])
      return
    }

    setIsSearching(true)
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await api.get(
          '/properties/search',
          { params: { q: text } }
        )

        if (!res.data.properties || res.data.properties.length === 0) {
          setNotFound(true)
          setSearchResults([])
        } else {
          setNotFound(false)
          setSearchResults(res.data.properties)
        }
      } catch (error) {
        setNotFound(true)
        setSearchResults([])
      }
    }, 500)
  }

  const handleSaveToggle = async (item, index) => {
    try {
      const res = await api.post(`/properties/${item._id}/save`)
      if (res.data.success) {
        loadProperties()
        if (isSearching) {
          setSearchResults(prev =>
            prev.map(p => p._id === item._id
              ? { ...p, savedBy: res.data.isSaved ? [...p.savedBy, 'dummyId'] : p.savedBy.filter(id => id !== 'dummyId') }
              : p
            )
          )
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  const displayList = isSearching
    ? searchResults
    : properties

  const renderPropertyCard = ({ item, index }) => {
    const ownerIdStr = typeof item.ownerId === 'object' ? item.ownerId?._id : item.ownerId
    const isMyProperty = ownerIdStr === user?._id

    return (
      <TouchableOpacity
        style={styles.propertyCard}
        onPress={() => router.push({
          pathname: '/(buyer)/property-detail',
          params: { id: item._id }
        })}
        activeOpacity={0.9}
      >
        {/* Property Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: item.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80'
            }}
            style={styles.propertyImage}
            resizeMode="cover"
          />

          {/* Badges */}
          <View style={styles.badgesRow}>
            <View style={[
              styles.badge,
              item.listingType === 'sale'
                ? styles.saleBadge
                : item.listingType === 'rent'
                  ? styles.rentBadge
                  : styles.leaseBadge
            ]}>
              <Text style={styles.badgeText}>
                For {item.listingType?.toUpperCase()}
              </Text>
            </View>
            {item.status === 'sold' && (
              <View style={[styles.badge, styles.soldBadge]}>
                <Text style={styles.badgeText}>
                  ❌ SOLD
                </Text>
              </View>
            )}
            {item.isFeatured && (
              <View style={styles.featuredBadge}>
                <Text style={styles.badgeText}>
                  ⭐ Featured
                </Text>
              </View>
            )}
          </View>

          {/* Save button */}
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={() => handleSaveToggle(item, index)}
          >
            <Text style={styles.saveIcon}>❤️</Text>
          </TouchableOpacity>
        </View>

        {/* Property Info */}
        <View style={styles.propInfo}>
          {/* Price */}
          <Text style={styles.propPrice}>
            ${item.price?.toLocaleString()}
            {item.listingType !== 'sale' ? '/mo' : ''}
          </Text>

          {/* Title */}
          <Text style={styles.propTitle} numberOfLines={2}>
            {item.title}
          </Text>

          {/* Specs row */}
          <View style={styles.specsRow}>
            {item.bedrooms && (
              <View style={styles.spec}>
                <Text style={styles.specIcon}>🛏️</Text>
                <Text style={styles.specText}>
                  {item.bedrooms} Bed
                </Text>
              </View>
            )}
            {item.bathrooms && (
              <View style={styles.spec}>
                <Text style={styles.specIcon}>🚿</Text>
                <Text style={styles.specText}>
                  {item.bathrooms} Bath
                </Text>
              </View>
            )}
            {item.area && (
              <View style={styles.spec}>
                <Text style={styles.specIcon}>📐</Text>
                <Text style={styles.specText}>
                  {item.area} {item.areaUnit || 'sqft'}
                </Text>
              </View>
            )}
          </View>

          {/* Location */}
          <View style={styles.locationRow}>
            <Text style={styles.locationPin}>📍</Text>
            <Text style={styles.locationText} numberOfLines={1}>
              {item.address?.city || 'Dubai'}, {item.address?.state || 'UAE'}
            </Text>
          </View>

          {/* Owner row */}
          <View style={styles.ownerRow}>
            <View style={styles.ownerLeft}>
              <Image
                source={{
                  uri: item.ownerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80'
                }}
                style={styles.ownerAvatar}
              />
              <Text style={styles.ownerName}>
                {item.ownerName || 'User'}
              </Text>
            </View>
            <Text style={styles.timeAgo}>
              {getTimeAgo(item.createdAt)}
            </Text>
          </View>

          {/* Management actions for user-owned properties */}
          {isMyProperty && (
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.editBtn]}
                onPress={() => router.push({
                  pathname: '/(buyer)/post-property',
                  params: { id: item._id }
                })}
              >
                <Ionicons name="create-outline" size={15} color="#1a237e" />
                <Text style={[styles.actionBtnText, { color: '#1a237e' }]}>Edit</Text>
              </TouchableOpacity>

              {item.status !== 'sold' && (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.soldBtn]}
                  onPress={() => handleMarkAsSold(item._id)}
                >
                  <Ionicons name="checkmark-done-circle-outline" size={15} color="#2e7d32" />
                  <Text style={[styles.actionBtnText, { color: '#2e7d32' }]}>Sold</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.actionBtn, styles.deleteBtn]}
                onPress={() => handleDeleteProperty(item._id)}
              >
                <Ionicons name="trash-outline" size={15} color="#d32f2f" />
                <Text style={[styles.actionBtnText, { color: '#d32f2f' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.container}>

      {/* TOP BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(buyer)/home')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a237e" />
        </TouchableOpacity>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={16} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search properties..."
            placeholderTextColor="#aaa"
            value={search}
            onChangeText={handleSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearch('')
                setIsSearching(false)
                setNotFound(false)
                setSearchResults([])
              }}
            >
              <Ionicons name="close-circle" size={18} color="#999" style={{ paddingLeft: 4 }} />
            </TouchableOpacity>
          )}
        </View>

        {/* Sell Button */}
        <TouchableOpacity
          style={styles.sellBtn}
          onPress={() => router.push('/(buyer)/post-property')}
        >
          <Text style={styles.sellBtnText}>+ Sell</Text>
        </TouchableOpacity>
      </View>

      {/* 404 Not Found */}
      {notFound && (
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundEmoji}>🏚️</Text>
          <Text style={styles.notFoundTitle}>
            No Properties Found
          </Text>
          <Text style={styles.notFoundSub}>
            No properties match "{search}".
            Only property listings are available here.
          </Text>
          <View style={styles.notFoundCode}>
            <Text style={styles.errorCode}>404</Text>
            <Text style={styles.errorMsg}>
              Property Not Found
            </Text>
          </View>
        </View>
      )}

      {!notFound && (
        <>
          {/* Filters Section */}
          <View style={styles.filtersSection}>
            {/* Listing type tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}
            >
              {LISTING_TYPES.map(type => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.filterChip,
                    activeListing === type.value && styles.filterChipActive
                  ]}
                  onPress={() => {
                    setActiveListing(type.value)
                  }}
                >
                  <Text style={[
                    styles.filterChipText,
                    activeListing === type.value && styles.filterChipTextActive
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Property type chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}
            >
              {PROPERTY_TYPES.map(type => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeChip,
                    activeType === type.value && styles.typeChipActive
                  ]}
                  onPress={() => setActiveType(type.value)}
                >
                  <Text style={[
                    styles.typeChipText,
                    activeType === type.value && styles.typeChipTextActive
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Results count */}
          <View style={styles.resultsRow}>
            <Text style={styles.resultsText}>
              {isSearching
                ? `${searchResults.length} results for "${search}"`
                : `${properties.length} Properties Available`
              }
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1a237e" />
            </View>
          ) : (
            /* Property List */
            <FlatList
              style={styles.flatList}
              data={displayList}
              renderItem={renderPropertyCard}
              keyExtractor={item => item._id}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              onRefresh={loadProperties}
              refreshing={loading}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyEmoji}>🏡</Text>
                  <Text style={styles.emptyText}>
                    No properties available
                  </Text>
                  <TouchableOpacity
                    style={styles.postBtn}
                    onPress={() => router.push('/(buyer)/post-property')}
                  >
                    <Text style={styles.postBtnText}>
                      + Post First Property
                    </Text>
                  </TouchableOpacity>
                </View>
              }
            />
          )}
        </>
      )}
    </SafeAreaView>
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
  // Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 8
  },
  backButton: {
    padding: 4
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f7fc',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#e8ecf4'
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    padding: 0
  },
  sellBtn: {
    backgroundColor: '#1a237e',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10
  },
  sellBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700'
  },

  // 404
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32
  },
  notFoundEmoji: {
    fontSize: 64,
    marginBottom: 16
  },
  notFoundTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a237e',
    marginBottom: 8
  },
  notFoundSub: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24
  },
  notFoundCode: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    width: '100%'
  },
  errorCode: {
    fontSize: 48,
    fontWeight: '700',
    color: '#ef4444'
  },
  errorMsg: {
    fontSize: 16,
    color: '#666',
    marginTop: 4
  },

  // Filters
  filtersSection: {
    backgroundColor: '#fff',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  filterScroll: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#dde3f0',
    backgroundColor: '#fff',
    marginRight: 6
  },
  filterChipActive: {
    backgroundColor: '#1a237e',
    borderColor: '#1a237e'
  },
  filterChipText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500'
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: '700'
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e8ecf4',
    backgroundColor: '#f5f7fc',
    marginRight: 6
  },
  typeChipActive: {
    backgroundColor: '#e3f2fd',
    borderColor: '#29b6f6'
  },
  typeChipText: {
    fontSize: 12,
    color: '#666'
  },
  typeChipTextActive: {
    color: '#1a237e',
    fontWeight: '600'
  },

  resultsRow: {
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  resultsText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500'
  },

  list: {
    padding: 12,
    gap: 16,
    paddingBottom: 100
  },

  // Property Card
  propertyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 12
  },
  imageContainer: {
    position: 'relative',
    height: 200
  },
  propertyImage: {
    width: '100%',
    height: '100%'
  },
  badgesRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    gap: 6
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6
  },
  saleBadge: { backgroundColor: '#22c55e' },
  rentBadge: { backgroundColor: '#f59e0b' },
  leaseBadge: { backgroundColor: '#3b82f6' },
  featuredBadge: { backgroundColor: '#8b5cf6' },
  soldBadge: { backgroundColor: '#ef4444' },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700'
  },
  saveBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  saveIcon: { fontSize: 16 },

  propInfo: { padding: 14 },
  propPrice: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a237e',
    marginBottom: 4
  },
  propTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    marginBottom: 10,
    lineHeight: 22
  },
  specsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 10
  },
  spec: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  specIcon: { fontSize: 14 },
  specText: {
    fontSize: 13,
    color: '#555'
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12
  },
  locationPin: { fontSize: 13 },
  locationText: {
    fontSize: 13,
    color: '#888',
    flex: 1
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10
  },
  ownerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  ownerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14
  },
  ownerName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#444'
  },
  timeAgo: {
    fontSize: 12,
    color: '#aaa'
  },

  // Empty
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40
  },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: {
    fontSize: 16,
    color: '#888',
    marginBottom: 20
  },
  postBtn: {
    backgroundColor: '#1a237e',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12
  },
  postBtnText: {
    color: '#fff',
    fontWeight: '700'
  },
  flatList: {
    flex: 1
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    gap: 8
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4
  },
  editBtn: {
    borderColor: '#1a237e',
    backgroundColor: '#e8eaf6'
  },
  soldBtn: {
    borderColor: '#2e7d32',
    backgroundColor: '#e8f5e9'
  },
  deleteBtn: {
    borderColor: '#d32f2f',
    backgroundColor: '#ffebee'
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600'
  }
})
