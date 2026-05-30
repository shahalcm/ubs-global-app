import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'

const { width } = Dimensions.get('window')

export default function VoiceCallScreen({
  otherUser,
  duration,
  isMuted,
  isSpeaker,
  onMuteToggle,
  onSpeakerToggle,
  onEnd
}) {
  const avatarUrl = otherUser?.avatar || 'https://via.placeholder.com/150'
  const name = otherUser?.name || 'UBS User'

  const formatDuration = (sec) => {
    const hours = Math.floor(sec / 3600)
    const minutes = Math.floor((sec % 3600) / 60)
    const seconds = sec % 60

    const pad = (num) => String(num).padStart(2, '0')

    if (hours > 0) {
      return `${hours}:${pad(minutes)}:${pad(seconds)}`
    }
    return `${pad(minutes)}:${pad(seconds)}`
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* Profile Section */}
      <View style={styles.profileContainer}>
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          {/* Subtle active speaking ring indicator */}
          <View style={styles.pulseRing} />
        </View>
        <Text style={styles.userName}>{name}</Text>
        <Text style={styles.timer}>{formatDuration(duration)}</Text>
      </View>

      {/* Control Actions Drawer */}
      <View style={styles.controlContainer}>
        {/* Mute Button */}
        <TouchableOpacity
          style={[styles.btnCircle, isMuted && styles.activeCircle]}
          onPress={onMuteToggle}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={isMuted ? 'microphone-off' : 'microphone'}
            size={28}
            color={isMuted ? '#ef4444' : '#fff'}
          />
          <Text style={styles.btnLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
        </TouchableOpacity>

        {/* Hang Up Button */}
        <TouchableOpacity
          style={[styles.btnCircle, styles.hangupCircle]}
          onPress={onEnd}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="phone-hangup" size={32} color="#fff" />
          <Text style={styles.btnLabel}>End</Text>
        </TouchableOpacity>

        {/* Speaker Button */}
        <TouchableOpacity
          style={[styles.btnCircle, isSpeaker && styles.activeCircle]}
          onPress={onSpeakerToggle}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={isSpeaker ? 'volume-high' : 'volume-medium'}
            size={28}
            color={isSpeaker ? '#38bdf8' : '#fff'}
          />
          <Text style={styles.btnLabel}>Speaker</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0f172a', // Sleek dark slate
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
    zIndex: 9999,
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  avatarWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: '#38bdf8',
    zIndex: 2,
  },
  pulseRing: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 2,
    borderColor: 'rgba(56, 189, 248, 0.4)',
    zIndex: 1,
  },
  userName: {
    color: '#f8fafc',
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 8,
  },
  timer: {
    color: '#38bdf8',
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'monospace', // Monospaced digits feel premium and stable
    letterSpacing: 1,
  },
  controlContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: width * 0.9,
    backgroundColor: 'rgba(30, 41, 59, 0.7)', // Translucent drawer layout
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 20,
  },
  btnCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(71, 85, 105, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeCircle: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
  },
  hangupCircle: {
    backgroundColor: '#ef4444',
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  btnLabel: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 4,
    position: 'absolute',
    bottom: -22,
    fontWeight: '500',
  }
})
