import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import SellerHeader from '../../components/seller/SellerHeader';
import { useSeller } from '../../context/SellerContext';
import { colors } from '../../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const types = ['All', 'Orders', 'Payments', 'Messages', 'System'];

export default function SellerNotifications() {
  const { notifications } = useSeller();
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = useMemo(() => {
    if (activeFilter === 'All') return notifications;
    return notifications.filter((item) => item.type === activeFilter.toLowerCase());
  }, [notifications, activeFilter]);

  return (
    <View style={styles.screen}>
      <SellerHeader title="Notifications" />
      <View style={styles.container}>
        <View style={styles.chipRow}>
          {types.map((type) => (
            <TouchableOpacity key={type} style={[styles.chip, activeFilter === type && styles.activeChip]} onPress={() => setActiveFilter(type)}>
              <Text style={[styles.chipText, activeFilter === type && styles.activeChipText]}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
          renderItem={({ item }) => (
            <View style={[styles.notifyCard, item.read ? null : styles.unreadCard]}>
              <View style={[styles.iconCircle, { backgroundColor: item.type === 'orders' ? colors.accent : item.type === 'payments' ? colors.success : item.type === 'messages' ? '#9c27b0' : colors.warning }]}>
                <MaterialCommunityIcons name="bell-outline" size={18} color="#fff" />
              </View>
              <View style={styles.notifyBody}>
                <Text style={styles.notifyTitle}>{item.title}</Text>
                <Text style={styles.notifyDescription}>{item.description}</Text>
              </View>
              <Text style={styles.notifyTime}>{item.timeAgo}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No notifications yet. You’ll see alerts here.</Text>}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: 20, paddingBottom: 100 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  chip: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e3e3e3', marginRight: 10, marginBottom: 10 },
  activeChip: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 12, color: '#666' },
  activeChipText: { color: '#fff' },
  notifyCard: { backgroundColor: '#fff', borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, elevation: 3 },
  unreadCard: { borderLeftWidth: 4, borderLeftColor: colors.accent, backgroundColor: '#eef6ff' },
  iconCircle: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  notifyBody: { flex: 1 },
  notifyTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 4 },
  notifyDescription: { fontSize: 13, color: '#7a7a7a', lineHeight: 18 },
  notifyTime: { fontSize: 11, color: '#9b9b9b', marginLeft: 10 },
  empty: { marginTop: 40, textAlign: 'center', color: '#7a7a7a' },
});
