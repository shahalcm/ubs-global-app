import React, { useState } from 'react';
import { Slot } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SellerProvider } from '../../context/SellerContext';
import { SellerLayoutProvider } from '../../context/SellerLayoutContext';
import SellerDrawer from '../../components/seller/SellerDrawer';
import SellerBottomNav from '../../components/seller/SellerBottomNav';
import { colors } from '../../constants/colors';

export default function SellerLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <SellerProvider>
      <SellerLayoutProvider value={{ drawerOpen, setDrawerOpen }}>
        <SafeAreaView style={styles.container}>
          <SellerDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
          <View style={styles.content}>
            <Slot />
          </View>
          <SellerBottomNav />
        </SafeAreaView>
      </SellerLayoutProvider>
    </SellerProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.background,
  },
});
