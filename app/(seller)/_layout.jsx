import React from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SellerProvider } from '../../context/SellerContext';
import SellerDrawerContent from '../../components/seller/SellerDrawerContent';
import SellerBottomNav from '../../components/seller/SellerBottomNav';
import { colors } from '../../constants/colors';

const DRAWER_WIDTH = Math.min(Dimensions.get('window').width * 0.78, 320);

const hiddenDrawerOptions = {
  drawerItemStyle: { display: 'none' },
  swipeEnabled: false,
};

export default function SellerLayout() {
  return (
    <SellerProvider>
      <GestureHandlerRootView style={styles.root}>
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
          <View style={styles.main}>
            <Drawer
              drawerContent={(props) => <SellerDrawerContent {...props} />}
              screenOptions={{
                headerShown: false,
                drawerType: 'front',
                overlayColor: 'rgba(0,0,0,0.32)',
                drawerStyle: { width: DRAWER_WIDTH },
                sceneContainerStyle: styles.scene,
                drawerActiveTintColor: colors.primary,
                drawerInactiveTintColor: '#6f6f6f',
                swipeEdgeWidth: 48,
                swipeEnabled: true,
                ...(Platform.OS === 'android' && {
                  drawerStatusBarAnimation: 'fade',
                }),
              }}
            >
              <Drawer.Screen
                name="dashboard"
                options={{ drawerLabel: 'Dashboard', title: 'Dashboard' }}
              />
              <Drawer.Screen
                name="my-products"
                options={{ drawerLabel: 'My Products', title: 'My Products' }}
              />
              <Drawer.Screen
                name="seller-orders"
                options={{ drawerLabel: 'Orders', title: 'Orders' }}
              />
              <Drawer.Screen
                name="seller-earnings"
                options={{ drawerLabel: 'Earnings', title: 'Earnings' }}
              />
              <Drawer.Screen
                name="seller-messages"
                options={{ drawerLabel: 'Messages', title: 'Messages' }}
              />
              <Drawer.Screen
                name="seller-notifications"
                options={{ drawerLabel: 'Notifications', title: 'Notifications' }}
              />
              <Drawer.Screen
                name="seller-settings"
                options={{ drawerLabel: 'Settings', title: 'Settings' }}
              />
              <Drawer.Screen name="seller-profile" options={hiddenDrawerOptions} />
              <Drawer.Screen name="become-seller" options={hiddenDrawerOptions} />
              <Drawer.Screen name="add-product" options={hiddenDrawerOptions} />
              <Drawer.Screen name="edit-product" options={hiddenDrawerOptions} />
              <Drawer.Screen name="order-details" options={hiddenDrawerOptions} />
            </Drawer>
          </View>
          <SellerBottomNav />
        </SafeAreaView>
      </GestureHandlerRootView>
    </SellerProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  main: {
    flex: 1,
    width: '100%',
  },
  scene: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
