import 'react-native-gesture-handler'
import '../utils/customAlert' // Override Alert.alert globally
import { AuthProvider } from '../context/AuthContext'
import { CallProvider } from '../context/CallContext'
import { CartProvider } from '../context/CartContext'
import { Slot } from 'expo-router'
import { useEffect, useState } from 'react'
import { I18nextProvider } from 'react-i18next'
import i18n, { initI18n } from '../i18n'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import CustomAlertContainer from '../components/shared/CustomAlert'
import * as WebBrowser from 'expo-web-browser'

WebBrowser.maybeCompleteAuthSession()

export default function RootLayout() {
  const [i18nLoaded, setI18nLoaded] = useState(false)

  useEffect(() => {
    initI18n().then(() => setI18nLoaded(true))
  }, [])

  if (!i18nLoaded) return null

  return (
    <SafeAreaProvider>
      <I18nextProvider i18n={i18n}>
        <AuthProvider>
          <CallProvider>
            <CartProvider>
              <Slot />
              <CustomAlertContainer />
            </CartProvider>
          </CallProvider>
        </AuthProvider>
      </I18nextProvider>
    </SafeAreaProvider>
  )
}
