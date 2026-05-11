import { PropsWithChildren } from 'react'
import { KeyboardAvoidingView, KeyboardAvoidingViewProps, Platform, StyleProp, ViewStyle } from 'react-native'

type KeyboardAvoidingMode = 'resizing' | 'ios-only'

type KeyboardAvoidingContainerProps = PropsWithChildren<{
  mode?: KeyboardAvoidingMode
  style?: StyleProp<ViewStyle>
}>

function behaviorForMode(mode: KeyboardAvoidingMode): KeyboardAvoidingViewProps['behavior'] {
  if (Platform.OS === 'ios') {
    return 'padding'
  }

  return mode === 'resizing' ? 'height' : undefined
}

export function KeyboardAvoidingContainer({ children, mode = 'resizing', style }: KeyboardAvoidingContainerProps) {
  return (
    <KeyboardAvoidingView
      behavior={behaviorForMode(mode)}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      style={style}
    >
      {children}
    </KeyboardAvoidingView>
  )
}
