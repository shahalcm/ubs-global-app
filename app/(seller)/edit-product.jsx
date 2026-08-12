import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import SellerHeader from '../../components/seller/SellerHeader';
import { useSeller } from '../../context/SellerContext';
import { colors } from '../../constants/colors';

const PRESET_COLORS = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Navy', 'Gray', 'Beige', 'Gold', 'Silver'];
const PRESET_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '28', '30', '32', '34', '36', '38', '40', 'Free Size'];

const CATEGORIES = [
  { label: 'Select Category', value: '' },
  { label: 'Fashion', value: 'fashion' },
  { label: 'Mobiles', value: 'mobiles' },
  { label: 'Furniture', value: 'furniture' },
  { label: 'Cosmetics', value: 'cosmetics' },
  { label: 'Grocery', value: 'grocery' },
  { label: 'Electronics', value: 'electronics' },
  { label: 'Medicines', value: 'medicines' },
  { label: 'Home & Kitchen', value: 'home-kitchen' },
  { label: 'Real Estate', value: 'real-estate' },
  { label: 'Building Materials', value: 'building-materials' },
  { label: 'Machinery', value: 'machinery' },
  { label: 'Oils', value: 'oils' },
];

const SUBCATEGORIES_MAP = {
  fashion: [
    { label: "Men's Wear", value: 'mens-wear' },
    { label: "Women's Wear", value: 'womens-wear' },
    { label: 'Kids Wear', value: 'kids-wear' },
    { label: 'Footwear', value: 'footwear' },
    { label: 'Accessories', value: 'accessories' }
  ],
  mobiles: [
    { label: 'Smartphones', value: 'smartphones' },
    { label: 'Feature Phones', value: 'feature-phones' },
    { label: 'Tablets', value: 'tablets' },
    { label: 'Mobile Accessories', value: 'mobile-accessories' }
  ],
  furniture: [
    { label: 'Living Room Furniture', value: 'living-room' },
    { label: 'Bedroom Furniture', value: 'bedroom' },
    { label: 'Office Furniture', value: 'office-furniture' },
    { label: 'Outdoor Furniture', value: 'outdoor-furniture' }
  ],
  cosmetics: [
    { label: 'Skincare', value: 'skincare' },
    { label: 'Haircare', value: 'haircare' },
    { label: 'Makeup', value: 'makeup' },
    { label: 'Fragrances', value: 'fragrances' },
    { label: 'Personal Care', value: 'personal-care' }
  ],
  grocery: [
    { label: 'Fruits & Vegetables', value: 'fruits-vegetables' },
    { label: 'Dairy & Eggs', value: 'dairy-eggs' },
    { label: 'Beverages', value: 'beverages' },
    { label: 'Packaged Food', value: 'packaged-food' },
    { label: 'Spices & Grains', value: 'spices-grains' }
  ],
  electronics: [
    { label: 'Laptops & Computers', value: 'laptops-computers' },
    { label: 'Cameras & Optics', value: 'cameras-optics' },
    { label: 'Audio & Headphones', value: 'audio-headphones' },
    { label: 'Smart Home Devices', value: 'smart-home' },
    { label: 'Televisions & Media Players', value: 'televisions-media' }
  ],
  medicines: [
    { label: 'Prescription Drugs', value: 'prescription' },
    { label: 'OTC Medicines', value: 'otc' },
    { label: 'Vitamins & Supplements', value: 'vitamins-supplements' },
    { label: 'First Aid & Medical Supplies', value: 'first-aid' }
  ],
  'home-kitchen': [
    { label: 'Cookware & Tableware', value: 'cookware-tableware' },
    { label: 'Home Decor & Lighting', value: 'home-decor' },
    { label: 'Kitchen Appliances', value: 'kitchen-appliances' },
    { label: 'Bedding & Bath Linens', value: 'bedding-bath' }
  ],
  'real-estate': [
    { label: 'Residential Properties', value: 'residential' },
    { label: 'Commercial Properties', value: 'commercial' },
    { label: 'Rentals & Leases', value: 'rentals' },
    { label: 'Land & Plots', value: 'land-plots' }
  ],
  'building-materials': [
    { label: 'Cement & Concrete', value: 'cement-concrete' },
    { label: 'Steel & Metal Rebar', value: 'steel-rebar' },
    { label: 'Pipes & Sanitary Fittings', value: 'pipes-fittings' },
    { label: 'Electrical Wires & Switches', value: 'electrical-switches' },
    { label: 'Paints & Wall Finishes', value: 'paints-finishes' }
  ],
  machinery: [
    { label: 'Agricultural Machinery', value: 'agricultural' },
    { label: 'Industrial Machinery', value: 'industrial' },
    { label: 'Construction Equipment', value: 'construction' },
    { label: 'Tools & Hardware Instruments', value: 'tools-hardware' }
  ],
  oils: [
    { label: 'Edible cooking Oils', value: 'edible-cooking' },
    { label: 'Industrial Lubricants', value: 'lubricants' },
    { label: 'Essential / Aroma Oils', value: 'essential-aroma' },
    { label: 'Hair & Cosmetic Oils', value: 'hair-cosmetic' }
  ]
};

