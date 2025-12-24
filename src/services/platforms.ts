import api from './api'
import type { PlatformInfo, PlatformSpecification, SocialPlatform } from '@/types'

interface AspectRatioInfo {
  key: string
  width: number
  height: number
  name: string
  decimal: number
}

export const platformsService = {
  async listPlatforms(): Promise<{ platforms: PlatformInfo[] }> {
    const response = await api.get('/platforms')
    return response.data
  },

  async getAspectRatios(): Promise<{ aspectRatios: AspectRatioInfo[] }> {
    const response = await api.get('/platforms/aspect-ratios')
    return response.data
  },

  async getSpecifications(): Promise<{ specifications: PlatformSpecification[] }> {
    const response = await api.get('/platforms/specifications')
    return response.data
  },

  async getPlatformDetails(platformId: SocialPlatform): Promise<PlatformSpecification> {
    const response = await api.get(`/platforms/${platformId}`)
    return response.data
  },
}
