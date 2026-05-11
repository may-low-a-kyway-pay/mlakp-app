export const lightColors = {
  background: '#fbfcff',
  surface: '#ffffff',
  surfaceMuted: '#f1f3f7',
  surfaceVariant: '#e6e8ee',
  outline: '#c8ccd8',
  outlineStrong: '#717683',
  text: '#17181c',
  textMuted: '#4f535d',
  textSoft: '#8d929d',
  primary: '#0052d4',
  primaryBright: '#0052d4',
  primarySoft: '#dce8ff',
  success: '#28a745',
  successSoft: '#e7f7ec',
  danger: '#c62828',
  dangerSoft: '#fde7e7',
  tertiary: '#f2994a',
  tertiarySoft: '#fff0df',
  white: '#ffffff',
  overlay: 'rgba(23, 24, 28, 0.34)',
}

export const darkColors: AppColors = {
  background: '#0f1117',
  surface: '#181b24',
  surfaceMuted: '#222734',
  surfaceVariant: '#2c3240',
  outline: '#4b5364',
  outlineStrong: '#8b94a7',
  text: '#f5f7fb',
  textMuted: '#c2c8d4',
  textSoft: '#8b94a7',
  primary: '#6ea8ff',
  primaryBright: '#8bbaff',
  primarySoft: '#183459',
  success: '#4dd27f',
  successSoft: '#123725',
  danger: '#ff7a7a',
  dangerSoft: '#401d22',
  tertiary: '#ffb15f',
  tertiarySoft: '#3d2a16',
  white: '#ffffff',
  overlay: 'rgba(0, 0, 0, 0.62)',
}

export type AppColors = typeof lightColors

export const lightShadows = {
  card: {
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  floating: {
    shadowColor: '#0052d4',
    shadowOpacity: 0.24,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
}

export const darkShadows: AppShadows = {
  card: {
    shadowColor: '#000000',
    shadowOpacity: 0.32,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  floating: {
    shadowColor: '#000000',
    shadowOpacity: 0.42,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
}

export type AppShadows = typeof lightShadows

export type AppTheme = {
  colors: AppColors
  dark: boolean
  shadows: AppShadows
}

export const appThemes = {
  light: {
    colors: lightColors,
    dark: false,
    shadows: lightShadows,
  },
  dark: {
    colors: darkColors,
    dark: true,
    shadows: darkShadows,
  },
} satisfies Record<'light' | 'dark', AppTheme>

export const colors = lightColors
export const shadows = lightShadows
