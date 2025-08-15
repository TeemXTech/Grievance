import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export const authOptions = {
  session: { strategy: "jwt" as const },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log('🔓 BYPASS: Login attempt bypassed for any credentials')
        
        const email = credentials?.email || 'admin@bypass.com'
        let role = 'ADMIN'
        let name = 'Admin User'
        
        // Determine role based on email
        if (email.includes('minister')) {
          role = 'MINISTER'
          name = 'Minister User'
        } else if (email.includes('pa')) {
          role = 'PA'
          name = 'PA User'
        } else if (email.includes('back')) {
          role = 'BACK_OFFICER'
          name = 'Back Officer User'
        } else if (email.includes('field')) {
          role = 'FIELD_OFFICER'
          name = 'Field Officer User'
        }
        
        return { 
          id: '1', 
          name: name, 
          email: email, 
          role: role 
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }: any) {
      if (session?.user) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }