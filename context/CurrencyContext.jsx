import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Location from 'expo-location'
import api from '../services/api'

const DEFAULT_RATES = {
  USD: 1.0, INR: 87.0, EUR: 0.92, GBP: 0.78, AED: 3.67,
  CAD: 1.38, AUD: 1.54, SGD: 1.34, JPY: 148.5, MYR: 4.45,
  SAR: 3.75, QAR: 3.64, CNY: 7.22
}

const METADATA = {
  USD: { symbol: '$', name: 'US Dollar', locale: 'en-US' },
  INR: { symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  EUR: { symbol: '€', name: 'Euro', locale: 'de-DE' },
  GBP: { symbol: '£', name: 'British Pound', locale: 'en-GB' },
  AED: { symbol: 'AED', name: 'UAE Dirham', locale: 'ar-AE' },
  CAD: { symbol: 'CA$', name: 'Canadian Dollar', locale: 'en-CA' },
  AUD: { symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
  SGD: { symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG' },
  JPY: { symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  MYR: { symbol: 'RM', name: 'Malaysian Ringgit', locale: 'ms-MY' },
  SAR: { symbol: 'SAR', name: 'Saudi Riyal', locale: 'ar-SA' },
  QAR: { symbol: 'QAR', name: 'Qatari Riyal', locale: 'ar-QA' },
  CNY: { symbol: 'CN¥', name: 'Chinese Yuan', locale: 'zh-CN' }
}

const COUNTRY_MAP = {
  IN: { name: 'India', currency: 'INR', symbol: '₹', timezone: 'Asia/Kolkata' },
  US: { name: 'United States', currency: 'USD', symbol: '$', timezone: 'America/New_York' },
  DE: { name: 'Germany', currency: 'EUR', symbol: '€', timezone: 'Europe/Berlin' },
  GB: { name: 'United Kingdom', currency: 'GBP', symbol: '£', timezone: 'Europe/London' },
  AE: { name: 'United Arab Emirates', currency: 'AED', symbol: 'AED', timezone: 'Asia/Dubai' },
  CA: { name: 'Canada', currency: 'CAD', symbol: 'CA$', timezone: 'America/Toronto' },
  AU: { name: 'Australia', currency: 'AUD', symbol: 'A$', timezone: 'Australia/Sydney' },
  SG: { name: 'Singapore', currency: 'SGD', symbol: 'S$', timezone: 'Asia/Singapore' },
  JP: { name: 'Japan', currency: 'JPY', symbol: '¥', timezone: 'Asia/Tokyo' },
  MY: { name: 'Malaysia', currency: 'MYR', symbol: 'RM', timezone: 'Asia/Kuala_Lumpur' },
  SA: { name: 'Saudi Arabia', currency: 'SAR', symbol: 'SAR', timezone: 'Asia/Riyadh' },
  QA: { name: 'Qatar', currency: 'QAR', symbol: 'QAR', timezone: 'Asia/Qatar' },
  CN: { name: 'China', currency: 'CNY', symbol: 'CN¥', timezone: 'Asia/Shanghai' }
}

const CurrencyContext = createContext()

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrencyState] = useState('INR')
  const [countryCode, setCountryCodeState] = useState('IN')
  const [countryName, setCountryNameState] = useState('India')
  const [exchangeRates, setExchangeRates] = useState(DEFAULT_RATES)
  const [loading, setLoading] = useState(true)

  // Fetch exchange rates from backend
  const fetchExchangeRates = useCallback(async () => {
    try {
      const res = await api.get('/currency/rates')
      if (res.data?.success && res.data?.rates) {
        setExchangeRates(res.data.rates)
      }
    } catch (err) {
      console.warn('Using fallback local exchange rates:', err.message)
    }
  }, [])

  // Location Detection (GPS -> IP fallback)
  const detectUserGeoLocation = useCallback(async () => {
    try {
      // 1. Check local storage
      const savedCountry = await AsyncStorage.getItem('user_country_code')
      const savedCurrency = await AsyncStorage.getItem('user_currency_code')

      if (savedCountry && savedCurrency) {
        setCountryCodeState(savedCountry)
        setCurrencyState(savedCurrency)
        const meta = COUNTRY_MAP[savedCountry] || COUNTRY_MAP['US']
        setCountryNameState(meta.name)
        setLoading(false)
        return
      }

      // 2. Try GPS permission
      let gpsGranted = false
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status === 'granted') {
          gpsGranted = true
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
          const reverseGeocode = await Location.reverseGeocodeAsync({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude
          })

          if (reverseGeocode?.[0]?.isoCountryCode) {
            const code = reverseGeocode[0].isoCountryCode.toUpperCase()
            const meta = COUNTRY_MAP[code] || COUNTRY_MAP['US']

            setCountryCodeState(code)
            setCurrencyState(meta.currency)
            setCountryNameState(meta.name || reverseGeocode[0].country)

            await AsyncStorage.setItem('user_country_code', code)
            await AsyncStorage.setItem('user_currency_code', meta.currency)
            setLoading(false)
            return
          }
        }
      } catch (gpsErr) {
        console.warn('GPS location detection skipped, falling back to IP:', gpsErr.message)
      }

      // 3. Fallback to IP Geolocation via API
      const geoRes = await api.get('/currency/detect-location').catch(() => null)
      if (geoRes?.data?.success && geoRes?.data?.location) {
        const loc = geoRes.data.location
        const code = (loc.countryCode || 'IN').toUpperCase()
        const meta = COUNTRY_MAP[code] || COUNTRY_MAP['US']

        setCountryCodeState(code)
        setCurrencyState(meta.currency)
        setCountryNameState(loc.countryName || meta.name)

        await AsyncStorage.setItem('user_country_code', code)
        await AsyncStorage.setItem('user_currency_code', meta.currency)
      }
    } catch (err) {
      console.warn('Geo location error:', err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchExchangeRates()
    detectUserGeoLocation()
  }, [fetchExchangeRates, detectUserGeoLocation])

  // Update Currency
  const updateCurrency = async (newCurrency) => {
    const code = (newCurrency || 'USD').toUpperCase()
    setCurrencyState(code)
    await AsyncStorage.setItem('user_currency_code', code)

    // Save preference to DB if logged in
    api.post('/currency/preferences', { currencyCode: code }).catch(() => null)
  }

  // Update Country
  const updateCountry = async (newCountryCode) => {
    const code = (newCountryCode || 'US').toUpperCase()
    const meta = COUNTRY_MAP[code] || COUNTRY_MAP['US']

    setCountryCodeState(code)
    setCurrencyState(meta.currency)
    setCountryNameState(meta.name)

    await AsyncStorage.setItem('user_country_code', code)
    await AsyncStorage.setItem('user_currency_code', meta.currency)

    // Save preference to DB if logged in
    api.post('/currency/preferences', {
      countryCode: code,
      countryName: meta.name,
      currencyCode: meta.currency,
      currencySymbol: meta.symbol,
      timezone: meta.timezone
    }).catch(() => null)
  }

  // Convert USD Price
  const convertPrice = useCallback((amountInUSD, targetCurrencyOverride) => {
    const num = Number(amountInUSD) || 0
    const targetCode = (targetCurrencyOverride || currency || 'USD').toUpperCase()
    const rate = exchangeRates[targetCode] || DEFAULT_RATES[targetCode] || 1.0
    return Number((num * rate).toFixed(2))
  }, [currency, exchangeRates])

  // Format Price with Symbol
  const formatPrice = useCallback((amountInUSD, targetCurrencyOverride) => {
    const targetCode = (targetCurrencyOverride || currency || 'USD').toUpperCase()
    const meta = METADATA[targetCode] || { symbol: targetCode, locale: 'en-US' }
    const converted = convertPrice(amountInUSD, targetCode)

    try {
      return new Intl.NumberFormat(meta.locale || 'en-US', {
        style: 'currency',
        currency: targetCode,
        maximumFractionDigits: targetCode === 'JPY' ? 0 : 2,
        minimumFractionDigits: targetCode === 'JPY' ? 0 : 2
      }).format(converted)
    } catch (e) {
      return `${meta.symbol}${converted.toFixed(2)}`
    }
  }, [currency, convertPrice])

  const symbol = METADATA[currency]?.symbol || '$'

  return (
    <CurrencyContext.Provider value={{
      currency,
      symbol,
      countryCode,
      countryName,
      exchangeRates,
      loading,
      setCurrency: updateCurrency,
      setCountry: updateCountry,
      convertPrice,
      formatPrice,
      refreshRates: fetchExchangeRates
    }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export const useCurrency = () => {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}
