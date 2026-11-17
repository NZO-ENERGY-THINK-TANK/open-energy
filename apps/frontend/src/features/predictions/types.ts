import { z } from 'zod'

const optionalPercent = z.number().finite().nullable().optional()
const sourceSchema = z.looseObject({
  csv_path: z.string().optional(),
  file_name: z.string().optional(),
  encoding: z.string().optional(),
  source_type: z.string().optional(),
  source_notes: z.array(z.string()).optional(),
})
const responseFields = {
  diagram_id: z.string().optional(),
  title: z.string(),
  title_he: z.string().optional(),
  value_unit: z.string().optional(),
  value_unit_description: z.string().optional(),
  series_labels: z.record(z.string(), z.union([z.string(), z.object({ en: z.string().optional(), he: z.string().optional() })])).optional(),
  source: sourceSchema.optional(),
}
export const israelForecastSchema = z.looseObject({
  ...responseFields,
  data: z.array(z.object({
    year: z.number().int(),
    renewable_share_percent: z.number().finite(),
    realistic_forecast_percent: z.number().finite(),
    ministry_target_percent: z.number().finite(),
    nzo_target_percent: z.number().finite(),
  })),
  metadata: z.looseObject({
    year_start: z.number().nullable().optional(),
    year_end: z.number().nullable().optional(),
    realistic_forecast_factor: optionalPercent,
    realistic_forecast_factor_percent: optionalPercent,
  }).optional(),
})
export const internationalComparisonSchema = z.looseObject({
  ...responseFields,
  filters: z.object({
    include_2030_targets: z.boolean().optional(),
    include_2050_targets: z.boolean().optional(),
    include_solar_share: z.boolean().optional(),
  }).optional(),
  regions: z.array(z.looseObject({
    region: z.string(),
    region_he: z.string().nullable().optional(),
    region_key: z.string(),
    renewable_target_percent_2030: optionalPercent,
    renewable_target_percent_2050: optionalPercent,
    solar_share_percent_2024: optionalPercent,
    renewable_share_percent_2024: optionalPercent,
    solar_data_available: z.boolean().optional(),
  })),
  regions_without_solar_data: z.array(z.string()).optional(),
  validation: z.array(z.looseObject({ region: z.string().optional(), code: z.string().optional(), detail: z.string().optional() })).optional(),
})
export type IsraelForecastResponse = z.infer<typeof israelForecastSchema>
export type IsraelForecastPoint = IsraelForecastResponse['data'][number]
export type InternationalComparisonResponse = z.infer<typeof internationalComparisonSchema>
export type InternationalRegion = InternationalComparisonResponse['regions'][number]
export type ComparisonFilters = { include_2050_targets: boolean; include_solar_share: boolean }
