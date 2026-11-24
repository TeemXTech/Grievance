import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, hasRole } from '@/lib/auth-middleware'

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  if (!hasRole(user, 'MINISTER', 'PA', 'ADMIN', 'BACK_OFFICER')) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }
  try {
    const [leaders, mandals, villages, officials, pas, offices, partyPosts, users] = await Promise.all([
      prisma.localLeader.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          phone: true,
          designation: true,
          partyRole: true,
          mandalName: true,
          villageName: true,
        },
        orderBy: { name: 'asc' },
      }),
      prisma.mandal.findMany({
        select: { id: true, name: true, district: true },
        orderBy: { name: 'asc' },
      }),
      prisma.village.findMany({
        select: { id: true, name: true, mandalId: true, mandal: { select: { name: true } } },
        orderBy: { name: 'asc' },
      }),
      prisma.user.findMany({
        where: { role: 'GOVERNMENT_OFFICIAL' },
        select: { id: true, name: true, email: true, phone: true },
      }),
      prisma.user.findMany({
        where: { role: 'PA' },
        select: { id: true, name: true, email: true, phone: true },
      }),
      // New: offices for task routing
      prisma.office.findMany({
        where: { isActive: true },
        select: { id: true, name: true, officeType: true, city: true, isDefault: true },
        orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
      }),
      // New: party posts for worker assignment
      prisma.partyPost.findMany({
        where: { isActive: true },
        select: { id: true, title: true, wing: true, level: true },
        orderBy: [{ level: 'asc' }, { title: 'asc' }],
      }),
      // New: all staff users for task assignment
      prisma.user.findMany({
        where: { status: 'active', role: { in: ['PA', 'BACK_OFFICER', 'FIELD_OFFICER', 'ADMIN'] } },
        select: { id: true, name: true, role: true, phone: true },
        orderBy: { name: 'asc' },
      }),
    ])

    return NextResponse.json({
      success: true,
      leaders,
      mandals,
      villages,
      officials,
      pas,
      offices,
      partyPosts,
      staffUsers: users,
      departments: [
        'Revenue / Tahsildar (MRO)',
        'Health & Medical Services (DMHO)',
        'Panchayat Raj Engineering (PR)',
        'Roads & Buildings (R&B)',
        'School Education (DEO)',
        'Rural Water Supply (RWS)',
        'Police Department',
        'Electricity (TSSPDCL)',
        'Civil Supplies / Ration',
        'Telangana Academy for Skill and Knowledge (TASK)',
        'Social Welfare / BC / SC / ST Corporation',
        'Chief Minister Relief Fund (CMRF Cell)',
        'Municipal Administration / Commissioner',
        'Irrigation Department',
        'Forest Department',
        'Agriculture Department',
      ],
    })
  } catch (error: any) {
    console.error('Error fetching metadata:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
