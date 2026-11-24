const fs = require('fs');
const path = 'd:\\Grievance\\prisma\\migrations\\20250814000000_baseline_full_schema\\migration.sql';

const sql = `
CREATE TABLE IF NOT EXISTS "VisitorLog" (
    "id" TEXT NOT NULL,
    "tokenNumber" TEXT NOT NULL,
    "visitorName" TEXT NOT NULL,
    "visitorPhone" VARCHAR(32),
    "visitorAadhar" TEXT,
    "visitorAddress" TEXT,
    "organization" TEXT,
    "visitType" "VisitType" NOT NULL DEFAULT 'WALK_IN',
    "purpose" TEXT NOT NULL,
    "appointmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkedInAt" TIMESTAMP(3),
    "checkedOutAt" TIMESTAMP(3),
    "meetingWith" TEXT,
    "status" "VisitorStatus" NOT NULL DEFAULT 'WAITING',
    "outcomeNotes" TEXT,
    "priorityFlag" BOOLEAN NOT NULL DEFAULT false,
    "grievanceId" TEXT,
    "projectId" TEXT,
    "petitionId" TEXT,
    "loggedById" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "VisitorLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ProjectStatusUpdate" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "oldStatus" "ProjectStatus",
    "newStatus" "ProjectStatus" NOT NULL,
    "remarks" TEXT,
    "attachments" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProjectStatusUpdate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "WhatsAppMessage" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "rawText" TEXT NOT NULL,
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,
    "grievanceId" TEXT,
    "mediaUrl" TEXT,
    "mediaType" TEXT,
    "mediaCaption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    CONSTRAINT "WhatsAppMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CalendarEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "location" TEXT,
    "attendees" JSONB,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Mandal" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "district" TEXT NOT NULL DEFAULT 'Peddapalli',
    "code" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Mandal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Village" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mandalId" TEXT NOT NULL,
    "pincode" TEXT,
    "population" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Village_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "LocalLeader" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" VARCHAR(32) NOT NULL,
    "email" TEXT,
    "designation" TEXT NOT NULL,
    "partyRole" TEXT,
    "photoUrl" TEXT,
    "mandalId" TEXT,
    "villageId" TEXT,
    "villageName" TEXT,
    "mandalName" TEXT,
    "notes" TEXT,
    "privateNotes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LocalLeader_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "PetitionRequest" (
    "id" TEXT NOT NULL,
    "trackingNumber" TEXT NOT NULL,
    "type" "PetitionType" NOT NULL DEFAULT 'PERSONAL_GRIEVANCE',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "status" "PetitionStatus" NOT NULL DEFAULT 'PENDING',
    "applicantName" TEXT NOT NULL,
    "applicantPhone" VARCHAR(32) NOT NULL,
    "applicantAadhar" TEXT,
    "applicantAddress" TEXT,
    "district" TEXT DEFAULT 'Peddapalli',
    "mandalId" TEXT,
    "villageId" TEXT,
    "mandalName" TEXT,
    "villageName" TEXT,
    "referredByLeaderId" TEXT,
    "referredByLeaderName" TEXT,
    "leaderEndorsementNote" TEXT,
    "handlingPaId" TEXT,
    "handlingPaName" TEXT,
    "assignedOfficialId" TEXT,
    "assignedOfficialName" TEXT,
    "assignedDepartment" TEXT,
    "privateNotes" TEXT,
    "hospitalName" TEXT,
    "medicalCondition" TEXT,
    "requestedAmount" DOUBLE PRECISION,
    "sanctionedAmount" DOUBLE PRECISION,
    "currentPosting" TEXT,
    "requestedPosting" TEXT,
    "employeeDesignation" TEXT,
    "qualification" TEXT,
    "skillsOrResumeNotes" TEXT,
    "daysAllowed" INTEGER DEFAULT 7,
    "isOverdue" BOOLEAN NOT NULL DEFAULT false,
    "dueDate" TIMESTAMP(3),
    "lastFollowUpAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "qrCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PetitionRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "RequestTimeline" (
    "id" TEXT NOT NULL,
    "petitionRequestId" TEXT NOT NULL,
    "fromStatus" "PetitionStatus",
    "toStatus" "PetitionStatus" NOT NULL,
    "actionTaken" TEXT NOT NULL,
    "remarks" TEXT,
    "performedByName" TEXT NOT NULL,
    "performedByRole" TEXT NOT NULL,
    "isPrivateNote" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RequestTimeline_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "PublicWork" (
    "id" TEXT NOT NULL,
    "workCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "WorkCategory" NOT NULL DEFAULT 'ROADS_BRIDGES',
    "stage" "WorkStage" NOT NULL DEFAULT 'PLANNED',
    "district" TEXT NOT NULL DEFAULT 'Peddapalli',
    "mandalId" TEXT,
    "villageId" TEXT,
    "mandalName" TEXT,
    "villageName" TEXT,
    "wardNumber" TEXT,
    "estimatedBudget" DOUBLE PRECISION,
    "sanctionedBudget" DOUBLE PRECISION,
    "spentBudget" DOUBLE PRECISION DEFAULT 0,
    "sanctionedDate" TIMESTAMP(3),
    "targetCompletionDate" TIMESTAMP(3),
    "actualCompletionDate" TIMESTAMP(3),
    "requestedByLeaderId" TEXT,
    "requestedByLeaderName" TEXT,
    "handlingPaId" TEXT,
    "handlingPaName" TEXT,
    "supervisingOfficial" TEXT,
    "executingDepartment" TEXT,
    "contractorName" TEXT,
    "contractorPhone" TEXT,
    "privateNotes" TEXT,
    "stuckReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PublicWork_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "WorkTimeline" (
    "id" TEXT NOT NULL,
    "publicWorkId" TEXT NOT NULL,
    "stage" "WorkStage" NOT NULL,
    "percentageDone" INTEGER NOT NULL DEFAULT 0,
    "updateNote" TEXT NOT NULL,
    "updatedByName" TEXT NOT NULL,
    "updatedByRole" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkTimeline_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "FileAttachment" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "mimeType" TEXT,
    "fileSize" INTEGER,
    "uploadedByName" TEXT,
    "petitionRequestId" TEXT,
    "publicWorkId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FileAttachment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "TourAppointment" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "eventType" "TourEventType" NOT NULL DEFAULT 'VILLAGE_TOUR',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "location" TEXT NOT NULL,
    "mandalName" TEXT,
    "villageName" TEXT,
    "linkedLeaderId" TEXT,
    "linkedLeaderName" TEXT,
    "vipGuests" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "privateNotes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TourAppointment_pkey" PRIMARY KEY ("id")
);
`;

fs.appendFileSync(path, sql);
console.log('Part 3 written OK, file size: ' + fs.statSync(path).size);
