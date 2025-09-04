import { DefaultSession, DefaultUser } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: (DefaultSession['user'] & {
      id: string
      backendAccessToken?: string
      googleIdToken?: string
      isOnboardingNeeded?: boolean
    })
  }

  interface User extends DefaultUser {
    id: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    backendAccessToken?: string
    user?: unknown
    isOnboardingNeeded?: boolean
  }
}
