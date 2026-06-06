import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import React, { useMemo, useState } from 'react'
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { colors } from '../../constants/colors'
import { setAppLanguage, LANGUAGE_OPTIONS } from '../../i18n'

export default function LanguageScreen() {
  const router = useRouter()
  const { fromSettings } = useLocalSearchParams() || {}
  const { t, i18n } = useTranslation()
  const [query, setQuery] = useState('')
  const [selectedCode, setSelectedCode] = useState(i18n.language || 'en')
  const [isBusy, setIsBusy] = useState(false)



  const filteredLanguages = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return LANGUAGE_OPTIONS

    return LANGUAGE_OPTIONS.filter(
      (item) =>
        item.name.toLowerCase().includes(normalized) ||
        item.nativeName.toLowerCase().includes(normalized),
    )
  }, [query])

  const handleContinue = async () => {
    setIsBusy(true)
    try {
      await setAppLanguage(selectedCode)
      if (fromSettings === 'true') {
        if (router.canGoBack()) {
          router.back()
        } else {
          router.replace('/(buyer)/home')
        }
      } else {
        router.push('/(auth)/login')
      }
    } finally {
      setIsBusy(false)
    }
  }

  const renderLanguageItem = ({ item }) => {
    const selected = item.code === selectedCode
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
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{t('Select Your Language')}</Text>
      <Text style={styles.subtitle}>{t('Choose your preferred language')}</Text>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder={t('Search language')}
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
        {isBusy ? t('Please wait...') : t('Continue')}
      </Button>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
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
