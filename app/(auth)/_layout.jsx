import { Redirect, useSegments, Stack } from 'expo-router'
import { useAuth } from '../../context/AuthContext'

export default function AuthLayout() {
  const { isAuthenticated, user, loading } = useAuth()
  console.log("AuthLayout Rendered, loading:", loading, "isAuthenticated:", isAuthenticated, "userRole:", user?.role)
  const segments = useSegments()

  if (loading) return null

  const currentSegment = segments[segments.length - 1]

  if (isAuthenticated) {
    if (!user?.role) {
      // Force user to choose a role if they don't have one
      if (currentSegment !== 'role-select' && currentSegment !== 'language') {
        return <Redirect href="/(auth)/role-select" />
      }
    } else {
      // If they already have a role, they shouldn't be in auth screens (except language or if they are in role-select)
      if (currentSegment !== 'role-select' && currentSegment !== 'language') {
        if (user.role === 'seller') {
          return <Redirect href="/(seller)/dashboard" />
        }
        return <Redirect href="/(buyer)/home" />
      }
    }
  }

  return (
    <Stack screenOptions={{ headerShown: false }} />
  )
}
