import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../constants/colors';

export function CategoryCard({ label, onPress }) {
  return (
    <TouchableOpacity style={styles.pill} onPress={onPress} activeOpacity={0.85}>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 50,
    backgroundColor: colors.surface,
    marginRight: 8,
    marginBottom: 8,
  },
  label: { fontSize: 14, fontWeight: '500', color: colors.primary },
});

export default CategoryCard;
