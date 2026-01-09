import api from './api'
import type { SocialAccount, SocialPlatform, PlatformInfo } from '@/types'

export const socialAccountsService = {
  async getPlatforms(): Promise<{ platforms: PlatformInfo[] }> {
    const response = await api.get<{ platforms: PlatformInfo[] }>('/social-accounts/platforms')
    return response.data
  },

  async listAccounts(): Promise<{ accounts: SocialAccount[] }> {
    const response = await api.get<{ accounts: SocialAccount[] }>('/social-accounts')
    return response.data
  },

  async getAccount(accountId: string): Promise<SocialAccount> {
    const response = await api.get<SocialAccount>(`/social-accounts/${accountId}`)
    return response.data
  },

  async deleteAccount(accountId: string): Promise<void> {
    await api.delete(`/social-accounts/${accountId}`)
  },

  async initiateOAuth(platform: SocialPlatform, redirectUrl?: string): Promise<{
    authorizationUrl: string
    state: string
    expiresIn: number
  }> {
    const response = await api.post('/social-accounts/oauth/initiate', {
      platform,
      redirectUrl,
    })
    return response.data
  },

  async completeOAuth(code: string, state: string): Promise<{ account: SocialAccount }> {
    const response = await api.get('/social-accounts/oauth/callback', {
      params: { code, state },
    })
    return response.data
  },

  async connectBluesky(identifier: string, appPassword: string): Promise<{ account: SocialAccount }> {
    const response = await api.post('/social-accounts/bluesky/connect', {
      identifier,
      appPassword,
    })
    return response.data
  },
}
