import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// Reusable Pulse Animated Block
export function SkeletonPulse({ style }) {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return <Animated.View style={[styles.pulse, style, { opacity: pulseAnim }]} />;
}

// 1. Seller Product Card List Row Skeleton
export function SellerProductCardSkeleton() {
  return (
    <View style={styles.productCard}>
      <SkeletonPulse style={styles.image} />
      <View style={styles.info}>
        <SkeletonPulse style={styles.titleLine} />
        <SkeletonPulse style={styles.badgeLine} />
        <SkeletonPulse style={styles.priceLine} />
        <View style={styles.btnRow}>
          <SkeletonPulse style={styles.btnSlot} />
          <SkeletonPulse style={styles.btnSlot} />
        </View>
      </View>
    </View>
  );
}

// 2. Seller Order Card List Row Skeleton
export function SellerOrderCardSkeleton() {
  return (
    <View style={styles.orderCard}>
      <View style={styles.orderLeft}>
        <SkeletonPulse style={styles.titleLine} />
        <SkeletonPulse style={[styles.badgeLine, { marginTop: 6 }]} />
        <SkeletonPulse style={[styles.priceLine, { marginTop: 8 }]} />
      </View>
      <SkeletonPulse style={styles.orderRightBadge} />
    </View>
  );
}

// 3. Seller Statistics Metric Card Skeleton
export function SellerStatsCardSkeleton() {
  return (
    <View style={styles.statsCard}>
      <SkeletonPulse style={styles.statsIcon} />
      <SkeletonPulse style={styles.statsLabel} />
      <SkeletonPulse style={styles.statsValue} />
      <SkeletonPulse style={styles.statsTrend} />
    </View>
  );
}

// 4. Seller Dashboard Full Loading Skeleton
export function SellerDashboardSkeleton() {
  const items = [1, 2, 3, 4];
  return (
    <View style={styles.dashboard}>
      <SkeletonPulse style={styles.welcomeBanner} />
      <View style={styles.statsRow}>
        <SellerStatsCardSkeleton />
        <SellerStatsCardSkeleton />
      </View>
      <SkeletonPulse style={styles.chartBlock} />
      <SkeletonPulse style={styles.headerLine} />
      {items.map(i => (
        <SellerOrderCardSkeleton key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  pulse: {
    backgroundColor: '#e1e3ed',
    borderRadius: 8,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginRight: 12,
  },
  info: {
    flex: 1,
    gap: 8,
  },
  titleLine: {
    width: '60%',
    height: 14,
  },
  badgeLine: {
    width: '35%',
    height: 10,
    borderRadius: 50,
  },
  priceLine: {
    width: '20%',
    height: 15,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  btnSlot: {
    width: 65,
    height: 28,
    borderRadius: 10,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  orderLeft: {
    flex: 1,
  },
  orderRightBadge: {
    width: 80,
    height: 28,
    borderRadius: 999,
  },
  statsCard: {
    width: 140,
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 16,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#eee',
    gap: 8,
  },
  statsIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
  },
  statsLabel: {
    width: '70%',
    height: 10,
  },
  statsValue: {
    width: '50%',
    height: 18,
  },
  statsTrend: {
    width: '40%',
    height: 8,
  },
  dashboard: {
    padding: 20,
    gap: 20,
  },
  welcomeBanner: {
    width: '100%',
    height: 120,
    borderRadius: 28,
  },
  statsRow: {
    flexDirection: 'row',
  },
  chartBlock: {
    width: '100%',
    height: 220,
    borderRadius: 28,
  },
  headerLine: {
    width: '45%',
    height: 16,
  },
});
