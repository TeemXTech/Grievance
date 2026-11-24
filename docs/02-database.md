# 02 — Database Schema

Single PostgreSQL database managed by Prisma. Schema file: `prisma/schema.prisma`.

---

## Entity Relationship Overview

```
User ──────────────────────────────────────────────────────────────────┐
 │                                                                      │
 ├── Grievance (assignedTo, statusUpdates)                             │
 ├── PetitionRequest (handlingPa, assignedOfficial)                    │
 ├── PublicWork (handlingPa)                                           │
 ├── GovernmentProject (assignedTo, createdBy)                         │
 ├── AuditLog                                                          │
 ├── Notification                                                      │
 ├── CalendarEvent                                                     │
 └── GrievanceStatusUpdate                                             │
                                                                        │
Mandal ──── Village ──── LocalLeader                                   │
  │              │                                                      │
  ├── PetitionRequest                                                   │
  ├── PublicWork                                                        │
  ├── PartyWorker                                                       │
  └── PollingBooth ──── Household ──── Citizen                         │
                                                                        │
Survey ──── SurveyQuestion                                             │
  │    └─── SurveyResponse                                             │
  └──────── BoothGrade                                                 │
                                                                        │
Campaign ──── CampaignDelivery                                         │
Letter   ──── LetterTimeline                                           │
FundAllocation ── FundTimeline                                         │
PartyPost ──── PartyWorker                                             │
Office    ──── Task                                                    │
AssemblyQuestion ──── AQTimeline                                       │
WhatsAppMessage (mediaUrl, mediaType, mediaCaption, grievanceId)       │
```

---

## Models

### User
The central identity model. Every action in the system is tied to a User.

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | Primary key |
| name | String | Full name |
| email | String (unique) | Login email |
| passwordHash | String | bcrypt cost 12 |
| role | Role enum | See roles below |
| phone | String? | VarChar(32) |
| status | String? | "active" / "inactive" |
| language | String? | "en" / "te" / "hi" |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

---

### Grievance
The core public grievance model. Submitted by citizens, managed by officers.

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| referenceNumber | String (unique) | `GRV-YYYY-NNNN` |
| title | String | Min 5 chars |
| description | String | Min 10 chars |
| status | GrievanceStatus | PENDING → ASSIGNED → IN_PROGRESS → RESOLVED |
| priority | Priority | LOW / MEDIUM / HIGH / URGENT |
| requesterName | String | Citizen name |
| requesterPhone | String | VarChar(32) |
| requesterEmail | String? | Optional |
| requesterAddress | String? | |
| village / mandal / district | String? | Location |
| grievanceCategory | GrievanceCategory | HEALTH, JOBS, CIVIL_WORK, etc. |
| intakeMethod | IntakeMethod | ONLINE / WHATSAPP / BACK_OFFICE / PA_ENTRY / FIELD_ENTRY |
| assignedToId | String? | FK → User |
| assignedBy | String? | Name of who assigned |
| assignedAt | DateTime? | When assigned |
| categoryId | String? | FK → Category |
| qrCode | String? | For physical tracking |
| createdAt / updatedAt | DateTime | Auto |

Relations: `assignedTo` (User), `category` (Category), `attachments` (Attachment[]), `statusUpdates` (GrievanceStatusUpdate[]), `visitorLogs` (VisitorLog[])

---

### PetitionRequest
The main operational model. Replaces paper slips at the Minister's office.

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| trackingNumber | String (unique) | `REQ-{TYPE}-YYYY-NNNN` |
| type | PetitionType | CMRF_MEDICAL, JOB_EMPLOYMENT, EMPLOYEE_TRANSFER, etc. |
| title / description | String | |
| priority | Priority | |
| status | PetitionStatus | PENDING → SUBMITTED_TO_PA → ASSIGNED_TO_OFFICIAL → RESOLVED |
| applicantName / applicantPhone | String | Citizen details |
| applicantAadhar | String? | Sensitive — PA/ADMIN only |
| district / mandalName / villageName | String? | Location |
| mandalId / villageId | String? | FK → Mandal / Village |
| referredByLeaderId | String? | FK → LocalLeader |
| handlingPaId | String? | FK → User (PA role) |
| assignedOfficialId | String? | FK → User |
| assignedDepartment | String? | e.g. "Revenue / MRO" |
| privateNotes | String? | MINISTER / PA / ADMIN only |
| hospitalName / medicalCondition | String? | CMRF fields |
| requestedAmount / sanctionedAmount | Float? | Financial fields |
| currentPosting / requestedPosting | String? | Transfer fields |
| daysAllowed | Int? | SLA target (default 7) |
| isOverdue | Boolean | Auto-flagged |
| dueDate | DateTime? | createdAt + daysAllowed |
| resolvedAt | DateTime? | When resolved |
| qrCode | String? | |

