/**
 * JWT helper utilities for extracting token claims on the client side.
 * 
 * Note: This does NOT verify the signature (that's the backend's job).
 * We only decode the payload to extract user info for UI purposes.
 */

/**
 * Decode a JWT token and return the payload.
 * Returns null if the token is malformed.
 */
export function decodeToken(token) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payload = parts[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

/**
 * Extract user_id and role from a JWT token.
 * Returns { userId: string, role: string } or null.
 */
export function extractUserInfo(token) {
  const payload = decodeToken(token)
  if (!payload) return null
  
  return {
    userId: payload.user_id || null,
    role: payload.role || 'user',
  }
}
