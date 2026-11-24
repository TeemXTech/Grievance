const fs = require('fs');
const path = 'd:\\Grievance\\prisma\\migrations\\20250812060738_baseline_full_schema\\migration.sql';

const existing = fs.readFileSync(path, 'utf8');

const enumSection = `-- Baseline migration: full schema snapshot (safe to apply on existing DB)
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

`;

fs.writeFileSync(path, enumSection + existing);
console.log('Baseline file rebuilt with enums prepended. Size: ' + fs.statSync(path).size);