Relations: `timeline` (RequestTimeline[]), `attachments` (FileAttachment[]), `referredByLeader` (LocalLeader), `handlingPa` (User), `assignedOfficial` (User), `mandal` (Mandal), `village` (Village)

---

### PublicWork
Constituency infrastructure works. Tracked from PLANNED to COMPLETED.

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| workCode | String (unique) | `WRK-{CAT}-YYYY-NNNN` |
| title | String | e.g. "BT Road to Harijanawada" |
| category | WorkCategory | ROADS_BRIDGES, DRINKING_WATER, etc. |
| stage | WorkStage | PLANNED → SANCTIONED → IN_PROGRESS → COMPLETED |
| district / mandalName / villageName | String | Location |
| estimatedBudget / sanctionedBudget / spentBudget | Float? | Financials |
| contractorName / contractorPhone | String? | |
| supervisingOfficial / executingDepartment | String? | |
| privateNotes | String? | MINISTER / PA / ADMIN only |
| stuckReason | String? | If STUCK_DELAYED |
| handlingPaId | String? | FK → User |

Relations: `milestones` (WorkTimeline[]), `attachments` (FileAttachment[]), `requestedByLeader` (LocalLeader), `handlingPa` (User)

---

### VisitorLog
Walk-in and appointment visitor tracking at the Minister's office.

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| tokenNumber | String (unique) | `VIS-YYYYMMDD-NNNN` |
| visitorName | String | |
| visitorPhone | String? | VarChar(32) |
| visitorAadhar | String? | Last 4 digits only |
| organization | String? | Delegation / party / dept |
| visitType | VisitType | WALK_IN / APPOINTMENT / VIP / DELEGATION / MEDIA / OFFICIAL |
| purpose | String | |
| appointmentDate | DateTime | |
| checkedInAt / checkedOutAt | DateTime? | |
| meetingWith | String? | Officer/staff name |
| status | VisitorStatus | WAITING → IN_MEETING → COMPLETED |
| outcomeNotes | String? | What was decided |
| priorityFlag | Boolean | VIP / urgent flag |
| grievanceId / projectId / petitionId | String? | Links to other entities |
| loggedById | String? | Staff who logged |

---

### Letter
Inbound and outbound official correspondence.

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| letterNumber | String (unique) | `LTR-IN/OUT-YYYY-NNNN` |
| direction | LetterDirection | INBOUND / OUTBOUND |
| letterType | LetterType | DO_LETTER / OFFICIAL_LETTER / RECOMMENDATION / etc. |
| status | LetterStatus | DRAFT → PENDING_APPROVAL → APPROVED → DISPATCHED → FILED |
| subject / body | String | |
| priority | Priority | |
| fromName / fromDesignation / fromDepartment | String | Sender |
| toName / toDesignation / toDepartment | String | Recipient |
| letterDate / dueDate | DateTime | |
| dispatchedAt / receivedAt / acknowledgedAt | DateTime? | Stage timestamps |
| linkedPetitionId / linkedWorkId | String? | Cross-links |
| fileUrl | String? | Scanned copy |
| draftedById / draftedByName | String | Who created |
| approvedById / approvedByName | String? | Who approved |
| privateNotes | String? | MINISTER / PA / ADMIN only |

Relations: `timeline` (LetterTimeline[])

---

### PartyWorker
Party worker registry with geo-scope and post assignment.

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| name / phone | String | Required |
| whatsappPhone | String? | |
| partyPostId | String? | FK → PartyPost |
| postTitle / wing | String? | Denormalised |
| level | PartyPostLevel | STATE / DISTRICT / ASSEMBLY / MANDAL / VILLAGE / BOOTH |
| mandalId / villageId | String? | FK → Mandal / Village |
| boothNumber | String? | |
| status | WorkerStatus | ACTIVE / INACTIVE / SUSPENDED |
| voterId | String? | EPIC — MINISTER/PA/ADMIN only |
| aadharLast4 | String? | MINISTER/PA/ADMIN only |
| privateNotes | String? | MINISTER/PA/ADMIN only |

---

### Survey + SurveyQuestion + SurveyResponse + BoothGrade
Constituency survey engine with booth grading.

**Survey**: title, status (DRAFT/ACTIVE/CLOSED), targetLevel (BOOTH/VILLAGE/MANDAL), languages (JSON array)

**SurveyQuestion**: questionText (English), questionTe (Telugu), questionHi (Hindi), questionType (YES_NO / RATING_1_5 / MULTIPLE_CHOICE / TEXT), weight (for scoring)

**SurveyResponse**: answers (JSON `{questionId: answer}`), boothNumber, GPS coordinates, respondent details (optional/anonymous)

**BoothGrade**: computed score per booth — schemePenetrationScore + grievanceResolutionScore + surveysentimentScore = totalScore → grade A/B/C/D

