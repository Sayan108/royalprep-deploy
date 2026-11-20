export async function api<T>(path: string, init: RequestInit = {}, admin = false): Promise<T> {
  const response = await fetch((import.meta.env.VITE_API_URL ?? '') + '/api' + path, {
    ...init, headers: { 'Content-Type': 'application/json', ...(admin ? { Authorization: 'Bearer ' + sessionStorage.getItem('rp-admin') } : {}), ...init.headers },
  })
  const body = await response.json()
  if (!response.ok) {
    if (admin && response.status === 401) sessionStorage.removeItem('rp-admin')
    throw Error(body.error ?? 'Request failed.')
  }
  return body
}
