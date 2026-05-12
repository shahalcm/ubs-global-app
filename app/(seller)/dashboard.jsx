import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import SellerHeader from '../../components/seller/SellerHeader';
import StatsCard from '../../components/seller/StatsCard';
import EarningsChart from '../../components/seller/EarningsChart';
import { useSeller } from '../../context/SellerContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

const recentOrders = [
  { id: '#UBS-00173', product: 'Aloe Vera Gel', customer: 'Sana Patel', amount: '$85.00', status: 'Pending' },
  { id: '#UBS-00172', product: 'Organic Spices', customer: 'Ravi Kumar', amount: '$145.00', status: 'Confirmed' },
  { id: '#UBS-00171', product: 'Silk Fabric', customer: 'Mina Shah', amount: '$230.00', status: 'Shipped' },
  { id: '#UBS-00170', product: 'Steel Pipes', customer: 'Rahul Gupta', amount: '$1,120.00', status: 'Delivered' },
];

const statusColor = { Pending: colors.warning, Confirmed: colors.primary, Shipped: '#7c4dff', Delivered: colors.success };

export default function Dashboard() {
  const { seller, stats, loading } = useSeller();
  const [mode, setMode] = useState('week');

  const statItems = useMemo(
    () => [
      { icon: 'currency-usd', label: 'Total Revenue', value: stats?.revenue ?? '$18.2k', color: colors.accent, trend: { text: '+8.7%', positive: true } },
      { icon: 'cube-outline', label: 'Total Products', value: stats?.products ?? '52', color: colors.success, trend: { text: '+4.5%', positive: true } },
      { icon: 'shopping', label: 'Total Orders', value: stats?.orders ?? '184', color: colors.warning, trend: { text: '+2.3%', positive: true } },
      { icon: 'clock-outline', label: 'Pending Orders', value: stats?.pending ?? '14', color: colors.error, trend: { text: '-1.2%', positive: false } },
    ],
    [stats],
  );

  if (loading) {
    return <ActivityIndicator style={styles.loader} size="large" color={colors.primary} />;
  }

  return (
    <View style={styles.screen}>
      <SellerHeader />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeCard}>
          <Text style={styles.greeting}>Good Morning, {seller?.shopName ?? 'Seller'} 👋</Text>
          <Text style={styles.subTitle}>{seller?.shopName ?? 'UBS Global Importers'}</Text>
          <View style={styles.pill}><MaterialCommunityIcons name="check-decagram" size={16} color={colors.success} /><Text style={styles.pillText}>Verified Seller</Text></View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsRow} contentContainerStyle={{ paddingHorizontal: 20 }}>
          {statItems.map((item) => <StatsCard key={item.label} {...item} />)}
        </ScrollView>

        <EarningsChart mode={mode} onModeChange={setMode} data={{ labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], values: [450, 650, 520, 740, 860, 960, 1040] }} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <Text style={styles.viewAll}>View All</Text>
        </View>
        {recentOrders.map((order) => (
          <View key={order.id} style={styles.orderRow}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderId}>{order.id}</Text>
              <Text style={styles.orderMeta}>{order.product} • {order.customer}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColor[order.status] + '22' }]}>
              <Text style={[styles.statusText, { color: statusColor[order.status] }]}>{order.status}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 100 },
  loader: { flex: 1, justifyContent: 'center' },
  welcomeCard: { margin: 20, padding: 24, borderRadius: 28, backgroundColor: colors.primary, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, elevation: 5 },
  greeting: { color: '#fff', fontSize: 22, fontWeight: '800' },
  subTitle: { marginTop: 10, color: '#d7dbff', fontSize: 14 },
  pill: { marginTop: 16, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 50, backgroundColor: '#dff7e2' },
  pillText: { marginLeft: 8, color: colors.success, fontWeight: '700', fontSize: 13 },
  statsRow: { marginTop: -10 },
  sectionTitle: { marginHorizontal: 20, fontSize: 17, fontWeight: '800', color: colors.text, marginTop: 14 },
  sectionHeader: { marginHorizontal: 20, marginTop: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  viewAll: { color: colors.accent, fontWeight: '700' },

  orderRow: { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginHorizontal: 20, marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  orderInfo: { maxWidth: '70%' },
  orderId: { fontSize: 14, fontWeight: '700', color: colors.text },
  orderMeta: { marginTop: 4, fontSize: 12, color: '#777' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  statusText: { fontSize: 12, fontWeight: '700' },
});
