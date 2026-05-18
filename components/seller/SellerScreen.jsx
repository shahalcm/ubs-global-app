import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

export default function SellerScreen({ children, style }) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: '100%',
    alignSelf: 'stretch',
    backgroundColor: colors.background,
  },
});
