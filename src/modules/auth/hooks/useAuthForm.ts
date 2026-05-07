import { useState } from 'react'
import { router } from 'expo-router'
import { getAuthErrorMessage, login, register } from '@/src/modules/auth/api/authApi'
import { saveAuthSession } from '@/src/modules/auth/services/authSession'

type AuthMode = 'login' | 'register'

export function useAuthForm(mode: AuthMode) {
  const isRegister = mode === 'register'
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function submit() {
    setError(null)

    if (isRegister && !name.trim()) {
      setError('Name is required.')
      return
    }

    if (isRegister && !username.trim()) {
      setError('Username is required.')
      return
    }

    if (!email.trim()) {
      setError('Email address is required.')
      return
    }

    if (!password) {
      setError('Password is required.')
      return
    }

    setIsSubmitting(true)
    try {
      const authData = isRegister
        ? await register({ email: email.trim(), name: name.trim(), password, username: username.trim() })
        : await login({ email: email.trim(), password })

      await saveAuthSession(authData)
      router.replace('/dashboard')
    } catch (caughtError) {
      setError(getAuthErrorMessage(caughtError))
    } finally {
      setIsSubmitting(false)
    }
  }

  function navigateToOtherMode() {
    router.push(isRegister ? '/login' : '/register')
  }

  return {
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
  }
}
