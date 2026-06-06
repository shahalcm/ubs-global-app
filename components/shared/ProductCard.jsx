import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '../../constants/colors';
import { getProductImageUrl } from '../../utils/image';

export function ProductCard({ title, price, imageUri, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {imageUri ? (
        <Image
          source={{ uri: getProductImageUrl(imageUri) }}
          style={styles.image}
          transition={200}
        />
      ) : (
        <View style={[styles.image, styles.placeholder]} />
      )}
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {price != null ? <Text style={styles.price}>{price}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    marginBottom: 12,
  },
  image: { width: '100%', height: 120, backgroundColor: colors.surface },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  body: { padding: 12 },
  title: { fontSize: 14, fontWeight: '600', color: colors.text },
  price: { marginTop: 6, fontSize: 16, fontWeight: '700', color: colors.primary },
});

export default ProductCard;
