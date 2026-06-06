import React from 'react';
import { Stack } from 'expo-router';
import { SellerProvider } from '../../context/SellerContext';

export default function SellerLayout() {
  return (
    <SellerProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(drawer)" />
      </Stack>
    </SellerProvider>
  );
}
