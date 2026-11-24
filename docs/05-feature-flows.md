# 05 — Feature Flows

End-to-end flows for every major feature in the system.

---

## 1. Citizen Submits a Grievance (Online)

```
Citizen opens /dashboard → clicks "Submit Grievance"
        │
Fills form: title, description, phone, village, category
        │
POST /api/grievances
  ├── getAuthUser() → must be logged in (PUBLIC role allowed)
  ├── Zod validation (title min 5, description min 10, phone 10 digits)
  ├── generateReferenceNumber() → GRV-2025-0042
  ├── prisma.grievance.create({ status: PENDING, intakeMethod: ONLINE })
  ├── prisma.grievanceStatusUpdate.create({ oldStatus: null, newStatus: PENDING })
  └── createAuditLog({ action: CREATE, entityType: GRIEVANCE })
        │
Response: { referenceNumber: "GRV-2025-0042", qrCode: "QR-GRV-2025-0042" }
        │
Citizen can track at /track/QR-GRV-2025-0042 (no auth required)
```

---

## 2. Back Officer Enters a Grievance (Walk-in / Phone)

```
Back Officer logs in → /back-officer/dashboard
        │
Clicks "New Grievance" → fills form with citizen details
        │
POST /api/grievances
  ├── intakeMethod: BACK_OFFICE
  ├── Same flow as above
  └── Back Officer can also assign immediately: assignedToId = self
        │
Grievance appears in Back Officer's queue
```

---

## 3. PA Receives a Petition (Paper Slip at Office)

```
Citizen arrives at Minister's office with paper petition
        │
PA logs in → /pa/dashboard → "New Petition"
        │
POST /api/pa/petitions
  ├── getAuthUser() → must be MINISTER/PA/ADMIN
  ├── type: CMRF_MEDICAL / JOB_EMPLOYMENT / EMPLOYEE_TRANSFER / etc.
  ├── generateTrackingNumber() → REQ-CMRF-2025-0007
  ├── prisma.petitionRequest.create({ status: SUBMITTED_TO_PA })
  ├── prisma.requestTimeline.create({ actionTaken: "Petition logged in PA Office" })
  └── createAuditLog({ action: CREATE, entityType: PETITION })
        │
Petition appears in PA Command Center with SLA timer
        │
PA assigns to department:
  PATCH /api/pa/petitions/[id]
  ├── status: ASSIGNED_TO_OFFICIAL
  ├── assignedDepartment: "Revenue / MRO"
  ├── assignedOfficialName: "Sri Ramana"
  ├── prisma.requestTimeline.create({ actionTaken: "Assigned to Revenue dept" })
  └── createAuditLog({ action: STATUS_CHANGE })
```

---

## 4. WhatsApp Message → Auto Grievance → BACK_OFFICER Assignment

```
Citizen sends WhatsApp to central number:
  "water problem in my village urgent"
        │
Gupshup/Twilio webhook → POST /api/whatsapp/intake
  Authorization: Bearer wa-secret-change-in-production
        │
  ├── Auth: validates webhook secret
  ├── prisma.whatsAppMessage.create({ isProcessed: false })
  ├── detectCategory("water problem") → "DRINKING_WATER"
  ├── detectPriority("urgent") → "URGENT"
  ├── generateGrievanceRef() → GRV-2025-0043
  ├── pickBackOfficer()
  │     └── queries all BACK_OFFICERs, counts open grievances each
  │         picks the one with fewest → least-loaded officer
  ├── prisma.grievance.create({
  │     status: ASSIGNED,
  │     assignedToId: officer.id,
  │     grievanceCategory: DRINKING_WATER,
  │     priority: URGENT,
  │     intakeMethod: WHATSAPP
  │   })
  ├── prisma.grievanceStatusUpdate.create({ newStatus: ASSIGNED })
  ├── prisma.notification.create({ userId: officer.id, type: GRIEVANCE_ASSIGNED })
  └── prisma.whatsAppMessage.update({ isProcessed: true, grievanceId })
        │
Response includes trackingMessage:
  "Your grievance has been registered. Reference: GRV-2025-0043.
   Category: DRINKING WATER. Our team will contact you shortly."
        │
Back Officer sees notification in dashboard
Back Officer opens grievance, updates status, adds remarks
```

---

## 5. Visitor Check-In Flow

