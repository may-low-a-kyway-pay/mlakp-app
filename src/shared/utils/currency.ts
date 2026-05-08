function requiredCurrencyEnv(name: string, value: string | undefined) {
  const trimmed = value?.trim()

  if (!trimmed) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return trimmed
}

export const appCurrency = {
  code: requiredCurrencyEnv('EXPO_PUBLIC_CURRENCY_CODE', process.env.EXPO_PUBLIC_CURRENCY_CODE).toUpperCase(),
  symbol: requiredCurrencyEnv('EXPO_PUBLIC_CURRENCY_SYMBOL', process.env.EXPO_PUBLIC_CURRENCY_SYMBOL),
}

export function formatMoneyLabel(amount: string, sign = '') {
  return `${sign}${appCurrency.symbol}${amount}`
}
