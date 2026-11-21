import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [leaders, mandals, villages, officials, pas] = await Promise.all([
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
    ])

    return NextResponse.json({
      success: true,
      leaders,
      mandals,
      villages,
      officials,
      pas,
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
      ],
    })
  } catch (error: any) {
    console.error('Error fetching metadata:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
