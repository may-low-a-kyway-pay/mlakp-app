import { colors } from '@/src/shared/theme/colors'

export const settingsItems = [
  {
    bg: colors.primaryBright,
    color: colors.white,
    icon: 'person-outline' as const,
    label: 'Profile Information',
    sublabel: 'Update your username and details',
    action: 'profile' as const,
  },
  {
    bg: colors.successSoft,
    color: colors.success,
    icon: 'lock-closed-outline' as const,
    label: 'Security',
    sublabel: 'Change password and auth methods',
    action: null,
  },
  {
    bg: colors.tertiary,
    color: colors.tertiarySoft,
    icon: 'globe-outline' as const,
    label: 'Language',
    sublabel: 'English (US)',
    action: null,
  },
]
