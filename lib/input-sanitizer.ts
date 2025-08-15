// Input sanitization utility
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .replace(/&/g, '&amp;') // Escape ampersands
    .replace(/\n|\r/g, '') // Remove newlines
    .trim();
}

export function sanitizeForLog(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/[<>"'&\n\r]/g, '')
    .substring(0, 100) // Limit length
    .trim();
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function sanitizePath(path: string): string {
  if (!path) return '';
  
  // Remove path traversal attempts
  return path
    .replace(/\.\./g, '')
    .replace(/[<>"'&\n\r]/g, '')
    .replace(/[\\\/]/g, '_');
}