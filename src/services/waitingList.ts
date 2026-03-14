import api from './api'

export type WaitingListSource = 'hero' | 'header' | 'pricing' | 'showcase' | 'skill' | 'seo-scheduler' | 'seo-instagram' | 'seo-tiktok' | 'seo-autopost' | 'seo-tools' | 'seo-cli'

interface JoinWaitingListResponse {
  success: boolean
  message: string
  already_registered?: boolean
}

export const waitingListService = {
  async join(email: string, source: WaitingListSource): Promise<JoinWaitingListResponse> {
    const response = await api.post<JoinWaitingListResponse>('/waiting-list', {
      email,
      source,
    })
    return response.data
  },
}
