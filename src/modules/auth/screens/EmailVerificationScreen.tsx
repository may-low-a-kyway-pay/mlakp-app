import { getAuthErrorMessage, sendOTP, verifyEmail } from '@/src/modules/auth/api/authApi'
import { saveAuthSession } from '@/src/modules/auth/services/authSession'
import { getCurrentUser } from '@/src/modules/users/api/usersApi'
import { Card } from '@/src/shared/components/Card'
import { KeyboardAvoidingContainer } from '@/src/shared/components/KeyboardAvoidingContainer'
import { Screen } from '@/src/shared/components/Screen'
import { useAppTheme } from '@/src/shared/theme/ThemeContext'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { router, useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native'
import { createStyles } from '@/src/modules/auth/screens/AuthFormScreen.styles'

export function EmailVerificationScreen() {
  const theme = useAppTheme()
  const { colors } = theme
  const styles = useMemo(() => createStyles(theme), [theme])
  const params = useLocalSearchParams<{ email?: string; source?: string }>()
  const email = useMemo(() => String(params.email ?? '').trim(), [params.email])
  const hasRequestedInitialOTP = useRef(false)
  const [otp, setOtp] = useState('')
  const [error, setError] = useState<string | null>(email ? null : 'Email address is required.')
  const [message, setMessage] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  const requestOTP = useCallback(async () => {
    if (!email || isSending) {
      return
    }

    setError(null)
    setMessage(null)
    setIsSending(true)

    try {
      await sendOTP({ email, purpose: 'signup' })
      setMessage('Verification code sent to your email.')
    } catch (caughtError) {
      setError(getAuthErrorMessage(caughtError))
    } finally {
      setIsSending(false)
    }
  }, [email, isSending])

  useEffect(() => {
    if (!email || hasRequestedInitialOTP.current) {
      return
    }

    hasRequestedInitialOTP.current = true
    void requestOTP()
  }, [email, requestOTP])

  async function submit() {
    const trimmedOTP = otp.trim()
    if (!email) {
      setError('Email address is required.')
      return
    }
    if (!trimmedOTP) {
      setError('Verification code is required.')
      return
    }

    setError(null)
    setMessage(null)
    setIsVerifying(true)

    try {
      const tokenData = await verifyEmail({ email, otp: trimmedOTP, purpose: 'signup' })
      const user = await getCurrentUser(tokenData.access_token)
      await saveAuthSession({ ...tokenData, user })
      router.replace('/dashboard')
    } catch (caughtError) {
      setError(getAuthErrorMessage(caughtError))
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <Screen contentStyle={styles.screen}>
      <KeyboardAvoidingContainer mode="ios-only" style={styles.keyboard}>
        <Card style={styles.card}>
          <View style={styles.iconMark}>
            <Image
              contentFit="contain"
              source={require('../../../../assets/images/logo.png')}
              style={styles.logoImage}
            />
          </View>
          <Text style={styles.heading}>Verify Email</Text>
          <Text style={styles.subheading}>Enter the 6-digit code sent to {email || 'your email'}.</Text>

          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Verification Code</Text>
              <View style={styles.inputShell}>
                <Ionicons color={colors.outline} name="keypad-outline" size={24} />
                <TextInput
                  autoComplete="one-time-code"
                  autoCorrect={false}
                  inputMode="numeric"
                  keyboardType="number-pad"
                  maxLength={6}
                  onChangeText={setOtp}
                  placeholder="123456"
                  placeholderTextColor={colors.outline}
                  returnKeyType="done"
                  style={styles.input}
                  value={otp}
                />
              </View>
            </View>

            {message ? <Text style={styles.successText}>{message}</Text> : null}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: isVerifying || !email }}
              disabled={isVerifying || !email}
              onPress={submit}
              style={[styles.primaryButton, (isVerifying || !email) && styles.disabledButton]}
            >
              {isVerifying ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.primaryText}>Verify</Text>
              )}
              {!isVerifying ? <Ionicons color={colors.white} name="checkmark" size={24} /> : null}
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: isSending || !email }}
              disabled={isSending || !email}
              onPress={requestOTP}
              style={styles.secondaryAction}
            >
              <Text style={styles.registerText}>
                {isSending ? 'Sending code...' : 'Need a new code? '}
                {!isSending ? <Text style={styles.registerLink}>Resend OTP</Text> : null}
              </Text>
            </Pressable>
          </View>
        </Card>
      </KeyboardAvoidingContainer>
    </Screen>
  )
}
