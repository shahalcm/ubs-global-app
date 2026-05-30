import { Alert } from 'react-native'

const originalAlert = Alert.alert
let alertListener = null

export const setAlertListener = (listener) => {
  alertListener = listener
}

Alert.alert = (title, message, buttons, options) => {
  if (alertListener) {
    alertListener(title, message, buttons, options)
  } else {
    originalAlert(title, message, buttons, options)
  }
}
