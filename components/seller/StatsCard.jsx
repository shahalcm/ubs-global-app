import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

export default function StatsCard({ icon, label, value, color, trend }) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconCircle, { backgroundColor: `${color}22` }]}>
        <MaterialCommunityIcons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {trend ? <Text style={[styles.trend, trend.positive ? styles.up : styles.down]}>{trend.text}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 156,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 18,
    marginRight: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  label: {
    marginTop: 6,
    fontSize: 13,
    color: '#777',
  },
  trend: {
    marginTop: 10,
    fontSize: 12,
  },
  up: { color: colors.success },
  down: { color: colors.error },
});
