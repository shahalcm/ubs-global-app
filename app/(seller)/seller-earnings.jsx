import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import SellerHeader from '../../components/seller/SellerHeader';
import { LineChart } from 'react-native-chart-kit';
import { useSeller } from '../../context/SellerContext';
import { colors } from '../../constants/colors';
import { getEarnings } from '../../services/sellerService';
import { getSellerEarnings, requestWithdrawal } from '../../services/paymentService';

export default function SellerEarnings() {
  const { seller } = useSeller();
  const [mode, setMode] = useState('week');
  const [chartData, setChartData] = useState({ labels: [], values: [] });
  const [chartLoading, setChartLoading] = useState(true);
  
  const [earningsData, setEarningsData] = useState(null);
  const [txList, setTxList] = useState([]);
  const [earningsLoading, setEarningsLoading] = useState(true);

  useEffect(() => {
    loadEarningsChart();
  }, [mode]);

  useEffect(() => {
    loadEarningsBreakdown();
  }, []);

  const loadEarningsChart = async () => {
    try {
      setChartLoading(true);
      const res = await getEarnings(mode);
      if (res.success && res.earnings) {
        setChartData({
          labels: res.earnings.labels || [],
          values: res.earnings.values || []
        });
      }
    } catch (err) {
      console.log('Error loading chart data:', err);
    } finally {
      setChartLoading(false);
    }
  };

  const loadEarningsBreakdown = async () => {
    try {
      setEarningsLoading(true);
      const res = await getSellerEarnings();
      if (res.success) {
        setEarningsData(res.earnings);
        setTxList(res.transactions || []);
      }
    } catch (err) {
      console.log('Error loading breakdown:', err);
    } finally {
      setEarningsLoading(false);
    }
  };

  const handleWithdraw = () => {
    const maxAvailable = earningsData?.pendingWithdrawal || 0;
    if (maxAvailable <= 0) {
      Alert.alert("Withdrawal", "You do not have any pending balance available to withdraw.");
      return;
    }

    Alert.alert(
      "Request Withdrawal",
      `Would you like to withdraw your full available balance of $${maxAvailable.toFixed(2)}?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              setEarningsLoading(true);
              const res = await requestWithdrawal({ amount: maxAvailable });
              if (res.success) {
                Alert.alert("Success", `Withdrawal request for $${maxAvailable.toFixed(2)} submitted successfully!`);
                loadEarningsBreakdown(); // Refresh state
              } else {
                Alert.alert("Error", res.message || "Failed to request withdrawal.");
              }
            } catch (err) {
              console.log("Error in withdrawal request:", err);
              Alert.alert("Error", "An unexpected error occurred.");
            } finally {
              setEarningsLoading(false);
            }
          }
        }
      ]
    );
  };

  const hasChartData = chartData.values && chartData.values.length > 0 && chartData.values.some(v => v > 0);
  const displayLabels = hasChartData 
    ? chartData.labels 
    : (mode === 'week' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']);
  const displayValues = hasChartData 
    ? chartData.values 
    : (mode === 'week' ? [450, 650, 520, 740, 860, 960, 1040] : [520, 700, 650, 880, 1020, 1180]);

  if (earningsLoading && !earningsData) {
    return <ActivityIndicator style={styles.loader} size="large" color={colors.primary} />;
  }

  return (
    <View style={styles.screen}>
      <SellerHeader title="My Earnings" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Revenue</Text>
          <Text style={styles.balanceAmount}>${parseFloat(earningsData?.totalEarnings || 0).toFixed(2)}</Text>
          <Text style={styles.balanceSub}>Available to Withdraw: ${parseFloat(earningsData?.pendingWithdrawal || 0).toFixed(2)}</Text>
          <TouchableOpacity style={styles.withdrawButton} onPress={handleWithdraw}>
            <Text style={styles.withdrawLabel}>Withdraw</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.cardTitle}>Revenue Overview</Text>
            <View style={styles.toggleGroup}>
              {['week', 'month', 'year'].map((item) => (
                <TouchableOpacity 
                  key={item} 
                  style={[styles.toggle, mode === item && styles.toggleActive]} 
                  onPress={() => setMode(item)}
                >
                  <Text style={[styles.toggleLabel, mode === item && styles.toggleLabelActive]}>{item.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          {chartLoading ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ height: 220 }} />
          ) : (
            <LineChart 
              data={{ labels: displayLabels, datasets: [{ data: displayValues }] }} 
              width={320} 
              height={220} 
              yAxisSuffix="$" 
              chartConfig={{ 
                backgroundGradientFrom: '#ffffff', 
                backgroundGradientTo: '#ffffff', 
                color: () => colors.primary, 
                labelColor: () => '#7a7a7a', 
                propsForDots: { r: '0' } 
              }} 
              bezier 
              style={styles.chart} 
            />
          )}
        </View>

        <View style={styles.commissionCard}>
          <Text style={styles.cardTitle}>Earnings Summary</Text>
          <View style={styles.row}>
            <Text style={styles.summaryLabel}>Withdrawn Amount</Text>
            <Text style={styles.summaryValue}>${parseFloat(earningsData?.withdrawnAmount || 0).toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.summaryLabel}>Platform Commission Paid</Text>
            <Text style={[styles.summaryValue, styles.negative]}>-${parseFloat(earningsData?.totalCommissionPaid || 0).toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.summaryLabel, styles.bold]}>Net Earnings</Text>
            <Text style={[styles.summaryValue, styles.positive]}>${parseFloat(earningsData?.totalEarnings || 0).toFixed(2)}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {txList.length === 0 ? (
          <Text style={styles.emptyText}>No transaction records found.</Text>
        ) : (
          <ScrollView horizontal={false} scrollEnabled={false} style={{ flex: 1 }}>
            {txList.map((item, index) => (
              <View key={item._id} style={[styles.transactionRow, index % 2 === 1 && styles.stripedRow]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.txLabel}>#{item.orderNumber || item._id.slice(-6).toUpperCase()}</Text>
                  <Text style={styles.txDate}>
                    {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Text>
                </View>
                <View style={styles.txAmounts}>
                  <Text style={styles.txGross}>Gross: ${(item.grossAmount || 0).toFixed(2)}</Text>
                  <Text style={styles.txCommission}>Fee: -${(item.commissionAmount || 0).toFixed(2)}</Text>
                  <Text style={styles.txNet}>Net: ${(item.sellerEarnings || 0).toFixed(2)}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { padding: 20, paddingBottom: 40 },
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
  txLabel: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 4 },
  txDate: { fontSize: 11, color: '#7a7a7a' },
  txAmounts: { alignItems: 'flex-end' },
  txGross: { fontSize: 12, color: '#666' },
  txCommission: { fontSize: 11, color: colors.error, marginTop: 1 },
  txNet: { fontSize: 12, color: colors.success, fontWeight: '700', marginTop: 1 },
  emptyText: { textAlign: 'center', marginVertical: 20, color: '#999', fontSize: 13 },
});
