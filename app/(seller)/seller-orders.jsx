import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SellerHeader from '../../components/seller/SellerHeader';
import OrderCard from '../../components/seller/OrderCard';
import { useSeller } from '../../context/SellerContext';
import { colors } from '../../constants/colors';

const tabs = ['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

export default function SellerOrders() {
  const { orders, loading, updateOrderStatus } = useSeller();
  const [activeTab, setActiveTab] = useState('All');

  const filtered = useMemo(() => {
    if (!orders) return [];
    if (activeTab === 'All') return orders;
    return orders.filter((order) => order.status === activeTab);
  }, [orders, activeTab]);

  const handleAction = async (id, action) => {
    let status = 'Confirmed';
    if (action === 'reject') status = 'Cancelled';
    if (action === 'ship') status = 'Shipped';
    if (action === 'track') return;
    await updateOrderStatus(id, { status });
  };

  if (loading) {
    return <ActivityIndicator style={styles.loader} size="large" color={colors.primary} />;
  }

  return (
    <View style={styles.screen}>
      <SellerHeader title="My Orders" />
      <View style={styles.container}>
        <View style={styles.tabRow}>
          {tabs.map((tab) => (
            <TouchableOpacity key={tab} style={[styles.tabItem, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
              <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <OrderCard order={item} onPressAction={(action) => handleAction(item.id, action)} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No orders available in this category.</Text>}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: 20, paddingBottom: 100 },
  loader: { flex: 1, justifyContent: 'center' },
  tabRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  tabItem: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: '#d9d9d9', marginRight: 10, marginBottom: 10, backgroundColor: '#fff' },
  tabActive: { borderColor: colors.primary, backgroundColor: colors.primary + '11' },
  tabLabel: { fontSize: 12, color: '#666', fontWeight: '700' },
  tabLabelActive: { color: colors.primary },
  list: { paddingBottom: 100 },
  empty: { marginTop: 30, color: '#7a7a7a', textAlign: 'center', fontSize: 14 },
});
