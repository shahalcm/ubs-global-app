import React, { useState, useEffect } from 'react'
import {
  Modal, View, Text, StyleSheet,
  TouchableOpacity, Dimensions, Animated, Platform
} from 'react-native'
import { setAlertListener } from '../../utils/customAlert'

const { width } = Dimensions.get('window')

export default function CustomAlertContainer() {
  const [visible, setVisible] = useState(false)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [buttons, setButtons] = useState([])
  
  const [scaleAnim] = useState(new Animated.Value(0.9))
  const [fadeAnim] = useState(new Animated.Value(0))

  useEffect(() => {
    setAlertListener((t, m, b) => {
      setTitle(t || '')
      setMessage(m || '')
      
      // Default to standard OK button if none provided
      const defaultButtons = b && b.length > 0 ? b : [{ text: 'OK' }]
      setButtons(defaultButtons)
      setVisible(true)

      // Start fade/scale transition
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 50,
          useNativeDriver: true
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        })
      ]).start()
    })

    return () => {
      setAlertListener(null)
    }
  }, [])

  const handleButtonPress = (btnOnPress) => {
    // Animate out before running the callback
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 150,
        useNativeDriver: true
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true
      })
    ]).start(() => {
      setVisible(false)
      if (btnOnPress) {
        btnOnPress()
      }
    })
  }

  if (!visible) return null

  // Contextual indicator based on alert title/message
  const getAlertContext = () => {
    const textToCheck = `${title} ${message}`.toLowerCase()
    
    if (textToCheck.includes('success') || textToCheck.includes('listed') || textToCheck.includes('verified') || textToCheck.includes('placed')) {
      return { emoji: '🎉', color: '#22c55e', bg: '#f0fdf4' }
    }
    if (textToCheck.includes('error') || textToCheck.includes('fail') || textToCheck.includes('limit') || textToCheck.includes('denied') || textToCheck.includes('cancel')) {
      return { emoji: '⚠️', color: '#ef4444', bg: '#fef2f2' }
    }
    if (textToCheck.includes('delete') || textToCheck.includes('remove') || textToCheck.includes('sold')) {
      return { emoji: '🗑️', color: '#f59e0b', bg: '#fffbeb' }
    }
    // Default info alert
    return { emoji: '💬', color: '#1a237e', bg: '#e8eaf6' }
  }

  const context = getAlertContext()

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={() => handleButtonPress()}
    >
      <View style={styles.backdrop}>
        {/* Backdrop overlay */}
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} />
        
        {/* Dialog container */}
        <Animated.View style={[
          styles.dialogContainer,
          { transform: [{ scale: scaleAnim }], opacity: fadeAnim }
        ]}>
          
          {/* Circular Emoji Header Indicator */}
          <View style={[styles.iconContainer, { backgroundColor: context.bg }]}>
            <Text style={styles.iconText}>{context.emoji}</Text>
          </View>

          {/* Title */}
          {title ? <Text style={styles.title}>{title}</Text> : null}
          
          {/* Message */}
          {message ? <Text style={styles.message}>{message}</Text> : null}
          
          {/* Actions Button Layout */}
          <View style={[
            styles.buttonsContainer,
            buttons.length > 2 ? styles.buttonsVertical : styles.buttonsHorizontal
          ]}>
            {buttons.map((btn, idx) => {
              const isDestructive = btn.style === 'destructive'
              const isCancel = btn.style === 'cancel'
              const isPrimary = !isCancel && (idx === buttons.length - 1 || buttons.length === 1)

              return (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.8}
                  style={[
                    styles.button,
                    buttons.length > 2 ? styles.buttonVertical : styles.buttonHorizontal,
                    isPrimary && styles.primaryButton,
                    isDestructive && styles.destructiveButton,
                    isCancel && styles.cancelButton,
                    (!isPrimary && !isDestructive && !isCancel) && styles.secondaryButton
                  ]}
                  onPress={() => handleButtonPress(btn.onPress)}
                >
                  <Text style={[
                    styles.buttonText,
                    isPrimary && styles.primaryButtonText,
                    isDestructive && styles.destructiveButtonText,
                    isCancel && styles.cancelButtonText,
                    (!isPrimary && !isDestructive && !isCancel) && styles.secondaryButtonText
                  ]}>
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </Animated.View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)'
  },
  dialogContainer: {
    width: Math.min(width * 0.85, 340),
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.12,
        shadowRadius: 20
      },
      android: {
        elevation: 8
      },
      web: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.12,
        shadowRadius: 20
      }
    })
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  iconText: {
    fontSize: 26
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24
  },
  message: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24
  },
  buttonsContainer: {
    width: '100%'
  },
  buttonsHorizontal: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10
  },
  buttonsVertical: {
    flexDirection: 'column',
    gap: 8
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 45
  },
  buttonHorizontal: {
    flex: 1
  },
  buttonVertical: {
    width: '100%'
  },
  primaryButton: {
    backgroundColor: '#1a237e'
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700'
  },
  destructiveButton: {
    backgroundColor: '#fee2e2'
  },
  destructiveButtonText: {
    color: '#ef4444',
    fontWeight: '700'
  },
  cancelButton: {
    backgroundColor: '#f1f5f9'
  },
  cancelButtonText: {
    color: '#64748b',
    fontWeight: '600'
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0'
  },
  secondaryButtonText: {
    color: '#1a237e',
    fontWeight: '600'
  },
  buttonText: {
    fontSize: 14
  }
})
