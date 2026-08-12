import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Dimensions,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { getProductImageUrl } from '../../utils/image';
import { getRecentlyViewed, clearRecentlyViewed, removeRecentlyViewed } from '../../services/recentlyViewed';
import { toggleWishlist } from '../../services/wishlistService';
import { useCart } from '../../context/CartContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 44) / 2;

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest' },
  { id: 'oldest', label: 'Oldest' },
  { id: 'price_low', label: 'Price: Low to High' },
  { id: 'price_high', label: 'Price: High to Low' },
];

export default function RecentlyViewedScreen() {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const fetchRecentProducts = useCallback(async () => {
    try {
      const items = await getRecentlyViewed();
      setProducts(items || []);
    } catch (err) {
      console.error('Failed to load recently viewed products:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRecentProducts();
    }, [fetchRecentProducts])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRecentProducts();
  }, [fetchRecentProducts]);

  const handleClearAll = () => {
    Alert.alert(
      t('Clear History'),
      t('Are you sure you want to clear your recently viewed items history?'),
      [
        { text: t('Cancel'), style: 'cancel' },
        {
          text: t('Clear'),
          style: 'destructive',
          onPress: async () => {
            await clearRecentlyViewed();
            setProducts([]);
          },
        },
      ]
    );
  };

  const handleRemoveSingle = async (id) => {
    await removeRecentlyViewed(id);
    setProducts((prev) => prev.filter((item) => (item._id || item.id) !== id));
  };

  const filteredAndSortedProducts = useMemo(() => {
    let list = [...products].filter(
      (item) => item && (item._id || item.id) && !item.isDeleted && item.status !== 'inactive'
    );

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          (item.title || item.name || '').toLowerCase().includes(q) ||
          (item.category?.name || item.category || '').toLowerCase().includes(q) ||
          (item.brand || '').toLowerCase().includes(q)
      );
    }

    if (sortBy === 'oldest') {
      list.reverse();
    } else if (sortBy === 'price_low') {
      list.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (sortBy === 'price_high') {
      list.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    }

    return list;
  }, [products, searchQuery, sortBy]);

  const renderProductCard = ({ item }) => {
    const isOutOfStock = Number(item.stock ?? 0) <= 0;
    const hasDiscount = item.comparePrice && Number(item.comparePrice) > Number(item.price);
    const discountPercent = hasDiscount
      ? Math.round(((item.comparePrice - item.price) / item.comparePrice) * 100)
      : 0;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: '/(buyer)/product-details',
            params: { id: item._id || item.id },
          })
        }
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: getProductImageUrl(item.images?.[0] || item.image) }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
          {hasDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discountPercent}%</Text>
            </View>
          )}
          {isOutOfStock && (
            <View style={styles.outOfStockBadge}>
              <Text style={styles.outOfStockText}>{t('Out of Stock')}</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.favBtn}
            onPress={(e) => {
              e.stopPropagation();
              toggleWishlist(item._id || item.id);
              Alert.alert(t('Wishlist'), t('Updated wishlist!'));
            }}
          >
            <MaterialCommunityIcons name="heart-outline" size={16} color="#d32f2f" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={(e) => {
              e.stopPropagation();
              handleRemoveSingle(item._id || item.id);
            }}
          >
            <MaterialCommunityIcons name="close" size={14} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.info}>
          <Text style={styles.category} numberOfLines={1}>
            {t(item.category?.name || item.category || 'General')}
          </Text>
          <Text style={styles.title} numberOfLines={2}>
            {t(item.title || item.name)}
          </Text>

          <View style={styles.ratingRow}>
            <MaterialCommunityIcons name="star" size={12} color="#ffb300" />
            <Text style={styles.ratingText}>{item.rating || 4.5}</Text>
            {item.sellerId?.shopName && (
              <Text style={styles.sellerName} numberOfLines={1}>
                • {item.sellerId.shopName}
              </Text>
            )}
          </View>

          <View style={styles.priceRow}>
            <View>
              <Text style={styles.price}>${item.price}{item.priceUnit ? ` ${item.priceUnit}` : ''}</Text>
              {hasDiscount && <Text style={styles.comparePrice}>${item.comparePrice}</Text>}
            </View>
            <TouchableOpacity
              style={[styles.cartBtn, isOutOfStock && styles.cartBtnDisabled]}
              disabled={isOutOfStock}
              onPress={(e) => {
                e.stopPropagation();
                if (!isOutOfStock) {
                  addToCart(item);
                  Alert.alert(t('Success'), t('Added to cart!'));
                }
              }}
            >
              <MaterialCommunityIcons name="cart-plus" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(buyer)/home'))}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1a237e" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('Recently Viewed')}</Text>
        {products.length > 0 ? (
          <TouchableOpacity style={styles.clearBtn} onPress={handleClearAll}>
            <MaterialCommunityIcons name="trash-can-outline" size={20} color="#d32f2f" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      {/* Search & Sort Controls */}
      {products.length > 0 && (
        <View style={styles.filterSection}>
          <View style={styles.searchBar}>
            <MaterialCommunityIcons name="magnify" size={20} color="#888" />
            <TextInput
              style={styles.searchInput}
              placeholder={t('Search recent items...')}
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialCommunityIcons name="close-circle" size={18} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          {/* Sort Chips */}
          <FlatList
            data={SORT_OPTIONS}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.sortChipsList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.sortChip, sortBy === item.id && styles.sortChipActive]}
                onPress={() => setSortBy(item.id)}
              >
                <Text style={[styles.sortChipText, sortBy === item.id && styles.sortChipTextActive]}>
                  {t(item.label)}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Content */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#1a237e" />
          <Text style={styles.loaderText}>{t('Loading history...')}</Text>
        </View>
      ) : filteredAndSortedProducts.length > 0 ? (
        <FlatList
          data={filteredAndSortedProducts}
          renderItem={renderProductCard}
          keyExtractor={(item, index) => (item._id || item.id || index).toString()}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.gridContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1a237e']} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>👀</Text>
          <Text style={styles.emptyTitle}>{t('No recently viewed products yet.')}</Text>
          <Text style={styles.emptySubtitle}>
            {t('Start browsing products to see them here.')}
          </Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => router.replace('/(buyer)/home')}
          >
            <Text style={styles.browseBtnText}>{t('Browse Products')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fd',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a237e',
  },
  clearBtn: {
    padding: 6,
  },
  filterSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f6fa',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 42,
    marginTop: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#333',
  },
  sortChipsList: {
    gap: 8,
  },
  sortChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f5f6fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sortChipActive: {
    backgroundColor: '#1a237e',
    borderColor: '#1a237e',
  },
  sortChipText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  sortChipTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  gridContent: {
    paddingTop: 16,
    paddingBottom: 40,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 140,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#d32f2f',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  outOfStockBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(211, 47, 47, 0.9)',
    paddingVertical: 3,
    alignItems: 'center',
  },
  outOfStockText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  favBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 5,
  },
  removeBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 4,
  },
  info: {
    padding: 10,
  },
  category: {
    fontSize: 10,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a237e',
    marginTop: 2,
    lineHeight: 17,
    height: 34,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 2,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#444',
  },
  sellerName: {
    fontSize: 10,
    color: '#888',
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  price: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1a237e',
  },
  comparePrice: {
    fontSize: 10,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  cartBtn: {
    backgroundColor: '#1a237e',
    borderRadius: 10,
    padding: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBtnDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBottom: 60,
  },
  emptyEmoji: {
    fontSize: 54,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a237e',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  browseBtn: {
    backgroundColor: '#1a237e',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#1a237e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  browseBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
