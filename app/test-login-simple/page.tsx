"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function TestLoginSimple() {
  const router = useRouter()
  useEffect(() => { router.replace("/auth/login") }, [router])
  return null
}
