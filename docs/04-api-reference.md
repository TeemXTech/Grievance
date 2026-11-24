# 04 — API Reference

All routes are under `/api/`. All return JSON. Auth required unless noted.

Legend: 🔒 = requires auth | 👁 = read roles | ✏️ = write roles | 🌐 = public (no auth)

---

## Auth

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/auth/[...nextauth]` | 🌐 | NextAuth login/logout/session |
| GET | `/api/auth/session` | 🌐 | Get current session |

---

## Grievances

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/grievances` | 👁 All roles | List grievances. PUBLIC scoped to their phone. |
| POST | `/api/grievances` | ✏️ All except FIELD_OFFICER | Create grievance. Zod validated. |
| GET | `/api/grievances/[id]` | 👁 All roles | Get single grievance with status history |
| PUT | `/api/grievances/[id]` | ✏️ MINISTER/PA/ADMIN/BACK_OFFICER/OFFICER | Update status, assignment, priority |
| GET | `/api/grievances/search` | 👁 | Full-text search |
| GET | `/api/grievances/by-mobile` | 👁 | Find by phone number |
| POST | `/api/grievances/create` | ✏️ PUBLIC | Public submission endpoint |
| GET | `/api/track/[qrCode]` | 🌐 | Public QR code tracking — no auth |

**Query params for GET /api/grievances:**
- `status` — filter by GrievanceStatus
- `priority` — filter by Priority
- `district` — filter by district
- `assignedTo` — filter by assignedToId
- `category` — filter by category name
- `search` — full-text search
- `page` / `limit` — pagination

---

## PA Petitions

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/pa/petitions` | 👁 MINISTER/PA/ADMIN | List all petitions with overdue flags |
| POST | `/api/pa/petitions` | ✏️ MINISTER/PA/ADMIN | Create petition with tracking number |
| GET | `/api/pa/petitions/[id]` | 👁 MINISTER/PA/ADMIN | Get petition with full timeline |
| PATCH | `/api/pa/petitions/[id]` | ✏️ MINISTER/PA/ADMIN | Update status, assignment, notes. Creates timeline entry. |
| GET | `/api/pa/petitions/stats` | 👁 MINISTER/PA/ADMIN | 18 KPIs: totals, intake trends, urgent counts, resolution rate, avgActualDaysToResolve |
| GET | `/api/pa/metadata` | 👁 BACK_OFFICER+ | Mandals, villages, leaders for form dropdowns |

**Query params for GET /api/pa/petitions:**
- `type` — PetitionType filter
- `status` — PetitionStatus filter
- `overdue=true` — only overdue
- `search` — searches trackingNumber, title, applicantName, phone, village, mandal, department

---

## Minister

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/minister/dashboard` | 👁 MINISTER/PA/ADMIN | Morning briefing stats |
| GET | `/api/minister/analytics` | 👁 MINISTER/PA/ADMIN | Constituency analytics |
| GET | `/api/minister/grievances` | 👁 MINISTER/PA/ADMIN | Grievances view |
| GET | `/api/minister/stats` | 👁 MINISTER/PA/ADMIN | Summary stats |
| GET | `/api/minister/projects` | 👁 MINISTER/PA/ADMIN/BACK_OFFICER/FIELD_OFFICER | List public works |
| POST | `/api/minister/projects` | ✏️ PA/ADMIN/BACK_OFFICER | Create public work |
| GET | `/api/minister/projects/[id]` | 👁 MINISTER/PA/ADMIN/BACK_OFFICER/FIELD_OFFICER | Get single work |
| PATCH | `/api/minister/projects/[id]` | ✏️ PA/ADMIN/BACK_OFFICER | Update work stage. Creates WorkTimeline entry. |
| GET | `/api/minister/events` | 👁 MINISTER/PA/ADMIN/BACK_OFFICER | List tour appointments |
| POST | `/api/minister/events` | ✏️ PA/ADMIN | Create tour appointment. Conflict detection. |
| GET | `/api/minister/events/[id]` | 👁 MINISTER/PA/ADMIN/BACK_OFFICER | Get single event |
| PATCH | `/api/minister/events/[id]` | ✏️ PA/ADMIN | Update event |
| DELETE | `/api/minister/events/[id]` | ✏️ PA/ADMIN | Soft-cancel (sets status=CANCELLED) |
| GET | `/api/minister/map-data` | 👁 MINISTER/PA/ADMIN | Geo data for constituency map |
| GET | `/api/minister/weather` | 👁 MINISTER/PA | Weather for constituency |
| POST | `/api/minister/assign` | ✏️ MINISTER/PA/ADMIN | Assign petition to official |
| GET | `/api/minister/ai` | 👁 MINISTER/PA | AI assistant query |

