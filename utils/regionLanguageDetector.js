import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Country / Region to Language Mapping Matrix
const COUNTRY_TO_LANG_MAP = {
  // Middle East / Arabic
  'SA': 'ar', 'AE': 'ar', 'QA': 'ar', 'KW': 'ar', 'OM': 'ar', 'BH': 'ar', 'EG': 'ar', 'JO': 'ar', 'LB': 'ar', 'IQ': 'ar',
  
  // South Asia / India Regional
  'IN': 'hi', // Default for India, will check state/locale if available
  'PK': 'ur',
  'BD': 'bn',
  
  // East & Southeast Asia
  'KR': 'ko',
  'JP': 'ja',
  'CN': 'zh', 'TW': 'zh', 'HK': 'zh',
  'ID': 'id',
  'TH': 'th',
  'VN': 'vi',
  
  // Europe & Americas
  'FR': 'fr',
  'ES': 'es', 'MX': 'es', 'AR': 'es', 'CO': 'es',
  'DE': 'de', 'AT': 'de', 'CH': 'de',
  'PT': 'pt', 'BR': 'pt',
  'IT': 'it',
  'NL': 'nl', 'BE': 'nl',
  'RU': 'ru', 'BY': 'ru',
  'TR': 'tr',
  'PL': 'pl',
  'SE': 'sv',
  'NO': 'no',
  'DK': 'da',
  'FI': 'fi',
  'GR': 'el',
  'IL': 'he',
  'IR': 'fa',
  
  // English Defaults
  'US': 'en', 'GB': 'en', 'CA': 'en', 'AU': 'en', 'NZ': 'en'
};

// Supported 34 System Languages
const SUPPORTED_LANG_CODES = [
  'en', 'ar', 'hi', 'ml', 'fr', 'es', 'de', 'zh', 'ja', 'ur',
  'tr', 'ru', 'ko', 'pt', 'it', 'nl', 'bn', 'ta', 'te', 'kn',
  'mr', 'gu', 'pa', 'id', 'th', 'vi', 'pl', 'sv', 'no', 'da',
  'fi', 'el', 'he', 'fa'
];

/**
 * Auto-detect region and device language for initial app setup
 */
export async function detectAutoRegionLanguage() {
  try {
    // 1. Check if user already manually selected a language
    const savedLang = await AsyncStorage.getItem('ubs_selected_language');
    if (savedLang && SUPPORTED_LANG_CODES.includes(savedLang)) {
      return savedLang;
    }

    // 2. Inspect Device Locales from expo-localization
    const locales = Localization.getLocales();
    if (locales && locales.length > 0) {
      const primary = locales[0];
      const langCode = primary.languageCode?.toLowerCase();
      const regionCode = primary.regionCode?.toUpperCase();

      // Direct language code match
      if (langCode && SUPPORTED_LANG_CODES.includes(langCode)) {
        return langCode;
      }

      // Region code lookup
      if (regionCode && COUNTRY_TO_LANG_MAP[regionCode]) {
        return COUNTRY_TO_LANG_MAP[regionCode];
      }
    }
  } catch (err) {
    console.warn('[RegionLanguageDetector] Auto-detection error:', err);
  }

  return 'en'; // Default fallback
}
