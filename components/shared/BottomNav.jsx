import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

export function BottomNav({ items, activeKey, onPress }) {
  return (
    <View style={styles.bar}>
      {items.map((item) => {
        const active = item.key === activeKey;
        return (
          <TouchableOpacity key={item.key} style={styles.tab} onPress={() => onPress(item.key)} accessibilityRole="button">
            {item.icon && (
              <MaterialCommunityIcons 
                name={item.icon} 
                size={24} 
                color={active ? colors.primary : colors.textMuted}
                style={styles.icon}
              />
            )}
            <Text style={[styles.label, active && styles.labelActive]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    paddingBottom: 8,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  icon: { marginBottom: 4 },
  label: { fontSize: 12, color: colors.textMuted, fontWeight: '500' },
  labelActive: { color: colors.primary, fontWeight: '700' },
});

export default BottomNav;