```
Visitor arrives at office
        │
Back Officer → /visitors/dashboard → "Register Visitor"
        │
POST /api/visitors
  ├── generateToken() → VIS-20250812-0034
  ├── prisma.visitorLog.create({ status: WAITING, visitType: WALK_IN })
  └── Token printed / shown to visitor
        │
Visitor called in:
  PATCH /api/visitors/[id]  { action: "CHECK_IN", meetingWith: "PA Srinivas" }
  ├── status: IN_MEETING
  ├── checkedInAt: now()
  └── createAuditLog({ action: STATUS_CHANGE, entityType: VISITOR })
        │
Meeting ends:
  PATCH /api/visitors/[id]  { action: "CHECK_OUT", outcomeNotes: "Referred to Revenue dept" }
  ├── status: COMPLETED
  ├── checkedOutAt: now()
  └── createAuditLog()
        │
Optional: Convert to Petition
  POST /api/visitors/[id]/convert-to-petition
  └── Creates PetitionRequest linked to this visitor
```

---

## 6. Minister's Morning Briefing

```
Minister logs in → /minister/dashboard
        │
GET /api/reports/nightly-briefing
  Single DB call (Promise.all of 16 queries):
  ├── petitionsToday, petitionsOverdue, criticalPetitions
  ├── tasksOverdue, tasksUrgentOpen, tasksDueToday
  ├── lettersOverdue, lettersDraftPending
  ├── fundsStuck, fundsStuckList
  ├── visitorsToday, visitorsWaiting
  ├── criticalBooths (grade D)
  ├── worksStuck
  └── recentTimeline (last 10 actions)
        │
Response includes redFlags array:
  ["5 overdue petitions need urgent follow-up",
   "2 fund allocations are stuck in bureaucracy",
   "3 booths graded D — require tour/camp visit"]
        │
Minister sees executive digest on dashboard
```

---

## 7. Public Work Lifecycle

```
PA creates work:
  POST /api/minister/projects
  ├── generateWorkCode(category) → WRK-RD-2025-0015
  ├── prisma.publicWork.create({ stage: PLANNED })
  ├── prisma.workTimeline.create({ stage: PLANNED, percentageDone: 0 })
  └── createAuditLog({ action: CREATE, entityType: PUBLIC_WORK })
        │
Stage advances (Sanctioned → Tender → In Progress):
  PATCH /api/minister/projects/[id]  { stage: "IN_PROGRESS", milestoneNote: "Earth work started" }
  ├── prisma.publicWork.update({ stage: IN_PROGRESS })
  ├── prisma.workTimeline.create({ stage: IN_PROGRESS, percentageDone: 20, updateNote: "Earth work started" })
  └── createAuditLog({ action: STATUS_CHANGE })
        │
Work completed:
  PATCH /api/minister/projects/[id]  { stage: "COMPLETED" }
  ├── actualCompletionDate: now()
  ├── prisma.workTimeline.create({ percentageDone: 100 })
  └── createAuditLog()
```

---

## 8. Letter Dispatch Flow

```
PA drafts letter:
  POST /api/letters
  ├── generateLetterNumber("OUTBOUND") → LTR-OUT-2025-0003
  ├── prisma.letter.create({ status: DRAFT })
  └── prisma.letterTimeline.create({ toStatus: DRAFT, actionTaken: "Letter created" })
        │
PA submits for approval:
  PATCH /api/letters/[id]  { status: "PENDING_APPROVAL" }
  └── prisma.letterTimeline.create({ fromStatus: DRAFT, toStatus: PENDING_APPROVAL })
        │
Minister/PA approves:
  PATCH /api/letters/[id]  { status: "APPROVED", approvedByName: "PA Srinivas" }
  ├── approvedById: user.id
  └── prisma.letterTimeline.create({ toStatus: APPROVED })
        │
Dispatched:
  PATCH /api/letters/[id]  { status: "DISPATCHED" }
  ├── dispatchedAt: now()
  └── prisma.letterTimeline.create({ toStatus: DISPATCHED })
```

---

## 9. WhatsApp Campaign Flow

