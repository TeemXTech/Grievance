import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json([
    {
      id: "1",
      from: "+919876543210",
      message: "Road repair needed on Main Street",
      timestamp: new Date().toISOString(),
      status: "pending",
      parsed: false,
    },
  ])
}


