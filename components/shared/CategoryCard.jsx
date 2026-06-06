import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '../../constants/colors';
import { getCategoryImage } from '../../constants/categories';

export function CategoryCard({ label, image, onPress, variant = 'circle' }) {
  if (variant === 'pill') {
    return (
      <TouchableOpacity style={styles.pill} onPress={onPress} activeOpacity={0.85}>
        <Text style={styles.label}>{label}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.categoryItem} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.categoryCircle}>
        <Image
          source={getCategoryImage(label, image)}
          style={styles.categoryImage}
          transition={200}
        />
      </View>
      <View style={styles.categoryNameContainer}>
        <Text style={styles.categoryName} numberOfLines={2}>{label}</Text>
      </View>
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
  categoryItem: {
    width: "25%",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  categoryCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: "#e8ecf4",
    marginBottom: 6,
  },
  categoryImage: {
    width: "100%",
    height: "100%",
  },
  categoryNameContainer: {
    height: 32,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
  },
  categoryName: {
    fontSize: 11,
    color: "#444",
    textAlign: "center",
    lineHeight: 14,
  },
});

export default CategoryCard;