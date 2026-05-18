import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, FlatList } from 'react-native';
import SellerHeader from '../../components/seller/SellerHeader';
import { colors } from '../../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const sections = [
  {
    title: 'Store Settings',
    items: [
      { label: 'Shop Name', icon: 'storefront-outline', value: 'UBS Global' },
      { label: 'Shop Description', icon: 'text-box-outline', value: 'Import & export marketplace' },
      { label: 'Business Hours', icon: 'clock-outline', value: '9 AM - 9 PM' },
      { label: 'Holiday Mode', icon: 'briefcase-off-outline', toggle: true, stateKey: 'holidayMode' },
    ],
  },
  {
    title: 'Notifications',
    items: [
      { label: 'Order Alerts', icon: 'bell-ring-outline', toggle: true, stateKey: 'orderAlerts' },
      { label: 'Message Alerts', icon: 'message-alert-outline', toggle: true, stateKey: 'messageAlerts' },
      { label: 'Payment Alerts', icon: 'credit-card-outline', toggle: true, stateKey: 'paymentAlerts' },
      { label: 'Promotional', icon: 'tag-outline', toggle: true, stateKey: 'promotional' },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Language', icon: 'translate', value: 'English' },
      { label: 'Change Password', icon: 'lock-outline' },
      { label: 'Two-Factor Auth', icon: 'shield-lock-outline', toggle: true, stateKey: 'twoFactor' },
      { label: 'Connected: Google', icon: 'google', value: 'Connected', status: 'connected' },
    ],
  },
  {
    title: 'Privacy',
    items: [
      { label: 'Privacy Policy', icon: 'file-document-outline' },
      { label: 'Terms of Service', icon: 'clipboard-text-outline' },
      { label: 'Data & Permissions', icon: 'shield-check-outline' },
    ],
  },
];

export default function SellerSettings() {
  const [toggles, setToggles] = useState({ holidayMode: false, orderAlerts: true, messageAlerts: true, paymentAlerts: true, promotional: false, twoFactor: true });

  const handleToggle = (key) => setToggles((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <View style={styles.screen}>
      <SellerHeader title="Settings" />
      <FlatList
        data={sections}
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{item.title}</Text>
            {item.items.map((row) => (
              <TouchableOpacity key={row.label} style={styles.row} activeOpacity={row.toggle ? 1 : 0.7} onPress={() => !row.toggle && alert(row.label)}>
                <View style={styles.rowLeft}>
                  <View style={[styles.iconWrap, { backgroundColor: '#eef2ff' }]}>
                    <MaterialCommunityIcons name={row.icon} size={20} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.label}>{row.label}</Text>
                    {row.value ? <Text style={styles.subLabel}>{row.value}</Text> : null}
                  </View>
                </View>
                {row.toggle ? (
                  <Switch value={toggles[row.stateKey]} onValueChange={() => handleToggle(row.stateKey)} thumbColor={toggles[row.stateKey] ? colors.primary : '#fff'} trackColor={{ false: '#d6d6d6', true: '#c3d7ff' }} />
                ) : (
                  <MaterialCommunityIcons name="chevron-right" size={22} color="#b4b4b4" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
        ListFooterComponent={(
          <View style={styles.dangerZone}>
            <TouchableOpacity style={styles.dangerRow} onPress={() => alert('Delete Account')}>
              <MaterialCommunityIcons name="trash-can-outline" size={20} color={colors.error} />
              <Text style={styles.dangerLabel}>Delete Account</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dangerRow} onPress={() => alert('Logout')}>
              <MaterialCommunityIcons name="logout" size={20} color={colors.error} />
              <Text style={styles.dangerLabel}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.content}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { color: '#7a7a7a', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  label: { fontSize: 14, fontWeight: '700', color: colors.text },
  subLabel: { fontSize: 12, color: '#7a7a7a', marginTop: 4 },
  dangerZone: { marginTop: 16 },
  dangerRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  dangerLabel: { marginLeft: 12, color: colors.error, fontWeight: '700', fontSize: 14 },
});
