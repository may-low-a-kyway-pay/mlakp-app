import { Platform } from 'react-native'

import { LoginScreen } from '@/src/modules/auth/screens/LoginScreen'
import { DownloadLandingScreen } from '@/src/modules/landing/screens/DownloadLandingScreen'

export default function IndexScreen() {
  if (Platform.OS === 'web') {
    return <DownloadLandingScreen />
  }

  return <LoginScreen />
}
