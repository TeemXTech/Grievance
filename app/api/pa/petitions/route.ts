import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const overdueOnly = searchParams.get('overdue') === 'true'
    const search = searchParams.get('search') || ''

    const where: any = {}

    if (type && type !== 'ALL') {
      where.type = type
    }

    if (status && status !== 'ALL') {
      where.status = status
    }

    if (search) {
      where.OR = [
        { trackingNumber: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { applicantName: { contains: search, mode: 'insensitive' } },
        { applicantPhone: { contains: search, mode: 'insensitive' } },
        { villageName: { contains: search, mode: 'insensitive' } },
        { mandalName: { contains: search, mode: 'insensitive' } },
        { referredByLeaderName: { contains: search, mode: 'insensitive' } },
        { assignedDepartment: { contains: search, mode: 'insensitive' } },
      ]
    }

    const petitions = await prisma.petitionRequest.findMany({
      where,
      include: {
        referredByLeader: true,
        handlingPa: { select: { id: true, name: true, email: true, phone: true } },
        assignedOfficial: { select: { id: true, name: true, email: true, phone: true } },
        timeline: { orderBy: { createdAt: 'desc' } },
        attachments: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Compute dynamic overdue flag based on daysAllowed and createdAt
    const now = new Date()
    const enriched = petitions.map((p) => {
      const createdDate = new Date(p.createdAt)
      const daysPassed = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
      const isOverdue =
        p.status !== 'SANCTIONED' &&
        p.status !== 'RESOLVED' &&
        p.status !== 'CLOSED' &&
        daysPassed >= (p.daysAllowed || 7)

      return {
        ...p,
        daysPassed,
        isOverdue: isOverdue || p.isOverdue,
      }
    })

    const finalResult = overdueOnly ? enriched.filter((p) => p.isOverdue) : enriched

    return NextResponse.json({
      success: true,
      count: finalResult.length,
      petitions: finalResult,
      summary: {
        total: petitions.length,
        overdueCount: enriched.filter((p) => p.isOverdue).length,
        cmrfCount: petitions.filter((p) => p.type === 'CMRF_MEDICAL').length,
        transferCount: petitions.filter((p) => p.type === 'EMPLOYEE_TRANSFER').length,
        jobCount: petitions.filter((p) => p.type === 'JOB_EMPLOYMENT').length,
        grievanceCount: petitions.filter((p) => p.type === 'PERSONAL_GRIEVANCE').length,
        resolvedCount: petitions.filter((p) => p.status === 'RESOLVED' || p.status === 'SANCTIONED').length,
      },
    })
  } catch (error: any) {
    console.error('Error fetching petitions:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      type = 'PERSONAL_GRIEVANCE',
      title,
      description,
      priority = 'MEDIUM',
      applicantName,
      applicantPhone,
      applicantAadhar,
      applicantAddress,
      district = 'Peddapalli',
      mandalName,
      villageName,
      referredByLeaderId,
      referredByLeaderName,
      leaderEndorsementNote,
      handlingPaId,
      handlingPaName = 'PA Srinivas',
      assignedDepartment,
      assignedOfficialName,
      privateNotes,
      hospitalName,
      medicalCondition,
      requestedAmount,
      currentPosting,
      requestedPosting,
      employeeDesignation,
      qualification,
      skillsOrResumeNotes,
      daysAllowed = 7,
    } = body

    if (!title || !applicantName || !applicantPhone) {
      return NextResponse.json(
        { success: false, error: 'Title, applicant name, and phone are required.' },
        { status: 400 }
      )
    }

    // Generate unique tracking number
    const count = await prisma.petitionRequest.count()
    const prefix =
      type === 'CMRF_MEDICAL'
        ? 'CMRF'
        : type === 'JOB_EMPLOYMENT'
        ? 'JOB'
        : type === 'EMPLOYEE_TRANSFER'
        ? 'TRF'
        : type === 'SCHEME_FINANCIAL'
        ? 'SCH'
        : 'REQ'
    const trackingNumber = `REQ-${prefix}-2026-${String(count + 101).padStart(4, '0')}`

    // Calculate due date
    const dueDate = new Date(Date.now() + daysAllowed * 24 * 60 * 60 * 1000)

    const newPetition = await prisma.petitionRequest.create({
      data: {
        trackingNumber,
        type,
        title,
        description: description || title,
        priority,
        status: 'SUBMITTED_TO_PA',
        applicantName,
        applicantPhone,
        applicantAadhar,
        applicantAddress,
        district,
        mandalName: mandalName || 'Manthanani',
        villageName: villageName || 'Manthanani Town',
        referredByLeaderId: referredByLeaderId || null,
        referredByLeaderName: referredByLeaderName || null,
        leaderEndorsementNote,
        handlingPaId: handlingPaId || null,
        handlingPaName,
        assignedDepartment: assignedDepartment || 'General Administration',
        assignedOfficialName,
        privateNotes,
        hospitalName,
        medicalCondition,
        requestedAmount: requestedAmount ? parseFloat(requestedAmount) : null,
        currentPosting,
        requestedPosting,
        employeeDesignation,
        qualification,
        skillsOrResumeNotes,
        daysAllowed: parseInt(daysAllowed) || 7,
        dueDate,
      },
    })

    // Create initial timeline event
    await prisma.requestTimeline.create({
      data: {
        petitionRequestId: newPetition.id,
        fromStatus: 'PENDING',
        toStatus: 'SUBMITTED_TO_PA',
        actionTaken: 'Petition logged in PA Office Command Center',
        remarks: leaderEndorsementNote ? `Referred by: ${referredByLeaderName}` : 'Direct intake at Praja Darbar',
        performedByName: handlingPaName || 'PA Staff',
        performedByRole: 'PA',
        isPrivateNote: false,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Petition successfully created',
      petition: newPetition,
    })
  } catch (error: any) {
    console.error('Error creating petition:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
