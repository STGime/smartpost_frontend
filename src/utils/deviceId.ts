/**
 * Random id for this browser, kept in localStorage and sent to the API as
 * X-Device-Id. The backend stores only a salted hash of it and uses it to
 * give one free trial per browser.
 */
const DEVICE_ID_KEY = 'posta_device_id'

let cached: string | null = null

const randomId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

export const getDeviceId = (): string | null => {
  if (cached) return cached
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY)
    if (!id || !/^[A-Za-z0-9-]{16,64}$/.test(id)) {
      id = randomId()
      localStorage.setItem(DEVICE_ID_KEY, id)
    }
    cached = id
    return id
  } catch {
    // Storage blocked (private mode, prerender): send no id at all
    return null
  }
}
