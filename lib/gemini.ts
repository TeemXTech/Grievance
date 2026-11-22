const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

export async function askGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not set")

  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 512 },
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data?.error?.message || "Gemini API error")
  }

  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response"
}
