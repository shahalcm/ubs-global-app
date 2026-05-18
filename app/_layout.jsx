import 'react-native-gesture-handler'
import { AuthProvider } from '../context/AuthContext'
import { CartProvider } from '../context/CartContext'
import { Slot } from 'expo-router'
import { useEffect, useState } from 'react'
import { I18nextProvider } from 'react-i18next'
import i18n, { initI18n } from '../i18n'

export default function RootLayout() {
  const [i18nLoaded, setI18nLoaded] = useState(false)

  useEffect(() => {
    initI18n().then(() => setI18nLoaded(true))
  }, [])

  if (!i18nLoaded) return null

  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <CartProvider>
          <Slot />
        </CartProvider>
      </AuthProvider>
    </I18nextProvider>
  )
}
