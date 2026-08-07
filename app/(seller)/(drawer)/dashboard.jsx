import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SellerHeader from '../../../components/seller/SellerHeader';
import SellerScreen from '../../../components/seller/SellerScreen';
import EarningsChart from '../../../components/seller/EarningsChart';
import FormattedPrice from '../../../components/common/FormattedPrice';
import { useSeller } from '../../../context/SellerContext';
import { useCurrency } from '../../../context/CurrencyContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../../constants/colors';
import { getDashboardStats, getEarnings, getRecentOrders } from '../../../services/sellerService';
import { useRouter } from 'expo-router';

export default function Dashboard() {
  const { seller, loading, loadProfile } = useSeller();
  const { currency } = useCurrency();
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
        return '#ff9800';
      case 'confirmed':
        return '#1a237e';
      case 'packed':
        return '#0097a7';
      case 'shipped':
      case 'in_transit':
        return '#7c4dff';
      case 'delivered':
        return '#4caf50';
      case 'cancelled':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  const rawRevenue = stats?.revenueValue || 0;
  const totalProducts = stats?.products || 0;
  const totalOrders = stats?.orders || 0;
  const pendingOrders = stats?.pending || 0;

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
          <ActivityIndicator size="large" color="#1a237e" />
          <Text style={styles.loadingText}>Loading seller analytics...</Text>
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
            colors={['#1a237e']} 
            tintColor="#1a237e"
          />
        }
      >
        {/* Welcome Card banner */}
        <LinearGradient
          colors={['#1a237e', '#303f9f', '#0d47a1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.welcomeCard}
        >
          <View style={styles.welcomeTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.greeting}>
                {getGreeting()}, {seller?.ownerName?.split(' ')?.[0] || 'Seller'} 👋
              </Text>
              <Text style={styles.subTitle}>{seller?.shopName ?? 'UBS Global Store'}</Text>
            </View>
            <View style={styles.storeBadge}>
              <MaterialCommunityIcons name="check-decagram" size={18} color="#4caf50" />
              <Text style={styles.storeBadgeText}>VERIFIED</Text>
            </View>
          </View>

          {/* Quick Metrics Bar inside Banner */}
          <View style={styles.bannerMetricsRow}>
            <View style={styles.bannerMetricItem}>
              <Text style={styles.bannerMetricLabel}>Store Rating</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                <MaterialCommunityIcons name="star" size={14} color="#ffd700" />
                <Text style={styles.bannerMetricValue}> 4.9 / 5.0</Text>
              </View>
            </View>
            <View style={styles.bannerMetricDivider} />
            <View style={styles.bannerMetricItem}>
              <Text style={styles.bannerMetricLabel}>Active Currency</Text>
              <Text style={styles.bannerMetricValue}>{currency}</Text>
            </View>
            <View style={styles.bannerMetricDivider} />
            <View style={styles.bannerMetricItem}>
              <Text style={styles.bannerMetricLabel}>Fulfillment Rate</Text>
              <Text style={styles.bannerMetricValue}>98.5%</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Actions Bar */}
        <View style={styles.quickActionsCard}>
          <Text style={[styles.cardHeaderTitle, isDark && styles.textDark]}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(seller)/add-product')}>
              <View style={[styles.actionIconWrap, { backgroundColor: '#e0f2fe' }]}>
                <MaterialCommunityIcons name="plus-circle" size={22} color="#0284c7" />
              </View>
              <Text style={[styles.actionText, isDark && styles.textDark]}>Add Product</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(seller)/seller-orders')}>
              <View style={[styles.actionIconWrap, { backgroundColor: '#f0fdf4' }]}>
                <MaterialCommunityIcons name="clipboard-text-clock" size={22} color="#16a34a" />
              </View>
              <Text style={[styles.actionText, isDark && styles.textDark]}>Orders</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(seller)/pickup-addresses')}>
              <View style={[styles.actionIconWrap, { backgroundColor: '#fef3c7' }]}>
                <MaterialCommunityIcons name="truck-fast" size={22} color="#d97706" />
              </View>
              <Text style={[styles.actionText, isDark && styles.textDark]}>Pickup Hub</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(seller)/seller-settings')}>
              <View style={[styles.actionIconWrap, { backgroundColor: '#f3e8ff' }]}>
                <MaterialCommunityIcons name="store-cog" size={22} color="#9333ea" />
              </View>
              <Text style={[styles.actionText, isDark && styles.textDark]}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Grid of Key Performance Cards */}
        <View style={styles.statsGrid}>
          <View style={[styles.statBox, isDark && styles.cardBgDark]}>
            <View style={[styles.statIconWrap, { backgroundColor: '#e8eaf6' }]}>
              <MaterialCommunityIcons name="cash-multiple" size={22} color="#1a237e" />
            </View>
            <Text style={styles.statLabel}>Total Revenue</Text>
            <FormattedPrice amount={rawRevenue} style={styles.statValuePrice} />
            <Text style={styles.statSub}>Total store earnings</Text>
          </View>

          <View style={[styles.statBox, isDark && styles.cardBgDark]}>
            <View style={[styles.statIconWrap, { backgroundColor: '#e0f2fe' }]}>
              <MaterialCommunityIcons name="package-variant-closed" size={22} color="#0284c7" />
            </View>
            <Text style={styles.statLabel}>Total Orders</Text>
            <Text style={[styles.statValue, isDark && styles.textDark]}>{totalOrders}</Text>
            <Text style={styles.statSub}>Processed orders</Text>
          </View>

          <View style={[styles.statBox, isDark && styles.cardBgDark]}>
            <View style={[styles.statIconWrap, { backgroundColor: '#fef3c7' }]}>
              <MaterialCommunityIcons name="clock-alert-outline" size={22} color="#d97706" />
            </View>
            <Text style={styles.statLabel}>Pending Orders</Text>
            <Text style={[styles.statValue, { color: '#d97706' }]}>{pendingOrders}</Text>
            <Text style={styles.statSub}>Awaiting dispatch</Text>
          </View>

          <View style={[styles.statBox, isDark && styles.cardBgDark]}>
            <View style={[styles.statIconWrap, { backgroundColor: '#f0fdf4' }]}>
              <MaterialCommunityIcons name="cube-outline" size={22} color="#16a34a" />
            </View>
            <Text style={styles.statLabel}>Listed Products</Text>
            <Text style={[styles.statValue, isDark && styles.textDark]}>{totalProducts}</Text>
            <Text style={styles.statSub}>Active catalog</Text>
          </View>
        </View>

        {/* Order Fulfillment Pipeline Funnel */}
        <View style={[styles.funnelCard, isDark && styles.cardBgDark]}>
          <View style={styles.sectionHeaderLeft}>
            <MaterialCommunityIcons name="progress-clock" size={20} color="#1a237e" />
            <Text style={[styles.cardHeaderTitle, isDark && styles.textDark, { marginLeft: 6 }]}>Order Fulfillment Pipeline</Text>
          </View>

          <View style={styles.funnelRow}>
            <TouchableOpacity style={styles.funnelStep} onPress={() => router.push('/(seller)/seller-orders')}>
              <Text style={[styles.funnelCount, { color: '#d97706' }]}>{pendingOrders}</Text>
              <Text style={styles.funnelLabel}>Pending</Text>
            </TouchableOpacity>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#cbd5e1" />
            <TouchableOpacity style={styles.funnelStep} onPress={() => router.push('/(seller)/seller-orders')}>
              <Text style={[styles.funnelCount, { color: '#0284c7' }]}>{Math.max(0, totalOrders - pendingOrders)}</Text>
              <Text style={styles.funnelLabel}>In Transit</Text>
            </TouchableOpacity>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#cbd5e1" />
            <TouchableOpacity style={styles.funnelStep} onPress={() => router.push('/(seller)/seller-orders')}>
              <Text style={[styles.funnelCount, { color: '#16a34a' }]}>{totalOrders}</Text>
              <Text style={styles.funnelLabel}>Completed</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Analytics Line Chart */}
        <View style={[styles.chartContainer, statsLoading && { opacity: 0.6 }]}>
          <EarningsChart mode={mode} onModeChange={setMode} data={chartData} />
          {statsLoading && (
            <View style={styles.chartLoaderOverlay}>
              <ActivityIndicator size="small" color="#1a237e" />
            </View>
          )}
        </View>

        {/* Recent Orders List Card Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <MaterialCommunityIcons name="clipboard-text-clock-outline" size={18} color="#1a237e" />
            <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Recent Orders</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(seller)/seller-orders')}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {recentOrders.length > 0 ? (
          recentOrders.map((order) => {
            const sColor = getStatusColor(order.status);
            const numAmount = parseFloat(String(order.amount).replace(/[^0-9.]/g, '')) || 0;
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
                  <FormattedPrice amount={numAmount} style={styles.orderAmountPrice} />
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
            <Text style={styles.emptyText}>No recent orders received</Text>
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
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16, 
    padding: 20, 
    borderRadius: 20, 
    shadowColor: '#1a237e', 
    shadowOpacity: 0.15, 
    shadowRadius: 12, 
    elevation: 4 
  },
  welcomeTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  },
  greeting: { 
    color: '#ffffff', 
    fontSize: 18, 
    fontWeight: '800'
  },
  subTitle: { 
    marginTop: 4, 
    color: '#e0e7ff', 
    fontSize: 13,
    fontWeight: '600'
  },
  storeBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 999, 
    backgroundColor: '#ffffff' 
  },
  storeBadgeText: { 
    marginLeft: 4, 
    color: '#1a237e', 
    fontWeight: '800', 
    fontSize: 10 
  },
  bannerMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 16
  },
  bannerMetricItem: {
    alignItems: 'center',
    flex: 1
  },
  bannerMetricLabel: {
    fontSize: 10,
    color: '#c7d2fe',
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  bannerMetricValue: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '800',
    marginTop: 2
  },
  bannerMetricDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)'
  },
  quickActionsCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a'
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12
  },
  actionBtn: {
    alignItems: 'center',
    flex: 1
  },
  actionIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6
  },
  actionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155'
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 12,
    marginBottom: 16
  },
  statBox: {
    width: '46%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    marginHorizontal: '2%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    elevation: 2
  },
  statIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b'
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2
  },
  statValuePrice: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1a237e',
    marginTop: 2
  },
  statSub: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2
  },
  funnelCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  funnelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 12,
    backgroundColor: '#f8fafc',
    paddingVertical: 12,
    borderRadius: 14
  },
  funnelStep: {
    alignItems: 'center'
  },
  funnelCount: {
    fontSize: 18,
    fontWeight: '800'
  },
  funnelLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    marginTop: 2
  },
  chartContainer: {
    position: 'relative',
    marginHorizontal: 16,
    marginBottom: 16
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
    marginHorizontal: 16, 
    marginTop: 8,
    marginBottom: 12, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  viewAll: { 
    color: '#1a237e', 
    fontWeight: '800',
    fontSize: 13
  },
  orderRow: { 
    backgroundColor: '#ffffff', 
    borderRadius: 16, 
    padding: 14, 
    marginHorizontal: 16, 
    marginBottom: 10, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    borderWidth: 1,
    borderColor: '#f0f3f8',
    elevation: 1
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
  orderAmountPrice: { 
    fontSize: 13.5, 
    fontWeight: '800', 
    color: '#1a237e',
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
    marginHorizontal: 16,
    marginBottom: 16,
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
