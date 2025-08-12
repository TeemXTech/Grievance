import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const { constituencyId, reportType = "pre-visit" } = await req.json()

    if (!constituencyId) {
      return NextResponse.json(
        { error: "Constituency ID is required" },
        { status: 400 }
      )
    }

    // Fetch constituency data
    const constituency = await prisma.grievance.groupBy({
      by: ['district'],
      where: {
        district: constituencyId
      },
      _count: {
        id: true
      },
      _sum: {
        estimatedCost: true
      }
    })

    // Fetch grievance statistics
    const grievanceStats = await prisma.grievance.groupBy({
      by: ['status'],
      where: {
        district: constituencyId
      },
      _count: {
        id: true
      }
    })

    // Fetch caste-wise data
    const casteData = await prisma.grievance.groupBy({
      by: ['requesterCaste'],
      where: {
        district: constituencyId,
        requesterCaste: {
          not: null
        }
      },
      _count: {
        id: true
      },
      _sum: {
        estimatedCost: true
      }
    })

    // Fetch critical grievances
    const criticalGrievances = await prisma.grievance.findMany({
      where: {
        district: constituencyId,
        OR: [
          { priority: 'URGENT' },
          { priority: 'HIGH' },
          {
            expectedResolutionDate: {
              lt: new Date()
            },
            status: {
              not: 'RESOLVED'
            }
          }
        ]
      },
      include: {
        assignedTo: {
          select: {
            name: true,
            phone: true,
            email: true,
            role: true
          }
        },
        category: {
          select: {
            name: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' }
      ],
      take: 20
    })

    // Fetch officer workload
    const officerWorkload = await prisma.grievance.groupBy({
      by: ['assignedToId'],
      where: {
        district: constituencyId,
        assignedToId: {
          not: null
        }
      },
      _count: {
        id: true
      }
    })

    const officerIds = officerWorkload.map(o => o.assignedToId).filter(Boolean)
    const officers = await prisma.user.findMany({
      where: {
        id: {
          in: officerIds as string[]
        }
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true
      }
    })

    // Generate PDF content
    const pdfContent = generatePDFContent({
      constituency: constituencyId,
      grievanceStats,
      casteData,
      criticalGrievances,
      officers,
      reportType
    })

    // In a real implementation, you would use a PDF library like jsPDF or puppeteer
    // For now, we'll return the structured data that would be used to generate the PDF
    
    return NextResponse.json({
      success: true,
      data: {
        constituency: constituencyId,
        grievanceStats,
        casteData,
        criticalGrievances,
        officers,
        pdfContent
      },
      message: "PDF report data generated successfully"
    })

  } catch (error) {
    console.error('Error generating minister visit report:', error)
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    )
  }
}

