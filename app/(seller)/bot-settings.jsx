import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  Switch,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import api from '../../services/api'
import { router } from 'expo-router'
import { colors } from '../../constants/colors'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function BotSettingsScreen() {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      setFetching(true)
      const res = await api.get('/bot-config')
      setConfig(res.data.config)
    } catch (error) {
      console.log('Error fetching bot config:', error)
      Alert.alert('Error', 'Failed to load bot settings. Make sure your seller profile is approved.')
    } finally {
      setFetching(false)
    }
  }

  const handleToggleBot = async () => {
    try {
      const res = await api.patch('/bot-config/toggle')
      setConfig(prev => ({
        ...prev,
        isEnabled: res.data.isEnabled
      }))
      Alert.alert(
        res.data.isEnabled ? '✅ Bot Enabled' : '⏹ Bot Disabled',
        res.data.isEnabled
          ? 'AI will now auto-reply to buyers.'
          : 'You will handle all chats manually.'
      )
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle bot status')
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Clean human takeover keywords
      let cleanedKeywords = config.humanTakeoverKeywords;
      if (Array.isArray(cleanedKeywords)) {
        cleanedKeywords = cleanedKeywords.map(k => k.trim()).filter(Boolean);
      }
      
      const payload = {
        ...config,
        humanTakeoverKeywords: cleanedKeywords
      };
      
      const res = await api.put('/bot-config', payload)
      if (res.data.success) {
        setConfig(res.data.config)
        Alert.alert('✅ Saved', 'Bot settings updated successfully!')
      } else {
        Alert.alert('Error', 'Failed to save settings')
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading AI settings...</Text>
      </SafeAreaView>
    )
  }

  if (!config) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <TouchableOpacity style={styles.retryBtn} onPress={loadConfig}>
          <Text style={styles.retryText}>Retry Loading Settings</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  const isDark = colors.background === '#121212';
  const themeStyles = {
    screen: { backgroundColor: colors.background },
    topBar: { backgroundColor: isDark ? '#1e1e1e' : '#fff', borderBottomColor: colors.border },
    cardBg: { backgroundColor: isDark ? '#1e1e1e' : '#fff', borderColor: colors.border },
    textColor: { color: colors.text },
    subTextColor: { color: colors.textMuted },
    iconBackground: { backgroundColor: isDark ? '#2d2d2d' : '#e3f2fd' },
    inputBg: { backgroundColor: isDark ? '#2a2a2a' : '#f5f7fc', borderColor: colors.border, color: colors.text }
  };

  return (
    <SafeAreaView style={[styles.container, themeStyles.screen]}>
      {/* TOP BAR */}
      <View style={[styles.topBar, themeStyles.topBar]}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(seller)/dashboard')}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, themeStyles.textColor]}>AI Bot Settings</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={styles.save}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* STATUS CARD */}
        <View style={[styles.statusCard, themeStyles.cardBg]}>
          <View style={[styles.botIconCircle, themeStyles.iconBackground]}>
            <Text style={styles.botIcon}>🤖</Text>
          </View>
          <View style={styles.statusInfo}>
            <Text style={[styles.statusTitle, themeStyles.textColor]}>AI Chat Assistant</Text>
            <Text style={[styles.statusSub, themeStyles.subTextColor]}>
              {config.isEnabled
                ? 'Active - Replying automatically'
                : 'Inactive - Manual replies only'
              }
            </Text>
          </View>
          <Switch
            value={config.isEnabled}
            onValueChange={handleToggleBot}
            trackColor={{
              false: '#ddd',
              true: '#c3d7ff'
            }}
            thumbColor={
              config.isEnabled ? colors.primary : '#fff'
            }
          />
        </View>

        {/* BOT NAME */}
        <View style={[styles.section, themeStyles.cardBg]}>
          <Text style={[styles.sectionTitle, themeStyles.textColor]}>Bot Name</Text>
          <TextInput
            style={[styles.input, themeStyles.inputBg]}
            value={config.botName}
            onChangeText={v => setConfig(p => ({
              ...p, botName: v
            }))}
            placeholder="e.g., UBS Assistant"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {/* WELCOME MESSAGE */}
        <View style={[styles.section, themeStyles.cardBg]}>
          <Text style={[styles.sectionTitle, themeStyles.textColor]}>Welcome Message</Text>
          <TextInput
            style={[styles.input, styles.textarea, themeStyles.inputBg]}
            value={config.welcomeMessage}
            onChangeText={v => setConfig(p => ({
              ...p, welcomeMessage: v
            }))}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {/* CUSTOM INSTRUCTIONS */}
        <View style={[styles.section, themeStyles.cardBg]}>
          <Text style={[styles.sectionTitle, themeStyles.textColor]}>Custom Instructions</Text>
          <Text style={[styles.sectionSub, themeStyles.subTextColor]}>
            Tell the AI about your shop details, policies, and items.
          </Text>
          <TextInput
            style={[styles.input, styles.textareaCustom, themeStyles.inputBg]}
            value={config.customInstructions}
            onChangeText={v => setConfig(p => ({
              ...p, customInstructions: v
            }))}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            placeholder="e.g., We sell premium textiles. Orders usually ship in 2 days. Returns are accepted within 14 days."
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {/* HUMAN TAKEOVER KEYWORDS */}
        <View style={[styles.section, themeStyles.cardBg]}>
          <Text style={[styles.sectionTitle, themeStyles.textColor]}>Human Takeover Keywords</Text>
          <Text style={[styles.sectionSub, themeStyles.subTextColor]}>
            Keywords that will automatically notify you and pause the bot (comma separated).
          </Text>
          <TextInput
            style={[styles.input, themeStyles.inputBg]}
            value={config.humanTakeoverKeywords?.join(', ')}
            onChangeText={v => {
              const keywords = v.split(',').map(k => k.trim());
              setConfig(p => ({
                ...p, humanTakeoverKeywords: keywords
              }));
            }}
            placeholder="e.g., speak to human, agent, refund"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {/* WORKING HOURS */}
        <View style={[styles.section, themeStyles.cardBg]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={[styles.sectionTitle, themeStyles.textColor]}>Restrict to Working Hours</Text>
              <Text style={[styles.sectionSub, themeStyles.subTextColor]}>
                Only run the bot outside or during specific working hours.
              </Text>
            </View>
            <Switch
              value={config.workingHours?.enabled}
              onValueChange={v => setConfig(p => ({
                ...p,
                workingHours: {
                  ...(p.workingHours || {}),
                  enabled: v
                }
              }))}
              trackColor={{
                false: '#ddd',
                true: '#c3d7ff'
              }}
              thumbColor={config.workingHours?.enabled ? colors.primary : '#fff'}
            />
          </View>
          
          {config.workingHours?.enabled && (
            <View style={{ marginTop: 16 }}>
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, themeStyles.textColor]}>Start Time</Text>
                  <TextInput
                    style={[styles.input, themeStyles.inputBg]}
                    value={config.workingHours?.start}
                    onChangeText={v => setConfig(p => ({
                      ...p,
                      workingHours: {
                        ...(p.workingHours || {}),
                        start: v
                      }
                    }))}
                    placeholder="09:00"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, themeStyles.textColor]}>End Time</Text>
                  <TextInput
                    style={[styles.input, themeStyles.inputBg]}
                    value={config.workingHours?.end}
                    onChangeText={v => setConfig(p => ({
                      ...p,
                      workingHours: {
                        ...(p.workingHours || {}),
                        end: v
                      }
                    }))}
                    placeholder="18:00"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>

              <Text style={[styles.inputLabel, themeStyles.textColor]}>Offline Message</Text>
              <TextInput
                style={[styles.input, styles.textarea, themeStyles.inputBg]}
                value={config.offlineMessage}
                onChangeText={v => setConfig(p => ({
                  ...p, offlineMessage: v
                }))}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                placeholder="We are currently offline. Please leave a message."
                placeholderTextColor={colors.textMuted}
              />
            </View>
          )}
        </View>

        {/* AUTO TAKEOVER */}
        <View style={[styles.section, themeStyles.cardBg]}>
          <Text style={[styles.sectionTitle, themeStyles.textColor]}>Auto Handover to Seller</Text>
          <Text style={[styles.sectionSub, themeStyles.subTextColor]}>
            After how many buyer messages should the bot automatically hand over to you?
          </Text>
          <TextInput
            style={[styles.input, themeStyles.inputBg]}
            value={config.autoTakeoverAfter?.toString()}
            onChangeText={v => setConfig(p => ({
              ...p, autoTakeoverAfter: Number(v) || 10
            }))}
            keyboardType="number-pad"
          />
        </View>

        {/* HOW IT WORKS */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 How AI Bot Works</Text>
          <Text style={styles.infoItem}>🤖 Bot auto-replies to buyers 24/7</Text>
          <Text style={styles.infoItem}>📦 Knows your product details</Text>
          <Text style={styles.infoItem}>
            🔄 Hands over to seller after {config.autoTakeoverAfter || 10} messages or takeover keywords
          </Text>
          <Text style={styles.infoItem}>👨‍💼 You can take over the chat anytime by replying</Text>
          <Text style={styles.infoItem}>🌍 Replies in the buyer's language automatically</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 12
  },
  retryText: {
    color: '#fff',
    fontWeight: '700'
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  save: {
    fontSize: 16,
    color: colors.accent,
    fontWeight: '800',
  },
  scroll: { padding: 16, paddingBottom: 40 },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    gap: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1
  },
  botIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botIcon: { fontSize: 24 },
  statusInfo: { flex: 1 },
  statusTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  statusSub: {
    fontSize: 12,
    marginTop: 2,
  },
  section: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 12,
    marginBottom: 10,
    lineHeight: 16
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  textarea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  textareaCustom: {
    height: 110,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  infoCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: 18,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
    gap: 8,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
  },
  infoItem: {
    fontSize: 13,
    color: '#1565c0',
    lineHeight: 20,
  },
})

