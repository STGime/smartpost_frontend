import api from './api'
import type {
  PricingPlan,
  Subscription,
  PaymentHistoryItem,
  PlanName,
  BillingInterval,
  PaginatedResponse,
} from '@/types'

export const paymentsService = {
  async getPlans(): Promise<{
    plans: Record<string, { monthly: PricingPlan; yearly: PricingPlan }>
    allPlans: PricingPlan[]
  }> {
    const response = await api.get('/payments/plans')
    return response.data
  },

  async getStatus(): Promise<{ configured: boolean }> {
    const response = await api.get('/payments/status')
    return response.data
  },

  async createCheckout(
    planType: PlanName,
    billingInterval: BillingInterval,
    successUrl: string,
    cancelUrl: string
  ): Promise<{ url: string }> {
    const response = await api.post('/payments/checkout', {
      planType,
      billingInterval,
      successUrl,
      cancelUrl,
    })
    return response.data
  },

  async createPortalSession(): Promise<{ url: string }> {
    const response = await api.post('/payments/portal')
    return response.data
  },

  async getSubscription(): Promise<{
    subscription: Subscription | null
    hasActiveSubscription: boolean
  }> {
    const response = await api.get('/payments/subscription')
    return response.data
  },

  async cancelSubscription(): Promise<{ subscription: Subscription; message: string }> {
    const response = await api.post('/payments/subscription/cancel')
    return response.data
  },

  async resumeSubscription(): Promise<{ subscription: Subscription; message: string }> {
    const response = await api.post('/payments/subscription/resume')
    return response.data
  },

  async getPaymentHistory(
    limit = 10,
    offset = 0
  ): Promise<PaginatedResponse<PaymentHistoryItem>> {
    const response = await api.get('/payments/history', { params: { limit, offset } })
    return response.data
  },
}
