// Sanitize single-line inputs (names, phones, titles)
export function sanitizeInput(input: string): string {
  if (!input) return ""
  return input
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .trim()
}

// Sanitize multi-line inputs (letter body, descriptions, notes)
export function sanitizeMultiline(input: string): string {
  if (!input) return ""
  return input
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .trim()
}

export function sanitizeForLog(input: string): string {
  if (!input) return ""
  return input
    .replace(/[<>"'\n\r]/g, "")
    .substring(0, 100)
    .trim()
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  return /^[+\d\s\-()]{7,20}$/.test(phone)
}

export function sanitizePath(path: string): string {
  if (!path) return ""
  return path
    .replace(/\.\./g, "")
    .replace(/[<>"'\n\r]/g, "")
    .replace(/[\\\/]/g, "_")
}
