import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const petition = await prisma.petitionRequest.findUnique({
      where: { id },
      include: {
        referredByLeader: true,
        handlingPa: true,
        assignedOfficial: true,
        timeline: { orderBy: { createdAt: 'desc' } },
        attachments: true,
      },
    })

    if (!petition) {
      return NextResponse.json({ success: false, error: 'Petition not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, petition })
  } catch (error: any) {
    console.error('Error fetching petition details:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await req.json()
    const {
      status,
      assignedDepartment,
      assignedOfficialName,
      privateNotes,
      sanctionedAmount,
      actionTaken,
      actionRemarks,
      performedByName = 'PA Srinivas',
      performedByRole = 'PA',
      isPrivateNote = false,
    } = body

    const existing = await prisma.petitionRequest.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Petition not found' }, { status: 404 })
    }

    // Build update object
    const updateData: any = {
      lastFollowUpAt: new Date(),
    }

    if (status && status !== existing.status) {
      updateData.status = status
      if (status === 'RESOLVED' || status === 'SANCTIONED') {
        updateData.resolvedAt = new Date()
        updateData.isOverdue = false
      }
    }

    if (assignedDepartment !== undefined) updateData.assignedDepartment = assignedDepartment
    if (assignedOfficialName !== undefined) updateData.assignedOfficialName = assignedOfficialName
    if (privateNotes !== undefined) updateData.privateNotes = privateNotes
    if (sanctionedAmount !== undefined) updateData.sanctionedAmount = parseFloat(sanctionedAmount)

    const updatedPetition = await prisma.petitionRequest.update({
      where: { id },
      data: updateData,
    })

    // If an action or remark is recorded, add to timeline
    if (actionTaken || status !== existing.status) {
      await prisma.requestTimeline.create({
        data: {
          petitionRequestId: id,
          fromStatus: existing.status,
          toStatus: status || existing.status,
          actionTaken: actionTaken || `Status changed to ${status}`,
          remarks: actionRemarks || null,
          performedByName,
          performedByRole,
          isPrivateNote: !!isPrivateNote,
        },
      })
    }

    // Fetch updated petition with full relations
    const finalPetition = await prisma.petitionRequest.findUnique({
      where: { id },
      include: {
        referredByLeader: true,
        handlingPa: true,
        assignedOfficial: true,
        timeline: { orderBy: { createdAt: 'desc' } },
        attachments: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Petition updated successfully',
      petition: finalPetition,
    })
  } catch (error: any) {
    console.error('Error updating petition:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
