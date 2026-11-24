import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-middleware"

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    
    // Process guest data
    const guests = []
    for (let i = 1; i <= 5; i++) {
      if (data[`guest${i}Name`]) {
        guests.push({
          name: data[`guest${i}Name`],
          mobile: data[`guest${i}Mobile`],
          aadhar: data[`guest${i}Aadhar`],
          age: data[`guest${i}Age`],
          address: data[`guest${i}Address`],
          village: data[`guest${i}Village`],
          mandal: data[`guest${i}Mandal`],
          district: data[`guest${i}District`]
        })
      }
    }

    const ttdRequest = await prisma.tTDRequest.create({
      data: {
        darshanDate: new Date(data.darshanDate),
        darshanType: data.darshanType,
        accommodationFrom: data.accommodationFrom ? new Date(data.accommodationFrom) : null,
        accommodationTo: data.accommodationTo ? new Date(data.accommodationTo) : null,
        guests: guests,
        referenceName: data.referenceName,
        referenceNumber: data.referenceNumber,
        referenceVillage: data.referenceVillage,
        referenceMandal: data.referenceMandal,
        createdBy: user.id
      }
    })

    return NextResponse.json(ttdRequest, { status: 201 })
  } catch (error) {
    console.error("Error creating TTD request:", error)
    return NextResponse.json(
      { error: "Failed to create TTD request" },
      { status: 500 }
    )
  }
}