---

### FundAllocation
MLACDS / MPLADS fund tracking through bureaucratic stages.

| Stage | Field set |
|-------|-----------|
| RECOMMENDED | recommendationDate |
| LETTER_SENT | — |
| ADMIN_SANCTION | adminSanctionDate |
| TECH_SANCTION | techSanctionDate |
| TENDER_FLOATED | tenderDate |
| WORK_IN_PROGRESS | firstInstallmentDate |
| COMPLETED | finalInstallmentDate, completionDate |

Stuck detection: if a stage exceeds its threshold days (30–180 days depending on stage), `isStuck = true` and `stuckSince` is set.

---

### Citizen + Household + PollingBooth
Living constituency voter database.

**PollingBooth**: boothNumber, totalVoters, maleVoters, femaleVoters, currentGrade (A/B/C/D)

**Household**: houseNumber, address, schemeBenefits (JSON), linked to booth

**Citizen**: epicNumber (EPIC/Voter ID, unique), name, fatherOrHusband, age, gender, phone, whatsappOptIn, schemeBenefits (JSON), dataSource (ECI_ROLL / CAMP_OFFICE / SURVEY / MANUAL)

---

### Campaign + CampaignDelivery
Outbound WhatsApp/SMS campaigns with two-key approval.

**Campaign**: messageTemplate (with `{{Citizen_Name}}` variables), channel (WHATSAPP/SMS/BOTH), segmentQuery (JSON filter), status (DRAFT → PENDING_APPROVAL → APPROVED → SENDING → SENT)

**Two-key rule**: approver must be a different user from creator.

**CampaignDelivery**: one record per recipient, rendered message, delivery status (PENDING/SENT/DELIVERED/READ/FAILED)

---

### AuditLog
Immutable. Never deleted. Every sensitive action writes here.

| Field | Notes |
|-------|-------|
| action | CREATE / UPDATE / DELETE / STATUS_CHANGE / APPROVE / DISPATCH / LOGIN |
| entityType | GRIEVANCE / PETITION / PUBLIC_WORK / VISITOR / LETTER / etc. |
| entityId | ID of the affected record |
| userId | FK → User who performed the action |
| oldValues / newValues | JSON snapshots |
| ipAddress / userAgent | From request headers |

---

### Letter — Peshi / Secretariat Fields
Added to the Letter model for physical file movement tracking.

| Field | Type | Notes |
|-------|------|-------|
| fileNumber | String? | Physical file no. e.g. `GO/RT/123/2026` or e-Office ref |
| eOfficeRef | String? | e-Office system reference number |
| endorsementText | String? | Minister's handwritten instruction. MINISTER/PA/ADMIN only to set. |
| endorsedById / endorsedByName | String? | Who endorsed — auto-set when endorsementText added |
| endorsedAt | DateTime? | When endorsement was added — auto-set |
| recipientAcknowledgedBy | String? | Name of person at receiving office who acknowledged |
| recipientAcknowledgedAt | DateTime? | When they acknowledged — auto-set on ACKNOWLEDGED status |
| currentlyWithName / currentlyWithDept | String? | Which officer/desk currently holds this file |
| expectedReplyBy | DateTime? | Deadline for reply from recipient department |

Security: only MINISTER, PA, ADMIN can set `endorsementText`. BACK_OFFICER gets 403 if they attempt it.

---

### AssemblyQuestion
Tracks Legislative Assembly Questions (LAQ/LCQ) related to the Minister's portfolio.

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| questionNumber | String (unique) | `LAQ-YYYY-NNNN` (STARRED), `LCQ-YYYY-NNNN` (UNSTARRED), `AQ-YYYY-NNNN` (others) |
| sessionName | String | e.g. "Budget Session 2026" |
| questionType | AQType | STARRED / UNSTARRED / SHORT_NOTICE / CALLING_ATTENTION |
| status | AQStatus | RECEIVED → SENT_TO_DEPT → DRAFT_RECEIVED → UNDER_REVIEW → ANSWER_READY → ANSWERED / LAPSED |
| subject | String | One-line subject |
| questionText | String | Full question text |
| askedByMLA | String | MLA name who raised the question |
| askedByConstituency | String? | MLA's constituency |
| ministry / department | String | Which ministry/dept this falls under |
| receivedDate / answerDueDate / answeredDate | DateTime? | Key dates |
| sentToDeptAt / sentToDeptName | DateTime? / String? | When/where forwarded |
| draftReceivedAt / draftAnswerText | DateTime? / String? | Draft from department |
| finalAnswerText | String? | Approved final answer |
| talkingPoints | String? | AI-generated bullet points for Minister — auto-created on POST, regeneratable on PATCH |
| linkedPetitionId / linkedWorkId / linkedLetterId | String? | Cross-links |
| fileUrl | String? | Scanned question paper |
| handledById / handledByName | String? | PA/ADMIN handling this |
| privateNotes | String? | MINISTER/PA/ADMIN only |

