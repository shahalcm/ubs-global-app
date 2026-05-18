import { View, ActivityIndicator } from 'react-native'

export default function Loader({ color = '#1a237e' }) {
  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <ActivityIndicator size="large" color={color} />
    </View>
  )
}
