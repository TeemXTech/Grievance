import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

const EIGHT_HOURS = 8 * 60 * 60 // seconds

export const authOptions = {
  session: { strategy: "jwt" as const, maxAge: EIGHT_HOURS },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        })

        if (!user) return null
        if (user.status === "inactive") return null

        const passwordValid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!passwordValid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone ?? "",
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.phone = user.phone
      }
      return token
    },
    async session({ session, token }: any) {
      if (session?.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.phone = token.phone
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