Relations: `timeline` (AQTimeline[])

**AQTimeline**: fromStatus, toStatus, actionTaken, remarks, performedByName, performedByRole, createdAt

---

### WhatsAppMessage
Raw inbound WhatsApp messages before processing.

| Field | Notes |
|-------|-------|
| phone | Sender's phone number |
| message / rawText | Message content |
| isProcessed | false until grievance is created |
| grievanceId | Set after auto-processing |
| processedAt | Timestamp of processing |
| mediaUrl | URL of image/doc/audio sent by citizen |
| mediaType | image / document / audio / video |
| mediaCaption | Caption the citizen sent with the media |

---

## Enums

### Role
```
MINISTER > PA > ADMIN > BACK_OFFICER > OFFICER > FIELD_OFFICER > LOCAL_LEADER > PUBLIC
```

### GrievanceStatus
`PENDING → ASSIGNED → IN_PROGRESS → UNDER_REVIEW → RESOLVED → CLOSED → REJECTED → WIP`

### PetitionStatus
`PENDING → SUBMITTED_TO_PA → ASSIGNED_TO_OFFICIAL → UNDER_REVIEW → SANCTIONED → RESOLVED → REJECTED → CLOSED`

### WorkStage
`PLANNED → PROPOSED → SANCTIONED → TENDER_STAGE → IN_PROGRESS → COMPLETED → STUCK_DELAYED`

### Priority
`LOW | MEDIUM | HIGH | URGENT`

### IntakeMethod
`ONLINE | WHATSAPP | BACK_OFFICE | PA_ENTRY | FIELD_ENTRY`

### GrievanceCategory
`HEALTH | JOBS | CIVIL_WORK | COLLECTIVE_REQUEST | CM_FUND | EDUCATION | AGRICULTURE | INFRASTRUCTURE | SOCIAL_WELFARE | TTD_SERVICES | PUBLIC_SERVICES | OTHER`

### PetitionType
`CMRF_MEDICAL | JOB_EMPLOYMENT | EMPLOYEE_TRANSFER | SCHEME_FINANCIAL | PERSONAL_GRIEVANCE | VILLAGE_WORK | TTD_DARSHAN | OTHER`

### WorkCategory
`ROADS_BRIDGES | DRINKING_WATER | EDUCATION_SCHOOLS | HEALTH_CLINICS | ELECTRICITY_LIGHTS | COMMUNITY_HALL | DRAINAGE_SANITATION | IRRIGATION_LAKES | OTHER`

### LetterType
`DO_LETTER | OFFICIAL_LETTER | RECOMMENDATION | REPRESENTATION | NOTICE | CIRCULAR | MEMO | OTHER`

### FundAllocationStatus
`RECOMMENDED | LETTER_SENT | ADMIN_SANCTION | TECH_SANCTION | TENDER_FLOATED | WORK_IN_PROGRESS | COMPLETED | CANCELLED`

### PartyPostLevel
`STATE | DISTRICT | ASSEMBLY | MANDAL | VILLAGE | BOOTH`

### VisitType
`WALK_IN | APPOINTMENT | VIP | DELEGATION | MEDIA | OFFICIAL`

### VisitorStatus
`WAITING | IN_MEETING | COMPLETED | CANCELLED | NO_SHOW`

### AQType (Assembly Question Type)
`STARRED | UNSTARRED | SHORT_NOTICE | CALLING_ATTENTION`

### AQStatus (Assembly Question Status)
`RECEIVED | SENT_TO_DEPT | DRAFT_RECEIVED | UNDER_REVIEW | ANSWER_READY | ANSWERED | LAPSED`

### LetterStatus
`DRAFT | PENDING_APPROVAL | APPROVED | DISPATCHED | RECEIVED | ACKNOWLEDGED | FILED | CANCELLED`

### AuditAction (full list)
`CREATE | UPDATE | DELETE | LOGIN | LOGOUT | VIEW | ASSIGN | STATUS_CHANGE | EXPORT | APPROVE | DISPATCH | GRADE_COMPUTE | CRON_MANUAL_TRIGGER`

### AuditEntityType (full list)
`GRIEVANCE | USER | CATEGORY | ATTACHMENT | PETITION | PUBLIC_WORK | VISITOR | LETTER | PARTY_WORKER | PARTY_POST | OFFICE | TASK | SURVEY | SURVEY_RESPONSE | FUND_ALLOCATION | GOVERNMENT_PROJECT | TOUR_APPOINTMENT | CITIZEN | HOUSEHOLD | POLLING_BOOTH | CAMPAIGN | SYSTEM | ASSEMBLY_QUESTION`
