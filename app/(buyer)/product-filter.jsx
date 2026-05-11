// app/(buyer)/product-filter.jsx
import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest Arrivals' },
  { id: 'price_low', label: 'Price: Low to\nHigh' },
  { id: 'price_high', label: 'Price: High to\nLow' },
  { id: 'top_rated', label: 'Top Rated' },
]

const CATEGORIES = [
  'Logistics',
  'Raw Materials',
  'Textiles',
  'Electronics',
]

const RATINGS = [
  { id: '2+', label: '2+' },
  { id: '3+', label: '3+' },
  { id: '4+', label: '4+' },
  { id: 'all', label: 'All' },
]

export default function ProductFilterScreen() {
  const [sortBy, setSortBy] = useState('newest')
  const [category, setCategory] = useState('Logistics')
  const [minRating, setMinRating] = useState('4+')

  const handleReset = () => {
    setSortBy('newest')
    setCategory('Logistics')
    setMinRating('4+')
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Drag Handle */}
      <View style={styles.handleContainer}>
        <View style={styles.handle} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Refine Search</Text>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.resetText}>Reset All</Text>
          </TouchableOpacity>
        </View>

        {/* Sort By */}
        <Text style={styles.sectionTitle}>Sort By</Text>
        <View style={styles.sortGrid}>
          {SORT_OPTIONS.map((opt) => {
            const isSelected = sortBy === opt.id
            return (
              <TouchableOpacity
                key={opt.id}
                style={[styles.sortBtn, isSelected && styles.sortBtnSelected]}
                onPress={() => setSortBy(opt.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.sortBtnText, isSelected && styles.sortBtnTextSelected]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Category */}
        <Text style={styles.sectionTitle}>Category</Text>
        <View style={styles.chipRow}>
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, isSelected ? styles.chipSelected : styles.chipUnselected]}
                onPress={() => setCategory(cat)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Price Range */}
        <View style={styles.priceHeader}>
          <Text style={styles.sectionTitle}>Price Range</Text>
          <Text style={styles.priceValue}>$100 - $5,000+</Text>
        </View>
        <View style={styles.sliderMockContainer}>
          <View style={styles.sliderTrackBg} />
          <View style={styles.sliderTrackActive} />
          <View style={[styles.sliderKnob, { left: '15%' }]} />
          <View style={[styles.sliderKnob, { right: '15%' }]} />
        </View>

        {/* Minimum Rating */}
        <Text style={styles.sectionTitle}>Minimum Rating</Text>
        <View style={styles.ratingRow}>
          {RATINGS.map((rating) => {
            const isSelected = minRating === rating.id
            return (
              <TouchableOpacity
                key={rating.id}
                style={styles.ratingBtn}
                onPress={() => setMinRating(rating.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.starIcon, isSelected && styles.starIconSelected]}>
                  {isSelected ? '★' : '☆'}
                </Text>
                <Text style={[styles.ratingText, isSelected && styles.ratingTextSelected]}>
                  {rating.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

      </ScrollView>

      {/* Apply Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.applyBtn}
          onPress={() => router.back()}
          activeOpacity={0.9}
        >
          <Text style={styles.applyBtnText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbfbfe',
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#d1d1d6',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000033',
  },
  resetText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007b8a',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  
  // Sort By
  sortGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  sortBtn: {
    width: '48%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  sortBtnSelected: {
    backgroundColor: '#e8eaf6',
    borderColor: '#3f51b5',
  },
  sortBtnText: {
    fontSize: 13,
    color: '#555',
    textAlign: 'center',
    lineHeight: 18,
  },
  sortBtnTextSelected: {
    color: '#1a237e',
    fontWeight: '600',
  },

  // Category
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 28,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipUnselected: {
    backgroundColor: '#f0f0f0',
    borderColor: '#f0f0f0',
  },
  chipSelected: {
    backgroundColor: '#e1f5fe',
    borderColor: '#0288d1',
  },
  chipText: {
    fontSize: 12,
    color: '#444',
  },
  chipTextSelected: {
    color: '#0288d1',
    fontWeight: '600',
  },

  // Price Range
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#007b8a',
  },
  sliderMockContainer: {
    height: 24,
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 32,
  },
  sliderTrackBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
  },
  sliderTrackActive: {
    position: 'absolute',
    left: '15%',
    right: '15%',
    height: 4,
    backgroundColor: '#007b8a',
    borderRadius: 2,
  },
  sliderKnob: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#007b8a',
  },

  // Ratings
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  ratingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starIcon: {
    fontSize: 16,
    color: '#a0a0a0',
  },
  starIconSelected: {
    color: '#007b8a',
  },
  ratingText: {
    fontSize: 13,
    color: '#a0a0a0',
  },
  ratingTextSelected: {
    color: '#333',
    fontWeight: '600',
  },

  // Bottom Button
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#fbfbfe',
  },
  applyBtn: {
    backgroundColor: '#000051', 
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
})
