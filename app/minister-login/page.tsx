"use client"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { signIn } from "next-auth/react"

export default function MinisterLogin() {
  const router = useRouter()
  useEffect(() => {
    const login = async () => {
      await signIn("credentials", { email: "minister@gov.in", password: "x", redirect: false })
      router.push("/minister/dashboard")
    }
    login()
  }, [router])
  return <div>Logging in as Minister...</div>
}