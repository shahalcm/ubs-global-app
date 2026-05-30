import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  mediaDevices
} from 'react-native-webrtc'

const getIceServers = () => {
  const iceServers = [
    { urls: 'stun:stun.l.google.com:19302' }
  ]
  
  // Future-proofing TURN server integration for scaling
  // To override during production deployment, set client environment variables:
  // EXPO_PUBLIC_TURN_URL, EXPO_PUBLIC_TURN_USERNAME, EXPO_PUBLIC_TURN_PASSWORD
  if (process.env.EXPO_PUBLIC_TURN_URL) {
    iceServers.push({
      urls: process.env.EXPO_PUBLIC_TURN_URL,
      username: process.env.EXPO_PUBLIC_TURN_USERNAME,
      credential: process.env.EXPO_PUBLIC_TURN_PASSWORD
    })
  }
  return iceServers
}

class WebRTCManager {
  constructor() {
    this.peerConnection = null
    this.localStream = null
    this.remoteStream = null
    this.onIceCandidateCallback = null
    this.onTrackCallback = null
    this.onConnectionStateChangeCallback = null
  }

  // Setup user audio media track
  async setupLocalStream() {
    try {
      if (this.localStream) {
        return this.localStream
      }
      
      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: false
      })
      this.localStream = stream
      return stream
    } catch (error) {
      console.error('WebRTC Service: getUserMedia error:', error)
      throw error
    }
  }

  // Create peer connection and bind track events
  createPeerConnection() {
    const pcConfig = {
      iceServers: getIceServers()
    }
    
    this.peerConnection = new RTCPeerConnection(pcConfig)

    // Add local tracks to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection.addTrack(track, this.localStream)
      })
    } else {
      console.warn('WebRTC Service: Peer connection created without local stream')
    }

    // Listen for ICE candidate discoveries
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.onIceCandidateCallback) {
        this.onIceCandidateCallback(event.candidate)
      }
    }

    // Listen for incoming remote audio tracks
    this.peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0]
        if (this.onTrackCallback) {
          this.onTrackCallback(this.remoteStream)
        }
      }
    }

    // Track state of signaling connection
    this.peerConnection.onconnectionstatechange = () => {
      console.log('WebRTC Connection State changed to:', this.peerConnection?.connectionState)
      if (this.onConnectionStateChangeCallback && this.peerConnection) {
        this.onConnectionStateChangeCallback(this.peerConnection.connectionState)
      }
    }

    return this.peerConnection
  }

  // Generate SDP offer
  async createOffer() {
    try {
      if (!this.peerConnection) {
        throw new Error('PeerConnection is not initialized')
      }
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false
      })
      await this.peerConnection.setLocalDescription(offer)
      return offer
    } catch (error) {
      console.error('WebRTC Service: createOffer error:', error)
      throw error
    }
  }

  // Generate SDP answer responding to offer
  async createAnswer(remoteOffer) {
    try {
      if (!this.peerConnection) {
        throw new Error('PeerConnection is not initialized')
      }
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(remoteOffer))
      const answer = await this.peerConnection.createAnswer()
      await this.peerConnection.setLocalDescription(answer)
      return answer
    } catch (error) {
      console.error('WebRTC Service: createAnswer error:', error)
      throw error
    }
  }

  // Accept and set remote answer
  async setAnswer(remoteAnswer) {
    try {
      if (!this.peerConnection) {
        throw new Error('PeerConnection is not initialized')
      }
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(remoteAnswer))
    } catch (error) {
      console.error('WebRTC Service: setAnswer error:', error)
      throw error
    }
  }

  // Add remote candidate discovered on signaling channel
  async addIceCandidate(candidate) {
    try {
      if (this.peerConnection) {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
      }
    } catch (error) {
      console.error('WebRTC Service: addIceCandidate error:', error)
    }
  }

  // Toggle mic status
  toggleMute(isMuted) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = !isMuted
      })
    }
  }

  // Toggle audio speaker route
  toggleSpeaker(isSpeakerOn) {
    console.log(`WebRTC Service: Route audio stream to speaker: ${isSpeakerOn}`)
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        if (track._setVolume) {
          track._setVolume(isSpeakerOn ? 1.0 : 0.5)
        }
      })
    }
  }

  // Reset service and release hardware devices
  cleanUp() {
    console.log('WebRTC Service: Cleaning up resources')
    if (this.peerConnection) {
      this.peerConnection.close()
      this.peerConnection = null
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        track.stop()
      })
      this.localStream = null
    }

    this.remoteStream = null
    this.onIceCandidateCallback = null
    this.onTrackCallback = null
    this.onConnectionStateChangeCallback = null
  }
}

export default new WebRTCManager()
