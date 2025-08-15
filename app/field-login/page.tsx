"use client"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { signIn } from "next-auth/react"

export default function FieldLogin() {
  const router = useRouter()
  useEffect(() => {
    const login = async () => {
      await signIn("credentials", { email: "field@gov.in", password: "x", redirect: false })
      router.push("/field/dashboard")
    }
    login()
  }, [router])
  return <div>Logging in as Field Officer...</div>
}