import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SellerHeader from '../../components/seller/SellerHeader';
import { useSeller } from '../../context/SellerContext';
import { colors } from '../../constants/colors';

const categories = ['Electronics', 'Clothing', 'Home', 'Beauty', 'Sports', 'Food', 'Automotive', 'Books', 'Toys', 'Health', 'Garden', 'Jewelry', 'Stationery', 'Gadgets'];

export default function AddProduct() {
  const { addProduct } = useSeller();
  const [form, setForm] = useState({ title: '', description: '', sku: '', price: '', comparePrice: '', cost: '', category: '', subcategory: '', stock: '10', alertThreshold: '3', inStock: true, weight: '', length: '', width: '', height: '', freeShipping: false, shippingFee: '' });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection: true, quality: 0.8 });
    if (!result.cancelled) {
      setImages((prev) => [...prev, result.uri].slice(0, 5));
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.price || !form.category) {
      setError('Title, price and category are required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await addProduct({ ...form, images });
      alert('Product added successfully.');
    } catch (err) {
      setError(err.message || 'Save failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SellerHeader title="Add New Product" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.uploadBox}>
          <MaterialCommunityIcons name="camera-plus-outline" size={28} color={colors.primary} />
          <Text style={styles.uploadTitle}>Upload Product Photos</Text>
          <Text style={styles.uploadSubtitle}>Add up to 5 images</Text>
          <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
            <Text style={styles.addPhotoLabel}>Add photos</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbRow}>
          {images.map((uri, idx) => (
            <View key={`${uri}-${idx}`} style={styles.thumbSlot}>
              <MaterialCommunityIcons name="image" size={26} color="#8a8a8a" />
            </View>
          ))}
          {images.length < 5 && (
            <TouchableOpacity style={styles.thumbSlot} onPress={pickImage}>
              <MaterialCommunityIcons name="plus" size={26} color={colors.primary} />
            </TouchableOpacity>
          )}
        </ScrollView>

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
          <TouchableOpacity style={styles.input} onPress={() => alert('Select category')}>
            <Text style={styles.selectLabel}>{form.category || 'Select category'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.input} onPress={() => alert('Select subcategory')}>
            <Text style={styles.selectLabel}>{form.subcategory || 'Select subcategory'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Inventory</Text>
          <View style={styles.row}> <TextInput style={[styles.input, styles.halfInput]} placeholder="Stock Quantity" keyboardType="number-pad" value={form.stock} onChangeText={(stock) => setForm({ ...form, stock })} />
            <TextInput style={[styles.input, styles.halfInput]} placeholder="Low stock alert" keyboardType="number-pad" value={form.alertThreshold} onChangeText={(alertThreshold) => setForm({ ...form, alertThreshold })} />
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>In Stock</Text>
            <TouchableOpacity style={[styles.switch, form.inStock && styles.switchActive]} onPress={() => setForm((prev) => ({ ...prev, inStock: !prev.inStock }))}>
              <View style={[styles.switchThumb, form.inStock && styles.switchThumbActive]} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Shipping</Text>
          <TextInput style={styles.input} placeholder="Weight (kg)" keyboardType="decimal-pad" value={form.weight} onChangeText={(weight) => setForm({ ...form, weight })} />
          <View style={styles.row}> <TextInput style={[styles.input, styles.threeInput]} placeholder="L" keyboardType="decimal-pad" value={form.length} onChangeText={(length) => setForm({ ...form, length })} />
            <TextInput style={[styles.input, styles.threeInput]} placeholder="W" keyboardType="decimal-pad" value={form.width} onChangeText={(width) => setForm({ ...form, width })} />
            <TextInput style={[styles.input, styles.threeInput]} placeholder="H" keyboardType="decimal-pad" value={form.height} onChangeText={(height) => setForm({ ...form, height })} />
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Free Shipping</Text>
            <TouchableOpacity style={[styles.switch, form.freeShipping && styles.switchActive]} onPress={() => setForm((prev) => ({ ...prev, freeShipping: !prev.freeShipping }))}>
              <View style={[styles.switchThumb, form.freeShipping && styles.switchThumbActive]} />
            </TouchableOpacity>
          </View>
          {!form.freeShipping && <TextInput style={styles.input} placeholder="Shipping fee" keyboardType="decimal-pad" value={form.shippingFee} onChangeText={(shippingFee) => setForm({ ...form, shippingFee })} />}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.saveButton} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveLabel}>Add Product</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { padding: 20, paddingBottom: 100 },
  uploadBox: { borderWidth: 1, borderStyle: 'dashed', borderColor: '#c7d2ff', borderRadius: 24, padding: 22, alignItems: 'center', backgroundColor: '#f6f8ff' },
  uploadTitle: { marginTop: 14, fontSize: 16, fontWeight: '700', color: colors.text },
  uploadSubtitle: { marginTop: 6, fontSize: 13, color: '#7a7a7a' },
  addPhotoButton: { marginTop: 16, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 14, backgroundColor: colors.primary },
  addPhotoLabel: { color: '#fff', fontWeight: '700' },
  thumbRow: { marginTop: 16 },
  thumbSlot: { width: 80, height: 80, borderRadius: 18, borderWidth: 1, borderColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center', marginRight: 12, backgroundColor: '#fff' },
  card: { marginTop: 18, backgroundColor: '#fff', borderRadius: 22, padding: 18, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12, elevation: 3 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 14 },
  input: { width: '100%', borderWidth: 1, borderColor: '#eef0ff', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 12, backgroundColor: '#fafaff' },
  textArea: { minHeight: 108, textAlignVertical: 'top' },
  selectLabel: { color: '#7a7a7a' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInput: { width: '48%' },
  threeInput: { width: '31%' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  toggleLabel: { fontSize: 14, color: '#555', fontWeight: '700' },
  switch: { width: 48, height: 28, borderRadius: 16, backgroundColor: '#e4e4e4', padding: 4, justifyContent: 'center' },
  switchActive: { backgroundColor: colors.accent },
  switchThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
  switchThumbActive: { transform: [{ translateX: 20 }] },
  error: { marginTop: 10, color: colors.error, fontSize: 13 },
  saveButton: { marginTop: 22, borderRadius: 18, backgroundColor: colors.primary, paddingVertical: 16, alignItems: 'center' },
  saveLabel: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
