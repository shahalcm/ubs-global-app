// app/(buyer)/profile.jsx
import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useAuth } from '../../context/AuthContext'

export default function ProfileScreen() {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    router.replace('/(auth)/login')
  }
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            <Image 
              source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80' }} 
              style={styles.avatar} 
            />
            <View style={styles.editBadge}>
              <MaterialCommunityIcons name="pencil" size={12} color="#fff" />
            </View>
          </View>
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

          <TouchableOpacity style={styles.editProfileBtn}>
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
                router.push('/(seller)/become-seller')
              }
            }}
          >
            <Text style={styles.promoBtnText}>
              {user?.role === 'seller' ? 'Go to Dashboard' : 'Become a Seller'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Dashboard */}
        <Text style={styles.sectionTitle}>Quick Dashboard</Text>
        <View style={styles.dashboardGrid}>
          {/* Card 1 */}
          <TouchableOpacity style={styles.dashCard} onPress={() => router.push('/(buyer)/orders')} activeOpacity={0.8}>
            <View style={[styles.dashIconBox, { backgroundColor: '#e8eaf6' }]}>
              <MaterialCommunityIcons name="package" size={24} color="#3f51b5" />
            </View>
            <Text style={styles.dashCardTitle}>My Orders</Text>
            <Text style={[styles.dashCardSub, { color: '#008b8b', fontWeight: '700' }]}>4 Active</Text>
          </TouchableOpacity>
          {/* Card 2 */}
          <TouchableOpacity style={styles.dashCard} activeOpacity={0.8}>
            <View style={[styles.dashIconBox, { backgroundColor: '#e0f7fa' }]}>
              <MaterialCommunityIcons name="heart" size={24} color="#006064" />
            </View>
            <Text style={styles.dashCardTitle}>Wishlist</Text>
            <Text style={styles.dashCardSub}>12 Items</Text>
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
          <TouchableOpacity style={styles.dashCard} activeOpacity={0.8}>
            <View style={[styles.dashIconBox, { backgroundColor: '#f3e5f5' }]}>
              <MaterialCommunityIcons name="bell" size={24} color="#6a1b9a" />
            </View>
            <Text style={styles.dashCardTitle}>Notifications</Text>
            <Text style={styles.dashCardSub}>Update Ready</Text>
          </TouchableOpacity>
        </View>

        {/* Account Settings */}
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <View style={styles.listContainer}>
          <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
            <Text style={styles.listIcon}>💳</Text>
            <View style={styles.listTextCol}>
              <Text style={styles.listTitle}>Payment Methods</Text>
              <Text style={styles.listSub}>Manage cards and billing info</Text>
            </View>
            <Text style={styles.listArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.listDivider} />
          <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
            <Text style={styles.listIcon}>📍</Text>
            <View style={styles.listTextCol}>
              <Text style={styles.listTitle}>Shipping Addresses</Text>
              <Text style={styles.listSub}>Primary: London Gateway Port</Text>
            </View>
            <Text style={styles.listArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.listDivider} />
          <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
            <Text style={styles.listIcon}>🛡</Text>
            <View style={styles.listTextCol}>
              <Text style={styles.listTitle}>Security & Privacy</Text>
              <Text style={styles.listSub}>2FA enabled, Password updated 2m ago</Text>
            </View>
            <Text style={styles.listArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Support */}
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.listContainer}>
          <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
            <Text style={styles.listIcon}>❓</Text>
            <View style={styles.listTextCol}>
              <Text style={styles.listTitle}>Help Center</Text>
              <Text style={styles.listSub}>FAQs, Guides and Tutorials</Text>
            </View>
            <Text style={styles.listArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.listDivider} />
          <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
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


})
