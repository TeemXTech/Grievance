import { getServerSession } from "next-auth"
import { authOptions } from "../[...nextauth]/route"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    return NextResponse.json(session)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 })
  }
}