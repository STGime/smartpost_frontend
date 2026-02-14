import api from './api'

export type FeedbackCategory = 'bug' | 'feature' | 'improvement' | 'other'

export const feedbackService = {
  async submit(category: FeedbackCategory, comment: string) {
    const response = await api.post('/feedback', { category, comment })
    return response.data
  },
}
