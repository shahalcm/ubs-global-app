import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SellerHeader from '../../../components/seller/SellerHeader';
import SellerScreen from '../../../components/seller/SellerScreen';
import StatsCard from '../../../components/seller/StatsCard';
import EarningsChart from '../../../components/seller/EarningsChart';
import { useSeller } from '../../../context/SellerContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../../constants/colors';
import { getDashboardStats, getEarnings, getRecentOrders } from '../../../services/sellerService';
import { useRouter } from 'expo-router';

export default function Dashboard() {
  const { seller, loading, loadProfile } = useSeller();
  const router = useRouter();

  const [mode, setMode] = useState('month');
  const [stats, setStats] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) {
      setStatsLoading(true);
    }
    try {
      const [statsRes, earningsRes, ordersRes] = await Promise.all([
        getDashboardStats(mode),
        getEarnings(mode),
        getRecentOrders(mode)
      ]);
      
      if (statsRes?.success) {
        setStats(statsRes.stats);
      }
      if (earningsRes?.success) {
        setEarnings(earningsRes.earnings);
      }
      if (ordersRes?.success) {
        setRecentOrders(ordersRes.orders);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setStatsLoading(false);
      setInitialLoading(false);
    }
  }, [mode]);

  // Fetch stats and earnings when mode changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(initialLoading);
    }, 0);
    return () => clearTimeout(timer);
  }, [mode, fetchData, initialLoading]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadProfile(),
        fetchData(true)
      ]);
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good Morning';
    if (hrs < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getStatusColor = (status) => {
    const normalized = status ? status.trim().toLowerCase() : '';
    switch (normalized) {
      case 'pending':
      case 'placed':
        return colors.warning || '#ff9800';
      case 'confirmed':
        return colors.primary || '#1a237e';
      case 'packed':
        return '#0097a7';
      case 'shipped':
        return '#7c4dff';
      case 'delivered':
        return colors.success || '#4caf50';
      case 'cancelled':
        return colors.error || '#f44336';
      default:
        return colors.textMuted || '#757575';
    }
  };

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
  );

  const isDark = colors.background === '#121212';

  if (loading || initialLoading) {
    return (
      <SellerScreen>
        <SellerHeader />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading dashboard analytics...</Text>
        </View>
      </SellerScreen>
    );
  }

  return (
    <SellerScreen>
      <SellerHeader />
      
      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[colors.primary]} 
            tintColor={colors.primary}
          />
        }
      >
        {/* Welcome Card banner */}
        <LinearGradient
          colors={[colors.primary, '#303f9f']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.welcomeCard}
        >
          <Text style={styles.greeting}>
            {getGreeting()}, {seller?.ownerName?.split(' ')?.[0] || 'Seller'} <MaterialCommunityIcons name="hand-wave" size={22} color="#ffffff" />
          </Text>
          <Text style={styles.subTitle}>{seller?.shopName ?? 'UBS Global Importers'}</Text>
          <View style={styles.pill}>
            <MaterialCommunityIcons name="check-decagram" size={15} color="#2e7d32" />
            <Text style={styles.pillText}>Verified Shop</Text>
          </View>
        </LinearGradient>

        {/* Horizontal Slider of Statistics Cards */}
        <View style={statsLoading && { opacity: 0.6 }}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.statsRow} 
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 6 }}
          >
            {statItems.map((item) => <StatsCard key={item.label} {...item} />)}
          </ScrollView>
        </View>

        {/* Analytics Line Chart */}
        <View style={[styles.chartContainer, statsLoading && { opacity: 0.6 }]}>
          <EarningsChart mode={mode} onModeChange={setMode} data={chartData} />
          {statsLoading && (
            <View style={styles.chartLoaderOverlay}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          )}
        </View>

        {/* Recent Orders List Card Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <MaterialCommunityIcons name="clipboard-text-clock-outline" size={18} color={colors.primary} />
            <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Recent Orders</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(seller)/seller-orders')}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {recentOrders.length > 0 ? (
          recentOrders.map((order) => {
            const sColor = getStatusColor(order.status);
            return (
              <TouchableOpacity
                key={order.id}
                style={[styles.orderRow, isDark && styles.cardBgDark]}
                onPress={() => router.push('/(seller)/seller-orders')}
                activeOpacity={0.7}
              >
                <View style={styles.orderLeft}>
                  <View style={[styles.orderIconWrap, { backgroundColor: sColor + '15' }]}>
                    <MaterialCommunityIcons name="package-variant-closed" size={20} color={sColor} />
                  </View>
                  <View style={styles.orderInfo}>
                    <Text style={[styles.orderId, isDark && styles.textDark]}>{order.id}</Text>
                    <Text style={styles.orderMeta} numberOfLines={1}>{order.product}</Text>
                  </View>
                </View>
                <View style={styles.orderRight}>
                  <Text style={[styles.orderAmount, isDark && styles.textDark]}>{order.amount}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: sColor + '15' }]}>
                    <Text style={[styles.statusText, { color: sColor }]}>{order.status}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="package-variant" size={32} color="#b0bec5" />
            <Text style={styles.emptyText}>No orders received in this period</Text>
          </View>
        )}
      </ScrollView>
    </SellerScreen>
  );
}

const styles = StyleSheet.create({
  content: { 
    paddingBottom: 30 
  },
  loaderContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#ffffff'
  },
  loadingText: { 
    marginTop: 12, 
    fontSize: 14, 
    color: '#757575', 
    fontWeight: '600' 
  },
  welcomeCard: { 
    margin: 20, 
    padding: 24, 
    borderRadius: 24, 
    shadowColor: '#1a237e', 
    shadowOpacity: 0.12, 
    shadowRadius: 12, 
    elevation: 4 
  },
  greeting: { 
    color: '#ffffff', 
    fontSize: 20, 
    fontWeight: '800',
    flexDirection: 'row',
    alignItems: 'center'
  },
  subTitle: { 
    marginTop: 8, 
    color: '#d7dbff', 
    fontSize: 13,
    fontWeight: '500'
  },
  pill: { 
    marginTop: 14, 
    flexDirection: 'row', 
    alignItems: 'center', 
    alignSelf: 'flex-start', 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 999, 
    backgroundColor: '#e8f5e9' 
  },
  pillText: { 
    marginLeft: 6, 
    color: '#2e7d32', 
    fontWeight: '700', 
    fontSize: 11 
  },
  statsRow: { 
    marginTop: -5,
    marginBottom: 8
  },
  chartContainer: {
    position: 'relative',
    marginHorizontal: 20,
    marginBottom: 8
  },
  chartLoaderOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  sectionTitle: { 
    fontSize: 15, 
    fontWeight: '800', 
    color: colors.text,
    marginLeft: 6
  },
  sectionHeader: { 
    marginHorizontal: 20, 
    marginTop: 16, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  viewAll: { 
    color: colors.accent, 
    fontWeight: '700',
    fontSize: 13
  },
  orderRow: { 
    backgroundColor: '#ffffff', 
    borderRadius: 16, 
    padding: 14, 
    marginHorizontal: 20, 
    marginTop: 12, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    borderWidth: 1,
    borderColor: '#f0f3f8',
    shadowColor: '#000000', 
    shadowOpacity: 0.03, 
    shadowRadius: 8, 
    elevation: 2 
  },
  cardBgDark: {
    backgroundColor: '#1e1e1e',
    borderColor: '#2d2d2d'
  },
  textDark: {
    color: '#ffffff'
  },
  orderLeft: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1, 
    marginRight: 12 
  },
  orderIconWrap: { 
    width: 40, 
    height: 40, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 12 
  },
  orderInfo: { 
    flex: 1 
  },
  orderId: { 
    fontSize: 13.5, 
    fontWeight: '700', 
    color: colors.text 
  },
  orderMeta: { 
    marginTop: 3, 
    fontSize: 11, 
    color: '#757575',
    fontWeight: '500'
  },
  orderRight: { 
    alignItems: 'flex-end' 
  },
  orderAmount: { 
    fontSize: 13.5, 
    fontWeight: '700', 
    color: colors.text,
    marginBottom: 4
  },
  statusBadge: { 
    paddingHorizontal: 8, 
    paddingVertical: 3, 
    borderRadius: 6 
  },
  statusText: { 
    fontSize: 10, 
    fontWeight: '700' 
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#edf2f7'
  },
  emptyText: { 
    marginTop: 8, 
    color: '#757575', 
    fontSize: 12.5,
    fontWeight: '600'
  },
});
