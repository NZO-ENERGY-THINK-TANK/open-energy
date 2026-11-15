// Keep the same explicit allowlist in nginx/default.conf.template.
// Never attach the internal key to arbitrary paths or administration routes.
export const PUBLIC_API_PATTERN = '^/api/backend/api/v1/(?:energy/(?:overview(?:/(?:details|export))?|production-mix(?:/export)?|smp(?:/export)?|smp-production-vs-marginal-price(?:/export)?)|co2/(?:emissions-savings|emissions-ratio|total-production|emissions-mix(?:/export)?|emissions-over-time(?:/export)?|total-vs-ratio(?:/export-csv)?)|private-supplier-connected-consumers(?:/(?:export|download-source))?|switching-requests(?:/export)?|heat-load-vs-generation(?:/export)?|renewables/(?:production-mix|transition|potential-by-industry|installed-capacity/(?:cumulative|growth|by-facility-size)|response-capacity/(?:by-period|by-size|by-district)|renewable-forecast-israel|international-renewable-comparison)(?:/export)?|apis)/?$'

const publicApi = new RegExp(PUBLIC_API_PATTERN)

export function isPublicApiRequest(method: string | undefined, requestUrl: string | undefined): boolean {
  const path = (requestUrl ?? '').split('?')[0]
  return method === 'GET' && publicApi.test(path)
}
