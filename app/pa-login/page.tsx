"use client"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { signIn } from "next-auth/react"

export default function PALogin() {
  const router = useRouter()
  useEffect(() => {
    const login = async () => {
      await signIn("credentials", { email: "pa@gov.in", password: "x", redirect: false })
      router.push("/pa/dashboard")
    }
    login()
  }, [router])
  return <div>Logging in as PA...</div>
}