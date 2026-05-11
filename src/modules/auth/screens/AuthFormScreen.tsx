import { useAuthForm } from '@/src/modules/auth/hooks/useAuthForm'
import { Card } from '@/src/shared/components/Card'
import { KeyboardAvoidingContainer } from '@/src/shared/components/KeyboardAvoidingContainer'
import { Screen } from '@/src/shared/components/Screen'
import { colors } from '@/src/shared/theme/colors'
import { Ionicons } from '@expo/vector-icons'
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native'
import { styles } from '@/src/modules/auth/screens/AuthFormScreen.styles'

type AuthFormScreenProps = {
  mode: 'login' | 'register'
}

export function AuthFormScreen({ mode }: AuthFormScreenProps) {
  const {
    email,
    error,
    isRegister,
    isSubmitting,
    name,
    navigateToOtherMode,
    password,
    setEmail,
    setName,
    setPassword,
    setShowPassword,
    setUsername,
    showPassword,
    submit,
    username,
  } = useAuthForm(mode)

  return (
    <Screen contentStyle={styles.screen}>
      <KeyboardAvoidingContainer mode="ios-only" style={styles.keyboard}>
        <Card style={styles.card}>
          <View style={styles.iconMark}>
            <Ionicons color={colors.primarySoft} name="wallet-outline" size={32} />
          </View>
          <Text style={styles.heading}>{isRegister ? 'Create Account' : 'Welcome Back'}</Text>
          <Text style={styles.subheading}>
            {isRegister
              ? 'Start tracking shared expenses with your groups.'
              : 'Securely manage your financial journey.'}
          </Text>

          <View style={styles.form}>
            {isRegister ? (
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Name</Text>
                <View style={styles.inputShell}>
                  <Ionicons color={colors.outline} name="person-outline" size={24} />
                  <TextInput
                    autoCapitalize="words"
                    onChangeText={setName}
                    placeholder="Full name"
                    placeholderTextColor={colors.outline}
                    style={styles.input}
                    value={name}
                  />
                </View>
              </View>
            ) : null}

            {isRegister ? (
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Username</Text>
                <View style={styles.inputShell}>
                  <Ionicons color={colors.outline} name="at-outline" size={24} />
                  <TextInput
                    autoCapitalize="none"
                    onChangeText={setUsername}
                    placeholder="Username"
                    placeholderTextColor={colors.outline}
                    style={styles.input}
                    value={username}
                  />
                </View>
              </View>
            ) : null}

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputShell}>
                <Ionicons color={colors.outline} name="mail-outline" size={24} />
                <TextInput
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onChangeText={setEmail}
                  placeholder="Email address"
                  placeholderTextColor={colors.outline}
                  style={styles.input}
                  value={email}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.passwordLabelRow}>
                <Text style={styles.label}>Password</Text>
                {!isRegister ? (
                  <Pressable>
                    <Text style={styles.linkText}>Forgot password?</Text>
                  </Pressable>
                ) : null}
              </View>
              <View style={styles.inputShell}>
                <Ionicons color={colors.outline} name="lock-closed-outline" size={24} />
                <TextInput
                  onChangeText={setPassword}
                  placeholder="Password"
                  placeholderTextColor={colors.outline}
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  value={password}
                />
                <Pressable onPress={() => setShowPassword((current) => !current)}>
                  <Ionicons color={colors.outline} name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={24} />
                </Pressable>
              </View>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              disabled={isSubmitting}
              onPress={submit}
              style={[styles.primaryButton, isSubmitting && styles.disabledButton]}
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.primaryText}>{isRegister ? 'Register' : 'Login'}</Text>
              )}
              {!isSubmitting ? <Ionicons color={colors.white} name="arrow-forward" size={24} /> : null}
            </Pressable>
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>

          <Pressable onPress={navigateToOtherMode}>
            <Text style={styles.registerText}>
              {isRegister ? 'Already have an account? ' : "Don't have an account? "}
              <Text style={styles.registerLink}>{isRegister ? 'Login here' : 'Register here'}</Text>
            </Text>
          </Pressable>
        </Card>

        <Text style={styles.terms}>
          By {isRegister ? 'registering' : 'logging in'}, you agree to our{' '}
          <Text style={styles.underline}>Terms of Service</Text> and{' '}
          <Text style={styles.underline}>Privacy Policy</Text>.
        </Text>
      </KeyboardAvoidingContainer>
    </Screen>
  )
}
