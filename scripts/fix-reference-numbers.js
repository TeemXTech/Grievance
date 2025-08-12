import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixReferenceNumbers() {
  try {
    console.log('Fetching all grievances...');
    const grievances = await prisma.grievance.findMany();
    
    console.log(`Found ${grievances.length} grievances`);
    
    for (let i = 0; i < grievances.length; i++) {
      const grievance = grievances[i];
      const newReferenceNumber = `GRV-2024-${String(i + 1).padStart(4, '0')}`;
      
      console.log(`Updating grievance ${grievance.id} with reference number: ${newReferenceNumber}`);
      
      await prisma.grievance.update({
        where: { id: grievance.id },
        data: {
          referenceNumber: newReferenceNumber,
          requesterName: grievance.citizenName || 'Unknown Requester',
          requesterPhone: grievance.citizenPhone || '+910000000000',
          requesterEmail: grievance.citizenEmail || null,
          requesterAddress: grievance.location || null,
        }
      });
    }
    
    console.log('Successfully updated all grievances with unique reference numbers');
  } catch (error) {
    console.error('Error fixing reference numbers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixReferenceNumbers();
