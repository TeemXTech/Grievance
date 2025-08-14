import { useSession, signIn, signOut } from 'next-auth/react'
import { Role } from '@prisma/client'

type User = {
  id: string
  email: string
  name: string
  role: Role
}

export function useAuth() {
  const { data: session, status } = useSession()
  
  const login = async (email: string, password: string) => {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      throw new Error('Login failed')
    }
  }

  const logout = async () => {
    await signOut({ redirect: false })
  }

  return {
    user: session?.user as User | null,
    loading: status === 'loading',
    login,
    logout,
    checkAuth: () => Promise.resolve(), // No longer needed with NextAuth
  }
}

// Keep AuthProvider for backward compatibility but it's no longer needed
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
