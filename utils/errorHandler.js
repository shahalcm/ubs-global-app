import { Alert } from 'react-native'

export const handleError = (error, defaultMsg) => {
  const message = error.response?.data?.message
    || defaultMsg
    || 'Something went wrong'
  Alert.alert('Error', message)
}
