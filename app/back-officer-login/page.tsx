"use client"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { signIn } from "next-auth/react"

export default function BackOfficerLogin() {
  const router = useRouter()
  useEffect(() => {
    const login = async () => {
      await signIn("credentials", { email: "back@gov.in", password: "x", redirect: false })
      router.push("/back-officer/dashboard")
    }
    login()
  }, [router])
  return <div>Logging in as Back Officer...</div>
}