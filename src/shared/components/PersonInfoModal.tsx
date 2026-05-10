import { Ionicons } from '@expo/vector-icons'
import * as Clipboard from 'expo-clipboard'
import { useState } from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, shadows } from '@/src/shared/theme/colors'
import { typography } from '@/src/shared/theme/typography'

type PersonInfoModalProps = {
  name: string
  username?: string | null
  visible: boolean
  onClose: () => void
}

export function PersonInfoModal({ name, onClose, username, visible }: PersonInfoModalProps) {
  const [isCopied, setIsCopied] = useState(false)
  const displayUsername = username?.trim() ? `@${username.trim()}` : name
  const copyValue = username?.trim() || name

  async function copyUsername() {
    await Clipboard.setStringAsync(copyValue)
    setIsCopied(true)
  }

  function close() {
    setIsCopied(false)
    onClose()
  }

  return (
    <Modal animationType="fade" onRequestClose={close} transparent visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Person</Text>
            <Pressable onPress={close} style={styles.closeButton}>
              <Ionicons color={colors.textMuted} name="close" size={24} />
            </Pressable>
          </View>

          <View style={styles.identityBlock}>
            <Text style={styles.name}>{name}</Text>
            <Text selectable style={styles.username}>
              {displayUsername}
            </Text>
          </View>

          <Pressable onPress={copyUsername} style={styles.copyButton}>
            <Ionicons color={colors.white} name={isCopied ? 'checkmark' : 'copy-outline'} size={20} />
            <Text style={styles.copyText}>{isCopied ? 'Copied' : 'Copy Username'}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    backgroundColor: colors.overlay,
    flex: 1,
    justifyContent: 'center',
    padding: 18,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    gap: 18,
    maxWidth: 420,
    padding: 20,
    width: '100%',
    ...shadows.floating,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.text,
    fontFamily: typography.familyBold,
    fontSize: typography.size.title,
    fontWeight: typography.weight.bold,
  },
  closeButton: {
    alignItems: 'center',
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  identityBlock: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.surfaceVariant,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
    padding: 16,
  },
  name: {
    color: colors.text,
    fontFamily: typography.familyBold,
    fontSize: typography.size.titleSmall,
    fontWeight: typography.weight.semibold,
  },
  username: {
    color: colors.textMuted,
    fontFamily: typography.family,
    fontSize: typography.size.body,
  },
  copyButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 24,
    flexDirection: 'row',
    gap: 8,
    height: 52,
    justifyContent: 'center',
  },
  copyText: {
    color: colors.white,
    fontFamily: typography.familyBold,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },
})
