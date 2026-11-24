-- CreateEnum (guarded — baseline may have already created these)
DO $$ BEGIN
  CREATE TYPE "VisitType" AS ENUM ('WALK_IN', 'APPOINTMENT', 'VIP', 'DELEGATION', 'MEDIA', 'OFFICIAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "VisitorStatus" AS ENUM ('WAITING', 'IN_MEETING', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Drop old VisitorLog table and recreate with full schema
-- (safe: no existing UI was using this table)
DROP TABLE IF EXISTS "VisitorLog";

-- CreateTable
CREATE TABLE "VisitorLog" (
    "id"              TEXT NOT NULL,
    "tokenNumber"     TEXT NOT NULL,
    "visitorName"     TEXT NOT NULL,
    "visitorPhone"    VARCHAR(32),
    "visitorAadhar"   TEXT,
    "visitorAddress"  TEXT,
    "organization"    TEXT,
    "visitType"       "VisitType" NOT NULL DEFAULT 'WALK_IN',
    "purpose"         TEXT NOT NULL,
    "appointmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkedInAt"     TIMESTAMP(3),
    "checkedOutAt"    TIMESTAMP(3),
    "meetingWith"     TEXT,
    "status"          "VisitorStatus" NOT NULL DEFAULT 'WAITING',
    "outcomeNotes"    TEXT,
    "priorityFlag"    BOOLEAN NOT NULL DEFAULT false,
    "grievanceId"     TEXT,
    "projectId"       TEXT,
    "petitionId"      TEXT,
    "loggedById"      TEXT,
    "notes"           TEXT,
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisitorLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "VisitorLog_tokenNumber_key" ON "VisitorLog"("tokenNumber");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "VisitorLog_appointmentDate_idx" ON "VisitorLog"("appointmentDate");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "VisitorLog_status_idx" ON "VisitorLog"("status");

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "VisitorLog" ADD CONSTRAINT "VisitorLog_grievanceId_fkey"
    FOREIGN KEY ("grievanceId") REFERENCES "Grievance"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "VisitorLog" ADD CONSTRAINT "VisitorLog_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "GovernmentProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
