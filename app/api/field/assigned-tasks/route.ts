import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, hasRole } from "@/lib/auth-middleware"

export async function GET(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasRole(user, "FIELD_OFFICER", "ADMIN", "PA", "MINISTER", "BACK_OFFICER"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const isFieldOfficer = hasRole(user, "FIELD_OFFICER")

  // Petitions: FIELD_OFFICER sees only those assigned to them
  const petitionWhere = isFieldOfficer ? { assignedOfficialId: user.id } : {}

  const petitions = await prisma.petitionRequest.findMany({
    where: petitionWhere,
    select: {
      id: true, trackingNumber: true, type: true, title: true,
      status: true, priority: true, applicantName: true, applicantPhone: true,
      villageName: true, mandalName: true, assignedDepartment: true,
      dueDate: true, isOverdue: true, createdAt: true,
    },
    orderBy: [{ isOverdue: "desc" }, { priority: "desc" }, { createdAt: "desc" }],
    take: 100,
  })

  // Tasks: FIELD_OFFICER sees only tasks assigned to them
  const taskWhere = isFieldOfficer ? { assignedToId: user.id } : {}
  const tasks = await prisma.task.findMany({
    where: taskWhere,
    orderBy: [{ isOverdue: "desc" }, { priority: "desc" }, { dueDate: "asc" }],
    take: 50,
    include: { office: { select: { id: true, name: true } } },
  })

  // Works: FIELD_OFFICER scoped to mandals/villages from their assigned petitions
  // We derive their geo-scope from the petitions assigned to them
  let worksWhere: any = {}
  if (isFieldOfficer) {
    // Collect unique mandal/village names from their assigned petitions
    const assignedMandals  = [...new Set(petitions.map(p => p.mandalName).filter(Boolean))]
    const assignedVillages = [...new Set(petitions.map(p => p.villageName).filter(Boolean))]

    if (assignedMandals.length > 0 || assignedVillages.length > 0) {
      worksWhere.OR = [
        ...(assignedMandals.length  > 0 ? [{ mandalName:  { in: assignedMandals  as string[] } }] : []),
        ...(assignedVillages.length > 0 ? [{ villageName: { in: assignedVillages as string[] } }] : []),
      ]
    } else {
      // No assigned petitions → return empty works list (not all works)
      worksWhere.id = "NONE"
    }
  }

  const works = await prisma.publicWork.findMany({
    where: worksWhere,
    select: {
      id: true, workCode: true, title: true, category: true, stage: true,
      villageName: true, mandalName: true, targetCompletionDate: true, createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return NextResponse.json({
    success: true,
    petitions,
    tasks,
    works,
    summary: {
      totalPetitions: petitions.length,
      overdue:        petitions.filter(p => p.isOverdue).length,
      pending:        petitions.filter(p => ["SUBMITTED_TO_PA", "ASSIGNED_TO_OFFICIAL"].includes(p.status)).length,
      resolved:       petitions.filter(p => ["RESOLVED", "SANCTIONED"].includes(p.status)).length,
      totalTasks:     tasks.length,
      tasksOverdue:   tasks.filter(t => t.isOverdue).length,
    },
  })
}
