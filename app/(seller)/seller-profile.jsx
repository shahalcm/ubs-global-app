import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import SellerHeader from '../../components/seller/SellerHeader';
import { useSeller } from '../../context/SellerContext';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getDashboardStats } from '../../services/sellerService';
import { useRouter } from 'expo-router';

export default function SellerProfile() {
  const { seller } = useSeller();
  const { logout } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState([
    { label: 'Total Sales', value: '...' },
    { label: 'Products', value: '...' },
    { label: 'Orders', value: '...' },
  ]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await getDashboardStats('all');
      if (res.success) {
        setStats([
          { label: 'Total Sales', value: res.stats.revenue },
          { label: 'Products', value: String(res.stats.products) },
          { label: 'Orders', value: String(res.stats.orders) },
        ]);
      }
    } catch (error) {
      console.log('Error fetching stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)/login');
    } catch (error) {
      console.log('Logout error', error);
    }
  };

  // Helper to format date
  const memberSince = seller?.createdAt 
    ? new Date(seller.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })
    : 'Recently';

  // Helper to get address safely
  const address = typeof seller?.address === 'object' 
    ? (seller.address.street || 'Not provided')
    : (seller?.address || 'Not provided');

  return (
    <View style={styles.screen}>
      <SellerHeader title="Seller Profile" />
      <FlatList
        data={[1]}
        keyExtractor={(item) => item.toString()}
        renderItem={() => (
          <View style={styles.content}>
            <View style={styles.profileCard}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarLabel}>{seller?.shopName?.charAt(0) ?? 'U'}</Text>
              </View>
              <Text style={styles.shopName}>{seller?.shopName ?? 'My Shop'}</Text>
              <Text style={styles.sellerName}>{seller?.ownerName ?? 'Seller'}</Text>
              <View style={styles.badge}>
                <MaterialCommunityIcons name="check-decagram" size={14} color={colors.success} />
                <Text style={styles.badgeText}>{seller?.status === 'approved' ? 'Verified Seller' : 'Pending Verification'}</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              {stats.map((item) => (
                <View key={item.label} style={styles.statCard}>
                  {loadingStats ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Text style={styles.statValue}>{item.value}</Text>
                  )}
                  <Text style={styles.statLabel}>{item.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Shop Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Business Type</Text>
                <Text style={styles.infoValue}>{seller?.businessType ?? 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue} numberOfLines={1}>{address}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Member Since</Text>
                <Text style={styles.infoValue}>{memberSince}</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.primary, marginBottom: 12 }]} 
              onPress={() => router.push('/(seller)/bot-settings')}
            >
              <MaterialCommunityIcons name="robot" size={16} color={colors.primary} />
              <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 14, marginLeft: 8 }}>AI Bot Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, styles.danger]} onPress={handleLogout}>
              <MaterialCommunityIcons name="logout" size={16} color={colors.error} />
              <Text style={styles.dangerLabel}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  profileCard: { backgroundColor: colors.primary, borderRadius: 26, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 18, elevation: 8 },
  avatarCircle: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarLabel: { color: colors.primary, fontSize: 32, fontWeight: '800' },
  shopName: { color: '#fff', fontSize: 22, fontWeight: '800' },
  sellerName: { marginTop: 8, color: '#dce3ff', fontSize: 14 },
  badge: { marginTop: 10, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#e8f7eb' },
  badgeText: { marginLeft: 8, color: colors.success, fontWeight: '700' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 18, padding: 18, marginHorizontal: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12, elevation: 3, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '800', color: colors.primary },
  statLabel: { marginTop: 6, color: '#7a7a7a', fontSize: 12, textAlign: 'center' },
  infoCard: { marginTop: 20, backgroundColor: '#fff', borderRadius: 22, padding: 18, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12, elevation: 3 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: 14 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  infoLabel: { color: '#7a7a7a', fontSize: 13 },
  infoValue: { fontSize: 13, fontWeight: '700', color: colors.text, maxWidth: '60%', textAlign: 'right' },
  actionButton: { borderRadius: 18, paddingVertical: 16, justifyContent: 'center', alignItems: 'center', marginTop: 24, flexDirection: 'row' },
  danger: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.error },
  dangerLabel: { color: colors.error, fontWeight: '700', fontSize: 14, marginLeft: 8 },
});
