import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import SellerHeader from '../../components/seller/SellerHeader';
import ProductCard from '../../components/seller/ProductCard';
import { useSeller } from '../../context/SellerContext';
import { colors } from '../../constants/colors';
import { SellerProductCardSkeleton } from '../../components/seller/SellerSkeleton';

const filters = ['All', 'Active', 'Out of Stock', 'Draft', 'Featured'];

export default function MyProducts() {
  const { products, loading, deleteProduct, loadDashboard } = useSeller();
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadDashboard();
    } catch (error) {
      console.error('Error refreshing products:', error);
    } finally {
      setRefreshing(false);
    }
  }, [loadDashboard]);

  const filteredProducts = useMemo(() => {
    let list = products || [];
    if (activeFilter === 'Active') list = list.filter((item) => item.status === 'active' && item.stock > 0);
    if (activeFilter === 'Out of Stock') list = list.filter((item) => item.stock === 0);
    if (activeFilter === 'Draft') list = list.filter((item) => item.status === 'draft');
    if (activeFilter === 'Featured') list = list.filter((item) => item.isFeatured === true);
    if (search) {
      list = list.filter((item) => 
        (item.title || item.name || '').toLowerCase().includes(search.toLowerCase())
      );
    }
    return list;
  }, [products, activeFilter, search]);

  const handleDelete = useCallback(async (id) => {
    try {
      await deleteProduct(id);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  }, [deleteProduct]);

  return (
    <View style={styles.screen}>
      <SellerHeader title="My Products" />
      <View style={styles.container}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={20} color="#7a7a7a" />
          <TextInput style={styles.searchInput} value={search} onChangeText={setSearch} placeholder="Search your products..." />
        </View>
        <View style={styles.chipRow}>
          {filters.map((item) => (
            <TouchableOpacity key={item} style={[styles.chip, activeFilter === item && styles.chipActive]} onPress={() => setActiveFilter(item)}>
              <Text style={[styles.chipText, activeFilter === item && styles.chipTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading && (!products || products.length === 0) ? (
          <View style={{ gap: 16 }}>
            <SellerProductCardSkeleton />
            <SellerProductCardSkeleton />
            <SellerProductCardSkeleton />
            <SellerProductCardSkeleton />
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            keyExtractor={(item, index) => (item._id || item.id || index).toString()}
            renderItem={({ item }) => (
              <ProductCard 
                product={item} 
                onEdit={() => router.push({ pathname: '/(seller)/edit-product', params: { id: item._id || item.id } })} 
                onDelete={() => handleDelete(item._id || item.id)} 
              />
            )}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
            }
            ListEmptyComponent={<Text style={styles.empty}>No products found. Add a new product to get started.</Text>}
          />
        )}
        <TouchableOpacity style={styles.fab} onPress={() => router.push('/(seller)/add-product')}>
          <MaterialCommunityIcons name="plus" size={26} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: 20, paddingBottom: 20 },
  loader: { flex: 1, justifyContent: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 16, height: 48, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  searchInput: { marginLeft: 10, flex: 1, fontSize: 14 },
  chipRow: { flexDirection: 'row', marginBottom: 16 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: '#d8d8d8', marginRight: 10, backgroundColor: '#fff' },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, color: '#676767' },
  chipTextActive: { color: '#fff' },
  list: { paddingBottom: 100 },
  empty: { fontSize: 14, color: '#7a7a7a', textAlign: 'center', marginTop: 40 },
  fab: { position: 'absolute', right: 24, bottom: 24, width: 58, height: 58, borderRadius: 29, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.16, shadowRadius: 12, elevation: 7 },
});
