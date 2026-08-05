import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Switch, 
  FlatList, 
  Modal, 
  TextInput, 
  ActivityIndicator, 
  Alert,
  ScrollView
} from 'react-native';
import SellerHeader from '../../../components/seller/SellerHeader';
import { colors } from '../../../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { getSellerProfile, updateSellerProfile } from '../../../services/sellerService';
import { changePassword, deleteAccount } from '../../../services/userService';
import { useSeller } from '../../../context/SellerContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SellerSettings() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const { loadProfile } = useSeller();
  
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [sellerProfile, setSellerProfile] = useState(null);
  const [businessHours, setBusinessHours] = useState('9 AM - 9 PM');
  
  // Toggles state
  const [toggles, setToggles] = useState({
    holidayMode: false,
    orderAlerts: true,
    messageAlerts: true,
    paymentAlerts: true,
    promotional: false,
    twoFactor: true
  });
  
  // Edit field modals
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editField, setEditField] = useState(''); // 'shopName', 'description', 'businessHours'
  const [editLabel, setEditLabel] = useState('');
  const [editValue, setEditValue] = useState('');
  const [savingField, setSavingField] = useState(false);
  
  // Change password modal
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Delete account modal
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  const fetchSellerProfile = async () => {
    try {
      setLoadingProfile(true);
      const res = await getSellerProfile();
      if (res.success && res.seller) {
        setSellerProfile(res.seller);
      }
    } catch (error) {
      console.log('Error fetching seller profile in settings:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchSellerProfile();
    
    // Load preferences
    const loadPreferences = async () => {
      try {
        const storedToggles = await AsyncStorage.getItem('seller_settings_toggles');
        if (storedToggles) {
          setToggles(JSON.parse(storedToggles));
        }
        const hours = await AsyncStorage.getItem('seller_business_hours');
        if (hours) {
          setBusinessHours(hours);
        }
      } catch (err) {
        console.log('Error loading settings preferences:', err);
      }
    };
    loadPreferences();
  }, []);

  const handleToggle = async (key) => {
    const updatedToggles = { ...toggles, [key]: !toggles[key] };
    setToggles(updatedToggles);
    try {
      await AsyncStorage.setItem('seller_settings_toggles', JSON.stringify(updatedToggles));
    } catch (err) {
      console.log('Error saving toggle settings:', err);
    }
  };

  const handleSaveField = async () => {
    if (!editValue.trim() && editField !== 'bankDetails.upiId') {
      Alert.alert('Error', `${editLabel} cannot be empty.`);
      return;
    }
    
    setSavingField(true);
    try {
      if (editField === 'businessHours') {
        setBusinessHours(editValue.trim());
        await AsyncStorage.setItem('seller_business_hours', editValue.trim());
        Alert.alert('Success', 'Business hours updated.');
        setEditModalVisible(false);
      } else {
        let updateData = {};
        if (editField.startsWith('bankDetails.')) {
          const nestedKey = editField.split('.')[1];
          updateData = {
            bankDetails: {
              ...sellerProfile?.bankDetails,
              [nestedKey]: editValue.trim()
            }
          };
        } else {
          updateData = { [editField]: editValue.trim() };
        }
        const res = await updateSellerProfile(updateData);
        if (res.success) {
          setSellerProfile(res.seller);
          await loadProfile();
          Alert.alert('Success', `${editLabel} updated successfully.`);
          setEditModalVisible(false);
        } else {
          Alert.alert('Error', res.message || `Failed to update ${editLabel}.`);
        }
      }
    } catch (error) {
      console.log('Error saving field:', error);
      Alert.alert('Error', 'An error occurred while saving.');
    } finally {
      setSavingField(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }
    
    setChangingPassword(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      if (res.success) {
        Alert.alert('Success', 'Password changed successfully.');
        setPasswordModalVisible(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Error', res.message || 'Failed to change password.');
      }
    } catch (error) {
      console.log('Change password error:', error);
      Alert.alert('Error', 'An incorrect current password was entered or backend error.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
      Alert.alert('Error', "Please type the word 'DELETE' to confirm.");
      return;
    }
    
    setDeletingAccount(true);
    try {
      const res = await deleteAccount();
      if (res.success) {
        setDeleteModalVisible(false);
        Alert.alert('Account Deleted', 'Your seller account has been deleted.');
        await logout();
        router.replace('/(auth)/login');
      } else {
        Alert.alert('Error', res.message || 'Failed to delete account.');
      }
    } catch (error) {
      console.log('Delete account error:', error);
      Alert.alert('Error', 'An error occurred during account deletion.');
    } finally {
      setDeletingAccount(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out of your seller account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  const sectionsData = [
    {
      title: 'Store Settings',
      items: [
        { 
          label: 'Shop Name', 
          icon: 'storefront-outline', 
          value: sellerProfile?.shopName || (loadingProfile ? 'Loading...' : 'Not Set'), 
          onPress: () => {
            setEditField('shopName');
            setEditLabel('Shop Name');
            setEditValue(sellerProfile?.shopName || '');
            setEditModalVisible(true);
          }
        },
        { 
          label: 'Shop Description', 
          icon: 'text-box-outline', 
          value: sellerProfile?.description || (loadingProfile ? 'Loading...' : 'No description set'), 
          onPress: () => {
            setEditField('description');
            setEditLabel('Shop Description');
            setEditValue(sellerProfile?.description || '');
            setEditModalVisible(true);
          }
        },
        { 
          label: 'Business Hours', 
          icon: 'clock-outline', 
          value: businessHours, 
          onPress: () => {
            setEditField('businessHours');
            setEditLabel('Business Hours');
            setEditValue(businessHours);
            setEditModalVisible(true);
          }
        },
        { label: 'Holiday Mode', icon: 'briefcase-off-outline', toggle: true, stateKey: 'holidayMode' },
        { label: 'AI Bot Settings', icon: 'robot', route: '/(seller)/bot-settings' },
      ],
    },
    {
      title: 'Business Credentials',
      items: [
        { 
          label: 'TAX / GST / VAT ID', 
          icon: 'text-box-check-outline', 
          value: sellerProfile?.gstNumber || (loadingProfile ? 'Loading...' : 'Not Provided'), 
          onPress: () => {
            setEditField('gstNumber');
            setEditLabel('TAX / GST ID');
            setEditValue(sellerProfile?.gstNumber || '');
            setEditModalVisible(true);
          }
        },
        { 
          label: 'Product Categories', 
          icon: 'shape-outline', 
          value: sellerProfile?.categories || (loadingProfile ? 'Loading...' : 'Not Specified'), 
          onPress: () => {
            setEditField('categories');
            setEditLabel('Product Categories');
            setEditValue(sellerProfile?.categories || '');
            setEditModalVisible(true);
          }
        },
        { 
          label: 'Year Established', 
          icon: 'calendar-month-outline', 
          value: sellerProfile?.yearEstablished || (loadingProfile ? 'Loading...' : 'Not Specified'), 
          onPress: () => {
            setEditField('yearEstablished');
            setEditLabel('Year Established');
            setEditValue(sellerProfile?.yearEstablished || '');
            setEditModalVisible(true);
          }
        },
        { 
          label: 'Company Website', 
          icon: 'web', 
          value: sellerProfile?.website || (loadingProfile ? 'Loading...' : 'Not Provided'), 
          onPress: () => {
            setEditField('website');
            setEditLabel('Company Website');
            setEditValue(sellerProfile?.website || '');
            setEditModalVisible(true);
          }
        },
        { 
          label: 'ID Proof Document', 
          icon: 'file-check-outline', 
          value: sellerProfile?.idProof ? 'Uploaded & Verified ✅' : 'Not Uploaded'
        },
      ],
    },
    {
      title: 'Payment Details',
      items: [
        {
          label: 'Bank Name',
          icon: 'bank-outline',
          value: sellerProfile?.bankDetails?.bankName || (loadingProfile ? 'Loading...' : 'Not Set'),
          onPress: () => {
            setEditField('bankDetails.bankName');
            setEditLabel('Bank Name');
            setEditValue(sellerProfile?.bankDetails?.bankName || '');
            setEditModalVisible(true);
          }
        },
        {
          label: 'Account Number',
          icon: 'numeric',
          value: sellerProfile?.bankDetails?.accountNumber || (loadingProfile ? 'Loading...' : 'Not Set'),
          onPress: () => {
            setEditField('bankDetails.accountNumber');
            setEditLabel('Account Number');
            setEditValue(sellerProfile?.bankDetails?.accountNumber || '');
            setEditModalVisible(true);
          }
        },
        {
          label: 'IFSC Code',
          icon: 'barcode',
          value: sellerProfile?.bankDetails?.ifscCode || (loadingProfile ? 'Loading...' : 'Not Set'),
          onPress: () => {
            setEditField('bankDetails.ifscCode');
            setEditLabel('IFSC Code');
            setEditValue(sellerProfile?.bankDetails?.ifscCode || '');
            setEditModalVisible(true);
          }
        },
        {
          label: 'UPI ID',
          icon: 'qrcode',
          value: sellerProfile?.bankDetails?.upiId || (loadingProfile ? 'Loading...' : 'Not Set'),
          onPress: () => {
            setEditField('bankDetails.upiId');
            setEditLabel('UPI ID');
            setEditValue(sellerProfile?.bankDetails?.upiId || '');
            setEditModalVisible(true);
          }
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        { label: 'Order Alerts', icon: 'bell-ring-outline', toggle: true, stateKey: 'orderAlerts' },
        { label: 'Message Alerts', icon: 'message-alert-outline', toggle: true, stateKey: 'messageAlerts' },
        { label: 'Payment Alerts', icon: 'credit-card-outline', toggle: true, stateKey: 'paymentAlerts' },
        { label: 'Promotional', icon: 'tag-outline', toggle: true, stateKey: 'promotional' },
      ],
    },
    {
      title: 'Account',
      items: [
        { label: 'Language', icon: 'translate', value: 'English', onPress: () => router.push('/(auth)/language?fromSettings=true') },
        { label: 'Change Password', icon: 'lock-outline', onPress: () => setPasswordModalVisible(true) },
        { label: 'Two-Factor Auth', icon: 'shield-lock-outline', toggle: true, stateKey: 'twoFactor' },
        { 
          label: 'Connected: Google', 
          icon: 'google', 
          value: user?.googleId ? 'Connected' : 'Not Connected', 
          status: user?.googleId ? 'connected' : 'none' 
        },
      ],
    },
    {
      title: 'Privacy & Legal',
      items: [
        { label: 'Privacy Policy', icon: 'file-document-outline', onPress: () => router.push('/(buyer)/privacy-policy') },
        { label: 'Terms of Service', icon: 'clipboard-text-outline', onPress: () => router.push('/(buyer)/terms-and-conditions') },
        { label: 'Data & Permissions', icon: 'shield-check-outline', onPress: () => router.push('/(buyer)/privacy-settings') },
      ],
    },
  ];

  const isDark = colors.background === '#121212';
  const themeStyles = {
    screen: { backgroundColor: colors.background },
    cardBg: { backgroundColor: isDark ? '#1e1e1e' : '#fff' },
    textColor: { color: colors.text },
    subTextColor: { color: colors.textMuted },
    iconBackground: { backgroundColor: isDark ? '#2d2d2d' : '#eef2ff' },
    divider: { borderBottomColor: colors.border },
    inputBg: { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5', borderColor: colors.border, color: colors.text }
  };

  return (
    <View style={[styles.screen, themeStyles.screen]}>
      <SellerHeader title="Settings" />
      <FlatList
        data={sectionsData}
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, themeStyles.subTextColor]}>{item.title}</Text>
            {item.items.map((row) => (
              <TouchableOpacity
                key={row.label}
                style={[styles.row, themeStyles.cardBg]}
                activeOpacity={row.toggle || !row.onPress && !row.route ? 1 : 0.7}
                onPress={() => {
                  if (row.route) {
                    router.push(row.route);
                  } else if (row.onPress) {
                    row.onPress();
                  }
                }}
              >
                <View style={styles.rowLeft}>
                  <View style={[styles.iconWrap, themeStyles.iconBackground]}>
                    <MaterialCommunityIcons name={row.icon} size={20} color={colors.primary} />
                  </View>
                  <View style={{ flexShrink: 1 }}>
                    <Text style={[styles.label, themeStyles.textColor]}>{row.label}</Text>
                    {row.value ? <Text style={[styles.subLabel, themeStyles.subTextColor]}>{row.value}</Text> : null}
                  </View>
                </View>
                {row.toggle ? (
                  <Switch 
                    value={toggles[row.stateKey]} 
                    onValueChange={() => handleToggle(row.stateKey)} 
                    thumbColor={toggles[row.stateKey] ? colors.primary : '#fff'} 
                    trackColor={{ false: '#d6d6d6', true: '#c3d7ff' }} 
                  />
                ) : (
                  (row.onPress || row.route) ? (
                    <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textMuted} />
                  ) : null
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
        ListFooterComponent={(
          <View style={styles.dangerZone}>
            <TouchableOpacity style={[styles.dangerRow, themeStyles.cardBg]} onPress={() => setDeleteModalVisible(true)}>
              <MaterialCommunityIcons name="trash-can-outline" size={20} color={colors.error} />
              <Text style={styles.dangerLabel}>Delete Account</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.dangerRow, themeStyles.cardBg]} onPress={handleLogout}>
              <MaterialCommunityIcons name="logout" size={20} color={colors.error} />
              <Text style={styles.dangerLabel}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.content}
      />

      {/* EDIT STORE FIELD MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, themeStyles.cardBg]}>
            <Text style={[styles.modalTitle, themeStyles.textColor]}>Edit {editLabel}</Text>
            
            <TextInput
              style={[styles.modalInput, themeStyles.inputBg]}
              value={editValue}
              onChangeText={setEditValue}
              placeholder={`Enter ${editLabel}`}
              placeholderTextColor={colors.textMuted}
              multiline={editField === 'description'}
              numberOfLines={editField === 'description' ? 4 : 1}
              keyboardType={editField === 'bankDetails.accountNumber' ? 'numeric' : 'default'}
              autoCapitalize={editField === 'bankDetails.ifscCode' ? 'characters' : 'none'}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalCancelBtn]} 
                onPress={() => setEditModalVisible(false)}
                disabled={savingField}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, styles.modalSaveBtn]} 
                onPress={handleSaveField}
                disabled={savingField}
              >
                {savingField ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalSaveBtnText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* CHANGE PASSWORD MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={passwordModalVisible}
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <ScrollView contentContainerStyle={{flexGrow: 1}} keyboardShouldPersistTaps="handled">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, themeStyles.cardBg]}>
              <Text style={[styles.modalTitle, themeStyles.textColor]}>Change Password</Text>
              
              <Text style={[styles.inputLabel, themeStyles.textColor]}>Current Password</Text>
              <TextInput
                style={[styles.modalInput, themeStyles.inputBg]}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                placeholder="Current password"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={[styles.inputLabel, themeStyles.textColor]}>New Password</Text>
              <TextInput
                style={[styles.modalInput, themeStyles.inputBg]}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                placeholder="New password (min 6 chars)"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={[styles.inputLabel, themeStyles.textColor]}>Confirm New Password</Text>
              <TextInput
                style={[styles.modalInput, themeStyles.inputBg]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholder="Confirm new password"
                placeholderTextColor={colors.textMuted}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalCancelBtn]} 
                  onPress={() => {
                    setPasswordModalVisible(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  disabled={changingPassword}
                >
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalSaveBtn]} 
                  onPress={handleChangePassword}
                  disabled={changingPassword}
                >
                  {changingPassword ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.modalSaveBtnText}>Update</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </Modal>

      {/* DELETE ACCOUNT MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, themeStyles.cardBg]}>
            <Text style={[styles.modalTitle, { color: colors.error }]}>⚠️ Delete Seller Account?</Text>
            
            <Text style={[styles.warningText, themeStyles.textColor]}>
              This action is permanent and cannot be undone. All your listings will be deactivated, and your store will be suspended immediately.
            </Text>

            <Text style={[styles.inputLabel, themeStyles.textColor]}>
              Type <Text style={{fontWeight: 'bold', color: colors.error}}>"DELETE"</Text> to confirm:
            </Text>
            
            <TextInput
              style={[styles.modalInput, themeStyles.inputBg]}
              value={deleteConfirmText}
              onChangeText={setDeleteConfirmText}
              placeholder="DELETE"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="characters"
              editable={!deletingAccount}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalCancelBtn]} 
                onPress={() => {
                  setDeleteConfirmText('');
                  setDeleteModalVisible(false);
                }}
                disabled={deletingAccount}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: colors.error }]} 
                onPress={handleDeleteAccount}
                disabled={deletingAccount}
              >
                {deletingAccount ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalSaveBtnText}>Delete Account</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 12 },
  row: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    borderRadius: 18, 
    padding: 16, 
    marginBottom: 12, 
    shadowColor: '#000', 
    shadowOpacity: 0.04, 
    shadowRadius: 10, 
    elevation: 2 
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconWrap: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  label: { fontSize: 14, fontWeight: '700' },
  subLabel: { fontSize: 12, marginTop: 4 },
  dangerZone: { marginTop: 16 },
  dangerRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderRadius: 18, 
    padding: 16, 
    marginBottom: 12, 
    shadowColor: '#000', 
    shadowOpacity: 0.03, 
    shadowRadius: 10, 
    elevation: 2 
  },
  dangerLabel: { marginLeft: 12, color: colors.error, fontWeight: '700', fontSize: 14 },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
  },
  warningText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtn: {
    backgroundColor: '#f5f5f5',
  },
  modalCancelBtnText: {
    color: '#666',
    fontSize: 15,
    fontWeight: '700',
  },
  modalSaveBtn: {
    backgroundColor: colors.primary,
  },
  modalSaveBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});

