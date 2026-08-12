import { useState, useEffect, useRef, useCallback } from 'react'
import { getSocket } from '../services/socketService'
import webrtcService from '../services/webrtcService'
import api from '../services/api'
import { Alert } from 'react-native'

export default function useSupportCall(currentUser) {
  const [callId, setCallId] = useState(null)
  const [channelId, setChannelId] = useState(null)
  const [status, setStatus] = useState('idle') // idle, connecting, ringing, accepted, rejected, ended, missed
  const [isIncoming, setIsIncoming] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeaker, setIsSpeaker] = useState(false)
  const [duration, setDuration] = useState(0)
  
  const timerRef = useRef(null)
  const socketRef = useRef(null)
  const callIdRef = useRef(null)

  useEffect(() => {
    callIdRef.current = callId
  }, [callId])

  // Reset local call states
  const resetCallState = useCallback(() => {
    console.log('SupportCallHook: Resetting call state')
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    webrtcService.cleanUp()
    setCallId(null)
    setChannelId(null)
    setStatus('idle')
    setIsIncoming(false)
    setIsMuted(false)
    setIsSpeaker(false)
    setDuration(0)
  }, [])

  // Manage duration timer
  useEffect(() => {
    if (status === 'accepted') {
      setDuration(0)
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [status])

  // Bind socket signaling events
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return
    socketRef.current = socket

    // 1. Support call accepted by admin
    socket.on('support-call:accepted', async (data) => {
      console.log('SupportCallHook: Call accepted by admin socket:', data.receiverSocketId)
      setStatus('accepted')
    })

    // 2. Relay SDP Answer from admin
    socket.on('support-call:answer', async (data) => {
      console.log('SupportCallHook: Received SDP Answer from admin')
      try {
        await webrtcService.setAnswer(data.answer)
      } catch (err) {
        console.error('Failed to set remote description answer:', err)
        handleEndCall()
      }
    })

    // 3. ICE Candidate discovered by admin
    socket.on('support-call:ice-candidate', async (data) => {
      await webrtcService.addIceCandidate(data.candidate)
    })

    // 4. Call rejected by admin
    socket.on('support-call:rejected', (data) => {
      console.log('SupportCallHook: Call rejected by admin')
      setStatus('rejected')
      Alert.alert('Call Failed', data.message || 'Call rejected by support agent')
      setTimeout(() => {
        resetCallState()
      }, 2000)
    })

    // 5. Calling timeout (missed)
    socket.on('support-call:timeout', () => {
      console.log('SupportCallHook: Ringing timed out')
      setStatus('missed')
      Alert.alert('No Answer', 'Support call was not answered.')
      setTimeout(() => {
        resetCallState()
      }, 2000)
    })

    // 6. Active call ended by admin
    socket.on('support-call:ended', () => {
      console.log('SupportCallHook: Call ended by admin')
      setStatus('ended')
      Alert.alert('Call Ended', 'The support call has ended.')
      setTimeout(() => {
        resetCallState()
      }, 1500)
    })

    return () => {
      socket.off('support-call:accepted')
      socket.off('support-call:answer')
      socket.off('support-call:ice-candidate')
      socket.off('support-call:rejected')
      socket.off('support-call:timeout')
      socket.off('support-call:ended')
    }
  }, [status, resetCallState])

  // Outgoing Support Call Trigger
  const handleStartCall = async () => {
    if (!socketRef.current) {
      Alert.alert('Connection Error', 'Socket is disconnected. Please retry shortly.')
      return
    }

    try {
      setStatus('connecting')

      // 1. Create support call via API
      const res = await api.post('/support-calls')
      if (!res.data || !res.data.success) {
        throw new Error('Failed to initialize API')
      }

      const { call } = res.data
      setCallId(call._id)
      setChannelId(call.channelId)

      // 2. Setup local WebRTC media tracks & peer connection
      await webrtcService.setupLocalStream()
      webrtcService.createPeerConnection()

      // Bind candidate handler
      webrtcService.onIceCandidateCallback = (candidate) => {
        socketRef.current.emit('support-call:ice-candidate', {
          callId: call._id,
          candidate
        })
      }

      // Generate local SDP offer and emit
      const offer = await webrtcService.createOffer()
      socketRef.current.emit('support-call:offer', {
        callId: call._id,
        offer
      })

      setStatus('ringing')
    } catch (error) {
      console.error('Failed to initiate outgoing support call:', error)
      const errorMsg = error.response?.data?.message || error.message || 'Error establishing connection'
      Alert.alert('Call Failed', errorMsg)
      resetCallState()
    }
  }

  // End call
  const handleEndCall = async () => {
    const currentId = callIdRef.current
    if (!currentId) {
      resetCallState()
      return
    }

    try {
      if (status === 'connecting' || status === 'ringing') {
        // Cancel call
        await api.post(`/support-calls/${currentId}/cancel`)
      } else if (status === 'accepted') {
        // End call
        if (socketRef.current) {
          socketRef.current.emit('support-call:end', { callId: currentId })
        }
        await api.post(`/support-calls/${currentId}/end`, { endedBy: 'caller' })
      }
    } catch (error) {
      console.error('Error terminating call:', error)
    } finally {
      setStatus('ended')
      setTimeout(() => {
        resetCallState()
      }, 1000)
    }
  }

  // Toggle local mute
  const handleToggleMute = () => {
    const nextMuted = !isMuted
    setIsMuted(nextMuted)
    webrtcService.toggleMute(nextMuted)
  }

  // Toggle speakerphone routing
  const handleToggleSpeaker = () => {
    const nextSpeakerState = !isSpeaker
    setIsSpeaker(nextSpeakerState)
    webrtcService.toggleSpeaker(nextSpeakerState)
  }

  return {
    callId,
    channelId,
    status,
    isIncoming,
    isMuted,
    isSpeaker,
    duration,
    startCall: handleStartCall,
    endCall: handleEndCall,
    toggleMute: handleToggleMute,
    toggleSpeaker: handleToggleSpeaker
  }
}
