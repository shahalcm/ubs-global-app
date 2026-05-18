import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SellerHeader from '../../components/seller/SellerHeader';
import ProductCard from '../../components/seller/ProductCard';
import { useSeller } from '../../context/SellerContext';
import { colors } from '../../constants/colors';

const filters = ['All', 'Active', 'Out of Stock', 'Draft', 'Featured'];

export default function MyProducts() {
  const { products, loading, deleteProduct } = useSeller();
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filteredProducts = useMemo(() => {
    let list = products || [];
    if (activeFilter === 'Active') list = list.filter((item) => item.stock > 0);
    if (activeFilter === 'Out of Stock') list = list.filter((item) => item.stock === 0);
    if (search) list = list.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [products, activeFilter, search]);

  if (loading) {
    return <ActivityIndicator style={styles.loader} size="large" color={colors.primary} />;
  }

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

        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ProductCard product={item} onEdit={() => {}} onDelete={() => deleteProduct(item.id)} />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No products found. Add a new product to get started.</Text>}
        />
        <TouchableOpacity style={styles.fab}>
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
  list: { paddingBottom: 20 },
  empty: { fontSize: 14, color: '#7a7a7a', textAlign: 'center', marginTop: 40 },
  fab: { position: 'absolute', right: 24, bottom: 24, width: 58, height: 58, borderRadius: 29, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.16, shadowRadius: 12, elevation: 7 },
});
