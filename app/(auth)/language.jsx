import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import i18next from 'i18next';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Button } from 'react-native-paper';
import { initReactI18next } from 'react-i18next';
import ar from '../../i18n/ar.json';
import en from '../../i18n/en.json';
import ml from '../../i18n/ml.json';
import { colors } from '../../constants/colors';

const LANGUAGE_STORAGE_KEY = 'ubs_selected_language';

const LANGUAGE_OPTIONS = [
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
];

const resources = {
  en: { translation: en },
  ar: { translation: ar },
  ml: { translation: ml },
  hi: { translation: en },
  fr: { translation: en },
  es: { translation: en },
  de: { translation: en },
  zh: { translation: en },
  ja: { translation: en },
  ur: { translation: en },
  tr: { translation: en },
  ru: { translation: en },
};

async function initializeI18n(languageCode) {
  if (!i18next.isInitialized) {
    await i18next.use(initReactI18next).init({
      compatibilityJSON: 'v4',
      resources,
      lng: languageCode,
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
    });
    return;
  }

  await i18next.changeLanguage(languageCode);
}

export default function LanguageScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedCode, setSelectedCode] = useState('en');
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    let active = true;

    const loadLanguage = async () => {
      try {
        const savedCode = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        const fallback = 'en';
        const code =
          savedCode && LANGUAGE_OPTIONS.some((item) => item.code === savedCode) ? savedCode : fallback;
        if (active) {
          setSelectedCode(code);
        }
        await initializeI18n(code);
      } catch {
        await initializeI18n('en');
      }
    };

    void loadLanguage();
    return () => {
      active = false;
    };
  }, []);

  const filteredLanguages = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return LANGUAGE_OPTIONS;
    }

    return LANGUAGE_OPTIONS.filter(
      (item) =>
        item.name.toLowerCase().includes(normalized) || item.nativeName.toLowerCase().includes(normalized),
    );
  }, [query]);

  const handleContinue = async () => {
    setIsBusy(true);
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, selectedCode);
      await initializeI18n(selectedCode);
      router.push('/login');
    } finally {
      setIsBusy(false);
    }
  };

  const renderLanguageItem = ({ item }) => {
    const selected = item.code === selectedCode;
    return (
      <TouchableOpacity
        style={[styles.row, selected && styles.rowSelected]}
        onPress={() => setSelectedCode(item.code)}
        activeOpacity={0.9}
      >
        <Text style={styles.flag}>{item.flag}</Text>
        <View style={styles.rowContent}>
          <Text style={styles.languageName}>{item.name}</Text>
          <Text style={styles.nativeName}>{item.nativeName}</Text>
        </View>
        {selected ? <MaterialCommunityIcons name="check-circle" size={22} color={colors.accent} /> : null}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Language</Text>
      <Text style={styles.subtitle}>Choose your preferred language</Text>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search language"
        placeholderTextColor={colors.textMuted}
        style={styles.searchInput}
      />

      <FlatList
        data={filteredLanguages}
        keyExtractor={(item) => item.code}
        renderItem={renderLanguageItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      <Button
        mode="contained"
        buttonColor={colors.primary}
        style={styles.continueButton}
        contentStyle={styles.continueButtonContent}
        loading={isBusy}
        disabled={isBusy}
        onPress={handleContinue}
      >
        Continue
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 20,
  },
  title: {
    fontSize: 38,
    lineHeight: 42,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    marginBottom: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#dbe3f1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
    marginBottom: 14,
  },
  listContent: {
    paddingBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: '#d7dce6',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  rowSelected: {
    borderColor: colors.accent,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.6,
    shadowRadius: 3,
    elevation: 2,
  },
  flag: {
    fontSize: 24,
    marginRight: 12,
  },
  rowContent: {
    flex: 1,
  },
  languageName: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: '600',
  },
  nativeName: {
    marginTop: 2,
    fontSize: 13,
    color: '#4f5b76',
  },
  continueButton: {
    borderRadius: 12,
    marginTop: 6,
  },
  continueButtonContent: {
    height: 50,
  },
});
