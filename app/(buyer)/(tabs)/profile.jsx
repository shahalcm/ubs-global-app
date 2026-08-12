// app/(buyer)/profile.jsx
import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
  Modal,
  TextInput,
  ActivityIndicator
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useAuth } from '../../../context/AuthContext'
import * as Location from 'expo-location'
import { updateUserLocation, updateAvatar } from '../../../services/userService'
import * as ImagePicker from 'expo-image-picker'
import { getUserAvatarUrl } from '../../../utils/image'


export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth()
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [pincode, setPincode] = useState("");
  const [manualCity, setManualCity] = useState("");
  const [manualState, setManualState] = useState("");
  const [manualCountry, setManualCountry] = useState("");
  const [manualAddress, setManualAddress] = useState("");


  React.useEffect(() => {
    if (locationModalVisible && user?.location) {
      setManualCity(user.location.city || "");
      setManualState(user.location.state || "");
      setManualCountry(user.location.country || "");
      setManualAddress(user.location.fullAddress || "");
    }
  }, [locationModalVisible, user]);

  const resolveLocationFromPincode = async (code) => {
    try {
      const geocoded = await Location.geocodeAsync(code);
      if (geocoded && geocoded.length > 0) {
        const { latitude, longitude } = geocoded[0];
        const rev = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (rev && rev.length > 0) {
          const first = rev[0];
          return {
            latitude,
            longitude,
            city: first.city || first.subregion || first.district || "",
            state: first.region || "",
            country: first.country || "",
            fullAddress: [
              first.name,
              first.street,
              first.subregion,
              first.city,
              first.region,
              code,
              first.country
            ].filter(Boolean).join(", ")
          };
        }
      }
    } catch (e) {
      console.log("Geocoding pincode error:", e);
    }
    return null;
  };

  const handleGPSUpdate = async () => {
    setLocLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = loc.coords;
        const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (geocode && geocode.length > 0) {
          const first = geocode[0];
          const resolvedLoc = {
            latitude,
            longitude,
            city: first.city || first.subregion || first.district || "",
            state: first.region || "",
            country: first.country || "",
            fullAddress: [
              first.name,
              first.street,
              first.subregion,
              first.city,
              first.region,
              first.postalCode,
              first.country
            ].filter(Boolean).join(", ")
          };
          const res = await updateUserLocation(resolvedLoc);
          if (res.success) {
            updateUser(res.user);
            Alert.alert("Success", "Location updated successfully");
            setLocationModalVisible(false);
          }
        } else {
          Alert.alert("Error", "Failed to reverse geocode GPS location.");
        }
      } else {
        Alert.alert("Permission Denied", "Location permission is required to fetch GPS coordinates.");
      }
    } catch (error) {
      console.log("GPS update error:", error);
      Alert.alert("Error", "Failed to get current location.");
    } finally {
      setLocLoading(false);
    }
  };

  const handleManualUpdate = async () => {
    setLocLoading(true);
    try {
      let resolvedLoc = null;
      if (pincode.trim()) {
        resolvedLoc = await resolveLocationFromPincode(pincode.trim());
      }
      
      if (!resolvedLoc) {
        if (!manualCity.trim() || !manualCountry.trim()) {
          Alert.alert("Validation Error", "City and Country are required for manual editing.");
          setLocLoading(false);
          return;
        }
        
        let latitude = 0;
        let longitude = 0;
        try {
          const searchString = `${manualAddress || ''} ${manualCity} ${manualState || ''} ${manualCountry}`.trim();
          const geocoded = await Location.geocodeAsync(searchString);
          if (geocoded && geocoded.length > 0) {
            latitude = geocoded[0].latitude;
            longitude = geocoded[0].longitude;
          }
        } catch (e) {
          console.log("Geocoding manual address error:", e);
        }

        resolvedLoc = {
          latitude,
          longitude,
          city: manualCity.trim(),
          state: manualState.trim(),
          country: manualCountry.trim(),
          fullAddress: manualAddress.trim() || `${manualCity}, ${manualState ? manualState + ', ' : ''}${manualCountry}`
        };
      }

      const res = await updateUserLocation(resolvedLoc);
      if (res.success) {
        updateUser(res.user);
        Alert.alert("Success", "Location updated successfully");
        setLocationModalVisible(false);
        setPincode("");
      }
    } catch (error) {
      console.log("Manual update error:", error);
      Alert.alert("Error", "Failed to update location.");
    } finally {
      setLocLoading(false);
    }
  };

  const handleContactSupport = () => {
    Alert.alert(
      "Connect Support",
      "We offer 24/7 global trade assistance. How would you like to connect?",
      [
        {
          text: "Email Support",
          onPress: () => Linking.openURL('mailto:support@ubsglobalapp.com?subject=UBS Global Support Request')
        },
        {
          text: "Call Hotline",
          onPress: () => Linking.openURL('tel:+18005550199')
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    )
  }

  const handleLogout = async () => {
    await logout()
    router.replace('/(auth)/login')
  }

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Gallery access permission is required to change profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatarLoading(true);
        const selectedUri = result.assets[0].uri;
        
        const res = await updateAvatar(selectedUri);
        if (res.success) {
          await updateUser(res.user);
          Alert.alert('Success', 'Profile picture updated successfully');
        } else {
          Alert.alert('Error', res.message || 'Failed to update profile picture');
        }
      }
    } catch (error) {
      console.log('Error selecting/uploading avatar:', error);
      Alert.alert('Error', 'Failed to update profile picture.');
    } finally {
      setAvatarLoading(false);
    }
  };
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 90 }]}
      >
        
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity 
            style={styles.avatarWrapper} 
            onPress={handlePickImage} 
            disabled={avatarLoading}
            activeOpacity={0.8}
          >
            {avatarLoading ? (
              <View style={[styles.avatarFallback, { backgroundColor: '#e0e0e0' }]}>
                <ActivityIndicator size="small" color="#000040" />
              </View>
            ) : user?.avatar ? (
              <Image 
                source={{ uri: getUserAvatarUrl(user.avatar) }} 
                style={styles.avatar} 
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarFallbackText}>{user?.name ? user.name.trim().charAt(0).toUpperCase() : '?'}</Text>
              </View>
            )}
            <View style={styles.editBadge}>
              <MaterialCommunityIcons name="camera" size={12} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.userName}>{user?.name || 'Alexander Vanguard'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'a.vanguard@logistics-global.com'}</Text>
          
          <View style={styles.badgesRow}>
            <View style={styles.badgePremium}>
              <Text style={styles.badgePremiumText}>Premium Member</Text>
            </View>
            <View style={styles.badgeVerified}>
              <Text style={styles.badgeVerifiedText}>Verified Exporter</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.editProfileBtn}
            onPress={() => router.push('/(buyer)/edit-profile')}
          >
            <MaterialCommunityIcons name="account" size={16} color="#fff" />
            <Text style={styles.editProfileBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mainDivider} />

        {/* Promo Card */}
        <View style={styles.promoCard}>
          <Text style={styles.promoTitle}>
            {user?.role === 'seller' ? 'Seller Dashboard' : 'Scale Your Trade Globally'}
          </Text>
          <Text style={styles.promoDesc}>
            {user?.role === 'seller' 
              ? 'Manage your store, view orders, and track your global earnings.'
              : 'Join the world\'s most reliable network of importers and exporters. Get your products listed today.'}
          </Text>
          <TouchableOpacity 
            style={styles.promoBtn} 
            onPress={() => {
              if (user?.role === 'seller') {
                router.push('/(seller)/dashboard')
              } else {
                router.push({ pathname: '/(seller)/become-seller', params: { from: 'buyer-profile' } })
              }
            }}
          >
            <Text style={styles.promoBtnText}>
              {user?.role === 'seller' ? 'Go to Dashboard' : 'Become a Seller'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Location Section */}
        <Text style={styles.sectionTitle}>📍 Location</Text>
        <View style={styles.locationCard}>
          <Text style={styles.locationText}>
            {user?.location?.fullAddress || 
             (user?.location?.city ? `${user.location.city}, ${user.location.state || ''}, ${user.location.country || ''}`.replace(/,\s*,/, ',').trim() : 'Location not set')}
          </Text>
          <View style={styles.locationBtnRow}>
            <TouchableOpacity style={styles.locMiniBtn} onPress={handleGPSUpdate}>
              <MaterialCommunityIcons name="refresh" size={14} color="#000040" />
              <Text style={styles.locMiniBtnText}>Refresh GPS</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.locMiniBtn} onPress={() => setLocationModalVisible(true)}>
              <MaterialCommunityIcons name="pencil" size={14} color="#000040" />
              <Text style={styles.locMiniBtnText}>Edit Manually</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Location Update Modal */}
        <Modal
          visible={locationModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setLocationModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Update Location</Text>
                <TouchableOpacity onPress={() => setLocationModalVisible(false)}>
                  <Text style={styles.modalCloseBtn}>✕</Text>
                </TouchableOpacity>
              </View>

              {locLoading ? (
                <View style={styles.modalLoading}>
                  <ActivityIndicator size="large" color="#1a237e" />
                  <Text style={styles.loadingText}>Updating Location...</Text>
                </View>
              ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* GPS Button */}
                  <TouchableOpacity style={styles.gpsBtn} onPress={handleGPSUpdate}>
                    <Text style={styles.gpsBtnIcon}>📡</Text>
                    <Text style={styles.gpsBtnText}>Use GPS / Current Location</Text>
                  </TouchableOpacity>

                  <View style={styles.modalOrRow}>
                    <View style={styles.orLine} />
                    <Text style={styles.modalOrText}>OR</Text>
                    <View style={styles.orLine} />
                  </View>

                  {/* Pincode Input */}
                  <Text style={styles.modalInputLabel}>Enter Pincode</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. 682024"
                    value={pincode}
                    onChangeText={setPincode}
                    keyboardType="numeric"
                    maxLength={6}
                  />

                  <Text style={styles.modalOrTextSmall}>or enter details completely:</Text>

                  {/* Manual Fields */}
                  <Text style={styles.modalInputLabel}>City</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="City"
                    value={manualCity}
                    onChangeText={setManualCity}
                  />

                  <Text style={styles.modalInputLabel}>State</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="State"
                    value={manualState}
                    onChangeText={setManualState}
                  />

                  <Text style={styles.modalInputLabel}>Country</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Country"
                    value={manualCountry}
                    onChangeText={setManualCountry}
                  />

                  <Text style={styles.modalInputLabel}>Full Address</Text>
                  <TextInput
                    style={[styles.modalInput, { height: 60 }]}
                    placeholder="Full Address"
                    value={manualAddress}
                    onChangeText={setManualAddress}
                    multiline
                  />

                  <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleManualUpdate}>
                    <Text style={styles.modalSubmitText}>Save Location</Text>
                  </TouchableOpacity>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>

        {/* Quick Dashboard */}
        <Text style={styles.sectionTitle}>Quick Dashboard</Text>
        <View style={styles.dashboardGrid}>
          {/* Card 1 */}
          <TouchableOpacity style={styles.dashCard} onPress={() => router.push('/(buyer)/orders')} activeOpacity={0.8}>
            <View style={[styles.dashIconBox, { backgroundColor: '#e8eaf6' }]}>
              <MaterialCommunityIcons name="package" size={24} color="#3f51b5" />
            </View>
            <Text style={styles.dashCardTitle}>My Orders</Text>
            <Text style={[styles.dashCardSub, { color: '#008b8b', fontWeight: '700' }]}>View orders</Text>
          </TouchableOpacity>
          {/* Card 2 */}
          <TouchableOpacity style={styles.dashCard} onPress={() => router.push('/(buyer)/wishlist')} activeOpacity={0.8}>
            <View style={[styles.dashIconBox, { backgroundColor: '#e0f7fa' }]}>
              <MaterialCommunityIcons name="heart" size={24} color="#006064" />
            </View>
            <Text style={styles.dashCardTitle}>Wishlist</Text>
            <Text style={styles.dashCardSub}>{user?.wishlist?.length || 0} Items</Text>
          </TouchableOpacity>
          {/* Card 3 */}
          <TouchableOpacity style={styles.dashCard} onPress={() => router.push('/(buyer)/messages')} activeOpacity={0.8}>
            <View style={styles.badgeNotification}>
              <Text style={styles.badgeNotificationText}>2</Text>
            </View>
            <View style={[styles.dashIconBox, { backgroundColor: '#efebe9' }]}>
              <MaterialCommunityIcons name="message-text" size={24} color="#4e342e" />
            </View>
            <Text style={styles.dashCardTitle}>Messages</Text>
            <Text style={styles.dashCardSub}>Unread</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dashCard} onPress={() => router.push('/(buyer)/my-requests')} activeOpacity={0.8}>
            <View style={[styles.dashIconBox, { backgroundColor: '#e8eaf6' }]}> 
              <MaterialCommunityIcons name="account-question" size={24} color="#1a237e" />
            </View>
            <Text style={styles.dashCardTitle}>Contact Requests</Text>
            <Text style={styles.dashCardSub}>Track approvals</Text>
          </TouchableOpacity>
          {/* Card 4 */}
          <TouchableOpacity style={styles.dashCard} onPress={() => router.push('/(buyer)/notifications')} activeOpacity={0.8}>
            <View style={[styles.dashIconBox, { backgroundColor: '#f3e5f5' }]}>
              <MaterialCommunityIcons name="bell" size={24} color="#6a1b9a" />
            </View>
            <Text style={styles.dashCardTitle}>Notifications</Text>
            <Text style={styles.dashCardSub}>View updates</Text>
          </TouchableOpacity>
          {/* Card 5 - Cart */}
          <TouchableOpacity style={styles.dashCard} onPress={() => router.push('/(buyer)/cart')} activeOpacity={0.8}>
            <View style={[styles.dashIconBox, { backgroundColor: '#fff3e0' }]}>
              <MaterialCommunityIcons name="cart" size={24} color="#e65100" />
            </View>
            <Text style={styles.dashCardTitle}>My Cart</Text>
            <Text style={styles.dashCardSub}>View items</Text>
          </TouchableOpacity>
        </View>

        {/* Account Settings */}
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <View style={styles.listContainer}>
          <TouchableOpacity 
            style={styles.listItem} 
            activeOpacity={0.7}
            onPress={() => router.push('/(buyer)/payment')}
          >
            <Text style={styles.listIcon}>💳</Text>
            <View style={styles.listTextCol}>
              <Text style={styles.listTitle}>Payment Methods</Text>
              <Text style={styles.listSub}>Manage cards and billing info</Text>
            </View>
            <Text style={styles.listArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.listDivider} />
          <TouchableOpacity 
            style={styles.listItem} 
            activeOpacity={0.7}
            onPress={() => Alert.alert("Shipping Address", "Primary: London Gateway Port\n\nTo update your delivery address, you can configure it during checkout.")}
          >
            <Text style={styles.listIcon}>📍</Text>
            <View style={styles.listTextCol}>
              <Text style={styles.listTitle}>Shipping Addresses</Text>
              <Text style={styles.listSub}>Primary: London Gateway Port</Text>
            </View>
            <Text style={styles.listArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.listDivider} />
          <TouchableOpacity 
            style={styles.listItem} 
            activeOpacity={0.7}
            onPress={() => router.push('/(buyer)/settings')}
          >
            <Text style={styles.listIcon}>🛡</Text>
            <View style={styles.listTextCol}>
              <Text style={styles.listTitle}>Security & Privacy</Text>
              <Text style={styles.listSub}>Password, preferences & security</Text>
            </View>
            <Text style={styles.listArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Support */}
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.listContainer}>
          <TouchableOpacity 
            style={styles.listItem} 
            activeOpacity={0.7}
            onPress={() => router.push('/(buyer)/help')}
          >
            <Text style={styles.listIcon}>❓</Text>
            <View style={styles.listTextCol}>
              <Text style={styles.listTitle}>Help Center</Text>
              <Text style={styles.listSub}>FAQs, Guides and Tutorials</Text>
            </View>
            <Text style={styles.listArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.listDivider} />
          <TouchableOpacity 
            style={styles.listItem} 
            activeOpacity={0.7}
            onPress={handleContactSupport}
          >
            <Text style={styles.listIcon}>🎧</Text>
            <View style={styles.listTextCol}>
              <Text style={styles.listTitle}>Contact Support</Text>
              <Text style={styles.listSub}>24/7 Global assistance</Text>
            </View>
            <Text style={styles.listArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutIcon}>↪</Text>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
        

      </ScrollView>



    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fa',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 30,
  },

  // Profile Header
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#e0f7fa',
  },
  avatarFallback: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#e0f7fa',
    backgroundColor: '#00838f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: -4,
    width: 26,
    height: 26,
    backgroundColor: '#00838f',
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000040',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  badgePremium: {
    backgroundColor: '#b3e5fc',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgePremiumText: {
    color: '#01579b',
    fontSize: 10,
    fontWeight: '700',
  },
  badgeVerified: {
    backgroundColor: '#ede7f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeVerifiedText: {
    color: '#311b92',
    fontSize: 10,
    fontWeight: '700',
  },
  editProfileBtn: {
    backgroundColor: '#000040',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  editProfileBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  mainDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginBottom: 24,
  },

  // Promo Card
  promoCard: {
    backgroundColor: '#004080', // mock gradient background
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  promoTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
  },
  promoDesc: {
    color: '#e0f7fa',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  promoBtn: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  promoBtnText: {
    color: '#004080',
    fontSize: 13,
    fontWeight: '700',
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#000040',
    marginBottom: 16,
  },

  // Dashboard Grid
  dashboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  dashCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eaeaea',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  dashIconBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  dashCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 4,
  },
  dashCardSub: {
    fontSize: 10,
    color: '#888',
  },
  badgeNotification: {
    position: 'absolute',
    top: 10,
    right: 25,
    backgroundColor: '#c62828',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  badgeNotificationText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Lists (Settings / Support)
  listContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eaeaea',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  listIcon: {
    fontSize: 18,
    color: '#555',
    marginRight: 16,
  },
  listTextCol: {
    flex: 1,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  listSub: {
    fontSize: 11,
    color: '#888',
  },
  listArrow: {
    fontSize: 20,
    color: '#ccc',
  },
  listDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 16,
  },

  // Logout
  logoutContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
  },
  logoutIcon: {
    fontSize: 18,
    color: '#c62828',
    transform: [{ scaleX: -1 }], // flips right-arrow left
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#c62828',
  },

  // Location Styles
  locationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eaeaea',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  locationText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginBottom: 12,
    lineHeight: 20,
  },
  locationBtnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  locMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f6fa',
    borderWidth: 1,
    borderColor: '#eaeaea',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  locMiniBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000040',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000040',
  },
  modalCloseBtn: {
    fontSize: 18,
    color: '#666',
    padding: 4,
  },
  modalLoading: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  gpsBtn: {
    backgroundColor: '#e8eaf6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#c5cae9',
  },
  gpsBtnIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  gpsBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a237e',
  },
  modalOrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#eee',
  },
  modalOrText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  modalOrTextSmall: {
    fontSize: 11,
    color: '#999',
    marginTop: 8,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  modalInputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: '#f5f6fa',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  modalSubmitBtn: {
    backgroundColor: '#000040',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  modalSubmitText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

})
