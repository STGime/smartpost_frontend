import type { LocationQuery } from 'vue-router'

/**
 * Query parameters the backend appends when a platform login (OAuth) finishes:
 * `platform` plus either `success=true` or `error`, and for Facebook the number
 * of Pages `connected`, `skipped` (plan limit or inactive plan) and `failed`.
 */
export const OAUTH_RESULT_PARAMS = ['platform', 'success', 'error', 'connected', 'skipped', 'failed', 'accountId']

export interface OAuthResult {
  platform: string
  success: boolean
  error: string | null
  connected: number
  skipped: number
  failed: number
}

/** Read a login result from the query, or null when the query isn't one. */
export function parseOAuthResult(query: LocationQuery): OAuthResult | null {
  const { platform, success, error, connected, skipped, failed } = query
  if (!platform || (!success && !error)) return null

  return {
    platform: String(platform),
    success: !error && !!success,
    error: error ? String(error) : null,
    connected: Number(connected) || 0,
    skipped: Number(skipped) || 0,
    failed: Number(failed) || 0,
  }
}

export const platformName = (platform: string) => platform.charAt(0).toUpperCase() + platform.slice(1)

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`

/** Sentences describing a successful login result. */
export function describeOAuthSuccess(result: OAuthResult): string[] {
  const lines =
    result.platform === 'facebook' && result.connected > 1
      ? [`${plural(result.connected, 'Facebook Page')} connected. Each Page is its own account.`]
      : [`${platformName(result.platform)} connected successfully.`]

  if (result.skipped > 0) {
    lines.push(`${plural(result.skipped, 'more Page')} not added because your plan's account limit is reached.`)
  }
  if (result.failed > 0) {
    lines.push(`${plural(result.failed, 'Page')} could not be connected. Please try again.`)
  }
  return lines
}
