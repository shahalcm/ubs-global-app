import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import SellerHeader from '../../components/seller/SellerHeader';
import SellerScreen from '../../components/seller/SellerScreen';
import StatsCard from '../../components/seller/StatsCard';
import EarningsChart from '../../components/seller/EarningsChart';
import { useSeller } from '../../context/SellerContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { getDashboardStats, getEarnings, getRecentOrders } from '../../services/sellerService';

const statusColor = { Pending: colors.warning, Confirmed: colors.primary, Shipped: '#7c4dff', Delivered: colors.success };

export default function Dashboard() {
  const { seller, loading } = useSeller();
  const [mode, setMode] = useState('month');
  const [stats, setStats] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch stats and earnings when mode changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setStatsLoading(true)
        const [statsRes, earningsRes, ordersRes] = await Promise.all([
          getDashboardStats(mode),
          getEarnings(mode),
          getRecentOrders(mode)
        ])
        
        if (statsRes?.success) {
          setStats(statsRes.stats)
        }
        if (earningsRes?.success) {
          setEarnings(earningsRes.earnings)
        }
        if (ordersRes?.success) {
          setRecentOrders(ordersRes.orders)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setStatsLoading(false)
      }
    }

    fetchData()
  }, [mode])

  const statItems = useMemo(
    () => [
      { icon: 'currency-usd', label: 'Total Revenue', value: stats?.revenue ?? '$0k', color: colors.accent, trend: stats?.trend?.revenue },
      { icon: 'cube-outline', label: 'Total Products', value: stats?.products ?? '0', color: colors.success, trend: stats?.trend?.products },
      { icon: 'shopping', label: 'Total Orders', value: stats?.orders ?? '0', color: colors.warning, trend: stats?.trend?.orders },
      { icon: 'clock-outline', label: 'Pending Orders', value: stats?.pending ?? '0', color: colors.error, trend: stats?.trend?.pending },
    ],
    [stats],
  );

  const chartData = useMemo(
    () => ({
      labels: earnings?.labels || [],
      values: earnings?.values || []
    }),
    [earnings]
  )

  if (loading || statsLoading) {
    return <ActivityIndicator style={styles.loader} size="large" color={colors.primary} />;
  }

  return (
    <SellerScreen>
      <SellerHeader />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeCard}>
          <Text style={styles.greeting}>Good Morning, {seller?.shopName ?? 'Seller'} <MaterialCommunityIcons name="hand-wave" size={20} color="#333" /></Text>
          <Text style={styles.subTitle}>{seller?.shopName ?? 'UBS Global Importers'}</Text>
          <View style={styles.pill}><MaterialCommunityIcons name="check-decagram" size={16} color={colors.success} /><Text style={styles.pillText}>Verified Seller</Text></View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsRow} contentContainerStyle={{ paddingHorizontal: 20 }}>
          {statItems.map((item) => <StatsCard key={item.label} {...item} />)}
        </ScrollView>

        <EarningsChart mode={mode} onModeChange={setMode} data={chartData} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Orders ({mode})</Text>
          <Text style={styles.viewAll}>View All</Text>
        </View>
        {recentOrders.length > 0 ? (
          recentOrders.map((order) => (
            <View key={order.id} style={styles.orderRow}>
              <View style={styles.orderInfo}>
                <Text style={styles.orderId}>{order.id}</Text>
                <Text style={styles.orderMeta}>{order.product}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusColor[order.status] + '22' }]}>
                <Text style={[styles.statusText, { color: statusColor[order.status] }]}>{order.status}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No orders in this period</Text>
        )}
      </ScrollView>
    </SellerScreen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 20 },
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
  emptyText: { textAlign: 'center', marginTop: 20, marginHorizontal: 20, color: '#999', fontSize: 14 },
});
