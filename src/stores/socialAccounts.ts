import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { socialAccountsService } from '@/services'
import type { SocialAccount, SocialPlatform, PlatformInfo } from '@/types'

export const useSocialAccountsStore = defineStore('socialAccounts', () => {
  const accounts = ref<SocialAccount[]>([])
  const platforms = ref<PlatformInfo[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const activeAccounts = computed(() =>
    accounts.value.filter((account) => account.status === 'active')
  )

  const accountsByPlatform = computed(() => {
    const grouped: Record<SocialPlatform, SocialAccount[]> = {} as Record<
      SocialPlatform,
      SocialAccount[]
    >
    accounts.value.forEach((account) => {
      if (!grouped[account.platform]) {
        grouped[account.platform] = []
      }
      grouped[account.platform].push(account)
    })
    return grouped
  })

  const fetchPlatforms = async () => {
    isLoading.value = true
    error.value = null
    try {
      const response = await socialAccountsService.getPlatforms()
      platforms.value = response.platforms
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      error.value = e.response?.data?.error || 'Failed to fetch platforms'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchAccounts = async () => {
    isLoading.value = true
    error.value = null
    try {
      const response = await socialAccountsService.listAccounts()
      accounts.value = response.accounts
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      error.value = e.response?.data?.error || 'Failed to fetch accounts'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const initiateOAuth = async (platform: SocialPlatform, redirectUrl?: string) => {
    error.value = null
    try {
      const response = await socialAccountsService.initiateOAuth(platform, redirectUrl)
      return response
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      error.value = e.response?.data?.error || 'Failed to initiate OAuth'
      throw err
    }
  }

  const completeOAuth = async (code: string, state: string) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await socialAccountsService.completeOAuth(code, state)
      accounts.value = [...accounts.value, response.account]
      return response.account
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      error.value = e.response?.data?.error || 'Failed to complete OAuth'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const connectBluesky = async (identifier: string, password: string) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await socialAccountsService.connectBluesky(identifier, password)
      accounts.value = [...accounts.value, response.account]
      return response.account
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      error.value = e.response?.data?.error || 'Failed to connect Bluesky'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteAccount = async (accountId: string) => {
    error.value = null
    try {
      await socialAccountsService.deleteAccount(accountId)
      accounts.value = accounts.value.filter((account) => account.id !== accountId)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      error.value = e.response?.data?.error || 'Failed to disconnect account'
      throw err
    }
  }

  return {
    accounts,
    platforms,
    isLoading,
    error,
    activeAccounts,
    accountsByPlatform,
    fetchPlatforms,
    fetchAccounts,
    initiateOAuth,
    completeOAuth,
    connectBluesky,
    deleteAccount,
  }
})
