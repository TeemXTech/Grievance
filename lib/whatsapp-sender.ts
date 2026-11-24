// lib/whatsapp-sender.ts
// Provider-agnostic WhatsApp outbound sender.
// Set WHATSAPP_PROVIDER=gupshup | twilio | meta in .env
// All provider credentials are read from environment variables — never hardcoded.

export interface WhatsAppSendResult {
  success: boolean
  messageId?: string
  error?: string
  provider: string
}

// ─── Gupshup ──────────────────────────────────────────────────────────────────
async function sendViaGupshup(to: string, message: string): Promise<WhatsAppSendResult> {
  const apiKey  = process.env.GUPSHUP_API_KEY
  const appName = process.env.GUPSHUP_APP_NAME
  const srcPhone = process.env.GUPSHUP_SRC_PHONE // your registered WhatsApp number

  if (!apiKey || !appName || !srcPhone) {
    return { success: false, provider: "gupshup", error: "GUPSHUP_API_KEY, GUPSHUP_APP_NAME, GUPSHUP_SRC_PHONE not set" }
  }

  const body = new URLSearchParams({
    channel:  "whatsapp",
    source:   srcPhone,
    destination: to.replace(/\D/g, ""), // strip non-digits
    message:  JSON.stringify({ type: "text", text: message }),
    "src.name": appName,
  })

  const res = await fetch("https://api.gupshup.io/sm/api/v1/msg", {
    method:  "POST",
    headers: { apikey: apiKey, "Content-Type": "application/x-www-form-urlencoded" },
    body:    body.toString(),
  })

  const text = await res.text()
  if (!res.ok) return { success: false, provider: "gupshup", error: text }

  // Gupshup returns "messageId:<uuid>" on success
  const messageId = text.includes("messageId") ? text.split(":")[1]?.trim() : undefined
  return { success: true, provider: "gupshup", messageId }
}

// ─── Twilio ───────────────────────────────────────────────────────────────────
async function sendViaTwilio(to: string, message: string): Promise<WhatsAppSendResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken  = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM // e.g. whatsapp:+14155238886

  if (!accountSid || !authToken || !fromNumber) {
    return { success: false, provider: "twilio", error: "TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM not set" }
  }

  const toFormatted = `whatsapp:${to.startsWith("+") ? to : "+" + to.replace(/\D/g, "")}`
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`

  const body = new URLSearchParams({ From: fromNumber, To: toFormatted, Body: message })
  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64")

  const res = await fetch(url, {
    method:  "POST",
    headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/x-www-form-urlencoded" },
    body:    body.toString(),
  })

  const json = await res.json() as any
  if (!res.ok) return { success: false, provider: "twilio", error: json.message || JSON.stringify(json) }
  return { success: true, provider: "twilio", messageId: json.sid }
}

// ─── Meta Cloud API ───────────────────────────────────────────────────────────
async function sendViaMeta(to: string, message: string): Promise<WhatsAppSendResult> {
  const token   = process.env.META_WHATSAPP_TOKEN
  const phoneId = process.env.META_PHONE_NUMBER_ID // from Meta Business dashboard

  if (!token || !phoneId) {
    return { success: false, provider: "meta", error: "META_WHATSAPP_TOKEN, META_PHONE_NUMBER_ID not set" }
  }

  const toClean = to.replace(/\D/g, "")
  const url = `https://graph.facebook.com/v19.0/${phoneId}/messages`

  const res = await fetch(url, {
    method:  "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: toClean,
      type: "text",
      text: { body: message },
    }),
  })

  const json = await res.json() as any
  if (!res.ok) return { success: false, provider: "meta", error: json.error?.message || JSON.stringify(json) }
  return { success: true, provider: "meta", messageId: json.messages?.[0]?.id }
}

// ─── Public API ───────────────────────────────────────────────────────────────
export async function sendWhatsApp(to: string, message: string): Promise<WhatsAppSendResult> {
  const provider = (process.env.WHATSAPP_PROVIDER || "stub").toLowerCase()

  switch (provider) {
    case "gupshup": return sendViaGupshup(to, message)
    case "twilio":  return sendViaTwilio(to, message)
    case "meta":    return sendViaMeta(to, message)
    default:
      // Stub mode — logs to console, returns success so the rest of the flow works
      console.log(`[WhatsApp STUB] To: ${to} | Message: ${message}`)
      return { success: true, provider: "stub", messageId: `stub-${Date.now()}` }
  }
}
