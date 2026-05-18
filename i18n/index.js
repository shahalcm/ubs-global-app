import { I18nManager } from 'react-native'
import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Localization from 'expo-localization'

import en from './en.json'
import ar from './ar.json'
import ml from './ml.json'
import hi from './hi.json'
import fr from './fr.json'
import es from './es.json'
import de from './de.json'
import zh from './zh.json'
import ja from './ja.json'
import ur from './ur.json'
import tr from './tr.json'
import ru from './ru.json'

export const LANGUAGE_STORAGE_KEY = 'ubs_selected_language'
export const RTL_LANGUAGES = ['ar', 'ur']

export const LANGUAGE_OPTIONS = [
  { code: 'en', flag: '🇬🇧', name: 'English', nativeName: 'English' },
  { code: 'ar', flag: '🇸🇦', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', flag: '🇮🇳', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ml', flag: '🇮🇳', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'fr', flag: '🇫🇷', name: 'French', nativeName: 'Français' },
  { code: 'es', flag: '🇪🇸', name: 'Spanish', nativeName: 'Español' },
  { code: 'de', flag: '🇩🇪', name: 'German', nativeName: 'Deutsch' },
  { code: 'zh', flag: '🇨🇳', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', flag: '🇯🇵', name: 'Japanese', nativeName: '日本語' },
  { code: 'ur', flag: '🇵🇰', name: 'Urdu', nativeName: 'اردو' },
  { code: 'tr', flag: '🇹🇷', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'ru', flag: '🇷🇺', name: 'Russian', nativeName: 'Русский' },
]

const resources = {
  en: { translation: en },
  ar: { translation: ar },
  ml: { translation: ml },
  hi: { translation: hi },
  fr: { translation: fr },
  es: { translation: es },
  de: { translation: de },
  zh: { translation: zh },
  ja: { translation: ja },
  ur: { translation: ur },
  tr: { translation: tr },
  ru: { translation: ru },
}

const resolveLanguage = (lang) => {
  if (!lang) return 'en'
  const code = lang.split('-')[0]
  return resources[code] ? code : 'en'
}

const applyRtl = (lang) => {
  const rtl = RTL_LANGUAGES.includes(lang)
  if (I18nManager.isRTL !== rtl) {
    I18nManager.allowRTL(true)
    I18nManager.forceRTL(rtl)
  }
}

export const initI18n = async () => {
  try {
    let savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (!savedLanguage) {
      const locales = Localization.getLocales()
      savedLanguage = locales[0]?.languageCode || 'en'
    }
    savedLanguage = resolveLanguage(savedLanguage)

    applyRtl(savedLanguage)

    if (!i18next.isInitialized) {
      await i18next.use(initReactI18next).init({
        compatibilityJSON: 'v4',
        resources,
        lng: savedLanguage,
        fallbackLng: 'en',
        load: 'languageOnly',
        supportedLngs: Object.keys(resources),
        interpolation: {
          escapeValue: false,
        },
        react: {
          useSuspense: false,
        },
      })
    } else {
      await i18next.changeLanguage(savedLanguage)
    }
  } catch (error) {
    console.log('i18n init error:', error)
    if (!i18next.isInitialized) {
      await i18next.use(initReactI18next).init({
        compatibilityJSON: 'v4',
        resources,
        lng: 'en',
        fallbackLng: 'en',
        interpolation: { escapeValue: false },
      })
    }
  }
}

export const setAppLanguage = async (langCode) => {
  const language = resolveLanguage(langCode)
  applyRtl(language)
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  if (!i18next.isInitialized) {
    await initI18n()
  } else {
    await i18next.changeLanguage(language)
  }
  return language
}

export default i18next;
