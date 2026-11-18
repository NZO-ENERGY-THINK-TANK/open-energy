import { z } from 'zod'

export const climateRangeSchema = z
  .object({ start: z.iso.date(), end: z.iso.date() })
  .refine((range) => range.start <= range.end, {
    message: 'תאריך ההתחלה חייב להיות לפני תאריך הסיום.',
  })
export const climateViewSchema = z.enum(['month', 'year', 'custom'])

const climatePointSchema = z.object({
  period: z.string().min(1),
  label: z.string(),
  heat_load: z.number().finite(),
  electricity_generation_mw: z.number().finite().nullable(),
})

export const climateResponseSchema = z
  .object({
    view: climateViewSchema,
    start_date: z.iso.date(),
    end_date: z.iso.date(),
    units: z.object({
      heat_load: z.string(),
      electricity_generation: z.string(),
    }),
    series: z.array(climatePointSchema),
    note: z.string().optional(),
  })
  .refine((response) => response.start_date <= response.end_date, {
    message: 'Invalid response date range.',
  })

export type ClimateRange = z.infer<typeof climateRangeSchema>
export type ClimateView = z.infer<typeof climateViewSchema>
export type ClimatePoint = z.infer<typeof climatePointSchema>
export type ClimateResponse = z.infer<typeof climateResponseSchema>
