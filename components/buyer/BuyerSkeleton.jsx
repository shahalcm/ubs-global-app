import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

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

// 1. Single Buyer Product Card Skeleton
export function ProductCardSkeleton() {
  return (
    <View style={styles.productCard}>
      <SkeletonPulse style={styles.productImage} />
      <View style={styles.productInfo}>
        <SkeletonPulse style={styles.smallLine} />
        <SkeletonPulse style={styles.titleLine} />
        <SkeletonPulse style={styles.priceLine} />
      </View>
    </View>
  );
}

// 2. Category Item Card Skeleton
export function CategoryCardSkeleton() {
  return (
    <View style={styles.categoryCard}>
      <SkeletonPulse style={styles.categoryCircle} />
      <SkeletonPulse style={styles.categoryText} />
    </View>
  );
}

// 3. Grid Skeleton for Listings
export function ProductGridSkeleton() {
  const tempArray = [1, 2, 4, 5, 6];
  return (
    <View style={styles.grid}>
      {tempArray.map((i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </View>
  );
}

// 4. Detailed View Skeleton
export function ProductDetailsSkeleton() {
  return (
    <View style={styles.detailsContainer}>
      <SkeletonPulse style={styles.detailsImage} />
      <View style={styles.detailsInfo}>
        <SkeletonPulse style={styles.detailsTitle} />
        <SkeletonPulse style={styles.detailsPrice} />
        <SkeletonPulse style={styles.detailsDescLine} />
        <SkeletonPulse style={[styles.detailsDescLine, { width: '85%' }]} />
        <SkeletonPulse style={[styles.detailsDescLine, { width: '60%' }]} />
        <SkeletonPulse style={styles.detailsButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pulse: {
    backgroundColor: '#e2e5f0',
    borderRadius: 8,
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 16,
  },
  productImage: {
    width: '100%',
    height: 160,
    borderRadius: 0,
  },
  productInfo: {
    padding: 10,
    gap: 8,
  },
  smallLine: {
    width: '40%',
    height: 10,
  },
  titleLine: {
    width: '80%',
    height: 14,
  },
  priceLine: {
    width: '30%',
    height: 16,
  },
  categoryCard: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 2,
    gap: 8,
  },
  categoryCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  categoryText: {
    width: '60%',
    height: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: '#f5f7fc',
  },
  detailsImage: {
    width: '100%',
    height: 300,
    borderRadius: 0,
  },
  detailsInfo: {
    padding: 20,
    gap: 16,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
    flex: 1,
  },
  detailsTitle: {
    width: '70%',
    height: 24,
  },
  detailsPrice: {
    width: '35%',
    height: 22,
  },
  detailsDescLine: {
    width: '95%',
    height: 12,
    marginTop: 4,
  },
  detailsButton: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    marginTop: 24,
  },
});