```
PA creates campaign:
  POST /api/campaigns
  ├── messageTemplate: "Dear {{Citizen_Name}}, your water issue has been resolved."
  ├── segmentQuery: { mandal: "Manthani", scheme: "PM_AWAS" }
  ├── Counts matching citizens with whatsappOptIn: true → recipientCount: 342
  └── status: DRAFT
        │
PA submits for approval:
  PATCH /api/campaigns/[id]  { status: "PENDING_APPROVAL" }
        │
Different PA/ADMIN approves (two-key rule):
  POST /api/campaigns/[id]/approve
  ├── Checks: campaign.createdById ≠ user.id  (two-key enforcement)
  └── status: APPROVED
        │
PA sends:
  POST /api/campaigns/[id]/send
  ├── Queries citizens matching segmentQuery with whatsappOptIn: true
  ├── Renders message per citizen (substitutes {{Citizen_Name}})
  ├── prisma.campaignDelivery.createMany() — one record per recipient
  ├── Sends in batches of 10 via lib/whatsapp-sender.ts
  │     Provider selected by WHATSAPP_PROVIDER env var:
  │     gupshup → Gupshup API
  │     twilio  → Twilio API
  │     meta    → Meta Cloud API
  │     stub    → console.log (default in dev)
  ├── Per-message success/fail tracked in CampaignDelivery
  └── status: SENT, sentCount: N, failedCount: N
```

---

## 10. Constituency Survey → Booth Grading

```
PA creates survey:
  POST /api/surveys
  ├── questions: [{ questionText: "Is drinking water available?", questionType: YES_NO, weight: 2.0 }]
  └── status: DRAFT
        │
PA activates:
  PATCH /api/surveys/[id]  { status: "ACTIVE" }
        │
Field Officer collects responses in village:
  POST /api/surveys/[id]/responses
  ├── boothNumber: "42"
  ├── answers: { "questionId1": "YES", "questionId2": "3" }
  ├── GPS: { latitude: 18.45, longitude: 79.12 }
  └── collectedByName: user.name
        │
PA computes booth grades:
  POST /api/surveys/[id]/grade
  ├── Aggregates responses per booth
  ├── Calculates weighted score
  ├── Grade: A (>80) / B (60-80) / C (40-60) / D (<40)
  └── prisma.boothGrade.upsert() per booth
        │
Minister sees D-grade booths in morning briefing
Minister plans tour to those booths
```

---

## 11. Fund Allocation Tracking

```
PA recommends fund:
  POST /api/funds
  ├── generateRefNumber("MLACDS") → FUND-MLACDS-2025-0001
  ├── recommendedAmount: 2500000
  └── status: RECOMMENDED
        │
Stages advance as bureaucracy processes:
  PATCH /api/funds/[id]  { status: "ADMIN_SANCTION", adminSanctionDate: "2025-03-15" }
  PATCH /api/funds/[id]  { status: "TECH_SANCTION" }
  PATCH /api/funds/[id]  { status: "TENDER_FLOATED" }
  PATCH /api/funds/[id]  { status: "WORK_IN_PROGRESS" }
        │
Stuck detection:
  If stage exceeds threshold days (e.g. ADMIN_SANCTION > 45 days):
  → isStuck: true, stuckSince: set
  → Appears in Minister's morning briefing redFlags
        │
Completed:
  PATCH /api/funds/[id]  { status: "COMPLETED", completionDate: "2025-09-01" }
```

---

## 12. Field Officer Daily Workflow

```
Field Officer logs in → /field-officer/dashboard
        │
GET /api/field/assigned-tasks
  ├── petitions: where assignedOfficialId = user.id
  ├── tasks: where assignedToId = user.id
  └── works: where mandalName IN (mandals from their assigned petitions)
             OR villageName IN (villages from their assigned petitions)
        │
Field Officer visits village, updates petition:
  POST /api/field/update-status
  ├── petitionId: "xxx"
  ├── status: "UNDER_REVIEW"
  └── remarks: "Visited site, issue confirmed, forwarding to MRO"
        │
Field Officer submits survey response:
  POST /api/surveys/[id]/responses
  └── GPS coordinates captured automatically
```

---

## 13. Audit Trail

Every sensitive write in the system calls `createAuditLog()`:

```typescript
await createAuditLog({
  action:     "STATUS_CHANGE",
  entityType: "PETITION",
  entityId:   petition.id,
  userId:     user.id,
  oldValues:  { status: "PENDING" },
  newValues:  { status: "RESOLVED" },
})
```

The audit log:
- Is **immutable** — no DELETE handler on `/api/audit-logs`
- Captures IP address and user agent from request headers
- Is readable only by ADMIN and MINISTER
- Stores JSON snapshots of old and new values

