import { colors } from '@/src/shared/theme/colors'

const avatarPalette = [
  { bg: colors.tertiarySoft, tone: colors.tertiary },
  { bg: colors.primarySoft, tone: colors.primary },
  { bg: colors.dangerSoft, tone: colors.danger },
  { bg: colors.surfaceVariant, tone: colors.textMuted },
]

export function initialsForName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const initials = parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  return initials || '?'
}

export function avatarToneForIndex(index: number) {
  return avatarPalette[index % avatarPalette.length]
}