---

## Calendar

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/calendar` | 👁 MINISTER/PA/ADMIN/BACK_OFFICER | List TourAppointments. privateNotes stripped for BACK_OFFICER. |
| POST | `/api/calendar` | ✏️ PA/ADMIN | Create appointment. Conflict detection on overlapping times. |

**Query params:** `date` (YYYY-MM-DD), `month` (YYYY-MM), `type` (TourEventType)

---

## Visitors

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/visitors` | 👁 MINISTER/PA/ADMIN/BACK_OFFICER | List visitors with today's summary |
| POST | `/api/visitors` | ✏️ PA/ADMIN/BACK_OFFICER | Register visitor, generate daily token |
| GET | `/api/visitors/stats` | 👁 MINISTER/PA/ADMIN/BACK_OFFICER | Today/week/month counts, by type/status, VIP queue, 7-day trend |
| GET | `/api/visitors/[id]` | 👁 MINISTER/PA/ADMIN/BACK_OFFICER | Get single visitor |
| PATCH | `/api/visitors/[id]` | ✏️ PA/ADMIN/BACK_OFFICER | Actions: CHECK_IN, CHECK_OUT, CANCEL, NO_SHOW. Creates audit log. |
| POST | `/api/visitors/[id]/convert-to-petition` | ✏️ PA/ADMIN | Convert visitor to PetitionRequest |

---

## Letters

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/letters` | 👁 MINISTER/PA/ADMIN/BACK_OFFICER | List letters. privateNotes stripped for BACK_OFFICER. |
| POST | `/api/letters` | ✏️ PA/ADMIN/BACK_OFFICER | Create letter. Generates letterNumber. Creates timeline entry. Accepts all Peshi fields on creation. |
| GET | `/api/letters/[id]` | 👁 MINISTER/PA/ADMIN/BACK_OFFICER | Get letter with full timeline. endorsementText stripped for BACK_OFFICER. |
| PATCH | `/api/letters/[id]` | ✏️ PA/ADMIN/BACK_OFFICER | Update status, Peshi fields, file movement. Sets dispatchedAt/receivedAt/acknowledgedAt automatically. endorsementText requires MINISTER/PA/ADMIN. Creates timeline entry. |
| DELETE | `/api/letters/[id]` | ✏️ PA/ADMIN | Soft-cancel only (sets status=CANCELLED). Never hard-deletes. |
| GET | `/api/letters/stats` | 👁 MINISTER/PA/ADMIN/BACK_OFFICER | KPIs: overdueResponse, pendingEndorsement, withFileNumber, awaitingAck, byDepartment, overdueList |

**Peshi fields accepted on POST and PATCH:**
`fileNumber`, `eOfficeRef`, `endorsementText`, `currentlyWithName`, `currentlyWithDept`, `expectedReplyBy`, `recipientAcknowledgedBy`

---

## Assembly Questions (LAQ / LCQ)

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/assembly-questions` | 👁 MINISTER/PA/ADMIN/BACK_OFFICER | List questions. Filters: search, status, type, session, overdue=true. privateNotes+draftAnswerText stripped for BACK_OFFICER. |
| POST | `/api/assembly-questions` | ✏️ PA/ADMIN/BACK_OFFICER | Register question. Auto-generates questionNumber (LAQ/LCQ/AQ prefix). Calls Gemini to auto-generate talkingPoints. Creates AQTimeline entry. |
| GET | `/api/assembly-questions/[id]` | 👁 MINISTER/PA/ADMIN/BACK_OFFICER | Get question with full timeline |
| PATCH | `/api/assembly-questions/[id]` | ✏️ PA/ADMIN/BACK_OFFICER | Update status/answer/dept. Sets sentToDeptAt/draftReceivedAt/answeredDate automatically. Pass `regenerateTalkingPoints: true` to re-run Gemini. Creates AQTimeline entry. |
| GET | `/api/assembly-questions/stats` | 👁 MINISTER/PA/ADMIN/BACK_OFFICER | KPIs by status, overdueAnswer count, urgentList (due in 7 days), byMinistry groupBy |

