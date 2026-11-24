import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth-middleware'

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const districtName = searchParams.get('name')

  if (!districtName) return NextResponse.json({ error: 'District name required' }, { status: 400 })

  try {
    const [projects, grievances, completedProjects, pendingGrievances] = await Promise.all([
      prisma.governmentProject.count({ where: { district: districtName } }),
      prisma.grievance.count({ where: { district: districtName } }),
      prisma.governmentProject.count({ where: { district: districtName, status: 'COMPLETED' } }),
      prisma.grievance.count({ where: { district: districtName, status: { in: ['PENDING', 'ASSIGNED'] } } }),
    ])

    return NextResponse.json({ projects, grievances, completed: completedProjects, pending: pendingGrievances })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
