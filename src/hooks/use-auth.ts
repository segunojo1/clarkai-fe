// hooks/useAuth.js
import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

export const useAuth = (requireAuth = false) => {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    // Check if we have a backend token
    const token = Cookies.get('token')
    
    if (requireAuth && !token) {
      // Redirect to login if auth is required but no token
      router.push('/auth/login')
    } else if (!requireAuth && token) {
      // Redirect to home if already authenticated
      router.push('/home')
    }
  }, [status, session, requireAuth, router])

  return {
    session,
    status,
    isAuthenticated: !!Cookies.get('token'),
    isLoading: status === 'loading'
  }
}