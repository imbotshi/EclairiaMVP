// radioValidator.js - Stream validation helpers
import { proxyUrl } from './radioApi'

/**
 * Validate a single station stream via the proxy using a HEAD request.
 * Returns a normalized result object.
 *
 * @param {{ id:string, name:string, stream:string }} station
 * @param {{ timeout?: number }} options
 */
export async function validateStream(station, options = {}) {
  const { timeout = 15000 } = options
  const startTime = Date.now()
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), timeout)
  try {
    const res = await fetch(proxyUrl(station.stream), {
      method: 'HEAD',
      signal: controller.signal
    })
    clearTimeout(t)
    const duration = Date.now() - startTime
    return {
      ok: res.ok,
      status: res.status,
      contentType: res.headers.get('content-type') || 'unknown',
      duration
    }
  } catch (e) {
    clearTimeout(t)
    const duration = Date.now() - startTime
    return {
      ok: false,
      error: e.name === 'AbortError' ? 'Timeout' : e.message,
      duration
    }
  }
}
