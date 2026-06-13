import { Alert } from 'react-native'
import i18n from '../i18n'

const originalAlert = Alert.alert
let alertListener = null

const translateString = (str) => {
  if (typeof str !== 'string') return str;
  const trimmed = str.trim();
  if (!trimmed) return str;
  const translated = i18n.t(trimmed);
  const startSpace = str.match(/^\s*/)[0];
  const endSpace = str.match(/\s*$/)[0];
  return startSpace + translated + endSpace;
};

export const setAlertListener = (listener) => {
  alertListener = listener
}

Alert.alert = (title, message, buttons, options) => {
  const translatedTitle = translateString(title);
  const translatedMessage = translateString(message);
  const translatedButtons = buttons?.map(btn => ({
    ...btn,
    text: translateString(btn.text)
  }));

  if (alertListener) {
    alertListener(translatedTitle, translatedMessage, translatedButtons, options)
  } else {
    originalAlert(translatedTitle, translatedMessage, translatedButtons, options)
  }
}
