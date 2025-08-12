// radioApi.js - API helpers for stations and proxy
// Centralizes API base detection and endpoints for the radio subsystem

/**
 * Return API base for Express server. If the app is not served from the same
 * port, target localhost:3001 (default server.js port).
 */
export function getApiBase() {
  if (typeof window === 'undefined') return ''
  const port = window.location?.port || ''
  return port !== '3001' ? 'http://localhost:3001' : ''
}

/**
 * Build a proxied URL for a stream.
 * @param {string} url - Original stream URL
 * @returns {string}
 */
export function proxyUrl(url) {
  const API_BASE = getApiBase()
  return `${API_BASE}/proxy?url=${encodeURIComponent(url)}`
}

/**
 * Fetch stations from /api/stations
 * @returns {Promise<Array>} stations
 */
export async function fetchStations() {
  const API_BASE = getApiBase()
  const res = await fetch(`${API_BASE}/api/stations`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
