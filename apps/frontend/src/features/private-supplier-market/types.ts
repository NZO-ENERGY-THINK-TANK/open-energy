export type CustomerType = 'residential' | 'non_residential'

export type SupplierType =
  'all' | 'virtual_suppliers' | 'suppliers_with_generation'

export type RejectionReason =
  'missing_power_of_attorney' | 'meter_issues' | 'request_form_issues' | 'other'

type MonthlyConsumerCount = {
  month: string
  total_consumers: number
  new_additions: number
}

export type ConnectedConsumersResponse = {
  start_date: string
  end_date: string
  unit: 'count'
  labels: {
    month: string
    total_consumers: string
    new_additions: string
  }
  data: Array<
    Omit<MonthlyConsumerCount, 'new_additions'> & {
      new_additions: number | null
    }
  >
  segments: {
    regulation_type: Array<MonthlyConsumerCount & { regulation_type: string }>
    sector: Array<MonthlyConsumerCount & { sector: string }>
    meter_type: Array<MonthlyConsumerCount & { meter_type: string }>
    district: Array<MonthlyConsumerCount & { district: string }>
    status?: Array<MonthlyConsumerCount & { status: string }>
    rejection_reason?: Array<
      MonthlyConsumerCount & { rejection_reason: string }
    >
  }
  district_meter_breakdown: Record<string, { smart?: number; basic?: number }>
  note: string | null
}

type RequestBreakdown = {
  label: string
  data: Array<{ label: string; count: number }>
}

export type SwitchingRequestsResponse = {
  filter: {
    customer_type: 'all' | CustomerType
    year: 'all' | number
    years: 'all' | number[]
  }
  unit: 'count'
  available_years: number[]
  start_year: number | null
  charts: {
    requests_by_status: RequestBreakdown
    requests_by_customer_type: RequestBreakdown
    requests_by_regulation_type: RequestBreakdown
    requests_by_competition_type: RequestBreakdown
    requests_by_rejection_reason: RequestBreakdown
  }
  monthly_requests: Array<{ month: string; requests: number }>
  monthly_rejections_by_reason: Array<
    { month: string; total_rejections: number } & Record<
      RejectionReason,
      number
    >
  >
  total_requests: number
  total_rejections: number
  note?: string
}
