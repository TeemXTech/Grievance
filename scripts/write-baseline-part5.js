const fs = require('fs');
const path = 'd:\\Grievance\\prisma\\migrations\\20250814000000_baseline_full_schema\\migration.sql';

const sql = `
CREATE TABLE IF NOT EXISTS "FundAllocation" (
    "id" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "scheme" "FundScheme" NOT NULL DEFAULT 'MLACDS',
    "financialYear" TEXT NOT NULL,
    "status" "FundAllocationStatus" NOT NULL DEFAULT 'RECOMMENDED',
    "workTitle" TEXT NOT NULL,
    "workDescription" TEXT,
    "category" TEXT,
    "district" TEXT NOT NULL DEFAULT 'Peddapalli',
    "mandalName" TEXT,
    "villageName" TEXT,
    "wardNumber" TEXT,
    "recommendedAmount" DOUBLE PRECISION NOT NULL,
    "sanctionedAmount" DOUBLE PRECISION,
    "releasedAmount" DOUBLE PRECISION DEFAULT 0,
    "utilizedAmount" DOUBLE PRECISION DEFAULT 0,
    "recommendationDate" TIMESTAMP(3),
    "adminSanctionDate" TIMESTAMP(3),
    "techSanctionDate" TIMESTAMP(3),
    "tenderDate" TIMESTAMP(3),
    "firstInstallmentDate" TIMESTAMP(3),
    "finalInstallmentDate" TIMESTAMP(3),
    "completionDate" TIMESTAMP(3),
    "linkedProjectId" TEXT,
    "isStuck" BOOLEAN NOT NULL DEFAULT false,
    "stuckReason" TEXT,
    "stuckSince" TIMESTAMP(3),
    "recommendedById" TEXT NOT NULL,
    "recommendedByName" TEXT NOT NULL,
    "collectorOffice" TEXT,
    "executingAgency" TEXT,
    "notes" TEXT,
    "privateNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FundAllocation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "FundTimeline" (
    "id" TEXT NOT NULL,
    "fundAllocationId" TEXT NOT NULL,
    "fromStatus" "FundAllocationStatus",
    "toStatus" "FundAllocationStatus" NOT NULL,
    "actionTaken" TEXT NOT NULL,
    "remarks" TEXT,
    "performedByName" TEXT NOT NULL,
    "performedByRole" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FundTimeline_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "PollingBooth" (
    "id" TEXT NOT NULL,
    "boothNumber" TEXT NOT NULL,
    "boothName" TEXT,
    "address" TEXT,
    "mandalId" TEXT,
    "mandalName" TEXT,
    "villageName" TEXT,
    "district" TEXT NOT NULL DEFAULT 'Peddapalli',
    "totalVoters" INTEGER,
    "maleVoters" INTEGER,
    "femaleVoters" INTEGER,
    "otherVoters" INTEGER,
    "currentGrade" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PollingBooth_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Household" (
    "id" TEXT NOT NULL,
    "houseNumber" TEXT,
    "address" TEXT,
    "streetColony" TEXT,
    "villageName" TEXT,
    "mandalName" TEXT,
    "district" TEXT NOT NULL DEFAULT 'Peddapalli',
    "boothId" TEXT,
    "boothNumber" TEXT,
    "schemeBenefits" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Household_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Citizen" (
    "id" TEXT NOT NULL,
    "epicNumber" TEXT,
    "name" TEXT NOT NULL,
    "fatherOrHusband" TEXT,
    "age" INTEGER,
    "gender" "CitizenGender",
    "houseNumber" TEXT,
    "streetColony" TEXT,
    "villageName" TEXT,
    "mandalName" TEXT,
    "district" TEXT NOT NULL DEFAULT 'Peddapalli',
    "pincode" TEXT,
    "boothId" TEXT,
    "boothNumber" TEXT,
    "householdId" TEXT,
    "phone" VARCHAR(32),
    "whatsappOptIn" BOOLEAN NOT NULL DEFAULT false,
    "aadharLast4" TEXT,
    "schemeBenefits" JSONB,
    "lastInteraction" TIMESTAMP(3),
    "interactionCount" INTEGER NOT NULL DEFAULT 0,
    "dataSource" TEXT NOT NULL DEFAULT 'ECI_ROLL',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Citizen_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Campaign" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "messageTemplate" TEXT NOT NULL,
    "channel" "CampaignChannel" NOT NULL DEFAULT 'WHATSAPP',
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "segmentQuery" JSONB,
    "segmentLabel" TEXT,
    "recipientCount" INTEGER NOT NULL DEFAULT 0,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "deliveredCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "approvedById" TEXT,
    "approvedByName" TEXT,
    "approvedAt" TIMESTAMP(3),
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CampaignDelivery" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "phone" VARCHAR(32) NOT NULL,
    "citizenName" TEXT,
    "citizenId" TEXT,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CampaignDelivery_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "AssemblyQuestion" (
    "id" TEXT NOT NULL,
    "questionNumber" TEXT NOT NULL,
    "sessionName" TEXT NOT NULL,
    "questionType" "AQType" NOT NULL DEFAULT 'STARRED',
    "status" "AQStatus" NOT NULL DEFAULT 'RECEIVED',
    "subject" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "askedByMLA" TEXT NOT NULL,
    "askedByConstituency" TEXT,
    "ministry" TEXT NOT NULL,
    "department" TEXT,
    "receivedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "answerDueDate" TIMESTAMP(3),
    "answeredDate" TIMESTAMP(3),
    "sentToDeptAt" TIMESTAMP(3),
    "sentToDeptName" TEXT,
    "draftReceivedAt" TIMESTAMP(3),
    "draftAnswerText" TEXT,
    "finalAnswerText" TEXT,
    "talkingPoints" TEXT,
    "linkedPetitionId" TEXT,
    "linkedWorkId" TEXT,
    "linkedLetterId" TEXT,
    "fileUrl" TEXT,
    "handledById" TEXT,
    "handledByName" TEXT,
    "privateNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AssemblyQuestion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "AQTimeline" (
    "id" TEXT NOT NULL,
    "assemblyQuestionId" TEXT NOT NULL,
    "fromStatus" "AQStatus",
    "toStatus" "AQStatus" NOT NULL,
    "actionTaken" TEXT NOT NULL,
    "remarks" TEXT,
    "performedByName" TEXT NOT NULL,
    "performedByRole" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AQTimeline_pkey" PRIMARY KEY ("id")
);

-- Unique indexes (IF NOT EXISTS)
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Category_name_key" ON "Category"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "Grievance_referenceNumber_key" ON "Grievance"("referenceNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "GovernmentProject_referenceNumber_key" ON "GovernmentProject"("referenceNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "PatientGrievance_referenceNumber_key" ON "PatientGrievance"("referenceNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "VisitorLog_tokenNumber_key" ON "VisitorLog"("tokenNumber");
CREATE INDEX IF NOT EXISTS "VisitorLog_appointmentDate_idx" ON "VisitorLog"("appointmentDate");
CREATE INDEX IF NOT EXISTS "VisitorLog_status_idx" ON "VisitorLog"("status");
CREATE UNIQUE INDEX IF NOT EXISTS "Mandal_name_key" ON "Mandal"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "Village_name_mandalId_key" ON "Village"("name", "mandalId");
CREATE UNIQUE INDEX IF NOT EXISTS "PetitionRequest_trackingNumber_key" ON "PetitionRequest"("trackingNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "PublicWork_workCode_key" ON "PublicWork"("workCode");
CREATE UNIQUE INDEX IF NOT EXISTS "Letter_letterNumber_key" ON "Letter"("letterNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "PartyPost_title_level_wing_key" ON "PartyPost"("title", "level", "wing");
CREATE UNIQUE INDEX IF NOT EXISTS "BoothGrade_surveyId_boothNumber_key" ON "BoothGrade"("surveyId", "boothNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "FundAllocation_referenceNumber_key" ON "FundAllocation"("referenceNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "PollingBooth_boothNumber_mandalId_key" ON "PollingBooth"("boothNumber", "mandalId");
CREATE UNIQUE INDEX IF NOT EXISTS "Citizen_epicNumber_key" ON "Citizen"("epicNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "AssemblyQuestion_questionNumber_key" ON "AssemblyQuestion"("questionNumber");

-- Foreign keys (DO blocks to skip if already exists)
DO $$ BEGIN ALTER TABLE "Grievance" ADD CONSTRAINT "Grievance_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "Grievance" ADD CONSTRAINT "Grievance_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_grievanceId_fkey" FOREIGN KEY ("grievanceId") REFERENCES "Grievance"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "GrievanceStatusUpdate" ADD CONSTRAINT "GrievanceStatusUpdate_grievanceId_fkey" FOREIGN KEY ("grievanceId") REFERENCES "Grievance"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "GrievanceStatusUpdate" ADD CONSTRAINT "GrievanceStatusUpdate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "GovernmentProject" ADD CONSTRAINT "GovernmentProject_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "GovernmentProject" ADD CONSTRAINT "GovernmentProject_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "PatientGrievance" ADD CONSTRAINT "PatientGrievance_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "PatientGrievance" ADD CONSTRAINT "PatientGrievance_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "IndividualGrievance" ADD CONSTRAINT "IndividualGrievance_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "IndividualGrievance" ADD CONSTRAINT "IndividualGrievance_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "JobRequest" ADD CONSTRAINT "JobRequest_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "JobRequest" ADD CONSTRAINT "JobRequest_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "TTDRequest" ADD CONSTRAINT "TTDRequest_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "TTDRequest" ADD CONSTRAINT "TTDRequest_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "VisitorLog" ADD CONSTRAINT "VisitorLog_grievanceId_fkey" FOREIGN KEY ("grievanceId") REFERENCES "Grievance"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "VisitorLog" ADD CONSTRAINT "VisitorLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "GovernmentProject"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "ProjectStatusUpdate" ADD CONSTRAINT "ProjectStatusUpdate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "GovernmentProject"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "ProjectStatusUpdate" ADD CONSTRAINT "ProjectStatusUpdate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "Village" ADD CONSTRAINT "Village_mandalId_fkey" FOREIGN KEY ("mandalId") REFERENCES "Mandal"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "LocalLeader" ADD CONSTRAINT "LocalLeader_mandalId_fkey" FOREIGN KEY ("mandalId") REFERENCES "Mandal"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "LocalLeader" ADD CONSTRAINT "LocalLeader_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "PetitionRequest" ADD CONSTRAINT "PetitionRequest_mandalId_fkey" FOREIGN KEY ("mandalId") REFERENCES "Mandal"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "PetitionRequest" ADD CONSTRAINT "PetitionRequest_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "PetitionRequest" ADD CONSTRAINT "PetitionRequest_referredByLeaderId_fkey" FOREIGN KEY ("referredByLeaderId") REFERENCES "LocalLeader"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "PetitionRequest" ADD CONSTRAINT "PetitionRequest_handlingPaId_fkey" FOREIGN KEY ("handlingPaId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "PetitionRequest" ADD CONSTRAINT "PetitionRequest_assignedOfficialId_fkey" FOREIGN KEY ("assignedOfficialId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "RequestTimeline" ADD CONSTRAINT "RequestTimeline_petitionRequestId_fkey" FOREIGN KEY ("petitionRequestId") REFERENCES "PetitionRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "PublicWork" ADD CONSTRAINT "PublicWork_mandalId_fkey" FOREIGN KEY ("mandalId") REFERENCES "Mandal"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "PublicWork" ADD CONSTRAINT "PublicWork_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "PublicWork" ADD CONSTRAINT "PublicWork_requestedByLeaderId_fkey" FOREIGN KEY ("requestedByLeaderId") REFERENCES "LocalLeader"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "PublicWork" ADD CONSTRAINT "PublicWork_handlingPaId_fkey" FOREIGN KEY ("handlingPaId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "WorkTimeline" ADD CONSTRAINT "WorkTimeline_publicWorkId_fkey" FOREIGN KEY ("publicWorkId") REFERENCES "PublicWork"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "FileAttachment" ADD CONSTRAINT "FileAttachment_petitionRequestId_fkey" FOREIGN KEY ("petitionRequestId") REFERENCES "PetitionRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "FileAttachment" ADD CONSTRAINT "FileAttachment_publicWorkId_fkey" FOREIGN KEY ("publicWorkId") REFERENCES "PublicWork"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "LetterTimeline" ADD CONSTRAINT "LetterTimeline_letterId_fkey" FOREIGN KEY ("letterId") REFERENCES "Letter"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "PartyWorker" ADD CONSTRAINT "PartyWorker_partyPostId_fkey" FOREIGN KEY ("partyPostId") REFERENCES "PartyPost"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "PartyWorker" ADD CONSTRAINT "PartyWorker_mandalId_fkey" FOREIGN KEY ("mandalId") REFERENCES "Mandal"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "PartyWorker" ADD CONSTRAINT "PartyWorker_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "Task" ADD CONSTRAINT "Task_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "SurveyQuestion" ADD CONSTRAINT "SurveyQuestion_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "SurveyResponse" ADD CONSTRAINT "SurveyResponse_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "BoothGrade" ADD CONSTRAINT "BoothGrade_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "FundTimeline" ADD CONSTRAINT "FundTimeline_fundAllocationId_fkey" FOREIGN KEY ("fundAllocationId") REFERENCES "FundAllocation"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "PollingBooth" ADD CONSTRAINT "PollingBooth_mandalId_fkey" FOREIGN KEY ("mandalId") REFERENCES "Mandal"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "Household" ADD CONSTRAINT "Household_boothId_fkey" FOREIGN KEY ("boothId") REFERENCES "PollingBooth"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "Citizen" ADD CONSTRAINT "Citizen_boothId_fkey" FOREIGN KEY ("boothId") REFERENCES "PollingBooth"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "Citizen" ADD CONSTRAINT "Citizen_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "CampaignDelivery" ADD CONSTRAINT "CampaignDelivery_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "AQTimeline" ADD CONSTRAINT "AQTimeline_assemblyQuestionId_fkey" FOREIGN KEY ("assemblyQuestionId") REFERENCES "AssemblyQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
`;

fs.appendFileSync(path, sql);
console.log('Part 5 written OK, final file size: ' + fs.statSync(path).size);
