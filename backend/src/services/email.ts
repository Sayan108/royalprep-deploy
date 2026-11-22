export function normalizeEmail(value: unknown): string | undefined {
  if (typeof value !== 'string' || value.length > 254) return undefined
  const email = value.trim().toLowerCase()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : undefined
}
