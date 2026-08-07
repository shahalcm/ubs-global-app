import React from 'react'
import { Text } from 'react-native'
import { useCurrency } from '../../context/CurrencyContext'

export default function FormattedPrice({ amount, style, targetCurrency, showOriginal = false }) {
  const { formatPrice } = useCurrency()

  const formatted = formatPrice(amount, targetCurrency)

  return (
    <Text style={style}>
      {formatted}
    </Text>
  )
}
