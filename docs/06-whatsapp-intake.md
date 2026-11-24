# 06 — WhatsApp System

Covers inbound intake (AI multilingual), outbound sender, and campaign delivery.

---

## Inbound: WhatsApp → Auto-Grievance Pipeline

```
Citizen's phone
      │
      │  Sends WhatsApp message (any language / media)
      ▼
WhatsApp Business API Provider
(Gupshup / Twilio / Meta Cloud API)
      │
      │  Webhook POST to your server
      │  Authorization: Bearer <WHATSAPP_WEBHOOK_SECRET>
      ▼
POST /api/whatsapp/intake
      │
      ├── 1. Auth: WHATSAPP_WEBHOOK_SECRET OR PA/ADMIN/BACK_OFFICER session
      │
      ├── 2. Store raw message immediately
      │         WhatsAppMessage { phone, message, rawText, isProcessed: false,
      │                           mediaUrl, mediaType, mediaCaption }
      │
      ├── 3. generateGrievanceRef() → GRV-2026-0043
      │         (findFirst + increment — safe under concurrent creates)
      │
      ├── 4. parseMessageWithAI(message, referenceNumber)
      │         Gemini prompt handles Telugu / Hindi / Urdu / English / mixed
      │         Returns JSON:
      │         {
      │           language: "te",
      │           languageName: "Telugu",
      │           category: "CIVIL_WORK",
      │           priority: "URGENT",
      │           applicantName: "రాజు",
      │           villageName: "మంథని",
      │           mandalName: "",
      │           issue: "No water supply for 3 days",
      │           replyMessage: "మీ ఫిర్యాదు నమోదైంది. రిఫరెన్స్: GRV-2026-0043"
      │         }
      │         Falls back to buildFallbackParse() if Gemini unavailable
      │
      ├── 5. pickBackOfficer()
      │         Queries all active BACK_OFFICERs
      │         Counts open grievances per officer
      │         Returns officer with fewest open cases
      │         If none exist → grievance created with status: PENDING, assignedToId: null
      │
      ├── 6. prisma.grievance.create({
      │         referenceNumber, intakeMethod: WHATSAPP,
      │         grievanceCategory: parsed.category,
      │         priority: parsed.priority,
      │         status: ASSIGNED (or PENDING if no officer),
      │         assignedToId: officer.id,
      │         remarks: "Language: Telugu"
      │       })
      │
      ├── 7. prisma.grievanceStatusUpdate.create({ PENDING → ASSIGNED })
      │
      ├── 8. prisma.notification.create() for assigned officer
      │
      ├── 9. prisma.whatsAppMessage.update({ isProcessed: true, grievanceId })
      │
      ├── 10. If mediaUrl present:
      │          prisma.attachment.create({
      │            url: mediaUrl, mimeType: derived from mediaType,
      │            grievanceId, uploadedBy: "WhatsApp:<phone>"
      │          })
      │
      └── 11. sendWhatsApp(phone, replyMessage)
                Reply is in the citizen's own script (Telugu/Hindi/Urdu/English)
```

---

## AI Message Parsing

`parseMessageWithAI()` in `app/api/whatsapp/intake/route.ts` sends a structured prompt to Gemini.

### What Gemini extracts

| Field | Description |
|-------|-------------|
| `language` | `te` / `hi` / `ur` / `en` / `mixed` |
| `languageName` | Telugu / Hindi / Urdu / English / Mixed |
| `category` | One of the GrievanceCategory enum values |
| `priority` | URGENT / HIGH / MEDIUM |
| `applicantName` | Extracted from message if present |
| `villageName` | Extracted from message if present |
| `mandalName` | Extracted from message if present |
| `issue` | One-line English summary |
| `replyMessage` | Acknowledgement in the **same script** as input |

### Priority rules (applied by Gemini)
URGENT if message mentions: death, accident, emergency, fire, flood, hospital surgery, or equivalent in any language.

### Category mapping
| Category | Triggers |
|----------|---------|
| HEALTH | medical/hospital/doctor/surgery/aarogya |
| CIVIL_WORK | water/borewell/road/drain/construction/toilet |
| INFRASTRUCTURE | electricity/light/power/transformer |
| EDUCATION | school/teacher/college/scholarship |
| AGRICULTURE | farm/crop/rytu/irrigation/seed/fertilizer |
| SOCIAL_WELFARE | pension/ration/scheme/subsidy/aadhar |
| JOBS | job/employment/nrega/salary |
| OTHER | catch-all |

### Keyword fallback
If Gemini is unavailable, `buildFallbackParse()` runs English keyword matching. Category detection is first-match top-to-bottom. Priority checks for: urgent, emergency, critical, death, died, accident, fire, flood, immediate.

---

## Media Handling

The intake endpoint accepts `mediaUrl`, `mediaType`, and `mediaCaption` in the request body.

```json
{
  "phone": "919876543210",
  "message": "road broken see photo",
  "mediaUrl": "https://cdn.gupshup.io/media/abc123.jpg",
  "mediaType": "image",
  "mediaCaption": "pothole near school"
}
```

- `mediaUrl` / `mediaType` / `mediaCaption` stored on `WhatsAppMessage`
- An `Attachment` record is created linked to the grievance
- MIME type derived: `image` → `image/jpeg`, `document` → `application/pdf`, `audio` → `audio/ogg`
- Back Officer sees the attachment in the grievance detail view

---

## Webhook Request Format

