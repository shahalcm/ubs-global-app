import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { connectSocket, disconnectSocket } from
  '../services/socketService'
import { auth } from '../services/firebase'
import {
  signInWithCredential,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { googleAuth } from '../services/authService'

console.log("AuthContext module evaluated!");
const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  console.log("AuthProvider rendered!");

  useEffect(() => {
    // 1. Initial load from AsyncStorage for instant loading
    const initializeSession = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token')
        const storedUser = await AsyncStorage.getItem('user')
        if (storedToken && storedUser) {
          setToken(storedToken)
          setUser(JSON.parse(storedUser))
          setIsAuthenticated(true)
          await connectSocket()
        }
      } catch (error) {
        console.error('AsyncStorage load user error:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeSession()

    // 2. Subscribe to Firebase Auth changes for Google users
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        const storedProvider = await AsyncStorage.getItem('authProvider')
        
        if (firebaseUser) {
          // If logged in via Google but local state is missing, sync it
          if (storedProvider === 'google') {
            const storedToken = await AsyncStorage.getItem('token')
            const storedUser = await AsyncStorage.getItem('user')
            
            if (!storedToken || !storedUser) {
              try {
                const backendData = {
                  googleId: firebaseUser.uid,
                  name: firebaseUser.displayName || 'Google User',
                  email: firebaseUser.email,
                  avatar: firebaseUser.photoURL,
                }
                const res = await googleAuth(backendData)
                if (res?.user && res?.token) {
                  await AsyncStorage.setItem('token', res.token)
                  await AsyncStorage.setItem('user', JSON.stringify(res.user))
                  await AsyncStorage.setItem('userId', res.user._id)
                  setUser(res.user)
                  setToken(res.token)
                  setIsAuthenticated(true)
                  await connectSocket()
                }
              } catch (error) {
                console.error('Firebase session restore sync error:', error)
              }
            }
          }
        } else {
          // If Firebase says no user, but we are supposed to be logged in via Google, log out!
          if (storedProvider === 'google') {
            setUser(null)
            setToken(null)
            setIsAuthenticated(false)
            await AsyncStorage.multiRemove(['token', 'user', 'userId', 'authProvider'])
            disconnectSocket()
          }
        }
      } catch (error) {
        console.error('onAuthStateChanged handler error:', error)
      }
    })

    return () => unsubscribe()
  }, [])

  const login = async (userData, userToken) => {
    await AsyncStorage.setItem('token', userToken)
    await AsyncStorage.setItem(
      'user',
      JSON.stringify(userData)
    )
    await AsyncStorage.setItem('userId', userData._id)
    await AsyncStorage.setItem('authProvider', 'phone')
    setUser(userData)
    setToken(userToken)
    setIsAuthenticated(true)
    await connectSocket()
  }

  const loginWithGoogle = async (idToken) => {
    setLoading(true)
    try {
      const credential = GoogleAuthProvider.credential(idToken)
      const userCredential = await signInWithCredential(auth, credential)
      const firebaseUser = userCredential.user

      // Sync with backend
      const backendData = {
        googleId: firebaseUser.uid,
        name: firebaseUser.displayName || 'Google User',
        email: firebaseUser.email,
        avatar: firebaseUser.photoURL,
      }

      try {
        const res = await googleAuth(backendData)
        if (res?.user && res?.token) {
          await AsyncStorage.setItem('token', res.token)
          await AsyncStorage.setItem('user', JSON.stringify(res.user))
          await AsyncStorage.setItem('userId', res.user._id)
          await AsyncStorage.setItem('authProvider', 'google')
          setUser(res.user)
          setToken(res.token)
          setIsAuthenticated(true)
          await connectSocket()
          return { success: true, user: res.user }
        } else {
          throw new Error('Backend failed to return user or token')
        }
      } catch (backendError) {
        console.warn('Backend sync failed, falling back to Firebase only session:', backendError)
        // Fallback session using Firebase details
        const fallbackUser = {
          _id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Google User',
          email: firebaseUser.email,
          avatar: firebaseUser.photoURL,
          role: 'buyer', // Default role
        }
        const fallbackToken = idToken

        await AsyncStorage.setItem('token', fallbackToken)
        await AsyncStorage.setItem('user', JSON.stringify(fallbackUser))
        await AsyncStorage.setItem('userId', fallbackUser._id)
        await AsyncStorage.setItem('authProvider', 'google')

        setUser(fallbackUser)
        setToken(fallbackToken)
        setIsAuthenticated(true)
        return { success: true, user: fallbackUser, isFallback: true }
      }
    } catch (error) {
      console.error('Google login credential signing error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      const storedProvider = await AsyncStorage.getItem('authProvider')
      if (storedProvider === 'google') {
        await signOut(auth)
      }
    } catch (error) {
      console.error('Firebase Auth signout error:', error)
    } finally {
      await AsyncStorage.multiRemove([
        'token', 'user', 'userId', 'authProvider'
      ])
      setUser(null)
      setToken(null)
      setIsAuthenticated(false)
      disconnectSocket()
      setLoading(false)
    }
  }

  const updateUser = async (updatedUser) => {
    await AsyncStorage.setItem(
      'user',
      JSON.stringify(updatedUser)
    )
    setUser(updatedUser)
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated,
      login,
      loginWithGoogle,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider. Is the component wrapped in AuthProvider?');
  }
  return context;
}