function generatePDFContent(data: any) {
  const { constituency, grievanceStats, casteData, criticalGrievances, officers, reportType } = data

  // Calculate totals
  const totalGrievances = grievanceStats.reduce((sum: number, stat: any) => sum + stat._count.id, 0)
  const pendingGrievances = grievanceStats.find((stat: any) => stat.status === 'PENDING')?._count.id || 0
  const resolvedGrievances = grievanceStats.find((stat: any) => stat.status === 'RESOLVED')?._count.id || 0
  const resolutionRate = totalGrievances > 0 ? (resolvedGrievances / totalGrievances * 100).toFixed(1) : 0

  return {
    // English Content
    english: {
      title: "Minister Pre-Visit Summary Report",
      subtitle: `${constituency} Constituency`,
      date: new Date().toLocaleDateString('en-IN'),
      
      summary: {
        title: "Executive Summary",
        totalGrievances,
        pendingGrievances,
        resolvedGrievances,
        resolutionRate: `${resolutionRate}%`,
        criticalIssues: criticalGrievances.length
      },

      statusBreakdown: {
        title: "Grievance Status Distribution",
        data: grievanceStats.map((stat: any) => ({
          status: stat.status,
          count: stat._count.id,
          percentage: ((stat._count.id / totalGrievances) * 100).toFixed(1)
        }))
      },

      casteAnalysis: {
        title: "Caste-wise Fund Distribution",
        data: casteData.map((caste: any) => ({
          category: caste.requesterCaste,
          grievanceCount: caste._count.id,
          fundAmount: caste._sum.estimatedCost || 0,
          percentage: ((caste._count.id / totalGrievances) * 100).toFixed(1)
        }))
      },

      criticalIssues: {
        title: "Critical Grievances Requiring Attention",
        data: criticalGrievances.map((grievance: any) => ({
          referenceNumber: grievance.referenceNumber,
          title: grievance.title,
          priority: grievance.priority,
          status: grievance.status,
          category: grievance.category?.name,
          assignedTo: grievance.assignedTo?.name,
          assignedToPhone: grievance.assignedTo?.phone,
          daysSinceCreation: Math.floor((new Date().getTime() - new Date(grievance.createdAt).getTime()) / (1000 * 60 * 60 * 24))
        }))
      },

      officers: {
        title: "Assigned Officers & Contact Details",
        data: officers.map((officer: any) => ({
          name: officer.name,
          role: officer.role,
          phone: officer.phone,
          email: officer.email,
          assignedGrievances: officerWorkload.find((w: any) => w.assignedToId === officer.id)?._count.id || 0
        }))
      }
    },

    // Telugu Content
    telugu: {
      title: "మంత్రి పూర్వ సందర్శన సారాంశ నివేదిక",
      subtitle: `${constituency} నియోజకవర్గం`,
      date: new Date().toLocaleDateString('te-IN'),
      
      summary: {
        title: "కార్యనిర్వాహక సారాంశం",
        totalGrievances: `మొత్తం ఫిర్యాదులు: ${totalGrievances}`,
        pendingGrievances: `పెండింగ్ ఫిర్యాదులు: ${pendingGrievances}`,
        resolvedGrievances: `పరిష్కరించబడిన ఫిర్యాదులు: ${resolvedGrievances}`,
        resolutionRate: `పరిష్కరణ రేటు: ${resolutionRate}%`,
        criticalIssues: `క్లిష్టమైన సమస్యలు: ${criticalGrievances.length}`
      },

      statusBreakdown: {
        title: "ఫిర్యాదు స్థితి పంపిణీ",
        data: grievanceStats.map((stat: any) => ({
          status: getTeluguStatus(stat.status),
          count: stat._count.id,
          percentage: ((stat._count.id / totalGrievances) * 100).toFixed(1)
        }))
      },

      casteAnalysis: {
        title: "కుల వారీ నిధి పంపిణీ",
        data: casteData.map((caste: any) => ({
          category: getTeluguCaste(caste.requesterCaste),
          grievanceCount: caste._count.id,
          fundAmount: caste._sum.estimatedCost || 0,
          percentage: ((caste._count.id / totalGrievances) * 100).toFixed(1)
        }))
      },

      criticalIssues: {
        title: "శ్రద్ధ అవసరమైన క్లిష్టమైన ఫిర్యాదులు",
        data: criticalGrievances.map((grievance: any) => ({
          referenceNumber: grievance.referenceNumber,
          title: grievance.title,
          priority: getTeluguPriority(grievance.priority),
          status: getTeluguStatus(grievance.status),
          category: grievance.category?.name,
          assignedTo: grievance.assignedTo?.name,
          assignedToPhone: grievance.assignedTo?.phone,
          daysSinceCreation: Math.floor((new Date().getTime() - new Date(grievance.createdAt).getTime()) / (1000 * 60 * 60 * 24))
        }))
      },

      officers: {
        title: "నియమించబడిన అధికారులు మరియు సంప్రదింపు వివరాలు",
        data: officers.map((officer: any) => ({
          name: officer.name,
          role: getTeluguRole(officer.role),
          phone: officer.phone,
          email: officer.email,
          assignedGrievances: officerWorkload.find((w: any) => w.assignedToId === officer.id)?._count.id || 0
        }))
      }
    }
  }
}

// Helper functions for Telugu translations
function getTeluguStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'PENDING': 'పెండింగ్',
    'IN_PROGRESS': 'ప్రగతిలో',
    'RESOLVED': 'పరిష్కరించబడింది',
    'CLOSED': 'ముగించబడింది',
    'REJECTED': 'తిరస్కరించబడింది'
  }
  return statusMap[status] || status
}

function getTeluguPriority(priority: string): string {
  const priorityMap: Record<string, string> = {
    'URGENT': 'తక్షణ',
    'HIGH': 'అధిక',
    'MEDIUM': 'మధ్యస్థ',
    'LOW': 'తక్కువ'
  }
  return priorityMap[priority] || priority
}

function getTeluguCaste(caste: string): string {
  const casteMap: Record<string, string> = {
    'SC': 'ఎస్.సి',
    'ST': 'ఎస్.టి',
    'OBC': 'ఓ.బి.సి',
    'GENERAL': 'సామాన్య'
  }
  return casteMap[caste] || caste
}

function getTeluguRole(role: string): string {
  const roleMap: Record<string, string> = {
    'FIELD_OFFICER': 'ఫీల్డ్ అధికారి',
    'ASSISTANT_COMMISSIONER': 'సహాయ కమిషనర్',
    'DEPUTY_COLLECTOR': 'డిప్యూటీ కలెక్టర్',
    'MINISTER': 'మంత్రి',
    'PA': 'వ్యక్తిగత సహాయకుడు'
  }
  return roleMap[role] || role
}
