import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { connectSocket, disconnectSocket } from
  '../services/socketService'

console.log("AuthContext module evaluated!");
const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  console.log("AuthProvider rendered!");

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
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
      console.log('Load user error:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (userData, userToken) => {
    await AsyncStorage.setItem('token', userToken)
    await AsyncStorage.setItem(
      'user',
      JSON.stringify(userData)
    )
    await AsyncStorage.setItem('userId', userData._id)
    setUser(userData)
    setToken(userToken)
    setIsAuthenticated(true)
    await connectSocket()
  }

  const logout = async () => {
    await AsyncStorage.multiRemove([
      'token', 'user', 'userId'
    ])
    setUser(null)
    setToken(null)
    setIsAuthenticated(false)
    disconnectSocket()
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
