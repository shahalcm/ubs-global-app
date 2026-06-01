import 'react-native-gesture-handler'
import '../utils/customAlert' // Override Alert.alert globally
import { AuthProvider } from '../context/AuthContext'
import { CallProvider } from '../context/CallContext'
import { CartProvider } from '../context/CartContext'
import { Slot } from 'expo-router'
import { useEffect, useState } from 'react'
import { I18nextProvider } from 'react-i18next'
import i18n, { initI18n } from '../i18n'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import CustomAlertContainer from '../components/shared/CustomAlert'
import * as WebBrowser from 'expo-web-browser'
import { StatusBar } from 'expo-status-bar'
import { View, Platform } from 'react-native'

// Startup logs & Global Native Crash Handler
console.log("📱 [App Status] App Started and Bundle Evaluating...");

if (global.ErrorUtils) {
  const previousHandler = global.ErrorUtils.getGlobalHandler();
  global.ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.error("💥 [Fatal Native Crash Caught]", error);
    if (previousHandler) {
      previousHandler(error, isFatal);
    }
  });
}

WebBrowser.maybeCompleteAuthSession()

function RootLayoutInner() {
  const [i18nLoaded, setI18nLoaded] = useState(false)
  const insets = useSafeAreaInsets()

  useEffect(() => {
    initI18n().then(() => setI18nLoaded(true))
  }, [])

  return (
    <I18nextProvider i18n={i18n}>
      <CallProvider>
        <CartProvider>
          <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
            <StatusBar style="light" backgroundColor="#1A237E" translucent={false} />
            {Platform.OS === 'ios' && (
              <View style={{ height: insets.top, backgroundColor: '#1A237E' }} />
            )}
            <View style={{ flex: 1 }}>
              {i18nLoaded ? <Slot /> : null}
            </View>
            <CustomAlertContainer />
          </View>
        </CartProvider>
      </CallProvider>
    </I18nextProvider>
  )
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <RootLayoutInner />
      </SafeAreaProvider>
    </AuthProvider>
  )
}
