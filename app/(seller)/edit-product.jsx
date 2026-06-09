import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import SellerHeader from '../../components/seller/SellerHeader';
import { useSeller } from '../../context/SellerContext';
import { colors } from '../../constants/colors';

export default function EditProduct() {
  const { products, updateProduct, deleteProduct } = useSeller();
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', sku: '', price: '', comparePrice: '', cost: '', category: '', subcategory: '', stock: '10', alertThreshold: '3', inStock: true, weight: '', length: '', width: '', height: '', freeShipping: false, shippingFee: '' });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id && products) {
      const found = products.find((item) => (item._id || item.id) === id);
      if (found) {
        setProduct(found);
      }
    } else if (products && products.length > 0) {
      setProduct(products[0]);
    }
  }, [id, products]);

  useEffect(() => {
    if (product) {
      setForm({
        title: product.title || product.name || '',
        description: product.description || '',
        sku: product.sku || '',
        price: String(product.price || ''),
        comparePrice: String(product.comparePrice || ''),
        cost: String(product.cost || ''),
        category: product.category?.name || product.category || '',
        subcategory: product.subcategory || '',
        stock: String(product.stock ?? 0),
        alertThreshold: String(product.alertThreshold ?? 3),
        inStock: product.stock > 0,
        weight: String(product.weight || ''),
        length: String(product.length || ''),
        width: String(product.width || ''),
        height: String(product.height || ''),
        freeShipping: product.freeShipping || false,
        shippingFee: String(product.shippingFee || ''),
      });
      setImages(product.images || []);
    }
  }, [product]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.cancelled) {
      setImages((prev) => [...prev, result.uri].slice(0, 5));
    }
  };

  const handleSubmit = async () => {
    if (!product) return;
    setLoading(true);
    setError(null);
    try {
      await updateProduct(product._id || product.id, { ...form, images });
      Alert.alert('Success', 'Product updated successfully.', [
        { text: 'OK', onPress: () => router.canGoBack() ? router.back() : router.replace('/(seller)/dashboard') }
      ]);
    } catch (err) {
      setError(err.message || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            setError(null);
            try {
              await deleteProduct(product._id || product.id);
              Alert.alert('Success', 'Product deleted successfully.', [
                { text: 'OK', onPress: () => router.canGoBack() ? router.back() : router.replace('/(seller)/dashboard') }
              ]);
            } catch (err) {
              setError(err.message || 'Delete failed.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.flex}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <SellerHeader title="Edit Product" />
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.photoRow}>
          {images.map((uri, idx) => (
            <View key={idx} style={styles.thumbSlot}><Text style={styles.thumbText}>Img</Text></View>
          ))}
          <TouchableOpacity style={styles.thumbSlot} onPress={pickImage}><MaterialCommunityIcons name="plus" size={28} color={colors.primary} /></TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Basic Info</Text>
          <TextInput style={styles.input} placeholder="Product Title" value={form.title} onChangeText={(text) => setForm({ ...form, title: text })} />
          <TextInput style={[styles.input, styles.textArea]} placeholder="Description" multiline value={form.description} onChangeText={(text) => setForm({ ...form, description: text })} />
          <TextInput style={styles.input} placeholder="SKU / Product Code" value={form.sku} onChangeText={(text) => setForm({ ...form, sku: text })} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pricing</Text>
          <TextInput style={styles.input} placeholder="Price" keyboardType="decimal-pad" value={form.price} onChangeText={(price) => setForm({ ...form, price })} />
          <TextInput style={styles.input} placeholder="Compare Price" keyboardType="decimal-pad" value={form.comparePrice} onChangeText={(comparePrice) => setForm({ ...form, comparePrice })} />
          <TextInput style={styles.input} placeholder="Cost per item" keyboardType="decimal-pad" value={form.cost} onChangeText={(cost) => setForm({ ...form, cost })} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Category</Text>
          <TouchableOpacity style={styles.input} onPress={() => Alert.alert('Select category')}><Text style={styles.selectLabel}>{form.category || 'Select category'}</Text></TouchableOpacity>
          <TouchableOpacity style={styles.input} onPress={() => Alert.alert('Select subcategory')}><Text style={styles.selectLabel}>{form.subcategory || 'Select subcategory'}</Text></TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Inventory</Text>
          <View style={styles.row}><TextInput style={[styles.input, styles.halfInput]} placeholder="Stock Quantity" keyboardType="number-pad" value={form.stock} onChangeText={(stock) => setForm({ ...form, stock })} /><TextInput style={[styles.input, styles.halfInput]} placeholder="Low stock alert" keyboardType="number-pad" value={form.alertThreshold} onChangeText={(alertThreshold) => setForm({ ...form, alertThreshold })} /></View>
          <View style={styles.toggleRow}><Text style={styles.toggleLabel}>In Stock</Text><TouchableOpacity style={[styles.switch, form.inStock && styles.switchActive]} onPress={() => setForm((prev) => ({ ...prev, inStock: !prev.inStock }))}><View style={[styles.switchThumb, form.inStock && styles.switchThumbActive]} /></TouchableOpacity></View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Shipping</Text>
          <TextInput style={styles.input} placeholder="Weight (kg)" keyboardType="decimal-pad" value={form.weight} onChangeText={(weight) => setForm({ ...form, weight })} />
          <View style={styles.row}><TextInput style={[styles.input, styles.threeInput]} placeholder="L" keyboardType="decimal-pad" value={form.length} onChangeText={(length) => setForm({ ...form, length })} /><TextInput style={[styles.input, styles.threeInput]} placeholder="W" keyboardType="decimal-pad" value={form.width} onChangeText={(width) => setForm({ ...form, width })} /><TextInput style={[styles.input, styles.threeInput]} placeholder="H" keyboardType="decimal-pad" value={form.height} onChangeText={(height) => setForm({ ...form, height })} /></View>
          <View style={styles.toggleRow}><Text style={styles.toggleLabel}>Free Shipping</Text><TouchableOpacity style={[styles.switch, form.freeShipping && styles.switchActive]} onPress={() => setForm((prev) => ({ ...prev, freeShipping: !prev.freeShipping }))}><View style={[styles.switchThumb, form.freeShipping && styles.switchThumbActive]} /></TouchableOpacity></View>
          {!form.freeShipping && <TextInput style={styles.input} placeholder="Shipping fee" keyboardType="decimal-pad" value={form.shippingFee} onChangeText={(shippingFee) => setForm({ ...form, shippingFee })} />}
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} disabled={loading}><MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.error} /><Text style={styles.deleteLabel}>Delete Product</Text></TouchableOpacity>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.saveButton} onPress={handleSubmit} disabled={loading}>{loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveLabel}>Update Product</Text>}</TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { padding: 20, paddingBottom: 20 },
  photoRow: { flexDirection: 'row', marginBottom: 20 },
  thumbSlot: { width: 84, height: 84, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e8e8e8', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  thumbText: { color: '#8a8a8a' },
  card: { backgroundColor: '#fff', borderRadius: 22, padding: 18, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 14, elevation: 4, marginBottom: 18 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, color: colors.text },
  input: { width: '100%', borderWidth: 1, borderColor: '#eef0ff', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 12, backgroundColor: '#fafaff' },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  selectLabel: { color: '#7a7a7a' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInput: { width: '48%' },
  threeInput: { width: '31%' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  toggleLabel: { fontSize: 14, color: '#555', fontWeight: '700' },
  switch: { width: 50, height: 28, borderRadius: 16, padding: 4, justifyContent: 'center', backgroundColor: '#e6e6e6' },
  switchActive: { backgroundColor: colors.accent },
  switchThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff' },
  switchThumbActive: { transform: [{ translateX: 22 }] },
  deleteButton: { marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.error, backgroundColor: '#fff' },
  deleteLabel: { marginLeft: 8, color: colors.error, fontWeight: '700' },
  saveButton: { marginTop: 20, borderRadius: 18, backgroundColor: colors.primary, paddingVertical: 16, alignItems: 'center' },
  saveLabel: { color: '#fff', fontSize: 15, fontWeight: '700' },
  error: { marginTop: 10, color: colors.error, fontSize: 13, textAlign: 'center' },
});
