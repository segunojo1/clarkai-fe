import type { DefaultSession } from 'next-auth'
import { getServerSession, Session } from 'next-auth'
import { JWT } from 'next-auth/jwt'

export const session = async ({ session, token }: { session: Session; token: JWT }) => {
  // Safely assign id if present on the token
  if (session.user && token.id) {
    ;(session.user as any).id = token.id
  }
  return session
}

export const getUserSession = async (): Promise<DefaultSession['user'] | null> => {
  const authUserSession = await getServerSession({
    callbacks: {
      session,
    },
  })
  return authUserSession?.user || null
}