Your WhatsApp provider should POST to `/api/whatsapp/intake`:

```json
{
  "phone": "919876543210",
  "message": "నాకు నీళ్ళు రావడం లేదు urgent",
  "senderName": "Raju Kumar",
  "mediaUrl": "https://...",
  "mediaType": "image",
  "mediaCaption": "photo of broken pipe"
}
```

Headers:
```
Content-Type: application/json
Authorization: Bearer <WHATSAPP_WEBHOOK_SECRET>
```

---

## API Response

```json
{
  "success": true,
  "referenceNumber": "GRV-2026-0043",
  "grievanceId": "clx1234abcd",
  "category": "CIVIL_WORK",
  "priority": "URGENT",
  "language": "te",
  "languageName": "Telugu",
  "assignedTo": "Back Officer Suresh",
  "status": "ASSIGNED",
  "replyMessage": "మీ ఫిర్యాదు నమోదైంది. రిఫరెన్స్: GRV-2026-0043. మా బృందం మీకు త్వరలో సంప్రదిస్తుంది."
}
```

Send `replyMessage` back to the citizen via your WhatsApp API.

---

## Outbound: WhatsApp Sender (`lib/whatsapp-sender.ts`)

Provider-agnostic. Selected via `WHATSAPP_PROVIDER` env var.

```
WHATSAPP_PROVIDER=gupshup  → Gupshup API (URLSearchParams POST)
WHATSAPP_PROVIDER=twilio   → Twilio API (Basic auth)
WHATSAPP_PROVIDER=meta     → Meta Cloud API v19.0 (Bearer token)
WHATSAPP_PROVIDER=stub     → console.log only (default in dev)
```

### sendWhatsApp(to, message) return value

```typescript
{
  success: boolean
  messageId?: string   // provider message ID on success
  error?: string       // error message on failure
  provider: string     // which provider was used
}
```

Used by:
- `app/api/whatsapp/intake/route.ts` — sends reply to citizen after grievance creation
- `app/api/campaigns/[id]/send/route.ts` — sends bulk campaign messages

---

## Outbound: Campaign Send

```
POST /api/campaigns/[id]/send  (PA/ADMIN only, campaign must be APPROVED)
      │
      ├── Mark campaign status: SENDING
      ├── Query citizens matching segmentQuery (mandal/village/booth/scheme)
      │     WhatsApp channel: only citizens with whatsappOptIn: true
      ├── Render message per citizen ({{Citizen_Name}} substitution)
      ├── prisma.campaignDelivery.createMany()
      ├── Process in batches of 10:
      │     sendWhatsApp(phone, message)
      │     → success: update delivery status: SENT, sentAt: now
      │     → failure: update delivery status: FAILED, errorMessage
      ├── Update campaign: status: SENT, sentCount, failedCount, sentAt
      └── createAuditLog({ action: DISPATCH })
```

---

## Viewing Pending Messages

```
GET /api/whatsapp/pending
  ?processed=false   ← unprocessed messages
  ?processed=true    ← already processed
  ?page=1            ← pagination (50 per page)
```

Access: PA / ADMIN / BACK_OFFICER

---

## Environment Variables

```env
# Inbound webhook auth
WHATSAPP_WEBHOOK_SECRET=<strong-random-hex>

# Outbound provider (gupshup | twilio | meta | stub)
WHATSAPP_PROVIDER=stub

# Gupshup (if WHATSAPP_PROVIDER=gupshup)
GUPSHUP_API_KEY=
GUPSHUP_APP_NAME=
GUPSHUP_SRC_PHONE=

# Twilio (if WHATSAPP_PROVIDER=twilio)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Meta Cloud API (if WHATSAPP_PROVIDER=meta)
META_WHATSAPP_TOKEN=
META_PHONE_NUMBER_ID=

# AI parsing
GEMINI_API_KEY=<your-gemini-key>
```

Generate secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Provider Setup Guides

### Gupshup
1. Create WhatsApp Business account on Gupshup
2. Set Inbound Message Webhook URL: `https://yourdomain.com/api/whatsapp/intake`
3. Set webhook method: POST
4. Add custom header: `Authorization: Bearer <WHATSAPP_WEBHOOK_SECRET>`
5. Map Gupshup payload fields to `phone` and `message`

### Twilio
1. Create WhatsApp Sandbox or Business account
2. Set webhook URL in Twilio Console → Messaging → WhatsApp
3. Twilio sends `From` (phone) and `Body` (message) — adapt field names in intake route if needed

### Meta Cloud API
1. Set up Meta Business Manager + WhatsApp Business Account
2. Configure webhook: `https://yourdomain.com/api/whatsapp/intake`
3. Meta sends a different payload format — adapt `phone` and `message` field extraction accordingly

---

## Manual Testing (Without WhatsApp Provider)

```bash
# Using webhook secret directly:
curl -X POST http://localhost:3000/api/whatsapp/intake \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <WHATSAPP_WEBHOOK_SECRET>" \
  -d '{"phone":"9876543210","message":"నాకు నీళ్ళు రావడం లేదు urgent","senderName":"Lakshmi"}'

# With media:
curl -X POST http://localhost:3000/api/whatsapp/intake \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <WHATSAPP_WEBHOOK_SECRET>" \
  -d '{"phone":"9876543210","message":"road broken","mediaUrl":"https://example.com/photo.jpg","mediaType":"image","mediaCaption":"pothole photo"}'
```
