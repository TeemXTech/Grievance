import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { phone, message } = await request.json()

    // Store WhatsApp message for processing
    const whatsappMessage = await prisma.whatsAppMessage.create({
      data: {
        phone,
        message,
        rawText: message,
        isProcessed: false
      }
    })

    // Auto-process if message contains keywords
    const keywords = ['complaint', 'grievance', 'problem', 'issue', 'help']
    const containsKeywords = keywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    )

    if (containsKeywords) {
      // Auto-create grievance
      const grievance = await prisma.grievance.create({
        data: {
          title: `WhatsApp Grievance from ${phone}`,
          description: message,
          requesterPhone: phone,
          requesterName: 'WhatsApp User',
          intakeMethod: 'WHATSAPP',
          grievanceCategory: 'OTHER',
          requestOrigin: 'VILLAGE',
          status: 'PENDING',
          priority: 'MEDIUM',
          qrCode: `QR-${Date.now()}`
        }
      })

      // Mark message as processed
      await prisma.whatsAppMessage.update({
        where: { id: whatsappMessage.id },
        data: {
          isProcessed: true,
          processedAt: new Date(),
          grievanceId: grievance.id
        }
      })

      // Send acknowledgment (mock implementation)
      // In real implementation, integrate with WhatsApp Business API
      console.log(`Sending WhatsApp acknowledgment to ${phone}:`)
      console.log(`Your grievance has been registered with reference: ${grievance.referenceNumber}`)
      console.log(`Track status: ${process.env.NEXTAUTH_URL}/track/${grievance.qrCode}`)
    }

    return NextResponse.json({ 
      success: true, 
      messageId: whatsappMessage.id,
      autoProcessed: containsKeywords 
    })

  } catch (error) {
    console.error('WhatsApp intake error:', error)
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 })
  }
}