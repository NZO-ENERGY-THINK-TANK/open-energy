import { z } from 'zod'

export const emissionsRangeSchema = z
  .object({ start: z.iso.date(), end: z.iso.date() })
  .refine((range) => range.start <= range.end, {
    message: 'תאריך ההתחלה חייב להיות לפני תאריך הסיום.',
  })

export type EmissionsRange = z.infer<typeof emissionsRangeSchema>

const numberSchema = z.number().finite()
const optionalNumber = numberSchema.nullish()
const fuelsSchema = z.object({
  coal: optionalNumber,
  diesel: optionalNumber,
  natural_gas: optionalNumber,
  fuel_oil: optionalNumber,
  methanol: optionalNumber,
})
const hierarchy = {
  level1: z
    .object({
      fossil_emissions: optionalNumber,
      renewable_emissions_savings: optionalNumber,
    })
    .optional(),
  level2: z
    .object({
      fossil_emissions: fuelsSchema.optional(),
      renewable_emissions_savings: z
        .object({ renewables: optionalNumber })
        .optional(),
    })
    .optional(),
}
const metricSchema = z.object({
  value: numberSchema,
  unit: z.string(),
  description: z.string().optional(),
})
const infographicsSchema = z.object({
  total_emissions_excluding_renewables: metricSchema.optional(),
  emissions_avoided_through_renewables: metricSchema
    .extend({ percentage_of_actual_plus_savings: optionalNumber })
    .optional(),
})

export const emissionsPeriodSchema = z.union([
  z.iso.date(),
  z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  z
    .string()
    .refine(
      (period) =>
        /^\d{4}-\d{2}-\d{2} ([01]\d|2[0-3]):00$/.test(period) &&
        z.iso.date().safeParse(period.slice(0, 10)).success,
      'Invalid hourly period.',
    ),
])

const pointSchema = fuelsSchema.extend({
  period: emissionsPeriodSchema,
  label: z.string().optional(),
  total_emissions: optionalNumber,
  emissions_savings: optionalNumber,
  generation_mwh: optionalNumber,
  emissions_ratio: optionalNumber,
  emissions_per_kwh: optionalNumber,
  ...hierarchy,
})
const responseFields = {
  start_date: z.iso.date(),
  end_date: z.iso.date(),
  infographics: infographicsSchema.optional(),
  ...hierarchy,
  note: z.string().optional(),
}
function orderedDates(response: { start_date: string; end_date: string }) {
  return response.start_date <= response.end_date
}
const pieSliceSchema = z.object({
  value: numberSchema,
  percentage: numberSchema,
  unit: z.string(),
})

export const emissionsMixResponseSchema = z
  .object({
    ...responseFields,
    view: z.enum(['day', 'month', 'year']),
    total_emissions: numberSchema,
    total_emissions_unit: z.string(),
    total_generation_mwh: numberSchema,
    emissions_per_kwh: numberSchema,
    emissions_per_kwh_unit: z.string(),
    pie_chart: z
      .object({
        coal: pieSliceSchema.optional(),
        diesel: pieSliceSchema.optional(),
        natural_gas: pieSliceSchema.optional(),
      })
      .optional(),
    time_series: z.array(pointSchema.extend({ unit: z.string().optional() })),
  })
  .refine(orderedDates, { message: 'Invalid response date range.' })

export const emissionsHistoryResponseSchema = z
  .object({
    ...responseFields,
    view: z.enum(['month', 'year', 'custom']),
    chart_data: z.array(pointSchema.extend({ unit: z.string().optional() })),
  })
  .refine(orderedDates, { message: 'Invalid response date range.' })

export const emissionsIntensityResponseSchema = z
  .object({
    ...responseFields,
    view: z.enum(['month', 'year', 'custom']),
    chart_data: z.array(
      pointSchema.extend({
        unit_emissions: z.string().optional(),
        unit_ratio: z.string().optional(),
      }),
    ),
  })
  .refine(orderedDates, { message: 'Invalid response date range.' })

export type EmissionsMixResponse = z.infer<typeof emissionsMixResponseSchema>
export type EmissionsHistoryResponse = z.infer<
  typeof emissionsHistoryResponseSchema
>
export type EmissionsIntensityResponse = z.infer<
  typeof emissionsIntensityResponseSchema
>
