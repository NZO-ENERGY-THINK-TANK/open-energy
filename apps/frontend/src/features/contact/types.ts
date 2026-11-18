import { z } from 'zod'

const requiredMessage = 'יש למלא את השדה המבוקש'

function contactField(limit: number, required = true) {
  return (
    z
      .string()
      // The backend counts Unicode code points and checks the raw length before trimming.
      .refine(
        (value) => Array.from(value).length <= limit,
        `יש להזין עד ${limit} תווים`,
      )
      .transform((value) => value.trim())
      .pipe(required ? z.string().min(1, requiredMessage) : z.string())
  )
}

export const contactSchema = z.strictObject({
  name: contactField(200),
  email: contactField(254).pipe(
    z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'כתובת דוא"ל לא תקינה'),
  ),
  organization: contactField(200, false).default(''),
  message: contactField(8000),
})

export type ContactPayload = z.infer<typeof contactSchema>