Actions logged: CREATE, UPDATE, DELETE, STATUS_CHANGE, APPROVE, DISPATCH, LOGIN, ASSIGN, EXPORT, GRADE_COMPUTE, CRON_MANUAL_TRIGGER

---

## 14. WhatsApp Inbound — Multilingual AI Flow

```
Citizen sends WhatsApp (any language — Telugu/Hindi/Urdu/English/mixed):
  e.g. "నాకు నీళ్ళు రావడం లేదు urgent"
        │
Provider webhook → POST /api/whatsapp/intake
  Authorization: Bearer <WHATSAPP_WEBHOOK_SECRET>
        │
  ├── 1. Store raw message + mediaUrl/mediaType/mediaCaption
  ├── 2. generateGrievanceRef() → GRV-2026-0043
  ├── 3. parseMessageWithAI(message, referenceNumber)
  │     └── Gemini prompt returns JSON:
  │           { language: "te", category: "CIVIL_WORK", priority: "URGENT",
  │             applicantName: "", villageName: "", mandalName: "",
  │             issue: "No water supply",
  │             replyMessage: "మీ ఫిర్యాదు నమోదైంది. రిఫరెన్స్: GRV-2026-0043" }
  │     └── Falls back to keyword detection if Gemini unavailable
  ├── 4. pickBackOfficer() — least-loaded by open grievance count
  ├── 5. prisma.grievance.create({ intakeMethod: WHATSAPP, ... })
  ├── 6. If mediaUrl present → prisma.attachment.create() linked to grievance
  ├── 7. prisma.notification.create() for assigned officer
  ├── 8. prisma.whatsAppMessage.update({ isProcessed: true })
  └── 9. sendWhatsApp(phone, replyMessage) — reply in Telugu script
```

---

## 15. Assembly Question (LAQ/LCQ) Flow

```
PA receives question from Assembly Secretariat:
  POST /api/assembly-questions
  ├── questionType: "STARRED"
  ├── generateQuestionNumber("STARRED") → LAQ-2026-0142
  ├── Gemini auto-generates 5-6 talkingPoints for Minister
  ├── prisma.assemblyQuestion.create({ status: RECEIVED })
  └── prisma.aQTimeline.create({ actionTaken: "Question received and registered" })
        │
PA forwards to department:
  PATCH /api/assembly-questions/[id]
  ├── status: "SENT_TO_DEPT"
  ├── sentToDeptName: "Panchayat Raj Department"
  ├── sentToDeptAt: auto-set
  └── AQTimeline entry created
        │
Draft answer received:
  PATCH /api/assembly-questions/[id]
  ├── status: "DRAFT_RECEIVED"
  ├── draftAnswerText: "..."
  ├── draftReceivedAt: auto-set
  └── Pass regenerateTalkingPoints: true → Gemini re-generates with draft context
        │
Minister reviews and approves:
  PATCH /api/assembly-questions/[id]  { status: "ANSWER_READY", finalAnswerText: "..." }
        │
Answered in Assembly:
  PATCH /api/assembly-questions/[id]  { status: "ANSWERED", answeredDate: "2026-03-15" }
```

---

## 16. Overdue Escalation Cron

```
Daily at 00:05 IST (18:35 UTC) — Vercel cron or Windows Task Scheduler
        │
POST /api/cron/overdue
  Authorization: Bearer <CRON_SECRET>
        │
  runOverdueEscalation() — all 4 run in Promise.all:
  │
  ├── escalatePetitions(now)
  │     ├── findMany where dueDate < now AND isOverdue=false AND status not terminal
  │     ├── updateMany → isOverdue: true
  │     └── notification.createMany() → all PA users
  │
  ├── escalateTasks(now)
  │     ├── updateMany where dueDate < now AND isOverdue=false AND status not terminal
  │     └── notification.createMany() → all PA/ADMIN users
  │
  ├── countOverdueLetters(now)
  │     └── count where dueDate < now AND status not FILED/CANCELLED/ACKNOWLEDGED
  │         (no flag update — live count only)
  │
  └── escalateFunds(now)
        ├── findMany where updatedAt < 30 days ago AND isStuck=false AND status not terminal
        ├── updateMany → isStuck: true, stuckSince: now
        └── notification.createMany() → all PA/ADMIN users
        │
Returns: { petitionsMarked, tasksMarked, overdueLetters, fundsMarkedStuck, ranAt }
```

Manual trigger: POST with MINISTER/PA/ADMIN session — audit-logged with result counts.
