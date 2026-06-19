import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import SellerHeader from '../../../components/seller/SellerHeader';
import { useSeller } from '../../../context/SellerContext';
import { useAuth } from '../../../context/AuthContext';
import { colors } from '../../../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getDashboardStats } from '../../../services/sellerService';
import { useRouter } from 'expo-router';
import { getSellerImageUrl } from '../../../utils/image';

export default function SellerProfile() {
  const { seller, loadProfile } = useSeller();
  const { logout, user } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState([
    { label: 'Total Revenue', value: '...', icon: 'cash-multiple', color: colors.success || '#4caf50' },
    { label: 'My Products', value: '...', icon: 'package-variant-closed', color: colors.accent || '#29b6f6' },
    { label: 'Orders Received', value: '...', icon: 'cart-outline', color: colors.warning || '#ff9800' },
  ]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await getDashboardStats('all');
      if (res.success) {
        setStats([
          { 
            label: 'Total Revenue', 
            value: typeof res.stats.revenue === 'number' 
              ? `$${res.stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
              : res.stats.revenue || '$0.00', 
            icon: 'cash-multiple', 
            color: colors.success || '#4caf50' 
          },
          { 
            label: 'My Products', 
            value: String(res.stats.products || 0), 
            icon: 'package-variant-closed', 
            color: colors.accent || '#29b6f6' 
          },
          { 
            label: 'Orders Received', 
            value: String(res.stats.orders || 0), 
            icon: 'cart-outline', 
            color: colors.warning || '#ff9800' 
          },
        ]);
      }
    } catch (error) {
      console.log('Error fetching stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStats();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadProfile(), fetchStats()]);
    } catch (error) {
      console.log('Error refreshing seller profile:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out of your seller account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/(auth)/login');
            } catch (error) {
              console.log('Logout error:', error);
              Alert.alert('Error', 'Failed to log out. Please try again.');
            }
          }
        }
      ]
    );
  };

  // Helper to format member since date
  const memberSince = seller?.createdAt 
    ? new Date(seller.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })
    : 'RecentlyJoined';

  // Helper to get formatted location address
  const userLoc = seller?.userId?.location;
  const address = userLoc?.fullAddress || 
    (userLoc?.city ? `${userLoc.city}, ${userLoc.state ? userLoc.state + ', ' : ''}${userLoc.country || ''}`.trim() : null) ||
    (typeof seller?.address === 'object' 
      ? (seller.address.street || 'Not provided')
      : (seller?.address || 'Not provided'));

  const isDark = colors.background === '#121212';

  return (
    <View style={styles.screen}>
      <SellerHeader title="Seller Profile" />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
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
        {/* Profile Gradient Banner Card */}
        <LinearGradient
          colors={[colors.primary, '#303f9f']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileCard}
        >
          <View style={styles.logoContainer}>
            {seller?.shopLogo ? (
              <Image 
                source={{ uri: getSellerImageUrl(seller.shopLogo) }} 
                style={styles.logoImage} 
                contentFit="cover"
                transition={300}
              />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoText}>{seller?.shopName?.charAt(0)?.toUpperCase() ?? 'S'}</Text>
              </View>
            )}
            <View style={[
              styles.statusDot, 
              { backgroundColor: seller?.status === 'approved' ? colors.success : colors.warning }
            ]} />
          </View>

          <Text style={styles.shopName} numberOfLines={1}>{seller?.shopName ?? 'My Shop'}</Text>
          <Text style={styles.ownerName} numberOfLines={1}>{seller?.ownerName ?? 'Owner Account'}</Text>

          <View style={[
            styles.statusBadge, 
            seller?.status === 'approved' ? styles.statusBadgeApproved : styles.statusBadgePending
          ]}>
            <MaterialCommunityIcons 
              name={seller?.status === 'approved' ? 'check-decagram' : 'clock-outline'} 
              size={13} 
              color={seller?.status === 'approved' ? '#2e7d32' : '#b25d00'} 
            />
            <Text style={[
              styles.statusBadgeText,
              { color: seller?.status === 'approved' ? '#2e7d32' : '#b25d00' }
            ]}>
              {seller?.status === 'approved' ? 'Verified Seller' : 'Pending Verification'}
            </Text>
          </View>
        </LinearGradient>

        {/* Dashboard Statistics Widget */}
        <View style={styles.statsGrid}>
          {stats.map((item) => (
            <View key={item.label} style={[styles.statCard, isDark && styles.cardBgDark]}>
              <View style={[styles.statIconWrapper, { backgroundColor: item.color + '15' }]}>
                <MaterialCommunityIcons name={item.icon} size={20} color={item.color} />
              </View>
              {loadingStats ? (
                <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 4 }} />
              ) : (
                <Text style={[styles.statValue, isDark && styles.textDark]}>{item.value}</Text>
              )}
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Detailed Information Section */}
        <View style={[styles.infoCard, isDark && styles.cardBgDark]}>
          <View style={styles.infoCardHeader}>
            <MaterialCommunityIcons name="information-outline" size={20} color={colors.primary} />
            <Text style={[styles.infoCardTitle, isDark && styles.textDark]}>Shop Information</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <MaterialCommunityIcons name="briefcase-outline" size={16} color={colors.textMuted} style={styles.infoIcon} />
              <Text style={styles.infoLabel}>Business Type</Text>
            </View>
            <Text style={[styles.infoValue, isDark && styles.textDark]}>{seller?.businessType ?? 'N/A'}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <MaterialCommunityIcons name="email-outline" size={16} color={colors.textMuted} style={styles.infoIcon} />
              <Text style={styles.infoLabel}>Contact Email</Text>
            </View>
            <Text style={[styles.infoValue, isDark && styles.textDark]}>{seller?.userId?.email || user?.email || 'N/A'}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <MaterialCommunityIcons name="phone-outline" size={16} color={colors.textMuted} style={styles.infoIcon} />
              <Text style={styles.infoLabel}>Contact Phone</Text>
            </View>
            <Text style={[styles.infoValue, isDark && styles.textDark]}>{seller?.phone || seller?.userId?.phone || 'N/A'}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <MaterialCommunityIcons name="map-marker-outline" size={16} color={colors.textMuted} style={styles.infoIcon} />
              <Text style={styles.infoLabel}>Location</Text>
            </View>
            <Text style={[styles.infoValue, isDark && styles.textDark]} numberOfLines={3}>{address}</Text>
          </View>

          <View style={[styles.infoRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
            <View style={styles.infoLabelContainer}>
              <MaterialCommunityIcons name="calendar-range" size={16} color={colors.textMuted} style={styles.infoIcon} />
              <Text style={styles.infoLabel}>Member Since</Text>
            </View>
            <Text style={[styles.infoValue, isDark && styles.textDark]}>{memberSince}</Text>
          </View>
        </View>

        {/* Action Options Panel */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryOutline]} 
            onPress={() => router.push('/(seller)/seller-settings')}
          >
            <MaterialCommunityIcons name="cog-outline" size={18} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.primary }]}>Store Settings & Privacy</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryOutline, { marginTop: 12 }]} 
            onPress={() => router.push('/(seller)/bot-settings')}
          >
            <MaterialCommunityIcons name="robot" size={18} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.primary }]}>AI Sales Assistant Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.dangerOutline, { marginTop: 16 }]} 
            onPress={handleLogout}
          >
            <MaterialCommunityIcons name="logout" size={18} color={colors.error} />
            <Text style={[styles.actionText, { color: colors.error }]}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { 
    flex: 1, 
    backgroundColor: colors.background 
  },
  scrollContent: { 
    padding: 20, 
    paddingBottom: 40 
  },
  profileCard: { 
    borderRadius: 24, 
    padding: 24, 
    alignItems: 'center', 
    shadowColor: '#1a237e', 
    shadowOpacity: 0.15, 
    shadowRadius: 15, 
    elevation: 6 
  },
  logoContainer: { 
    position: 'relative', 
    marginBottom: 16 
  },
  logoImage: { 
    width: 90, 
    height: 90, 
    borderRadius: 45, 
    backgroundColor: '#ffffff', 
    borderWidth: 3, 
    borderColor: '#ffffff' 
  },
  logoPlaceholder: { 
    width: 90, 
    height: 90, 
    borderRadius: 45, 
    backgroundColor: '#ffffff', 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff'
  },
  logoText: { 
    color: colors.primary, 
    fontSize: 34, 
    fontWeight: '850' 
  },
  statusDot: { 
    position: 'absolute', 
    bottom: 2, 
    right: 2, 
    width: 16, 
    height: 16, 
    borderRadius: 8, 
    borderWidth: 2, 
    borderColor: '#ffffff' 
  },
  shopName: { 
    color: '#ffffff', 
    fontSize: 20, 
    fontWeight: '800', 
    marginBottom: 4 
  },
  ownerName: { 
    color: '#e0e4ff', 
    fontSize: 13, 
    fontWeight: '500', 
    marginBottom: 12 
  },
  statusBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 12, 
    paddingVertical: 5, 
    borderRadius: 999 
  },
  statusBadgeApproved: { 
    backgroundColor: '#e8f5e9' 
  },
  statusBadgePending: { 
    backgroundColor: '#fff3e0' 
  },
  statusBadgeText: { 
    marginLeft: 6, 
    fontWeight: '700', 
    fontSize: 11 
  },
  statsGrid: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 18 
  },
  statCard: { 
    flex: 1, 
    backgroundColor: '#ffffff', 
    borderRadius: 18, 
    paddingVertical: 16, 
    paddingHorizontal: 8, 
    marginHorizontal: 4, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f3f8',
    shadowColor: '#000000', 
    shadowOpacity: 0.04, 
    shadowRadius: 10, 
    elevation: 3 
  },
  cardBgDark: {
    backgroundColor: '#1e1e1e',
    borderColor: '#2d2d2d'
  },
  textDark: {
    color: '#ffffff'
  },
  statIconWrapper: { 
    width: 36, 
    height: 36, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  statValue: { 
    fontSize: 15, 
    fontWeight: '800', 
    color: colors.primary,
    textAlign: 'center'
  },
  statLabel: { 
    marginTop: 4, 
    color: '#757575', 
    fontSize: 10, 
    textAlign: 'center',
    fontWeight: '600'
  },
  infoCard: { 
    marginTop: 20, 
    backgroundColor: '#ffffff', 
    borderRadius: 20, 
    padding: 18, 
    borderWidth: 1,
    borderColor: '#f0f3f8',
    shadowColor: '#000000', 
    shadowOpacity: 0.04, 
    shadowRadius: 10, 
    elevation: 3 
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    paddingBottom: 8
  },
  infoCardTitle: { 
    fontSize: 14, 
    fontWeight: '800', 
    color: colors.text,
    marginLeft: 8
  },
  infoRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#fbfbfb',
    paddingBottom: 10,
    marginBottom: 10
  },
  infoLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  infoIcon: {
    marginRight: 6
  },
  infoLabel: { 
    color: '#757575', 
    fontSize: 12.5,
    fontWeight: '600'
  },
  infoValue: { 
    fontSize: 12.5, 
    fontWeight: '700', 
    color: colors.text, 
    maxWidth: '55%', 
    textAlign: 'right' 
  },
  actionsContainer: { 
    marginTop: 20 
  },
  actionButton: { 
    borderRadius: 14, 
    paddingVertical: 14, 
    justifyContent: 'center', 
    alignItems: 'center', 
    flexDirection: 'row',
    shadowColor: '#000000',
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 1
  },
  primaryOutline: { 
    backgroundColor: '#ffffff', 
    borderWidth: 1.5, 
    borderColor: colors.primary 
  },
  dangerOutline: { 
    backgroundColor: '#ffffff', 
    borderWidth: 1.5, 
    borderColor: colors.error 
  },
  actionText: { 
    fontWeight: '800', 
    fontSize: 13.5, 
    marginLeft: 8 
  },
});
