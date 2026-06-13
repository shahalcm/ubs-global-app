import 'react-native-gesture-handler'
import '../utils/customAlert' // Override Alert.alert globally

// Hijack StyleSheet.create for global automatic dark mode styling
import { StyleSheet } from 'react-native'
import { colors } from '../constants/colors'

const originalCreate = StyleSheet.create;
const registeredStylesheets = [];

const resolveThemeColor = (val, currentColors) => {
  if (typeof val !== 'string') return val;
  const lowerVal = val.toLowerCase().trim();
  const isDark = currentColors.background !== '#ffffff';
  
  if (lowerVal === '#ffffff' || lowerVal === '#fff') {
    return isDark ? '#1e1e1e' : '#ffffff';
  } else if (lowerVal === '#eef1f8') {
    return isDark ? '#121212' : '#eef1f8';
  } else if (lowerVal === '#f5f5f5') {
    return currentColors.surface;
  } else if (lowerVal === '#1a1a1a' || lowerVal === '#333' || lowerVal === '#333333' || lowerVal === '#000033') {
    return currentColors.text;
  } else if (lowerVal === '#757575' || lowerVal === '#666' || lowerVal === '#666666' || lowerVal === '#888' || lowerVal === '#888888' || lowerVal === '#909090') {
    return currentColors.textMuted;
  } else if (lowerVal === '#e0e0e0' || lowerVal === '#eee' || lowerVal === '#eeeeee') {
    return currentColors.border;
  } else if (lowerVal.replace(/\s/g, '') === 'rgba(0,0,0,0.08)') {
    return currentColors.shadow;
  }
  return val;
};

StyleSheet.create = (stylesObj) => {
  const newStyles = {};
  for (const styleKey in stylesObj) {
    const styleObj = stylesObj[styleKey];
    if (styleObj && typeof styleObj === 'object') {
      newStyles[styleKey] = {};
      for (const prop in styleObj) {
        const val = styleObj[prop];
        newStyles[styleKey][prop] = resolveThemeColor(val, colors);
      }
    } else {
      newStyles[styleKey] = styleObj;
    }
  }

  const compiled = originalCreate(newStyles);
  
  registeredStylesheets.push({
    original: stylesObj,
    compiled: compiled
  });

  return compiled;
};

// Register listener to update all static stylesheets whenever colors change
colors.onChange = () => {
  for (const sheet of registeredStylesheets) {
    if (!sheet.compiled || Object.isFrozen(sheet.compiled)) {
      continue;
    }
    for (const styleKey in sheet.original) {
      const styleObj = sheet.original[styleKey];
      if (styleObj && typeof styleObj === 'object' && sheet.compiled[styleKey]) {
        if (Object.isFrozen(sheet.compiled[styleKey])) {
          continue;
        }
        for (const prop in styleObj) {
          const val = styleObj[prop];
          sheet.compiled[styleKey][prop] = resolveThemeColor(val, colors);
        }
      }
    }
  }
};


import { AuthProvider } from '../context/AuthContext'
import { CallProvider } from '../context/CallContext'
import { CartProvider } from '../context/CartContext'
import { ThemeProvider, useTheme } from '../context/ThemeContext'
import { ErrorBoundary } from '../components/shared/ErrorBoundary'
import { Slot } from 'expo-router'
import React, { useEffect, useState, forwardRef } from 'react'
import { I18nextProvider, useTranslation } from 'react-i18next'
import i18n, { initI18n } from '../i18n'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import CustomAlertContainer from '../components/shared/CustomAlert'
import * as WebBrowser from 'expo-web-browser'
import { StatusBar } from 'expo-status-bar'
import ReactNative, { View, Platform } from 'react-native'

// Hijack Text & TextInput for global automatic translation
const OriginalText = ReactNative.Text;
const OriginalTextInput = ReactNative.TextInput;

const translateString = (str, t) => {
  if (typeof str !== 'string') return str;
  const trimmed = str.trim();
  if (!trimmed) return str;
  
  if (/^\d+$/.test(trimmed) || /^\d{1,2}:\d{2}$/.test(trimmed) || trimmed.startsWith('Order #')) {
    return str;
  }

  const translated = t(trimmed);
  const startSpace = str.match(/^\s*/)[0];
  const endSpace = str.match(/\s*$/)[0];
  return startSpace + translated + endSpace;
};

const CustomText = forwardRef(({ children, ...props }, ref) => {
  const { t } = useTranslation();

  const translateChildren = (node) => {
    if (typeof node === 'string') {
      return translateString(node, t);
    }
    if (Array.isArray(node)) {
      return React.Children.map(node, translateChildren);
    }
    return node;
  };

  const translatedChildren = translateChildren(children);
  return <OriginalText {...props} ref={ref}>{translatedChildren}</OriginalText>;
});

const CustomTextInput = forwardRef(({ placeholder, ...props }, ref) => {
  const { t } = useTranslation();
  const translatedPlaceholder = placeholder ? translateString(placeholder, t) : placeholder;
  return <OriginalTextInput {...props} ref={ref} placeholder={translatedPlaceholder} />;
});

Object.defineProperty(ReactNative, 'Text', {
  configurable: true,
  enumerable: true,
  get() {
    return CustomText;
  }
});

Object.defineProperty(ReactNative, 'TextInput', {
  configurable: true,
  enumerable: true,
  get() {
    return CustomTextInput;
  }
});


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
  const { darkTheme } = useTheme()

  useEffect(() => {
    initI18n().then(() => setI18nLoaded(true))
  }, [])

  return (
    <I18nextProvider i18n={i18n}>
      <CallProvider>
        <CartProvider>
          <View style={{ flex: 1, backgroundColor: colors.background }}>
            <StatusBar style={darkTheme ? "light" : "dark"} backgroundColor={darkTheme ? "#121212" : "#1A237E"} translucent={false} />
            {Platform.OS === 'ios' && (
              <View style={{ height: insets.top, backgroundColor: darkTheme ? "#121212" : "#1A237E" }} />
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
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <SafeAreaProvider>
            <RootLayoutInner />
          </SafeAreaProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}
