import { getAuthErrorMessage, resetPassword, sendAccountPasswordOTP, sendOTP } from '@/src/modules/auth/api/authApi'
import { clearAuthSession, getAuthSession } from '@/src/modules/auth/services/authSession'
import { Card } from '@/src/shared/components/Card'
import { KeyboardAvoidingContainer } from '@/src/shared/components/KeyboardAvoidingContainer'
import { Screen } from '@/src/shared/components/Screen'
import { useAppTheme } from '@/src/shared/theme/ThemeContext'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native'
import { createStyles } from '@/src/modules/auth/screens/AuthFormScreen.styles'

type ResetMode = 'forgot' | 'account'

export function PasswordResetScreen() {
  const theme = useAppTheme()
  const { colors } = theme
  const styles = createStyles(theme)
  const params = useLocalSearchParams<{ email?: string; mode?: ResetMode }>()
  const mode: ResetMode = params.mode === 'account' ? 'account' : 'forgot'
  const initialEmail = useMemo(() => String(params.email ?? '').trim(), [params.email])
  const [email, setEmail] = useState(initialEmail)
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (mode !== 'account') {
      return
    }

    void loadAccountEmail()
  }, [mode])

  async function loadAccountEmail() {
    setError(null)

    try {
      const session = await getAuthSession()
      if (!session) {
        router.replace('/login')
        return
      }

      setEmail(session.user.email)
    } catch (caughtError) {
      setError(getAuthErrorMessage(caughtError))
    }
  }

  async function requestOTP() {
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setError('Email address is required.')
      return
    }

    setError(null)
    setMessage(null)
    setIsSending(true)

    try {
      if (mode === 'account') {
        await sendAccountPasswordOTP()
      } else {
        await sendOTP({ email: trimmedEmail, purpose: 'password_reset' })
      }
      setMessage('Password reset code sent to your email.')
    } catch (caughtError) {
      setError(getAuthErrorMessage(caughtError))
    } finally {
      setIsSending(false)
    }
  }

  async function submit() {
    const trimmedEmail = email.trim()
    const trimmedOTP = otp.trim()

    if (!trimmedEmail) {
      setError('Email address is required.')
      return
    }
    if (!trimmedOTP) {
      setError('OTP code is required.')
      return
    }
    if (!newPassword) {
      setError('New password is required.')
      return
    }

    setError(null)
    setMessage(null)
    setIsSubmitting(true)

    try {
      await resetPassword({ email: trimmedEmail, otp: trimmedOTP, new_password: newPassword })
      await clearAuthSession()
      router.replace('/login')
    } catch (caughtError) {
      setError(getAuthErrorMessage(caughtError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Screen contentStyle={styles.screen}>
      <KeyboardAvoidingContainer mode="ios-only" style={styles.keyboard}>
        <Card style={styles.card}>
          <View style={styles.iconMark}>
            <Ionicons color={colors.primarySoft} name="lock-open-outline" size={32} />
          </View>
          <Text style={styles.heading}>{mode === 'account' ? 'Change Password' : 'Reset Password'}</Text>
          <Text style={styles.subheading}>
            {mode === 'account'
              ? 'Use the OTP sent to your account email to set a new password.'
              : 'Request an OTP, then set a new password for your account.'}
          </Text>

          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputShell}>
                <Ionicons color={colors.outline} name="mail-outline" size={24} />
                <TextInput
                  autoCapitalize="none"
                  editable={mode !== 'account'}
                  keyboardType="email-address"
                  onChangeText={setEmail}
                  placeholder="Email address"
                  placeholderTextColor={colors.outline}
                  style={styles.input}
                  value={email}
                />
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              disabled={isSending}
              onPress={requestOTP}
              style={[styles.primaryButton, isSending && styles.disabledButton]}
            >
              {isSending ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.primaryText}>Send OTP</Text>
              )}
              {!isSending ? <Ionicons color={colors.white} name="mail-outline" size={24} /> : null}
            </Pressable>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>OTP Code</Text>
              <View style={styles.inputShell}>
                <Ionicons color={colors.outline} name="keypad-outline" size={24} />
                <TextInput
                  keyboardType="number-pad"
                  maxLength={6}
                  onChangeText={setOtp}
                  placeholder="123456"
                  placeholderTextColor={colors.outline}
                  style={styles.input}
                  value={otp}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.inputShell}>
                <Ionicons color={colors.outline} name="lock-closed-outline" size={24} />
                <TextInput
                  onChangeText={setNewPassword}
                  placeholder="New password"
                  placeholderTextColor={colors.outline}
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  value={newPassword}
                />
                <Pressable
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  accessibilityRole="button"
                  onPress={() => setShowPassword((current) => !current)}
                  style={styles.passwordIconButton}
                >
                  <Ionicons color={colors.outline} name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={24} />
                </Pressable>
              </View>
            </View>

            {message ? <Text style={styles.successText}>{message}</Text> : null}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              disabled={isSubmitting}
              onPress={submit}
              style={[styles.primaryButton, isSubmitting && styles.disabledButton]}
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.primaryText}>Save Password</Text>
              )}
              {!isSubmitting ? <Ionicons color={colors.white} name="checkmark" size={24} /> : null}
            </Pressable>
          </View>
        </Card>
      </KeyboardAvoidingContainer>
    </Screen>
  )
}
