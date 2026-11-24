import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, hasRole } from '@/lib/auth-middleware'

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  if (!hasRole(user, 'MINISTER', 'PA', 'ADMIN', 'BACK_OFFICER')) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const stage = searchParams.get('stage')
    const category = searchParams.get('category')
    const mandal = searchParams.get('mandal')
    const village = searchParams.get('village')
    const leaderId = searchParams.get('leaderId')
    const search = searchParams.get('search') || ''

    const where: any = {}
    if (stage && stage !== 'ALL') where.stage = stage
    if (category && category !== 'ALL') where.category = category
    if (mandal && mandal !== 'ALL') where.mandalName = mandal
    if (village && village !== 'ALL') where.villageName = village
    if (leaderId && leaderId !== 'ALL') where.requestedByLeaderId = leaderId
    if (search.trim()) {
      where.OR = [
        { workCode: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { villageName: { contains: search, mode: 'insensitive' } },
        { mandalName: { contains: search, mode: 'insensitive' } },
        { requestedByLeaderName: { contains: search, mode: 'insensitive' } },
        { contractorName: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [works, allWorks] = await Promise.all([
      prisma.publicWork.findMany({
        where,
        include: {
          requestedByLeader: true,
          milestones: { orderBy: { createdAt: 'desc' } },
          attachments: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.publicWork.findMany({
        select: { id: true, stage: true, sanctionedBudget: true, spentBudget: true },
      }),
    ])

    const totalSanctioned = allWorks.reduce((acc, w) => acc + (w.sanctionedBudget || 0), 0)
    const totalSpent = allWorks.reduce((acc, w) => acc + (w.spentBudget || 0), 0)

    return NextResponse.json({
      success: true,
      count: works.length,
      works,
      summary: {
        total: allWorks.length,
        completed: allWorks.filter((w) => w.stage === 'COMPLETED').length,
        inProgress: allWorks.filter((w) => w.stage === 'IN_PROGRESS').length,
        sanctioned: allWorks.filter((w) => w.stage === 'SANCTIONED').length,
        planned: allWorks.filter((w) => w.stage === 'PLANNED' || w.stage === 'PROPOSED').length,
        stuck: allWorks.filter((w) => w.stage === 'STUCK_DELAYED').length,
        totalSanctionedBudget: totalSanctioned,
        totalSpentBudget: totalSpent,
      },
    })
  } catch (error: any) {
    console.error('Projects GET error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  if (!hasRole(user, 'MINISTER', 'PA', 'ADMIN', 'BACK_OFFICER')) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const {
      title, description, category = 'ROADS_BRIDGES', stage = 'PLANNED',
      district = 'Peddapalli', mandalName, villageName, wardNumber,
      estimatedBudget, sanctionedBudget, requestedByLeaderId, requestedByLeaderName,
      supervisingOfficial, executingDepartment, contractorName, contractorPhone, privateNotes,
    } = body

    if (!title) return NextResponse.json({ success: false, error: 'Work title is required' }, { status: 400 })

    const catCode = { ROADS_BRIDGES: 'RD', DRINKING_WATER: 'WTR', EDUCATION_SCHOOLS: 'SCH', HEALTH_CLINICS: 'HLT', COMMUNITY_HALL: 'CH' }[category as string] || 'WRK'
    const year = new Date().getFullYear()
    const prefix = `WRK-${catCode}-${year}-`
    const lastWork = await prisma.publicWork.findFirst({
      where: { workCode: { startsWith: prefix } },
      orderBy: { workCode: 'desc' },
    })
    const seq = lastWork ? parseInt(lastWork.workCode.split('-').pop()!, 10) + 1 : 1
    const workCode = `${prefix}${String(seq).padStart(4, '0')}`

    const newWork = await prisma.publicWork.create({
      data: {
        workCode, title, description: description || title, category, stage,
        district, mandalName, villageName, wardNumber,
        estimatedBudget: estimatedBudget ? parseFloat(estimatedBudget) : null,
        sanctionedBudget: sanctionedBudget ? parseFloat(sanctionedBudget) : null,
        spentBudget: 0,
        requestedByLeaderId: requestedByLeaderId || null,
        requestedByLeaderName: requestedByLeaderName || null,
        supervisingOfficial, executingDepartment, contractorName, contractorPhone,
        privateNotes,
        handlingPaName: user.name,
        handlingPaId: user.id,
      },
    })

    await prisma.workTimeline.create({
      data: {
        publicWorkId: newWork.id,
        stage,
        percentageDone: stage === 'COMPLETED' ? 100 : 0,
        updateNote: `Work logged in system. Status: ${stage}`,
        updatedByName: user.name,
        updatedByRole: user.role,
      },
    })

    const finalWork = await prisma.publicWork.findUnique({
      where: { id: newWork.id },
      include: { requestedByLeader: true, milestones: true },
    })

    return NextResponse.json({ success: true, work: finalWork })
  } catch (error: any) {
    console.error('Projects POST error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  if (!hasRole(user, 'MINISTER', 'PA', 'ADMIN', 'BACK_OFFICER')) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { id, stage, percentageDone, spentBudget, sanctionedBudget, contractorName, contractorPhone, stuckReason, privateNotes, milestoneNote } = body

    if (!id) return NextResponse.json({ success: false, error: 'Work ID is required' }, { status: 400 })

    const existing = await prisma.publicWork.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ success: false, error: 'Work not found' }, { status: 404 })

    const updateData: any = {}
    if (stage) updateData.stage = stage
    if (spentBudget !== undefined) updateData.spentBudget = parseFloat(spentBudget)
    if (sanctionedBudget !== undefined) updateData.sanctionedBudget = parseFloat(sanctionedBudget)
    if (contractorName !== undefined) updateData.contractorName = contractorName
    if (contractorPhone !== undefined) updateData.contractorPhone = contractorPhone
    if (stuckReason !== undefined) updateData.stuckReason = stuckReason
    if (privateNotes !== undefined) updateData.privateNotes = privateNotes
    if (stage === 'COMPLETED') updateData.actualCompletionDate = new Date()

    await prisma.publicWork.update({ where: { id }, data: updateData })

    if (milestoneNote || (stage && stage !== existing.stage)) {
      await prisma.workTimeline.create({
        data: {
          publicWorkId: id,
          stage: stage || existing.stage,
          percentageDone: percentageDone !== undefined ? parseInt(percentageDone) : (stage === 'COMPLETED' ? 100 : 50),
          updateNote: milestoneNote || `Stage updated to ${stage}`,
          updatedByName: user.name,
          updatedByRole: user.role,
        },
      })
    }

    const finalWork = await prisma.publicWork.findUnique({
      where: { id },
      include: { requestedByLeader: true, milestones: { orderBy: { createdAt: 'desc' } }, attachments: true },
    })

    return NextResponse.json({ success: true, work: finalWork })
  } catch (error: any) {
    console.error('Projects PATCH error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
