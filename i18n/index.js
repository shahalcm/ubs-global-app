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
import ko from './ko.json'
import pt from './pt.json'
import it from './it.json'
import nl from './nl.json'
import bn from './bn.json'
import ta from './ta.json'
import te from './te.json'
import kn from './kn.json'
import mr from './mr.json'
import gu from './gu.json'
import pa from './pa.json'
import id from './id.json'
import th from './th.json'
import vi from './vi.json'
import pl from './pl.json'
import sv from './sv.json'
import no from './no.json'
import da from './da.json'
import fi from './fi.json'
import el from './el.json'
import he from './he.json'
import fa from './fa.json'

export const LANGUAGE_STORAGE_KEY = 'ubs_selected_language'
export const RTL_LANGUAGES = ['ar', 'ur', 'fa', 'he']

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
  { code: 'ko', flag: '🇰🇷', name: 'Korean', nativeName: '한국어' },
  { code: 'pt', flag: '🇵🇹', name: 'Portuguese', nativeName: 'Português' },
  { code: 'it', flag: '🇮🇹', name: 'Italian', nativeName: 'Italiano' },
  { code: 'nl', flag: '🇳🇱', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'bn', flag: '🇧🇩', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ta', flag: '🇮🇳', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', flag: '🇮🇳', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'kn', flag: '🇮🇳', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'mr', flag: '🇮🇳', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'gu', flag: '🇮🇳', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'pa', flag: '🇮🇳', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'id', flag: '🇮🇩', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'th', flag: '🇹🇭', name: 'Thai', nativeName: 'ไทย' },
  { code: 'vi', flag: '🇻🇳', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'pl', flag: '🇵🇱', name: 'Polish', nativeName: 'Polski' },
  { code: 'sv', flag: '🇸🇪', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'no', flag: '🇳🇴', name: 'Norwegian', nativeName: 'Norsk' },
  { code: 'da', flag: '🇩🇰', name: 'Danish', nativeName: 'Dansk' },
  { code: 'fi', flag: '🇫🇮', name: 'Finnish', nativeName: 'Suomi' },
  { code: 'el', flag: '🇬🇷', name: 'Greek', nativeName: 'Ελληνικά' },
  { code: 'he', flag: '🇮🇱', name: 'Hebrew', nativeName: 'עברית' },
  { code: 'fa', flag: '🇮🇷', name: 'Persian', nativeName: 'فارسی' },
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
  ko: { translation: ko },
  pt: { translation: pt },
  it: { translation: it },
  nl: { translation: nl },
  bn: { translation: bn },
  ta: { translation: ta },
  te: { translation: te },
  kn: { translation: kn },
  mr: { translation: mr },
  gu: { translation: gu },
  pa: { translation: pa },
  id: { translation: id },
  th: { translation: th },
  vi: { translation: vi },
  pl: { translation: pl },
  sv: { translation: sv },
  no: { translation: no },
  da: { translation: da },
  fi: { translation: fi },
  el: { translation: el },
  he: { translation: he },
  fa: { translation: fa },
}

const resolveLanguage = (lang) => {
  if (!lang) return 'en'
  const code = lang.split('-')[0].toLowerCase()
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

export default i18next
