import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { colors } from '../../constants/colors';

const screenWidth = Dimensions.get('window').width - 40;

export default function EarningsChart({ mode = 'week', onModeChange, data = {} }) {
  const labels = data.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const values = data.values || [450, 700, 650, 900, 800, 950, 1100];

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Revenue Analytics</Text>
        <View style={styles.toggleRow}>
          {['week', 'month', 'year'].map((option) => (
            <TouchableOpacity key={option} style={[styles.toggleButton, mode === option && styles.activeToggle]} onPress={() => onModeChange(option)}>
              <Text style={[styles.toggleLabel, mode === option && styles.activeToggleLabel]}>{option.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <LineChart
        data={{ labels, datasets: [{ data: values, color: () => colors.accent }] }}
        width={screenWidth}
        height={240}
        verticalLabelRotation={0}
        withDots={false}
        withShadow
        bezier
        chartConfig={{
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: () => colors.primary,
          labelColor: () => '#8a8a8a',
          propsForBackgroundLines: { strokeDasharray: '' },
          propsForDots: { r: '0' },
        }}
        style={styles.chart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 5,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  toggleRow: { flexDirection: 'row', backgroundColor: '#f2f6ff', borderRadius: 999, padding: 4 },
  toggleButton: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  activeToggle: { backgroundColor: colors.primary },
  toggleLabel: { color: '#606060', fontSize: 11, fontWeight: '700' },
  activeToggleLabel: { color: '#fff' },
  chart: { marginTop: 12, borderRadius: 20 },
});
