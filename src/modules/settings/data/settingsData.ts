import { AppColors } from '@/src/shared/theme/colors'

export function getSettingsItems(colors: AppColors) {
  return [
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
      action: 'security' as const,
    },
  ]
}
