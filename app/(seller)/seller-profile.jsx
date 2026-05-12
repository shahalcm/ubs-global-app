import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import SellerHeader from '../../components/seller/SellerHeader';
import { useSeller } from '../../context/SellerContext';
import { colors } from '../../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const stats = [
  { label: 'Total Sales', value: '1.2k' },
  { label: 'Products Listed', value: '68' },
  { label: 'Happy Customers', value: '520' },
];

export default function SellerProfile() {
  const { seller } = useSeller();

  return (
    <View style={styles.screen}>
      <SellerHeader title="Seller Profile" />
      <FlatList
        data={[1]}
        keyExtractor={(item) => item.toString()}
        renderItem={() => (
          <View style={styles.content}>
            <View style={styles.profileCard}>
              <View style={styles.avatarCircle}><Text style={styles.avatarLabel}>{seller?.shopName?.charAt(0) ?? 'U'}</Text></View>
              <Text style={styles.shopName}>{seller?.shopName ?? 'UBS Global Importing'}</Text>
              <Text style={styles.sellerName}>{seller?.ownerName ?? 'Aaliya Roy'}</Text>
              <View style={styles.badge}><MaterialCommunityIcons name="check-decagram" size={14} color={colors.success} /><Text style={styles.badgeText}>Verified Seller</Text></View>
              <Text style={styles.rating}>⭐ 4.8 (124 reviews)</Text>
            </View>

            <View style={styles.statsRow}>
              {stats.map((item) => (
                <View key={item.label} style={styles.statCard}>
                  <Text style={styles.statValue}>{item.value}</Text>
                  <Text style={styles.statLabel}>{item.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Shop Information</Text>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Business Type</Text><Text style={styles.infoValue}>{seller?.businessType ?? 'Importer / Exporter'}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Location</Text><Text style={styles.infoValue}>{seller?.address ?? '123 Global Street, Dubai'}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Member Since</Text><Text style={styles.infoValue}>Jan 2024</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Response Rate</Text><Text style={[styles.infoValue, { color: colors.success }]}>98%</Text></View>
            </View>

            <View style={styles.bankCard}>
              <View style={styles.bankHeader}><Text style={styles.cardTitle}>Payment Details</Text><TouchableOpacity><Text style={styles.editLink}>Edit</Text></TouchableOpacity></View>
              <Text style={styles.bankLine}>**** **** 4521</Text>
              <Text style={styles.bankLabel}>UPI ID: seller@upi</Text>
            </View>

            <TouchableOpacity style={[styles.actionButton, styles.outlined]}><Text style={styles.outlinedLabel}>Edit Profile</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.primary]}><Text style={styles.primaryLabel}>View My Store</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.danger]}><MaterialCommunityIcons name="logout" size={16} color={colors.error} /><Text style={styles.dangerLabel}>Logout</Text></TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 120 },
  profileCard: { backgroundColor: colors.primary, borderRadius: 26, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 18, elevation: 8 },
  avatarCircle: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarLabel: { color: colors.primary, fontSize: 32, fontWeight: '800' },
  shopName: { color: '#fff', fontSize: 22, fontWeight: '800' },
  sellerName: { marginTop: 8, color: '#dce3ff', fontSize: 14 },
  badge: { marginTop: 10, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#e8f7eb' },
  badgeText: { marginLeft: 8, color: colors.success, fontWeight: '700' },
  rating: { marginTop: 10, color: '#dce3ff', fontSize: 13 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 18, padding: 18, marginRight: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12, elevation: 3 },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.primary },
  statLabel: { marginTop: 6, color: '#7a7a7a', fontSize: 12 },
  infoCard: { marginTop: 20, backgroundColor: '#fff', borderRadius: 22, padding: 18, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12, elevation: 3 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: 14 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  infoLabel: { color: '#7a7a7a', fontSize: 13 },
  infoValue: { fontSize: 13, fontWeight: '700', color: colors.text, maxWidth: '55%', textAlign: 'right' },
  bankCard: { marginTop: 18, backgroundColor: '#fff', borderRadius: 22, padding: 18, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12, elevation: 3 },
  bankHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  editLink: { color: colors.accent, fontWeight: '700' },
  bankLine: { color: colors.text, fontSize: 16, fontWeight: '800' },
  bankLabel: { marginTop: 8, color: '#7a7a7a', fontSize: 13 },
  actionButton: { borderRadius: 18, paddingVertical: 16, justifyContent: 'center', alignItems: 'center', marginTop: 14, flexDirection: 'row' },
  outlined: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.primary },
  primary: { backgroundColor: '#1a237e' },
  danger: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.error },
  outlinedLabel: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  primaryLabel: { color: '#fff', fontWeight: '700', fontSize: 14 },
  dangerLabel: { color: colors.error, fontWeight: '700', fontSize: 14, marginLeft: 8 },
});
