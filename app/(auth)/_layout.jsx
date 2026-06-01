import { Redirect, useSegments, Stack } from 'expo-router'
import { useAuth } from '../../context/AuthContext'

export default function AuthLayout() {
  const { isAuthenticated, user, loading } = useAuth()
  console.log("AuthLayout Rendered, loading:", loading, "isAuthenticated:", isAuthenticated)
  const segments = useSegments()

  if (loading) return null

  if (
    isAuthenticated && 
    segments[segments.length - 1] !== 'role-select' && 
    segments[segments.length - 1] !== 'language'
  ) {
    if (user?.role === 'seller') {
      return <Redirect href="/(seller)/dashboard" />
    }
    return <Redirect href="/(buyer)/home" />
  }

  return (
    <Stack screenOptions={{ headerShown: false }} />
  )
}
