import { Stack, Redirect } from 'expo-router'
import { useAuth } from '../../context/AuthContext'

export default function BuyerLayout() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return null
  if (!isAuthenticated) return <Redirect href="/login" />

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  )
}
