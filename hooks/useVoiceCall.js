import { useState, useEffect, useRef, useCallback } from 'react'
import { getSocket } from '../services/socketService'
import webrtcService from '../services/webrtcService'
import api from '../services/api'
import { Alert } from 'react-native'

export default function useVoiceCall(currentUser) {
  const [callId, setCallId] = useState(null)
  const [channelId, setChannelId] = useState(null)
  const [status, setStatus] = useState('idle') // idle, connecting, ringing, accepted, rejected, ended, missed
  const [isIncoming, setIsIncoming] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeaker, setIsSpeaker] = useState(false)
  const [duration, setDuration] = useState(0)
  const [otherUser, setOtherUser] = useState(null)

  const timerRef = useRef(null)
  const socketRef = useRef(null)
  const otherUserRef = useRef(null)
  const callIdRef = useRef(null)

  useEffect(() => {
    otherUserRef.current = otherUser
  }, [otherUser])

  useEffect(() => {
    callIdRef.current = callId
  }, [callId])

  // Reset local call state
  const resetCallState = useCallback(() => {
    console.log('[Mobile VoiceCallHook] Resetting call state')
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
    setOtherUser(null)
  }, [])

  // Call timer management
  useEffect(() => {
    if (status === 'accepted') {
      setDuration(0)
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1)
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

  // Socket signaling listener setup
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return
    socketRef.current = socket

    const initReceiverPeerConnection = async (sdpOffer) => {
      try {
        await webrtcService.setupLocalStream()
        webrtcService.createPeerConnection()

        webrtcService.onIceCandidateCallback = (candidate) => {
          if (otherUserRef.current) {
            socket.emit('ice-candidate', {
              callId: callIdRef.current,
              targetId: otherUserRef.current.id,
              candidate
            })
          }
        }

        const answer = await webrtcService.createAnswer(sdpOffer)
        if (otherUserRef.current) {
          socket.emit('answer', {
            callId: callIdRef.current,
            targetId: otherUserRef.current.id,
            answer
          })
        }
      } catch (error) {
        console.error('[Mobile VoiceCallHook] Receiver WebRTC setup failed:', error)
        handleEndCall()
      }
    }

    // 1. Incoming Call Event
    const handleIncomingCall = (data) => {
      console.log('[Mobile VoiceCallHook] Incoming Call:', data)
      if (status !== 'idle') {
        socket.emit('reject-call', {
          targetId: data.callerId,
          callId: data.callId,
          reason: 'busy'
        })
        return
      }

      setCallId(data.callId)
      setChannelId(data.channelId)
      setIsIncoming(true)
      setStatus('ringing')
      setOtherUser({
        id: data.callerId,
        name: data.callerName,
        avatar: data.callerAvatar,
        type: data.callerType
      })
    }
    socket.on('incoming-call', handleIncomingCall)
    socket.on('support-call:incoming', handleIncomingCall)

    // 2. Offer Event
    const handleOffer = async (data) => {
      console.log('[Mobile VoiceCallHook] Offer Received')
      await initReceiverPeerConnection(data.offer)
    }
    socket.on('offer', handleOffer)
    socket.on('support-call:offer', handleOffer)

    // 3. Answer Event
    const handleAnswer = async (data) => {
      console.log('[Mobile VoiceCallHook] Answer Received')
      try {
        await webrtcService.setAnswer(data.answer)
        setStatus('accepted')
      } catch (error) {
        console.error('[Mobile VoiceCallHook] Failed to set remote answer:', error)
        handleEndCall()
      }
    }
    socket.on('answer', handleAnswer)
    socket.on('support-call:answer', handleAnswer)

    // 4. ICE Candidate Event
    const handleIceCandidate = async (data) => {
      await webrtcService.addIceCandidate(data.candidate)
    }
    socket.on('ice-candidate', handleIceCandidate)
    socket.on('support-call:ice-candidate', handleIceCandidate)

    // 5. Call Accepted Event
    const handleCallAccepted = (data) => {
      console.log('[Mobile VoiceCallHook] Call Accepted by Peer')
      setStatus('accepted')
    }
    socket.on('accept-call', handleCallAccepted)
    socket.on('support-call:accepted', handleCallAccepted)

    // 6. Call Rejected Event
    const handleCallRejected = (data) => {
      console.log('[Mobile VoiceCallHook] Call Rejected:', data)
      setStatus('rejected')
      Alert.alert('Call Declined', data.message || 'Call was declined.')
      setTimeout(() => {
        resetCallState()
      }, 2000)
    }
    socket.on('call-rejected', handleCallRejected)
    socket.on('support-call:rejected', handleCallRejected)

    // 7. Call Timeout Event
    const handleCallTimeout = () => {
      console.log('[Mobile VoiceCallHook] Ringing Timed Out')
      setStatus('missed')
      Alert.alert('No Answer', 'Call was not answered.')
      setTimeout(() => {
        resetCallState()
      }, 2000)
    }
    socket.on('call-timeout', handleCallTimeout)
    socket.on('support-call:timeout', handleCallTimeout)

    // 8. Call Ended Event
    const handleCallEnded = () => {
      console.log('[Mobile VoiceCallHook] Call Ended by Remote Peer')
      setStatus('ended')
      setTimeout(() => {
        resetCallState()
      }, 1500)
    }
    socket.on('call-ended', handleCallEnded)
    socket.on('support-call:ended', handleCallEnded)

    return () => {
      socket.off('incoming-call', handleIncomingCall)
      socket.off('support-call:incoming', handleIncomingCall)
      socket.off('offer', handleOffer)
      socket.off('support-call:offer', handleOffer)
      socket.off('answer', handleAnswer)
      socket.off('support-call:answer', handleAnswer)
      socket.off('ice-candidate', handleIceCandidate)
      socket.off('support-call:ice-candidate', handleIceCandidate)
      socket.off('accept-call', handleCallAccepted)
      socket.off('support-call:accepted', handleCallAccepted)
      socket.off('call-rejected', handleCallRejected)
      socket.off('support-call:rejected', handleCallRejected)
      socket.off('call-timeout', handleCallTimeout)
      socket.off('support-call:timeout', handleCallTimeout)
      socket.off('call-ended', handleCallEnded)
      socket.off('support-call:ended', handleCallEnded)
    }
  }, [status, resetCallState, currentUser])

  // Initiate Outgoing Call (to user, seller, or support admin)
  const handleStartCall = async (receiverId, receiverName, receiverAvatar, receiverType = 'user') => {
    if (!socketRef.current) {
      Alert.alert('Connection Error', 'Socket is disconnected. Retrying...')
      return
    }

    try {
      setStatus('connecting')
      setOtherUser({
        id: receiverId,
        name: receiverName,
        avatar: receiverAvatar,
        type: receiverType
      })

      // 1. Create Call via API
      const res = await api.post('/calls/initiate', { receiverId, receiverType })
      if (!res.data || !res.data.success) {
        throw new Error(res.data?.message || 'Failed to initialize call')
      }

      const { call } = res.data
      setCallId(call._id)
      setChannelId(call.channelId)

      // 2. Setup WebRTC Peer Connection locally
      await webrtcService.setupLocalStream()
      webrtcService.createPeerConnection()

      webrtcService.onIceCandidateCallback = (candidate) => {
        socketRef.current.emit('ice-candidate', {
          callId: call._id,
          targetId: receiverId,
          candidate
        })
      }

      // 3. Emit signaling 'call-user' to recipient
      socketRef.current.emit('call-user', {
        receiverId,
        receiverType,
        callerId: currentUser._id,
        callerName: currentUser.name,
        callerAvatar: currentUser.avatar,
        channelId: call.channelId,
        callId: call._id
      })

      // 4. Generate Offer and Emit
      const offer = await webrtcService.createOffer()
      socketRef.current.emit('offer', {
        callId: call._id,
        targetId: receiverId,
        offer
      })

      setStatus('ringing')
    } catch (error) {
      console.error('[Mobile VoiceCallHook] Failed to initiate outgoing call:', error)
      Alert.alert('Call Failed', error.message || 'Error establishing connection')
      resetCallState()
    }
  }

  // Accept Incoming Call
  const handleAcceptCall = async () => {
    if (!otherUser || !callId) return
    try {
      await webrtcService.setupLocalStream()
      webrtcService.createPeerConnection()

      webrtcService.onIceCandidateCallback = (candidate) => {
        if (socketRef.current) {
          socketRef.current.emit('ice-candidate', {
            callId,
            targetId: otherUser.id,
            candidate
          })
        }
      }

      if (socketRef.current) {
        socketRef.current.emit('accept-call', {
          callId,
          targetId: otherUser.id
        })
      }

      setStatus('accepted')
    } catch (error) {
      console.error('[Mobile VoiceCallHook] Error accepting call:', error)
      handleEndCall()
    }
  }

  // Reject Incoming Call
  const handleRejectCall = () => {
    if (otherUser && callId && socketRef.current) {
      socketRef.current.emit('reject-call', {
        callId,
        targetId: otherUser.id,
        reason: 'rejected'
      })
    }
    resetCallState()
  }

  // End Active Call
  const handleEndCall = () => {
    if (otherUser && callId && socketRef.current) {
      socketRef.current.emit('end-call', {
        callId,
        targetId: otherUser.id,
        endedBy: 'user'
      })
    }
    setStatus('ended')
    setTimeout(() => {
      resetCallState()
    }, 1000)
  }

  // Toggle Mute
  const handleToggleMute = () => {
    const nextMuted = !isMuted
    setIsMuted(nextMuted)
    webrtcService.toggleMute(nextMuted)
  }

  // Toggle Speaker
  const handleToggleSpeaker = () => {
    const nextSpeaker = !isSpeaker
    setIsSpeaker(nextSpeaker)
    webrtcService.toggleSpeaker(nextSpeaker)
  }

  return {
    callId,
    channelId,
    status,
    isIncoming,
    isMuted,
    isSpeaker,
    duration,
    otherUser,
    startCall: handleStartCall,
    acceptCall: handleAcceptCall,
    rejectCall: handleRejectCall,
    endCall: handleEndCall,
    toggleMute: handleToggleMute,
    toggleSpeaker: handleToggleSpeaker
  }
}
