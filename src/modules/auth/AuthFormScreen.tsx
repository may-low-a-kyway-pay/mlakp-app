import { getAuthErrorMessage, login, register } from '@/src/modules/auth/authApi';
import { saveAuthSession } from '@/src/modules/auth/tokenStore';
import { Card } from '@/src/shared/components/Card';
import { Screen } from '@/src/shared/components/Screen';
import { colors, shadows } from '@/src/shared/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type AuthFormScreenProps = {
  mode: 'login' | 'register';
};

export function AuthFormScreen({ mode }: AuthFormScreenProps) {
  const isRegister = mode === 'register';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    setError(null);

    if (isRegister && !name.trim()) {
      setError('Name is required.');
      return;
    }

    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }

    if (!password) {
      setError('Password is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const authData = isRegister
        ? await register({ email: email.trim(), name: name.trim(), password })
        : await login({ email: email.trim(), password });

      await saveAuthSession(authData);
      router.replace('/dashboard');
    } catch (caughtError) {
      setError(getAuthErrorMessage(caughtError));
    } finally {
      setIsSubmitting(false);
    }
  }

  function navigateToOtherMode() {
    router.push(isRegister ? '/login' : '/register');
  }

  return (
    <Screen scroll={false} contentStyle={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
        <Card style={styles.card}>
          <View style={styles.iconMark}>
            <Ionicons color="#c9d4ff" name="wallet-outline" size={42} />
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
                  <Ionicons color={colors.outline} name="person-outline" size={26} />
                  <TextInput
                    autoCapitalize="words"
                    onChangeText={setName}
                    placeholder="Thomas"
                    placeholderTextColor={colors.outline}
                    style={styles.input}
                    value={name}
                  />
                </View>
              </View>
            ) : null}

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputShell}>
                <Ionicons color={colors.outline} name="mail-outline" size={26} />
                <TextInput
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onChangeText={setEmail}
                  placeholder="name@example.com"
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
                <Ionicons color={colors.outline} name="lock-closed-outline" size={26} />
                <TextInput
                  onChangeText={setPassword}
                  placeholder="........"
                  placeholderTextColor={colors.outline}
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  value={password}
                />
                <Pressable onPress={() => setShowPassword((current) => !current)}>
                  <Ionicons color={colors.outline} name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={26} />
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
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.primaryText}>{isRegister ? 'Register' : 'Login'}</Text>
              )}
              {!isSubmitting ? <Ionicons color="#ffffff" name="arrow-forward" size={24} /> : null}
            </Pressable>
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>

          <Pressable onPress={navigateToOtherMode}>
            <Text style={styles.registerText}>
              {isRegister ? 'Already have an account? ' : 'Don&apos;t have an account? '}
              <Text style={styles.registerLink}>{isRegister ? 'Login here' : 'Register here'}</Text>
            </Text>
          </Pressable>
        </Card>

        <Text style={styles.terms}>
          By {isRegister ? 'registering' : 'logging in'}, you agree to our{' '}
          <Text style={styles.underline}>Terms of Service</Text> and{' '}
          <Text style={styles.underline}>Privacy Policy</Text>.
        </Text>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: 'center',
    padding: 18,
  },
  keyboard: {
    width: '100%',
  },
  card: {
    gap: 18,
    overflow: 'hidden',
    padding: 28,
  },
  iconMark: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.primaryBright,
    borderRadius: 18,
    height: 82,
    justifyContent: 'center',
    width: 82,
    ...shadows.card,
  },
  heading: {
    color: colors.text,
    fontSize: 40,
    fontWeight: '800',
    textAlign: 'center',
  },
  subheading: {
    color: colors.textMuted,
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
  },
  form: {
    gap: 18,
    marginTop: 10,
  },
  fieldGroup: {
    gap: 8,
  },
  passwordLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  linkText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  inputShell: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.outline,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    height: 58,
    paddingHorizontal: 18,
  },
  input: {
    color: colors.text,
    flex: 1,
    fontSize: 18,
  },
  errorText: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 28,
    flexDirection: 'row',
    gap: 10,
    height: 60,
    justifyContent: 'center',
    marginTop: 2,
    ...shadows.floating,
  },
  disabledButton: {
    opacity: 0.72,
  },
  primaryText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  dividerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 18,
    marginTop: 14,
  },
  divider: {
    backgroundColor: colors.surfaceVariant,
    flex: 1,
    height: 1,
  },
  dividerText: {
    color: colors.textSoft,
    fontSize: 14,
    fontWeight: '700',
  },
  registerText: {
    color: colors.textMuted,
    fontSize: 17,
    textAlign: 'center',
  },
  registerLink: {
    color: colors.primary,
    fontWeight: '700',
  },
  terms: {
    color: colors.textSoft,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 26,
    paddingHorizontal: 18,
    textAlign: 'center',
  },
  underline: {
    textDecorationLine: 'underline',
  },
});
