// app/(auth)/location-permission.jsx
import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import * as Location from 'expo-location'

const OPTIONS = [
  {
    id: 'while_using',
    label: 'While Using the App',
    icon: '➤',
    iconBg: '#29b6f6',
    iconColor: '#fff',
    textColor: '#1a237e',
    cardBg: '#e0f7fe',
    borderColor: '#29b6f6',
    showCheck: true,
  },
  {
    id: 'only_once',
    label: 'Only This Time',
    icon: '⏱',
    iconBg: '#f0f0f0',
    iconColor: '#555',
    textColor: '#222',
    cardBg: '#fff',
    borderColor: '#dde3f0',
    showCheck: false,
  },
  {
    id: 'deny',
    label: "Don't Allow",
    icon: '🚫',
    iconBg: '#fde8e8',
    iconColor: '#e53935',
    textColor: '#e53935',
    cardBg: '#fff',
    borderColor: '#dde3f0',
    showCheck: false,
  },
]

export default function LocationPermissionScreen() {
  const [selected, setSelected] = useState('while_using')
  const [loading, setLoading] = useState(false)

  const handleSelect = async (id) => {
    setSelected(id)
    setLoading(true)

    try {
      if (id === 'while_using') {
        const { status } =
          await Location.requestForegroundPermissionsAsync()
        if (status === 'granted') {
          await Location.getCurrentPositionAsync({})
        }
        router.replace('/(buyer)/home')

      } else if (id === 'only_once') {
        const { status } =
          await Location.requestForegroundPermissionsAsync()
        if (status === 'granted') {
          await Location.getCurrentPositionAsync({})
        }
        router.replace('/(buyer)/home')

      } else {
        // denied — go home anyway
        router.replace('/(buyer)/home')
      }
    } catch (error) {
      console.log(error)
      router.replace('/(buyer)/home')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>

      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <Text style={styles.globeIcon}>🌐</Text>
          <Text style={styles.topTitle}>UBS Global</Text>
        </View>
        <TouchableOpacity>
          <Text style={styles.bellIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
      {/* Image Card */}
      <View style={styles.imageCardWrapper}>
        <View style={styles.imageCard}>
          <Image
            source={require('../../assets/images/city-location.jpg')}
            style={styles.locationImage}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* Title & Subtitle */}
      <Text style={styles.title}>
        Allow UBS Global to access{'\n'}your location?
      </Text>
      <Text style={styles.subtitle}>
        We use your location to show nearby products,{'\n'}
        estimate delivery time, and improve your shopping{'\n'}
        experience.
      </Text>

      {/* Options */}
      <View style={styles.optionsList}>
        {OPTIONS.map((option) => {
          const isSelected = selected === option.id
          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                {
                  backgroundColor: isSelected
                    ? option.cardBg
                    : '#fff',
                  borderColor: isSelected
                    ? option.borderColor
                    : '#dde3f0',
                  borderWidth: isSelected ? 2 : 1.5,
                },
              ]}
              onPress={() => handleSelect(option.id)}
              activeOpacity={0.8}
              disabled={loading}
            >
              {/* Icon */}
              <View style={[
                styles.optionIconBox,
                { backgroundColor: isSelected ? option.iconBg : '#f0f0f0' },
              ]}>
                <Text style={styles.optionIconText}>{option.icon}</Text>
              </View>

              {/* Label */}
              <Text style={[
                styles.optionLabel,
                { color: isSelected ? option.textColor : '#222' },
              ]}>
                {option.label}
              </Text>

              {/* Check */}
              {isSelected && option.showCheck && (
                <View style={styles.checkCircle}>
                  <Text style={styles.checkMark}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          )
        })}
      </View>

      {/* Privacy Note */}
      <View style={styles.privacyRow}>
        <Text style={styles.lockIcon}>🔒</Text>
        <Text style={styles.privacyText}>
          Your location data is never shared with third parties
        </Text>
      </View>

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef1f8',
    paddingHorizontal: 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  globeIcon: {
    fontSize: 22,
  },
  topTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a237e',
  },
  bellIcon: {
    fontSize: 22,
  },

  // Image Card
  imageCardWrapper: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 28,
  },
  imageCard: {
    width: 220,
    height: 200,
    backgroundColor: '#fff',
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },

  // Title
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a237e',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },

  // Options
  optionsList: {
    gap: 12,
    marginBottom: 28,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    gap: 14,
  },
  optionIconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionIconText: {
    fontSize: 20,
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#1a237e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: {
    fontSize: 13,
    color: '#1a237e',
    fontWeight: '700',
  },

  // Privacy
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  lockIcon: {
    fontSize: 13,
  },
  privacyText: {
    fontSize: 12,
    color: '#888',
  },
})