---

## File Upload

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/upload` | ✏️ PA/ADMIN/BACK_OFFICER/FIELD_OFFICER | Multipart file upload. 10 MB limit. MIME whitelist: images, PDF, Word, Excel. UUID filename. Local disk in dev, S3 in production (when `AWS_S3_BUCKET` set). Returns `fileUrl`. |

---

## Cron / Overdue Escalation

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/cron/overdue` | 🔒 `Bearer CRON_SECRET` OR MINISTER/PA/ADMIN session | Run overdue escalation: marks petitions isOverdue, tasks isOverdue, counts overdue letters, marks stuck funds. Notifies PA/ADMIN users. |
| GET | `/api/cron/overdue` | 👁 MINISTER/PA/ADMIN | Returns endpoint metadata and schedule info |

---

## Party Workers

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/party-workers` | 👁 MINISTER/PA/ADMIN/BACK_OFFICER | List workers. voterId/aadharLast4/privateNotes stripped for BACK_OFFICER. |
| POST | `/api/party-workers` | ✏️ PA/ADMIN/BACK_OFFICER | Register worker |
| GET | `/api/party-workers/[id]` | 👁 MINISTER/PA/ADMIN/BACK_OFFICER | Get single worker |
| PATCH | `/api/party-workers/[id]` | ✏️ PA/ADMIN/BACK_OFFICER | Update worker |
| GET | `/api/party-workers/stats` | 👁 MINISTER/PA/ADMIN/BACK_OFFICER | Counts by level/wing/status/mandal |

---

## Party Posts

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/party-posts` | 👁 MINISTER/PA/ADMIN/BACK_OFFICER | List posts with active worker counts |
| POST | `/api/party-posts` | ✏️ PA/ADMIN | Create post. Duplicate check on title+level+wing. |
| GET | `/api/party-posts/[id]` | 👁 | Get single post |
| PATCH | `/api/party-posts/[id]` | ✏️ PA/ADMIN | Update post |

---

