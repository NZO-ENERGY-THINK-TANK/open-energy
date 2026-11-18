const backendOrigin = import.meta.env.VITE_UPSTREAM_ORIGIN

// TODO: this secret flow is redundant
export function apiFetch(path: string, options?: RequestInit) {
  const headers = new Headers(options?.headers)
  headers.set('x-api-key', import.meta.env.VITE_OPEN_ENERGY_API_KEY)
  return fetch(new URL(path, backendOrigin), { ...options, headers })
}
