// app/(buyer)/products.jsx
import React, { useState, useEffect, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Linking,
  TextInput,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import api from '../../services/api'
import { getCategoryImage } from '../../constants/categories'
import { useTranslation } from 'react-i18next'
import { MaterialCommunityIcons } from '@expo/vector-icons'

const { width } = Dimensions.get('window')
const CARD_WIDTH = (width - 48) / 2

const CATEGORIES = [
  {
    id: '1',
    name: 'Fashion',
    count: '2.4k+ Products',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80',
    popular: true,
  },
  {
    id: '2',
    name: 'Mobiles',
    count: '1.8k+ Products',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80',
    popular: true,
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
    popular: true,
  },
  {
    id: '5',
    name: 'Electronics',
    count: '4.5k+ Products',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80',
    popular: true,
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
    popular: true,
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
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&q=80',
    popular: true,
  },
  {
    id: '12',
    name: 'Oils',
    count: '400+ Products',
    image: 'oils',
  },
]

export default function ProductsScreen() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n?.dir?.() === 'rtl' || ['ar', 'ur', 'he', 'fa'].includes(i18n?.language)
  const insets = useSafeAreaInsets()

  const [categories, setCategories] = useState(CATEGORIES)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all') // 'all' | 'popular'

  const [supportEmail, setSupportEmail] = useState("ubsimportingexporting@gmail.com")
  const [supportPhone, setSupportPhone] = useState("9544755008")

  const handleRequestQuote = () => {
    Alert.alert(
      t("Request a Quote"),
      t("Our global network of verified vendors can source specific wholesale products for your business needs."),
      [
        {
          text: t("Email Requirements"),
          onPress: () => Linking.openURL(`mailto:${supportEmail}?subject=Wholesale Sourcing & Quote Request`)
        },
        {
          text: t("Call Hotline"),
          onPress: () => Linking.openURL(`tel:${supportPhone}`)
        },
        {
          text: t("Cancel"),
          style: "cancel"
        }
      ]
    )
  }

  const getTranslatedCategoryName = React.useCallback((item) => {
    if (!item) return ''
    const currentLang = i18n?.language || 'en'
    return (
      item.translations?.[currentLang]?.name ||
      t(item.name) ||
      item.name
    )
  }, [i18n?.language, t])

  const loadCategories = React.useCallback(async () => {
    try {
      setLoading(true)
      setHasError(false)
      const res = await api.get('/categories')
      if (res?.data?.categories) {
        const apiCategories = res.data.categories
        const merged = [...CATEGORIES]
        apiCategories.forEach(apiCat => {
          const index = merged.findIndex(c => 
            c.name.replace(/\s+/g, ' ').toLowerCase() === apiCat.name.replace(/\s+/g, ' ').toLowerCase()
          )
          if (index !== -1) {
            merged[index] = { ...merged[index], ...apiCat, name: merged[index].name }
          } else {
            merged.push({
              id: apiCat._id,
              count: '0+ Products',
              ...apiCat
            })
          }
        })
        setCategories(merged)
      }
    } catch (err) {
      console.log('Error loading categories in products screen:', err)
      setHasError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true)
    await loadCategories()
    setRefreshing(false)
  }, [loadCategories])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCategories()

    const fetchSupport = async () => {
      try {
        const res = await api.get('/public-settings')
        if (res.data?.success && res.data.settings) {
          if (res.data.settings.supportEmail) setSupportEmail(res.data.settings.supportEmail)
          if (res.data.settings.contactPhone) setSupportPhone(res.data.settings.contactPhone)
        }
      } catch (err) {
        console.log("Failed to load public support settings:", err)
      }
    }
    fetchSupport()
  }, [loadCategories])

  const filteredCategories = useMemo(() => {
    let result = categories
    if (selectedFilter === 'popular') {
      result = result.filter(c => c.popular)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      result = result.filter(item => {
        const engName = (item.name || '').toLowerCase()
        const translatedName = getTranslatedCategoryName(item).toLowerCase()
        return engName.includes(q) || translatedName.includes(q)
      })
    }
    return result
  }, [categories, selectedFilter, searchQuery, getTranslatedCategoryName])

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

  const renderCategory = ({ item }) => {
    const translatedName = getTranslatedCategoryName(item)
    return (
      <TouchableOpacity
        style={styles.categoryCard}
        onPress={() => handleCategoryPress(item)}
        activeOpacity={0.85}
      >
        <Image
          source={getCategoryImage(item.name, item.image)}
          style={styles.categoryImage}
          resizeMode="cover"
        />
        <View style={[styles.categoryInfo, isRTL && { alignItems: 'flex-end' }]}>
          <Text style={[styles.categoryName, isRTL && { textAlign: 'right' }]} numberOfLines={1}>
            {translatedName}
          </Text>
          <Text style={[styles.categoryCount, isRTL && { textAlign: 'right' }]}>
            {t(item.count) || item.count || `0+ ${t('categories.products', t('Products'))}`}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Bar */}
      <View style={[styles.topBar, isRTL && { flexDirection: 'row-reverse' }]}>
        <TouchableOpacity
          onPress={() => router.push('/(buyer)/drawer')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>UBS Global</Text>
        <TouchableOpacity
          onPress={() => router.push('/(buyer)/cart')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.bellIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredCategories}
        renderItem={renderCategory}
        keyExtractor={(item) => (item.id || item._id || item.name).toString()}
        numColumns={2}
        columnWrapperStyle={[styles.row, isRTL && { flexDirection: 'row-reverse' }]}
        refreshing={refreshing}
        onRefresh={onRefresh}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1a237e']}
            tintColor="#1a237e"
          />
        }
        ListHeaderComponent={
          <View style={styles.pageHeader}>
            <Text style={[styles.pageTitle, isRTL && { textAlign: 'right' }]}>
              {t('categories.title', t('All Categories'))}
            </Text>
            <Text style={[styles.pageSubtitle, isRTL && { textAlign: 'right' }]}>
              {t("Explore a world of products curated for international logistics and global trade excellence.")}
            </Text>

            {/* Search Bar */}
            <View style={[styles.searchBox, isRTL && { flexDirection: 'row-reverse' }]}>
              <MaterialCommunityIcons name="magnify" size={20} color="#757575" />
              <TextInput
                style={[styles.searchInput, isRTL && { textAlign: 'right' }]}
                placeholder={t('categories.search', t('Search categories...'))}
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
                autoCapitalize="none"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <MaterialCommunityIcons name="close-circle" size={18} color="#999" />
                </TouchableOpacity>
              )}
            </View>

            {/* Filter Tabs */}
            <View style={[styles.filterTabsRow, isRTL && { flexDirection: 'row-reverse' }]}>
              <TouchableOpacity
                style={[
                  styles.filterTab,
                  selectedFilter === 'all' && styles.filterTabActive,
                ]}
                onPress={() => setSelectedFilter('all')}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    selectedFilter === 'all' && styles.filterTabTextActive,
                  ]}
                >
                  {t('categories.all', t('All'))}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterTab,
                  selectedFilter === 'popular' && styles.filterTabActive,
                ]}
                onPress={() => setSelectedFilter('popular')}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    selectedFilter === 'popular' && styles.filterTabTextActive,
                  ]}
                >
                  {t('categories.popular', t('Popular'))}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Error / Retry Banner */}
            {hasError && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{t('Failed to load categories')}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={loadCategories}>
                  <Text style={styles.retryBtnText}>{t('categories.retry', t('Retry'))}</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Loading Indicator */}
            {loading && !refreshing && (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color="#1a237e" />
                <Text style={styles.loadingText}>{t('categories.loading', t('Loading...'))}</Text>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>
                {t('categories.noCategories', t('No categories found'))}
              </Text>
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  style={styles.clearSearchBtn}
                  onPress={() => setSearchQuery('')}
                >
                  <Text style={styles.clearSearchText}>{t('Clear Search')}</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null
        }
        ListFooterComponent={
          <>
            {/* Can't find card */}
            <View style={styles.findCard}>
              <Text style={[styles.findTitle, isRTL && { textAlign: 'right' }]}>
                {t("Can't find what you're looking for?")}
              </Text>
              <Text style={[styles.findDesc, isRTL && { textAlign: 'right' }]}>
                {t("Our global network of verified vendors can source specific wholesale products for your business needs.")}
              </Text>
              <TouchableOpacity 
                style={styles.findBtn}
                onPress={handleRequestQuote}
              >
                <Text style={styles.findBtnText}>
                  {t("Request a Quote")}
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
    paddingTop: 16,
    paddingBottom: 12,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a237e',
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    marginBottom: 14,
  },

  // Search Box
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    paddingVertical: 0,
  },

  // Filter Tabs
  filterTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d7dce6',
  },
  filterTabActive: {
    backgroundColor: '#1a237e',
    borderColor: '#1a237e',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  filterTabTextActive: {
    color: '#fff',
  },

  // Error State
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: '#c62828',
    fontSize: 13,
    fontWeight: '500',
  },
  retryBtn: {
    backgroundColor: '#c62828',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  // Loading Box
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  loadingText: {
    fontSize: 13,
    color: '#666',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 10,
  },
  clearSearchBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1a237e',
  },
  clearSearchText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
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
    height: 130,
    backgroundColor: '#e8ecf4',
  },
  categoryInfo: {
    padding: 12,
  },
  categoryName: {
    fontSize: 14,
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