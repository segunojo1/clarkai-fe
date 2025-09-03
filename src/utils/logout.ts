// utils/logout.ts
import { handleGoogleLogout } from './google'
import authService from '@/services/auth.service'

export const logout = async () => {
  try {
    // Call backend logout if needed
    await authService.logout()
    
    // Handle the frontend logout
    await handleGoogleLogout()
  } catch (error) {
    console.error('Logout error:', error)
    // Still clear frontend state even if backend logout fails
    await handleGoogleLogout()
  }
}