export default function EditProduct() {
  const { products, updateProduct, deleteProduct } = useSeller();
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    sku: '',
    price: '',
    comparePrice: '',
    cost: '',
    category: '',
    subcategory: '',
    stock: '10',
    alertThreshold: '3',
    inStock: true,
    weight: '',
    length: '',
    width: '',
    height: '',
    freeShipping: false,
    shippingFee: '',
    brand: '',
    color: '',
    colors: [],
    sizes: [],
    countryOfOrigin: '',
    warranty: '',
    material: '',
    fit: '',
    sleeve: '',
    neck: '',
    refundPolicy: '',
    priceUnit: '',
    stockUnit: 'pcs'
  });
  const [customColor, setCustomColor] = useState('');
  const [customSize, setCustomSize] = useState('');
  const [customSubcategory, setCustomSubcategory] = useState('');
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
      const initialStockNum = Number(product.stock ?? 0);
      const catVal = product.category?.slug || product.category?.name?.toLowerCase() || product.category || '';
      const subcatVal = product.subcategory || '';
      const mappedSubcats = SUBCATEGORIES_MAP[catVal] || [];
      const isMapped = mappedSubcats.some(s => s.value === subcatVal);

      setForm({
        title: product.title || product.name || '',
        description: product.description || '',
        sku: product.sku || '',
        price: String(product.price || ''),
        comparePrice: String(product.comparePrice || ''),
        cost: String(product.cost || ''),
        category: catVal,
        subcategory: subcatVal ? (isMapped ? subcatVal : 'custom') : '',
        stock: String(initialStockNum),
        alertThreshold: String(product.alertThreshold ?? 3),
        inStock: initialStockNum > 0,
        weight: String(product.weight || ''),
        length: String(product.length || ''),
        width: String(product.width || ''),
        height: String(product.height || ''),
        freeShipping: product.freeShipping || false,
        shippingFee: String(product.shippingFee || ''),
        brand: product.brand || '',
        color: product.color || '',
        colors: Array.isArray(product.colors) ? product.colors : (product.color ? [product.color] : []),
        sizes: Array.isArray(product.sizes) ? product.sizes : [],
        countryOfOrigin: product.countryOfOrigin || '',
        warranty: product.warranty || '',
        material: product.material || '',
        fit: product.fit || '',
        sleeve: product.sleeve || '',
        neck: product.neck || '',
        refundPolicy: product.refundPolicy || '',
        priceUnit: product.priceUnit || '',
        stockUnit: product.stockUnit || 'pcs'
      });
      setCustomSubcategory(subcatVal ? (isMapped ? '' : subcatVal) : '');
      setImages(product.images || []);
    }
  }, [product]);

  const toggleColor = (c) => {
    setForm(prev => {
      const current = prev.colors || [];
      const updated = current.includes(c) ? current.filter(item => item !== c) : [...current, c];
      return { ...prev, colors: updated, color: updated[0] || '' };
    });
  };

  const addCustomColor = () => {
    const trimmed = customColor.trim();
    if (trimmed && !(form.colors || []).includes(trimmed)) {
      setForm(prev => {
        const updated = [...(prev.colors || []), trimmed];
        return { ...prev, colors: updated, color: updated[0] || '' };
      });
      setCustomColor('');
    }
  };

  const toggleSize = (s) => {
    setForm(prev => {
      const current = prev.sizes || [];
      const updated = current.includes(s) ? current.filter(item => item !== s) : [...current, s];
      return { ...prev, sizes: updated };
    });
  };

  const addCustomSize = () => {
    const trimmed = customSize.trim();
    if (trimmed && !(form.sizes || []).includes(trimmed)) {
      setForm(prev => ({ ...prev, sizes: [...(prev.sizes || []), trimmed] }));
      setCustomSize('');
    }
  };

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
      const finalStock = form.inStock ? (Number(form.stock) > 0 ? form.stock : '10') : '0';
      const payload = {
        ...form,
        subcategory: form.subcategory === 'custom' ? customSubcategory.trim() : form.subcategory,
        stock: finalStock,
        inStock: form.inStock,
        images
      };
      await updateProduct(product._id || product.id, payload);
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
          <Text style={styles.cardTitle}>Specifications & Attributes</Text>
          <Text style={styles.fieldLabel}>Brand Name</Text>
          <TextInput style={styles.input} placeholder="Brand Name (e.g. Nike, Samsung)" value={form.brand} onChangeText={(brand) => setForm({ ...form, brand })} />

          <Text style={styles.fieldLabel}>Available Colors</Text>
          <View style={styles.chipsContainer}>
            {PRESET_COLORS.map((c) => {
              const selected = (form.colors || []).includes(c);
              return (
                <TouchableOpacity key={c} style={[styles.chip, selected && styles.chipSelected]} onPress={() => toggleColor(c)}>
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{selected ? '✓ ' : ''}{c}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.customAddRow}>
            <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} placeholder="Add custom color" value={customColor} onChangeText={setCustomColor} />
            <TouchableOpacity style={styles.addChipBtn} onPress={addCustomColor}><Text style={styles.addChipBtnText}>+ Add</Text></TouchableOpacity>
          </View>

          <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Available Sizes</Text>
          <View style={styles.chipsContainer}>
            {PRESET_SIZES.map((s) => {
              const selected = (form.sizes || []).includes(s);
              return (
                <TouchableOpacity key={s} style={[styles.chip, selected && styles.chipSelected]} onPress={() => toggleSize(s)}>
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{selected ? '✓ ' : ''}{s}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.customAddRow}>
            <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} placeholder="Add custom size" value={customSize} onChangeText={setCustomSize} />
            <TouchableOpacity style={styles.addChipBtn} onPress={addCustomSize}><Text style={styles.addChipBtnText}>+ Add</Text></TouchableOpacity>
          </View>

          <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Country of Origin</Text>
          <TextInput style={styles.input} placeholder="Country of Origin (e.g. India, USA)" value={form.countryOfOrigin} onChangeText={(countryOfOrigin) => setForm({ ...form, countryOfOrigin })} />

          <Text style={styles.fieldLabel}>Warranty / Guarantee</Text>
          <TextInput style={styles.input} placeholder="Warranty (e.g. 1 Year Manufacturer Warranty)" value={form.warranty} onChangeText={(warranty) => setForm({ ...form, warranty })} />

          <Text style={styles.fieldLabel}>Material / Fabric</Text>
          <TextInput style={styles.input} placeholder="Material (e.g. 100% Cotton, Leather)" value={form.material} onChangeText={(material) => setForm({ ...form, material })} />

          <View style={styles.row}>
            <TextInput style={[styles.input, styles.halfInput]} placeholder="Fit (e.g. Slim, Regular)" value={form.fit} onChangeText={(fit) => setForm({ ...form, fit })} />
            <TextInput style={[styles.input, styles.halfInput]} placeholder="Sleeve (e.g. Full, Short)" value={form.sleeve} onChangeText={(sleeve) => setForm({ ...form, sleeve })} />
          </View>

          <Text style={styles.fieldLabel}>Neck / Collar Type</Text>
          <TextInput style={styles.input} placeholder="Neck Type (e.g. Round Neck, Polo)" value={form.neck} onChangeText={(neck) => setForm({ ...form, neck })} />

          <Text style={styles.fieldLabel}>Refund & Return Policy</Text>
          <TextInput style={styles.input} placeholder="Refund Policy (e.g. 7 Days Replacement)" value={form.refundPolicy} onChangeText={(refundPolicy) => setForm({ ...form, refundPolicy })} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pricing</Text>
          <TextInput style={styles.input} placeholder="Price" keyboardType="decimal-pad" value={form.price} onChangeText={(price) => setForm({ ...form, price })} />
          <TextInput style={styles.input} placeholder="Compare Price" keyboardType="decimal-pad" value={form.comparePrice} onChangeText={(comparePrice) => setForm({ ...form, comparePrice })} />
          <TextInput style={styles.input} placeholder="Cost per item" keyboardType="decimal-pad" value={form.cost} onChangeText={(cost) => setForm({ ...form, cost })} />
          
          <Text style={[styles.fieldLabel, { marginTop: 6, marginBottom: 4 }]}>Pricing Unit (Optional)</Text>
          <TextInput style={styles.input} placeholder="e.g. /kg, /gm, /liter" value={form.priceUnit} onChangeText={(priceUnit) => setForm({ ...form, priceUnit })} autoCapitalize="none" />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2, marginBottom: 8 }}>
            {['/kg', '/gm', '/liter', '/pcs', '/box'].map((unit) => (
              <TouchableOpacity
                key={unit}
                onPress={() => setForm({ ...form, priceUnit: unit })}
                style={{
                  backgroundColor: form.priceUnit === unit ? '#021B79' : '#f0f0f0',
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 14,
                }}
              >
                <Text style={{ 
                  fontSize: 11, 
                  color: form.priceUnit === unit ? '#ffffff' : '#333333',
                  fontWeight: '600'
                }}>
                  {unit}
                </Text>
              </TouchableOpacity>
            ))}
            {form.priceUnit ? (
              <TouchableOpacity
                onPress={() => setForm({ ...form, priceUnit: '' })}
                style={{
                  backgroundColor: '#ffebee',
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 14,
                }}
              >
                <Text style={{ fontSize: 11, color: '#c62828', fontWeight: '600' }}>Clear</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Category & Subcategory</Text>
          
          <Text style={styles.fieldLabel}>Category</Text>
          <View style={styles.pickerBox}>
            <Picker
              selectedValue={form.category}
              onValueChange={(cat) => {
                setForm(prev => ({ ...prev, category: cat, subcategory: '' }));
                setCustomSubcategory('');
              }}
              style={styles.picker}
            >
              {CATEGORIES.map(cat => (
                <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
              ))}
            </Picker>
          </View>

          <Text style={styles.fieldLabel}>Subcategory</Text>
          <View style={styles.pickerBox}>
            <Picker
              selectedValue={form.subcategory}
              onValueChange={(sub) => {
                setForm(prev => ({ ...prev, subcategory: sub }));
                if (sub !== 'custom') setCustomSubcategory('');
              }}
              style={styles.picker}
            >
              <Picker.Item label="Select Subcategory" value="" />
              {(SUBCATEGORIES_MAP[form.category] || []).map((sub) => (
                <Picker.Item key={sub.value} label={sub.label} value={sub.value} />
              ))}
              {form.category ? <Picker.Item label="Other / Custom Subcategory" value="custom" /> : null}
            </Picker>
          </View>

          {form.subcategory === 'custom' && (
            <View style={{ marginTop: 6 }}>
              <Text style={styles.fieldLabel}>Custom Subcategory Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Handmade Crafts"
                value={customSubcategory}
                onChangeText={setCustomSubcategory}
              />
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Inventory</Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Stock Quantity"
              keyboardType="number-pad"
              value={form.stock}
              onChangeText={(stockText) => {
                const num = Number(stockText || 0);
                setForm((prev) => ({
                  ...prev,
                  stock: stockText,
                  inStock: num > 0
                }));
              }}
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Low stock alert"
              keyboardType="number-pad"
              value={form.alertThreshold}
              onChangeText={(alertThreshold) => setForm({ ...form, alertThreshold })}
            />
          </View>

          <Text style={[styles.fieldLabel, { marginTop: 6, marginBottom: 4 }]}>Stock Unit (Optional)</Text>
          <TextInput style={styles.input} placeholder="e.g. kg, gm, liter, pcs, box" value={form.stockUnit} onChangeText={(stockUnit) => setForm({ ...form, stockUnit })} autoCapitalize="none" />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2, marginBottom: 8 }}>
            {['kg', 'gm', 'liter', 'pcs', 'box'].map((unit) => (
              <TouchableOpacity
                key={unit}
                onPress={() => setForm({ ...form, stockUnit: unit })}
                style={{
                  backgroundColor: form.stockUnit === unit ? '#021B79' : '#f0f0f0',
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 14,
                }}
              >
                <Text style={{ 
                  fontSize: 11, 
                  color: form.stockUnit === unit ? '#ffffff' : '#333333',
                  fontWeight: '600'
                }}>
                  {unit}
                </Text>
              </TouchableOpacity>
            ))}
            {form.stockUnit ? (
              <TouchableOpacity
                onPress={() => setForm({ ...form, stockUnit: '' })}
                style={{
                  backgroundColor: '#ffebee',
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 14,
                }}
              >
                <Text style={{ fontSize: 11, color: '#c62828', fontWeight: '600' }}>Clear</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>In Stock</Text>
            <TouchableOpacity
              style={[styles.switch, form.inStock && styles.switchActive]}
              onPress={() =>
                setForm((prev) => {
                  const nextInStock = !prev.inStock;
                  return {
                    ...prev,
                    inStock: nextInStock,
                    stock: nextInStock ? (Number(prev.stock) > 0 ? prev.stock : '10') : '0'
                  };
                })
              }
            >
              <View style={[styles.switchThumb, form.inStock && styles.switchThumbActive]} />
            </TouchableOpacity>
          </View>
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
  fieldLabel: { fontSize: 12, fontWeight: '700', color: '#666', marginBottom: 6, textTransform: 'uppercase' },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: '#f0f3fa', borderWidth: 1, borderColor: '#e0e6f5' },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, color: '#444', fontWeight: '600' },
  chipTextSelected: { color: '#fff' },
  customAddRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  addChipBtn: { backgroundColor: '#00c853', paddingHorizontal: 14, paddingVertical: 14, borderRadius: 12 },
  addChipBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  pickerBox: {
    borderWidth: 1,
    borderColor: '#eef0ff',
    borderRadius: 14,
    backgroundColor: '#fafaff',
    marginBottom: 12,
    overflow: 'hidden'
  },
  picker: {
    width: '100%',
    height: 50,
    color: '#333'
  },
});
