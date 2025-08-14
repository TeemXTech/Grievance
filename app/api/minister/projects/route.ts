import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const place = searchParams.get('place')
    const status = searchParams.get('status')
    const category = searchParams.get('category')

    const where: any = {}
    if (place) where.village = place
    if (status) where.status = status
    if (category) where.category = { name: category }

    const projects = await prisma.project.findMany({
      where,
      include: {
        assignedOfficer: true,
        category: true,
        documents: true
      },
      orderBy: { createdAt: 'desc' }
    })

    const formattedProjects = projects.map(project => ({
      id: project.id,
      name: project.title,
      status: project.status,
      progress: project.progress || 0,
      budget: `₹${(project.budget / 100000).toFixed(1)} L`,
      spent: `₹${((project.budget * (project.progress || 0) / 100) / 100000).toFixed(1)} L`,
      place: project.village,
      village: project.village,
      mandal: project.mandal,
      district: project.district,
      contractor: project.contractor || 'TBD',
      startDate: project.startDate?.toISOString().split('T')[0] || 'TBD',
      expectedEnd: project.expectedEndDate?.toISOString().split('T')[0] || 'TBD',
      completedDate: project.completedDate?.toISOString().split('T')[0],
      workOrder: project.workOrderNumber || `WO/${new Date().getFullYear()}/${project.village?.substring(0,3).toUpperCase()}/${project.id.toString().padStart(3, '0')}`,
      assignedOfficer: project.assignedOfficer?.name || 'Unassigned',
      fieldOfficer: `Field Officer ${project.assignedOfficer?.name?.split(' ')[0] || 'TBD'}`,
      paOfficer: 'PA Srinivas',
      category: project.category?.name || 'General',
      description: project.description,
      documents: project.documents.map(doc => doc.fileName),
      images: [`${project.title.replace(/\s+/g, '_').toLowerCase()}_progress.jpg`],
      daysInProgress: project.startDate ? Math.floor((new Date().getTime() - project.startDate.getTime()) / (1000 * 60 * 60 * 24)) : 0,
      issues: project.issues ? JSON.parse(project.issues) : [],
      createdAt: project.createdAt
    }))

    return NextResponse.json(formattedProjects)
  } catch (error) {
    console.error('Projects API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}