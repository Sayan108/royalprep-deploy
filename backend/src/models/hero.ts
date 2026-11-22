import { z } from 'zod'

const internalPath = z.string().max(200).refine(
  value => /^\/(?![\/\\])[^\\\s]*$/.test(value),
  'Use a safe internal path.',
)

export const heroContentSchema = z.object({
  eyebrow: z.string().trim().max(100),
  headline: z.string().trim().min(1).max(160),
  highlight: z.string().trim().max(100),
  description: z.string().trim().min(1).max(600),
  primaryLabel: z.string().trim().min(1).max(80),
  primaryPath: internalPath,
  secondaryLabel: z.string().trim().min(1).max(80),
  secondaryPath: internalPath,
}).strict()

export type HeroContent = z.infer<typeof heroContentSchema>
export const revisionSchema = z.number().int().min(0).max(2_147_483_646)
