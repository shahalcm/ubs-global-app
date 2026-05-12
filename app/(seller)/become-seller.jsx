import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';

export default function BecomeSellerScreen() {
  const [form, setForm] = useState({
    shopName: '',
    ownerName: '',
    phone: '',
    address: '',
    businessType: '',
    idProof: null,
    logo: null,
  });
  const [loading, setLoading] = useState(false);

  const pickImage = async (field) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setForm({ ...form, [field]: result.assets[0].uri });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace('/(seller)/dashboard');
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Blue Header Gradient */}
          <LinearGradient
            colors={['#021B79', '#0575E6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerArea}
          >
            <View style={styles.headerSafeArea}>
              <Text style={styles.headerTitle}>UBS Global</Text>
              <Text style={styles.headerSubtitle}>Become a Seller</Text>

              <View style={styles.progressContainer}>
                <View style={styles.progressTextRow}>
                  <Text style={styles.stepTextBold}>Step 1 of 2</Text>
                  <Text style={styles.stepText}>Business Details</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={styles.progressBarFill} />
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* White Form Card */}
          <View style={styles.formCard}>
            
            {/* Logo Upload (Overlapping) */}
            <View style={styles.logoSection}>
              <View style={styles.logoWrapper}>
                <TouchableOpacity style={styles.logoCircle} onPress={() => pickImage('logo')}>
                  {form.logo ? (
                    <Image source={{ uri: form.logo }} style={styles.logoImage} />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="camera-plus-outline" size={24} color="#888" />
                      <Text style={styles.logoPlaceholder}>LOGO</Text>
                    </>
                  )}
                </TouchableOpacity>
                <View style={styles.editIconBadge}>
                  <MaterialCommunityIcons name="pencil" size={12} color="#fff" />
                </View>
              </View>
              <Text style={styles.logoLabel}>UPLOAD SHOP LOGO</Text>
            </View>

            {/* Form Fields */}
            <View style={styles.fieldsContainer}>
              <Text style={styles.label}>SHOP NAME</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="storefront-outline" size={20} color="#888" />
                <TextInput 
                  style={styles.input} 
                  placeholder="Global Trade Hub" 
                  placeholderTextColor="#bbb"
                  value={form.shopName}
                  onChangeText={(text) => setForm({...form, shopName: text})}
                />
              </View>

              <Text style={styles.label}>OWNER FULL NAME</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="account-outline" size={20} color="#888" />
                <TextInput 
                  style={styles.input} 
                  placeholder="John Doe" 
                  placeholderTextColor="#bbb"
                  value={form.ownerName}
                  onChangeText={(text) => setForm({...form, ownerName: text})}
                />
              </View>

              <Text style={styles.label}>PHONE NUMBER</Text>
              <View style={styles.phoneContainer}>
                <TouchableOpacity style={styles.countryPicker}>
                  <Text style={styles.countryText}>+1 (US)</Text>
                  <MaterialCommunityIcons name="chevron-down" size={18} color="#555" />
                </TouchableOpacity>
                <TextInput 
                  style={styles.phoneInput} 
                  placeholder="123-456-7890" 
                  placeholderTextColor="#bbb"
                  keyboardType="phone-pad"
                  value={form.phone}
                  onChangeText={(text) => setForm({...form, phone: text})}
                />
              </View>

              <Text style={styles.label}>BUSINESS TYPE</Text>
              <TouchableOpacity style={styles.inputContainer}>
                <MaterialCommunityIcons name="briefcase-outline" size={20} color="#888" />
                <Text style={[styles.input, { color: form.businessType ? '#333' : '#bbb' }]}>
                  {form.businessType || 'Select Business Type'}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={20} color="#888" />
              </TouchableOpacity>

              <Text style={styles.label}>FULL ADDRESS</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="map-marker-outline" size={20} color="#888" />
                <TextInput 
                  style={styles.input} 
                  placeholder="123 Logistic Way, Suite 400, Port City" 
                  placeholderTextColor="#bbb"
                  value={form.address}
                  onChangeText={(text) => setForm({...form, address: text})}
                />
              </View>

              <Text style={styles.label}>UPLOAD ID PROOF</Text>
              <TouchableOpacity style={styles.uploadDashed} onPress={() => pickImage('idProof')}>
                <View style={styles.uploadIconCircle}>
                  <MaterialCommunityIcons name="file-upload-outline" size={20} color="#0575E6" />
                </View>
                <Text style={styles.uploadTextBold}>Tap to upload your ID or{"\n"}Business License</Text>
                <Text style={styles.uploadTextSmall}>PDF, JPG, or PNG (Max 5MB)</Text>
              </TouchableOpacity>

              {/* Submit Button */}
              <TouchableOpacity 
                style={styles.submitBtn} 
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitBtnText}>Submit Seller Request</Text>
                )}
              </TouchableOpacity>

              <View style={styles.noticeRow}>
                <MaterialCommunityIcons name="clock-outline" size={14} color="#888" />
                <Text style={styles.noticeText}>Your application will be reviewed within 24 hours</Text>
              </View>
            </View>
          </View>

          {/* Bottom Badges */}
          <View style={styles.badgesContainer}>
            <View style={styles.badgeRow}>
              <View style={styles.badgeItem}>
                <MaterialCommunityIcons name="shield-check-outline" size={18} color="#666" />
                <Text style={styles.badgeText}>VERIFIED SELLER</Text>
              </View>
              <View style={styles.badgeItem}>
                <MaterialCommunityIcons name="earth" size={18} color="#666" />
                <Text style={styles.badgeText}>GLOBAL EXPORT</Text>
              </View>
            </View>
            <View style={styles.badgeRow}>
              <View style={styles.badgeItem}>
                <MaterialCommunityIcons name="shield-lock-outline" size={18} color="#666" />
                <Text style={styles.badgeText}>SECURE PAYMENTS</Text>
              </View>
              <View style={styles.badgeItem}>
                <MaterialCommunityIcons name="headset" size={18} color="#666" />
                <Text style={styles.badgeText}>24/7 SUPPORT</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  headerArea: {
    paddingTop: 80, // approximate status bar + extra
    paddingBottom: 90, // extra padding to put behind the white card
    paddingHorizontal: 20,
  },
  headerSafeArea: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E0F0FF',
    marginTop: 4,
    marginBottom: 24,
  },
  progressContainer: {
    width: '100%',
    paddingHorizontal: 10,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stepTextBold: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  stepText: {
    color: '#E0F0FF',
    fontSize: 12,
    fontWeight: '500',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    width: '50%',
    backgroundColor: '#33D1FF', 
    borderRadius: 2,
  },
  formCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 16,
    marginTop: -40, // overlap with the blue header
    paddingHorizontal: 20,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: -40, // push half of the circle outside the white box
    marginBottom: 20,
  },
  logoWrapper: {
    position: 'relative',
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EAEAEA',
    borderWidth: 3,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logoPlaceholder: {
    fontSize: 10,
    color: '#888',
    fontWeight: '600',
    marginTop: 2,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  editIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#021B79',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  logoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#333',
    marginTop: 10,
    letterSpacing: 0.5,
  },
  fieldsContainer: {
    width: '100%',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#222',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
  phoneContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginRight: 10,
  },
  countryText: {
    fontSize: 14,
    color: '#333',
    marginRight: 6,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    color: '#333',
  },
  uploadDashed: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#C0D4EB',
    borderRadius: 12,
    backgroundColor: '#F8FBFF',
    paddingVertical: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D6E9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  uploadTextBold: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 18,
  },
  uploadTextSmall: {
    fontSize: 11,
    color: '#777',
  },
  submitBtn: {
    backgroundColor: '#1a237e', // deep navy
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeText: {
    fontSize: 12,
    color: '#888',
    marginLeft: 6,
  },
  badgesContainer: {
    marginTop: 30,
    paddingHorizontal: 30,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#666',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
});
