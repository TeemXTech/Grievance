import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const district = searchParams.get("district") || "all"
    const mandal = searchParams.get("mandal") || "all"
    const view = searchParams.get("view") || "state"

    if (view === "state") {
      // Get district-level data
      const districts = await prisma.grievance.groupBy({
        by: ['district'],
        where: { district: { not: null } },
        _count: {
          id: true
        }
      })

      const projectsByDistrict = await prisma.governmentProject.groupBy({
        by: ['district'],
        where: { district: { not: null } },
        _count: {
          id: true
        }
      })

      const districtData = districts.map(d => {
        const projectCount = projectsByDistrict.find(p => p.district === d.district)?._count || 0
        return {
          name: d.district,
          grievances: d._count,
          projects: projectCount,
          mandals: Math.floor(Math.random() * 20) + 10, // Mock data
          villages: Math.floor(Math.random() * 200) + 50 // Mock data
        }
      })

      return NextResponse.json({ districts: districtData })
    }

    if (view === "district" && district !== "all") {
      // Get mandal-level data for selected district
      const mandals = await prisma.grievance.groupBy({
        by: ['mandal'],
        where: { 
          district,
          mandal: { not: null }
        },
        _count: {
          id: true
        }
      })

      const projectsByMandal = await prisma.governmentProject.groupBy({
        by: ['mandal'],
        where: { 
          district,
          mandal: { not: null }
        },
        _count: {
          id: true
        }
      })

      const mandalData = mandals.map(m => {
        const projectCount = projectsByMandal.find(p => p.mandal === m.mandal)?._count || 0
        return {
          name: m.mandal,
          grievances: m._count,
          projects: projectCount,
          villages: Math.floor(Math.random() * 50) + 10 // Mock data
        }
      })

      return NextResponse.json({ mandals: mandalData })
    }

    if (view === "mandal" && mandal !== "all") {
      // Get village-level data for selected mandal
      const villages = await prisma.grievance.groupBy({
        by: ['village'],
        where: { 
          district,
          mandal,
          village: { not: null }
        },
        _count: {
          id: true
        }
      })

      const projectsByVillage = await prisma.governmentProject.groupBy({
        by: ['village'],
        where: { 
          district,
          mandal,
          village: { not: null }
        },
        _count: {
          id: true
        }
      })

      const villageData = villages.map(v => {
        const projectCount = projectsByVillage.find(p => p.village === v.village)?._count || 0
        return {
          name: v.village,
          grievances: v._count,
          projects: projectCount,
          population: Math.floor(Math.random() * 5000) + 1000, // Mock data
          households: Math.floor(Math.random() * 1000) + 200 // Mock data
        }
      })

      return NextResponse.json({ villages: villageData })
    }

    if (view === "village") {
      // Get detailed village information
      const villageDetails = {
        population: Math.floor(Math.random() * 5000) + 1000,
        households: Math.floor(Math.random() * 1000) + 200,
        schools: Math.floor(Math.random() * 5) + 1,
        hospitals: Math.floor(Math.random() * 3) + 1,
        infrastructure: {
          roads: Math.floor(Math.random() * 10) + 5,
          waterSupply: Math.random() > 0.5 ? "Available" : "Limited",
          electricity: Math.random() > 0.2 ? "24/7" : "Limited"
        }
      }

      return NextResponse.json({ villageDetails })
    }

    return NextResponse.json({ message: "No data available for current view" })

  } catch (error) {
    console.error("Map data error:", error)
    return NextResponse.json(
      { error: "Failed to load map data" },
      { status: 500 }
    )
  }
}