## Surveys

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/surveys` | 👁 MINISTER/PA/ADMIN/BACK_OFFICER/FIELD_OFFICER | List surveys |
| POST | `/api/surveys` | ✏️ PA/ADMIN | Create survey with questions |
| GET | `/api/surveys/[id]` | 👁 | Get survey with questions |
| PATCH | `/api/surveys/[id]` | ✏️ PA/ADMIN | Update survey status |
| GET | `/api/surveys/[id]/responses` | 👁 MINISTER/PA/ADMIN/BACK_OFFICER | List responses |
| POST | `/api/surveys/[id]/responses` | ✏️ PA/ADMIN/BACK_OFFICER/FIELD_OFFICER | Submit response |
| POST | `/api/surveys/[id]/grade` | ✏️ PA/ADMIN | Compute booth grades |
| GET | `/api/surveys/stats` | 👁 MINISTER/PA/ADMIN | Survey stats |

---

## Constituents (Citizen Database)

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/constituents` | 👁 MINISTER/PA/ADMIN/BACK_OFFICER/FIELD_OFFICER | List citizens. Phone masked for FIELD_OFFICER. |
| POST | `/api/constituents` | ✏️ PA/ADMIN/BACK_OFFICER | Add citizen. Deduplicates on epicNumber. |
| GET | `/api/constituents/[id]` | 👁 | Get single citizen |
| PATCH | `/api/constituents/[id]` | ✏️ PA/ADMIN/BACK_OFFICER | Update citizen |
| GET | `/api/constituents/stats` | 👁 MINISTER/PA/ADMIN/BACK_OFFICER | Constituency overview: citizen counts, WhatsApp opt-in rate, booth grades, party worker counts |
| GET | `/api/constituents/booths` | 👁 | List polling booths |
| GET | `/api/constituents/households` | 👁 | List households |
| POST | `/api/constituents/bulk-import` | ✏️ PA/ADMIN | ECI voter roll bulk import. Max 5000/batch. Deduplicates on epicNumber. |

---

## Funds (MLACDS / MPLADS)

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/funds` | 👁 MINISTER/PA/ADMIN/BACK_OFFICER | List fund allocations. privateNotes stripped for BACK_OFFICER. |
| POST | `/api/funds` | ✏️ PA/ADMIN | Create fund allocation. Generates referenceNumber. Creates timeline entry. |
| GET | `/api/funds/[id]` | 👁 | Get fund with full timeline |
| PATCH | `/api/funds/[id]` | ✏️ PA/ADMIN | Advance stage. Auto stuck detection. Creates timeline entry. |
| GET | `/api/funds/stats` | 👁 MINISTER/PA/ADMIN | Fund stats by scheme/status/financial year |

---

## Campaigns (WhatsApp / SMS)

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/campaigns` | 👁 MINISTER/PA/ADMIN | List campaigns |
| POST | `/api/campaigns` | ✏️ PA/ADMIN | Create campaign. Computes recipientCount from segment query. |
| GET | `/api/campaigns/[id]` | 👁 | Get campaign |
| PATCH | `/api/campaigns/[id]` | ✏️ PA/ADMIN | Update campaign |
| POST | `/api/campaigns/[id]/approve` | ✏️ PA/ADMIN | Approve campaign. Two-key: approver ≠ creator. |
| POST | `/api/campaigns/[id]/send` | ✏️ PA/ADMIN | Send campaign. Renders messages per citizen. Creates CampaignDelivery records. |

---

## Tasks

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/tasks` | 👁 All roles | List tasks. FIELD_OFFICER sees only their assigned tasks. Auto-flags overdue. |
| POST | `/api/tasks` | ✏️ MINISTER/PA/ADMIN/BACK_OFFICER | Create task |
| GET | `/api/tasks/[id]` | 👁 | Get task |
| PATCH | `/api/tasks/[id]` | ✏️ | Update task |
| GET | `/api/tasks/stats` | 👁 | Task stats |

---

## Offices

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/offices` | 👁 MINISTER/PA/ADMIN/BACK_OFFICER | List offices with open task counts |
| POST | `/api/offices` | ✏️ PA/ADMIN | Create office. Enforces single default. |
| GET | `/api/offices/[id]` | 👁 | Get office |
| PATCH | `/api/offices/[id]` | ✏️ PA/ADMIN | Update office |

---

