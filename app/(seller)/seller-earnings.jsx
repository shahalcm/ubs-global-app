import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import SellerHeader from '../../components/seller/SellerHeader';
import { LineChart } from 'react-native-chart-kit';
import { useSeller } from '../../context/SellerContext';
import { colors } from '../../constants/colors';

const transactions = [
  { id: '#UBS-00127', date: 'May 9', gross: '$320', commission: '-$25', net: '$295' },
  { id: '#UBS-00126', date: 'May 7', gross: '$480', commission: '-$38', net: '$442' },
  { id: '#UBS-00125', date: 'May 6', gross: '$150', commission: '-$12', net: '$138' },
];

export default function SellerEarnings() {
  const { stats, loading } = useSeller();
  const [mode, setMode] = useState('week');

  const chartData = useMemo(() => {
    const labels = mode === 'week' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const values = mode === 'week' ? [450, 650, 520, 740, 860, 960, 1040] : [520, 700, 650, 880, 1020, 1180];
    return { labels, values };
  }, [mode]);

  if (loading) {
    return <ActivityIndicator style={styles.loader} size="large" color={colors.primary} />;
  }

  return (
    <View style={styles.screen}>
      <SellerHeader title="My Earnings" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Earnings</Text>
          <Text style={styles.balanceAmount}>{stats?.earnings ?? '$24,850.00'}</Text>
          <Text style={styles.balanceSub}>Available to Withdraw ${stats?.available ?? '18,400.00'}</Text>
          <TouchableOpacity style={styles.withdrawButton}><Text style={styles.withdrawLabel}>Withdraw</Text></TouchableOpacity>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.sectionHeader}><Text style={styles.cardTitle}>Revenue Overview</Text><View style={styles.toggleGroup}>{['week', 'month', 'year'].map((item) => (<TouchableOpacity key={item} style={[styles.toggle, mode === item && styles.toggleActive]} onPress={() => setMode(item)}><Text style={[styles.toggleLabel, mode === item && styles.toggleLabelActive]}>{item.toUpperCase()}</Text></TouchableOpacity>))}</View></View>
          <LineChart data={{ labels: chartData.labels, datasets: [{ data: chartData.values }] }} width={320} height={220} yAxisSuffix="$" chartConfig={{ backgroundGradientFrom: '#ffffff', backgroundGradientTo: '#ffffff', color: () => colors.primary, labelColor: () => '#7a7a7a', propsForDots: { r: '0' } }} bezier style={styles.chart} />
        </View>

        <View style={styles.commissionCard}>
          <Text style={styles.cardTitle}>Commission Summary</Text>
          <View style={styles.row}><Text style={styles.summaryLabel}>Gross Sales</Text><Text style={styles.summaryValue}>${stats?.gross ?? '32,400'}</Text></View>
          <View style={styles.row}><Text style={styles.summaryLabel}>Platform Commission (8%)</Text><Text style={[styles.summaryValue, styles.negative]}>-${stats?.commission ?? '2,592'}</Text></View>
          <View style={styles.row}><Text style={[styles.summaryLabel, styles.bold]}>Net Earnings</Text><Text style={[styles.summaryValue, styles.positive]}>${stats?.net ?? '29,808'}</Text></View>
        </View>

        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <FlatList data={transactions} keyExtractor={(item) => item.id} renderItem={({ item, index }) => (<View style={[styles.transactionRow, index % 2 === 1 && styles.stripedRow]}><Text style={styles.txLabel}>{item.id}</Text><Text style={styles.txDate}>{item.date}</Text><View style={styles.txAmounts}><Text style={styles.txGross}>{item.gross}</Text><Text style={styles.txCommission}>{item.commission}</Text><Text style={styles.txNet}>{item.net}</Text></View></View>)} contentContainerStyle={{ paddingBottom: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { padding: 20, paddingBottom: 20 },
  loader: { flex: 1, justifyContent: 'center' },
  balanceCard: { backgroundColor: colors.primary, borderRadius: 24, padding: 22, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 16, elevation: 7 },
  balanceLabel: { color: '#cfd9ff', fontSize: 13, fontWeight: '600' },
  balanceAmount: { marginTop: 14, color: '#fff', fontSize: 32, fontWeight: '800' },
  balanceSub: { marginTop: 8, color: '#d4deff', fontSize: 14 },
  withdrawButton: { marginTop: 18, borderColor: '#fff', borderWidth: 1, borderRadius: 18, paddingVertical: 12, alignItems: 'center' },
  withdrawLabel: { color: '#fff', fontWeight: '700' },
  chartCard: { marginTop: 18, borderRadius: 22, backgroundColor: '#fff', padding: 18, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 14, elevation: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  toggleGroup: { flexDirection: 'row', backgroundColor: '#f1f6ff', borderRadius: 999, padding: 4 },
  toggle: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999 },
  toggleActive: { backgroundColor: colors.primary },
  toggleLabel: { color: '#7a7a7a', fontSize: 11, fontWeight: '700' },
  toggleLabelActive: { color: '#fff' },
  chart: { borderRadius: 22 },
  commissionCard: { marginTop: 18, backgroundColor: '#fff', borderRadius: 22, padding: 18, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 14, elevation: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryLabel: { color: '#7a7a7a', fontSize: 14 },
  summaryValue: { fontSize: 14, fontWeight: '700', color: colors.text },
  negative: { color: colors.error },
  positive: { color: colors.success },
  bold: { fontWeight: '800' },
  sectionTitle: { marginTop: 20, marginBottom: 12, fontSize: 16, fontWeight: '800', color: colors.text },
  transactionRow: { padding: 16, borderRadius: 18, backgroundColor: '#fff', marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, elevation: 3 },
  stripedRow: { backgroundColor: '#f8fbff' },
  txLabel: { fontSize: 13, fontWeight: '700', color: colors.text },
  txDate: { fontSize: 12, color: '#7a7a7a' },
  txAmounts: { alignItems: 'flex-end' },
  txGross: { fontSize: 13, color: colors.text, fontWeight: '700' },
  txCommission: { fontSize: 12, color: colors.error, marginTop: 2 },
  txNet: { fontSize: 13, color: colors.primary, marginTop: 2 },
});
