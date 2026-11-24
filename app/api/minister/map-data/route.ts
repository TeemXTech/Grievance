import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, hasRole } from "@/lib/auth-middleware"

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!hasRole(user, "MINISTER", "PA", "ADMIN")) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const district = searchParams.get("district") || "all"
    const mandal = searchParams.get("mandal") || "all"
    const view = searchParams.get("view") || "state"

    if (view === "state") {
      const [grievancesByDistrict, projectsByDistrict] = await Promise.all([
        prisma.grievance.groupBy({ by: ["district"], where: { district: { not: null } }, _count: { id: true } }),
        prisma.governmentProject.groupBy({ by: ["district"], where: { district: { not: null } }, _count: { id: true } }),
      ])
      const districtData = grievancesByDistrict.map((d) => ({
        name: d.district,
        grievances: d._count.id,
        projects: projectsByDistrict.find((p) => p.district === d.district)?._count.id || 0,
      }))
      return NextResponse.json({ success: true, districts: districtData })
    }

    if (view === "district" && district !== "all") {
      const [grievancesByMandal, projectsByMandal] = await Promise.all([
        prisma.grievance.groupBy({ by: ["mandal"], where: { district, mandal: { not: null } }, _count: { id: true } }),
        prisma.governmentProject.groupBy({ by: ["mandal"], where: { district, mandal: { not: null } }, _count: { id: true } }),
      ])
      const mandalData = grievancesByMandal.map((m) => ({
        name: m.mandal,
        grievances: m._count.id,
        projects: projectsByMandal.find((p) => p.mandal === m.mandal)?._count.id || 0,
      }))
      return NextResponse.json({ success: true, mandals: mandalData })
    }

    if (view === "mandal" && mandal !== "all") {
      const [grievancesByVillage, projectsByVillage, villageRecords] = await Promise.all([
        prisma.grievance.groupBy({ by: ["village"], where: { district, mandal, village: { not: null } }, _count: { id: true } }),
        prisma.governmentProject.groupBy({ by: ["village"], where: { district, mandal, village: { not: null } }, _count: { id: true } }),
        prisma.village.findMany({ where: { mandal: { name: mandal } }, select: { name: true, population: true } }),
      ])
      const villageData = grievancesByVillage.map((v) => {
        const record = villageRecords.find((r) => r.name === v.village)
        return {
          name: v.village,
          grievances: v._count.id,
          projects: projectsByVillage.find((p) => p.village === v.village)?._count.id || 0,
          population: record?.population || null,
        }
      })
      return NextResponse.json({ success: true, villages: villageData })
    }

    return NextResponse.json({ success: true, message: "No data for current view" })
  } catch (error: any) {
    console.error("Map data error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