## Analytics

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/analytics/dashboard` | 👁 MINISTER/PA/ADMIN/BACK_OFFICER | Full grievance analytics: KPIs, distributions, monthly trend (parameterized raw SQL) |
| GET | `/api/analytics/constituency` | 👁 MINISTER/PA/ADMIN | Constituency-level analytics |
| GET | `/api/analytics/aggregated` | 👁 MINISTER/PA/ADMIN | Aggregated stats |
| GET | `/api/analytics/realtime` | 👁 MINISTER/PA/ADMIN | Real-time counts |
| GET | `/api/analytics/critical-grievances` | 👁 MINISTER/PA/ADMIN | Critical/overdue grievances |

---

## Reports

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/reports/nightly-briefing` | 👁 MINISTER/PA/ADMIN | Executive digest: petitions, tasks, letters, funds, visitors, surveys, works — all in one call |
| GET | `/api/reports/minister-visit` | 👁 MINISTER/PA/ADMIN | Minister visit report |

---

## WhatsApp

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/whatsapp/intake` | 🔒 `Bearer WHATSAPP_WEBHOOK_SECRET` OR PA/ADMIN/BACK_OFFICER session | Inbound message (any language). Gemini AI parses language/category/priority/names. Stores media as Attachment. Assigns to least-loaded BACK_OFFICER. Sends reply in citizen's own script. |
| GET | `/api/whatsapp/pending` | 👁 PA/ADMIN/BACK_OFFICER | List WhatsApp messages. Filter: `processed=true/false`. Paginated. |
| POST | `/api/whatsapp/[id]/approve` | ✏️ PA/ADMIN/BACK_OFFICER | Manually approve a raw WhatsApp message into a Grievance. Auth-guarded. Uses real session userId. |

---

## Audit Logs

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/audit-logs` | 👁 ADMIN/MINISTER only | Immutable audit trail. No DELETE handler. Filters: entityType, entityId, userId, action, from/to dates. |

---

## Field Officer

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/field/assigned-tasks` | 👁 FIELD_OFFICER/ADMIN/PA/MINISTER/BACK_OFFICER | Petitions + tasks + works. FIELD_OFFICER geo-scoped to their assigned mandals/villages. |
| POST | `/api/field/update-status` | ✏️ FIELD_OFFICER/ADMIN | Update petition/task status from field |

---

## Government Projects

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/government-projects` | 👁 MINISTER/PA/ADMIN/BACK_OFFICER/FIELD_OFFICER | List public works (alias for minister/projects) |
| POST | `/api/government-projects` | ✏️ PA/ADMIN/BACK_OFFICER | Create public work |

---

## Notifications

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/notifications` | 👁 All authenticated | Get notifications for current user |
| PATCH | `/api/notifications` | ✏️ All authenticated | Mark as read |

---

## Admin

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/admin/stats` | 👁 ADMIN | System-wide stats |
| GET | `/api/users` | 👁 ADMIN/MINISTER/PA | List users |
| POST | `/api/users` | ✏️ ADMIN | Create user |
| PATCH | `/api/users/[id]` | ✏️ ADMIN | Update user |

---

## AI Assistant

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/ai/voice-intake` | ✏️ BACK_OFFICER/PA/ADMIN/MINISTER | NLP extraction of name, phone, village, type, amount, hospital from speech transcript. Returns extracted fields + duplicate check result. |
| POST | `/api/ai/duplicate-check` | ✏️ BACK_OFFICER/PA/ADMIN/MINISTER | Check for open petitions matching phone or name. Returns up to 5 matches with daysAgo and sameType flag. |
| GET | `/api/ai/morning-briefing` | 👁 MINISTER/PA/ADMIN | Pulls today's events, overdue petitions, new petitions, stuck works. Returns bilingual briefing text (English + Telugu). |
| GET | `/api/ai/visit-brief` | 👁 MINISTER/PA/ADMIN | Given `?mandal=X`, returns all works/petitions/leaders for that mandal plus auto-generated speech points in English and Telugu. |
| POST | `/api/assistant/query` | 👁 MINISTER/PA/ADMIN/BACK_OFFICER | Pulls live DB stats as context, sends to Gemini. Keyword fallback if Gemini unavailable. |
| GET | `/api/assistant/health` | 👁 All authenticated | Checks Gemini API connectivity and DB. Returns `healthy` or `degraded`. |
