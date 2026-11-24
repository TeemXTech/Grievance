-- Baseline migration: full schema snapshot (safe to apply on existing DB)
-- All objects already exist from prisma db push. This file exists so
-- prisma migrate dev can use a shadow database going forward.
-- Every statement is wrapped in a DO block to skip if already exists.

DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('ADMIN','OFFICER','PUBLIC','MINISTER','PA','FIELD_OFFICER','BACK_OFFICER','GOVERNMENT_OFFICIAL','LOCAL_LEADER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "GrievanceStatus" AS ENUM ('PENDING','ASSIGNED','IN_PROGRESS','UNDER_REVIEW','RESOLVED','CLOSED','REJECTED','WIP');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "Priority" AS ENUM ('LOW','MEDIUM','HIGH','URGENT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "GrievanceCategory" AS ENUM ('HEALTH','JOBS','CIVIL_WORK','COLLECTIVE_REQUEST','CM_FUND','EDUCATION','AGRICULTURE','INFRASTRUCTURE','SOCIAL_WELFARE','TTD_SERVICES','PUBLIC_SERVICES','OTHER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "RequestOrigin" AS ENUM ('VILLAGE','MANDAL','DISTRICT','STATE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "IntakeMethod" AS ENUM ('BACK_OFFICE','WHATSAPP','PA_ENTRY','FIELD_ENTRY','ONLINE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ProjectStatus" AS ENUM ('COMPLETED','IN_PROGRESS','YET_TO_COMPLETE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "GrievanceType" AS ENUM ('PATIENT_ISSUE','INDIVIDUAL_ISSUE','JOB_REQUEST','TTD_REQUEST','OTHER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "VisitType" AS ENUM ('WALK_IN','APPOINTMENT','VIP','DELEGATION','MEDIA','OFFICIAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "VisitorStatus" AS ENUM ('WAITING','IN_MEETING','COMPLETED','CANCELLED','NO_SHOW');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "PetitionType" AS ENUM ('CMRF_MEDICAL','JOB_EMPLOYMENT','EMPLOYEE_TRANSFER','SCHEME_FINANCIAL','PERSONAL_GRIEVANCE','VILLAGE_WORK','TTD_DARSHAN','OTHER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "PetitionStatus" AS ENUM ('PENDING','SUBMITTED_TO_PA','ASSIGNED_TO_OFFICIAL','UNDER_REVIEW','SANCTIONED','RESOLVED','REJECTED','CLOSED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "WorkCategory" AS ENUM ('ROADS_BRIDGES','DRINKING_WATER','EDUCATION_SCHOOLS','HEALTH_CLINICS','ELECTRICITY_LIGHTS','COMMUNITY_HALL','DRAINAGE_SANITATION','IRRIGATION_LAKES','OTHER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "WorkStage" AS ENUM ('PLANNED','PROPOSED','SANCTIONED','TENDER_STAGE','IN_PROGRESS','COMPLETED','STUCK_DELAYED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "TourEventType" AS ENUM ('VILLAGE_TOUR','GRIEVANCE_DAY','DEPARTMENT_REVIEW','VIP_MEETING','PUBLIC_MEETING','PRESS_CONFERENCE','OTHER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "LetterDirection" AS ENUM ('INBOUND','OUTBOUND');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "LetterStatus" AS ENUM ('DRAFT','PENDING_APPROVAL','APPROVED','DISPATCHED','RECEIVED','ACKNOWLEDGED','FILED','CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "LetterType" AS ENUM ('DO_LETTER','OFFICIAL_LETTER','RECOMMENDATION','REPRESENTATION','NOTICE','CIRCULAR','MEMO','OTHER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "PartyPostLevel" AS ENUM ('STATE','DISTRICT','ASSEMBLY','MANDAL','VILLAGE','BOOTH');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "WorkerStatus" AS ENUM ('ACTIVE','INACTIVE','SUSPENDED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "OfficeType" AS ENUM ('SECRETARIAT','CONSTITUENCY','RESIDENCE','DISTRICT','OTHER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "TaskStatus" AS ENUM ('OPEN','IN_PROGRESS','PENDING_INFO','COMPLETED','CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "TaskPriority" AS ENUM ('LOW','MEDIUM','HIGH','URGENT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "SurveyStatus" AS ENUM ('DRAFT','ACTIVE','CLOSED','ARCHIVED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "QuestionType" AS ENUM ('YES_NO','RATING_1_5','MULTIPLE_CHOICE','TEXT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "FundScheme" AS ENUM ('MPLADS','MLACDS','STATE','OTHER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "FundAllocationStatus" AS ENUM ('RECOMMENDED','LETTER_SENT','ADMIN_SANCTION','TECH_SANCTION','TENDER_FLOATED','WORK_IN_PROGRESS','COMPLETED','CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "CitizenGender" AS ENUM ('MALE','FEMALE','OTHER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "CampaignChannel" AS ENUM ('WHATSAPP','SMS','BOTH');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT','PENDING_APPROVAL','APPROVED','SENDING','SENT','CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "AQType" AS ENUM ('STARRED','UNSTARRED','SHORT_NOTICE','CALLING_ATTENTION');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "AQStatus" AS ENUM ('RECEIVED','SENT_TO_DEPT','DRAFT_RECEIVED','UNDER_REVIEW','ANSWER_READY','ANSWERED','LAPSED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Tables missing from init migration (GovernmentProject and others added via db push)
CREATE TABLE IF NOT EXISTS "GovernmentProject" (
    "id" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL DEFAULT 'TEMP-PRJ-0000',
    "projectName" TEXT NOT NULL,
    "description" TEXT,
    "ministerName" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL,
    "estimatedCost" DOUBLE PRECISION,
    "actualCost" DOUBLE PRECISION,
    "startDate" TIMESTAMP(3),
    "completionDate" TIMESTAMP(3),
    "village" TEXT,
    "mandal" TEXT,
    "district" TEXT,
    "state" TEXT NOT NULL DEFAULT 'Telangana',
    "beneficiaries" INTEGER,
    "remarks" TEXT,
    "attachments" JSONB,
    "approvalDate" TIMESTAMP(3),
    "sanctionOrder" TEXT,
    "contractAssignment" TEXT,
    "documents" JSONB,
    "expectedCompletionDate" TIMESTAMP(3),
    "assignedToId" TEXT,
    "assignedBy" TEXT,
    "assignedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GovernmentProject_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "PatientGrievance" (
    "id" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL DEFAULT 'TEMP-PAT-0000',
    "patientName" TEXT NOT NULL,
    "patientPhone" TEXT NOT NULL,
    "village" TEXT,
    "caretakerName" TEXT,
    "caretakerPhone" TEXT,
    "issue" TEXT NOT NULL,
    "hospital" TEXT,
    "doctor" TEXT,
    "referredByName" TEXT,
    "referredByNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "assignedToId" TEXT,
    "qrCode" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PatientGrievance_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "IndividualGrievance" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mobileNumber" TEXT NOT NULL,
    "village" TEXT,
    "contactName" TEXT,
    "contactNumber" TEXT,
    "office" TEXT,
    "subject" TEXT NOT NULL,
    "referredByName" TEXT,
    "referredByNumber" TEXT,
    "assignedToId" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "IndividualGrievance_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "JobRequest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mobileNumber" TEXT NOT NULL,
    "village" TEXT,
    "contactName" TEXT,
    "contactNumber" TEXT,
    "office" TEXT,
    "subject" TEXT NOT NULL,
    "referredByName" TEXT,
    "referredByNumber" TEXT,
    "assignedToId" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "JobRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "TTDRequest" (
    "id" TEXT NOT NULL,
    "darshanDate" TIMESTAMP(3) NOT NULL,
    "darshanType" TEXT NOT NULL,
    "accommodationFrom" TIMESTAMP(3),
    "accommodationTo" TIMESTAMP(3),
    "guests" JSONB NOT NULL,
    "referenceName" TEXT,
    "referenceNumber" TEXT,
    "referenceVillage" TEXT,
    "referenceMandal" TEXT,
    "assignedToId" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TTDRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

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
DO $$ BEGIN ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;


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

CREATE TABLE IF NOT EXISTS "Letter" (
    "id" TEXT NOT NULL,
    "letterNumber" TEXT NOT NULL,
    "direction" "LetterDirection" NOT NULL DEFAULT 'OUTBOUND',
    "letterType" "LetterType" NOT NULL DEFAULT 'OFFICIAL_LETTER',
    "status" "LetterStatus" NOT NULL DEFAULT 'DRAFT',
    "subject" TEXT NOT NULL,
    "body" TEXT,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "fromName" TEXT NOT NULL,
    "fromDesignation" TEXT,
    "fromDepartment" TEXT,
    "fromAddress" TEXT,
    "toName" TEXT NOT NULL,
    "toDesignation" TEXT,
    "toDepartment" TEXT,
    "toAddress" TEXT,
    "letterDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "dispatchedAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3),
    "acknowledgedAt" TIMESTAMP(3),
    "linkedPetitionId" TEXT,
    "linkedWorkId" TEXT,
    "barcodeRef" TEXT,
    "fileUrl" TEXT,
    "draftedById" TEXT NOT NULL,
    "draftedByName" TEXT NOT NULL,
    "approvedById" TEXT,
    "approvedByName" TEXT,
    "privateNotes" TEXT,
    "fileNumber" TEXT,
    "eOfficeRef" TEXT,
    "endorsementText" TEXT,
    "endorsedById" TEXT,
    "endorsedByName" TEXT,
    "endorsedAt" TIMESTAMP(3),
    "recipientAcknowledgedBy" TEXT,
    "recipientAcknowledgedAt" TIMESTAMP(3),
    "currentlyWithName" TEXT,
    "currentlyWithDept" TEXT,
    "expectedReplyBy" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Letter_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "LetterTimeline" (
    "id" TEXT NOT NULL,
    "letterId" TEXT NOT NULL,
    "fromStatus" "LetterStatus",
    "toStatus" "LetterStatus" NOT NULL,
    "actionTaken" TEXT NOT NULL,
    "remarks" TEXT,
    "performedByName" TEXT NOT NULL,
    "performedByRole" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LetterTimeline_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "PartyPost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "wing" TEXT,
    "level" "PartyPostLevel" NOT NULL DEFAULT 'MANDAL',
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PartyPost_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "PartyWorker" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" VARCHAR(32) NOT NULL,
    "whatsappPhone" VARCHAR(32),
    "email" TEXT,
    "photoUrl" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "partyPostId" TEXT,
    "postTitle" TEXT,
    "wing" TEXT,
    "level" "PartyPostLevel" NOT NULL DEFAULT 'MANDAL',
    "district" TEXT DEFAULT 'Peddapalli',
    "mandalId" TEXT,
    "mandalName" TEXT,
    "villageId" TEXT,
    "villageName" TEXT,
    "boothNumber" TEXT,
    "status" "WorkerStatus" NOT NULL DEFAULT 'ACTIVE',
    "joinedPartyOn" TIMESTAMP(3),
    "lastActiveAt" TIMESTAMP(3),
    "voterId" TEXT,
    "aadharLast4" TEXT,
    "notes" TEXT,
    "privateNotes" TEXT,
    "addedById" TEXT,
    "addedByName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PartyWorker_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Office" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "officeType" "OfficeType" NOT NULL DEFAULT 'CONSTITUENCY',
    "address" TEXT,
    "city" TEXT,
    "phone" VARCHAR(32),
    "email" TEXT,
    "inChargeName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Office_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "officeId" TEXT,
    "officeName" TEXT,
    "assignedToId" TEXT,
    "assignedToName" TEXT,
    "assignedToRole" TEXT,
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdByRole" TEXT NOT NULL,
    "linkedPetitionId" TEXT,
    "linkedWorkId" TEXT,
    "linkedLetterId" TEXT,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "isOverdue" BOOLEAN NOT NULL DEFAULT false,
    "voiceNoteUrl" TEXT,
    "transcription" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Survey" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "SurveyStatus" NOT NULL DEFAULT 'DRAFT',
    "targetLevel" TEXT NOT NULL DEFAULT 'BOOTH',
    "languages" JSONB,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Survey_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "SurveyQuestion" (
    "id" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "questionType" "QuestionType" NOT NULL DEFAULT 'YES_NO',
    "questionText" TEXT NOT NULL,
    "questionTe" TEXT,
    "questionHi" TEXT,
    "options" JSONB,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SurveyQuestion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "SurveyResponse" (
    "id" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "boothNumber" TEXT,
    "villageName" TEXT,
    "mandalName" TEXT,
    "district" TEXT DEFAULT 'Peddapalli',
    "respondentName" TEXT,
    "respondentPhone" VARCHAR(32),
    "voterId" TEXT,
    "answers" JSONB NOT NULL,
    "collectedById" TEXT,
    "collectedByName" TEXT,
    "collectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SurveyResponse_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BoothGrade" (
    "id" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "boothNumber" TEXT NOT NULL,
    "villageName" TEXT,
    "mandalName" TEXT,
    "schemePenetrationScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "grievanceResolutionScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "surveysentimentScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "grade" TEXT NOT NULL DEFAULT 'C',
    "previousGrade" TEXT,
    "gradeDrop" BOOLEAN NOT NULL DEFAULT false,
    "responseCount" INTEGER NOT NULL DEFAULT 0,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BoothGrade_pkey" PRIMARY KEY ("id")
);

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
