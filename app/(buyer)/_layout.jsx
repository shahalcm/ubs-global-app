import { Tabs, Redirect } from 'expo-router'
import { useAuth } from '../../context/AuthContext'
import { Ionicons } from '@expo/vector-icons'
import { Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'

export default function BuyerLayout() {
  const { isAuthenticated, loading } = useAuth()
  const insets = useSafeAreaInsets()
  const { t } = useTranslation()

  if (loading) return null
  if (!isAuthenticated) return <Redirect href="/login" />

  const isAndroid = Platform.OS === 'android'
  const hasBottomInset = insets.bottom > 0

  // Calculate dynamic heights and paddings for the tab bar based on safe area insets
  const bottomPadding = isAndroid
    ? Math.max(insets.bottom, 12)
    : Math.max(insets.bottom, 20);

  const tabHeight = isAndroid
    ? 60 + bottomPadding
    : 64 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1a237e',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          height: tabHeight,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#eee',
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          zIndex: 999,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
        }
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('Home'),
          tabBarLabel: t('Home'),
          tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: t('Wishlist'),
          tabBarLabel: t('Wishlist'),
          tabBarIcon: ({ color }) => <Ionicons name="heart-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: t('Cart', 'Cart'),
          tabBarLabel: t('Cart', 'Cart'),
          tabBarIcon: ({ color }) => <Ionicons name="cart-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: t('Messages'),
          tabBarLabel: t('Messages'),
          tabBarIcon: ({ color }) => <Ionicons name="chatbubble-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('Profile'),
          tabBarLabel: t('Profile'),
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} />,
        }}
      />

      {/* Hide all other screens from the tab bar */}
      <Tabs.Screen name="drawer" options={{ tabBarButton: () => null, tabBarItemStyle: { display: 'none' } }} />
      <Tabs.Screen name="edit-profile" options={{ tabBarButton: () => null, tabBarItemStyle: { display: 'none' } }} />
      <Tabs.Screen name="help" options={{ tabBarButton: () => null, tabBarItemStyle: { display: 'none' } }} />
      <Tabs.Screen name="notifications" options={{ tabBarButton: () => null, tabBarItemStyle: { display: 'none' } }} />
      <Tabs.Screen name="order-summary" options={{ tabBarButton: () => null, tabBarItemStyle: { display: 'none' } }} />
      <Tabs.Screen name="order-tracking" options={{ tabBarButton: () => null, tabBarItemStyle: { display: 'none' } }} />
      <Tabs.Screen name="payment" options={{ tabBarButton: () => null, tabBarItemStyle: { display: 'none' } }} />
      <Tabs.Screen name="product-details" options={{ tabBarButton: () => null, tabBarItemStyle: { display: 'none' } }} />
      <Tabs.Screen name="product-filter" options={{ tabBarButton: () => null, tabBarItemStyle: { display: 'none' } }} />
      <Tabs.Screen name="product-listing" options={{ tabBarButton: () => null, tabBarItemStyle: { display: 'none' } }} />
      <Tabs.Screen name="products" options={{ tabBarButton: () => null, tabBarItemStyle: { display: 'none' } }} />
      <Tabs.Screen name="chat" options={{ tabBarButton: () => null, tabBarItemStyle: { display: 'none' } }} />
      <Tabs.Screen name="my-requests" options={{ tabBarButton: () => null, tabBarItemStyle: { display: 'none' } }} />
      <Tabs.Screen name="settings" options={{ tabBarButton: () => null, tabBarItemStyle: { display: 'none' } }} />
      <Tabs.Screen name="orders" options={{ tabBarButton: () => null, tabBarItemStyle: { display: 'none' } }} />
      <Tabs.Screen name="real-estate" options={{ tabBarButton: () => null, tabBarItemStyle: { display: 'none' } }} />
      <Tabs.Screen name="post-property" options={{ tabBarButton: () => null, tabBarItemStyle: { display: 'none' } }} />
      <Tabs.Screen name="property-detail" options={{ tabBarButton: () => null, tabBarItemStyle: { display: 'none' } }} />
      <Tabs.Screen name="privacy-policy" options={{ tabBarButton: () => null, tabBarItemStyle: { display: 'none' } }} />
      <Tabs.Screen name="terms-and-conditions" options={{ tabBarButton: () => null, tabBarItemStyle: { display: 'none' } }} />
      <Tabs.Screen name="refund-policy" options={{ tabBarButton: () => null, tabBarItemStyle: { display: 'none' } }} />
      <Tabs.Screen name="account-deletion-policy" options={{ tabBarButton: () => null, tabBarItemStyle: { display: 'none' } }} />
      <Tabs.Screen name="privacy-settings" options={{ tabBarButton: () => null, tabBarItemStyle: { display: 'none' } }} />
    </Tabs>
  )
}
