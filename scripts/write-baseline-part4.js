const fs = require('fs');
const path = 'd:\\Grievance\\prisma\\migrations\\20250814000000_baseline_full_schema\\migration.sql';

const sql = `
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
`;

fs.appendFileSync(path, sql);
console.log('Part 4 written OK, file size: ' + fs.statSync(path).size);
