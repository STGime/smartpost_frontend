import api from './api'
import type { WebhookEndpoint, WebhookDelivery } from '@/types'

interface ListEndpointsResponse {
  endpoints: Omit<WebhookEndpoint, 'secret'>[]
  available_events: string[]
  all_events: string[]
}

interface DeliveriesResponse {
  items: WebhookDelivery[]
  total: number
}

export const webhooksService = {
  async listEndpoints(): Promise<ListEndpointsResponse> {
    const response = await api.get<ListEndpointsResponse>('/webhook-endpoints')
    return response.data
  },

  async createEndpoint(data: { url: string; description?: string; events: string[] }): Promise<WebhookEndpoint> {
    const response = await api.post<WebhookEndpoint>('/webhook-endpoints', data)
    return response.data
  },

  async getEndpoint(id: string): Promise<WebhookEndpoint> {
    const response = await api.get<WebhookEndpoint>(`/webhook-endpoints/${id}`)
    return response.data
  },

  async updateEndpoint(
    id: string,
    data: { url?: string; description?: string; events?: string[]; is_active?: boolean; regenerate_secret?: boolean }
  ): Promise<WebhookEndpoint> {
    const response = await api.patch<WebhookEndpoint>(`/webhook-endpoints/${id}`, data)
    return response.data
  },

  async deleteEndpoint(id: string): Promise<void> {
    await api.delete(`/webhook-endpoints/${id}`)
  },

  async testEndpoint(id: string): Promise<{ deliveryId: string }> {
    const response = await api.post<{ deliveryId: string }>(`/webhook-endpoints/${id}/test`)
    return response.data
  },

  async listDeliveries(endpointId: string, params?: { limit?: number; offset?: number }): Promise<DeliveriesResponse> {
    const response = await api.get<DeliveriesResponse>(`/webhook-endpoints/${endpointId}/deliveries`, { params })
    return response.data
  },

  async retryDelivery(endpointId: string, deliveryId: string): Promise<void> {
    await api.post(`/webhook-endpoints/${endpointId}/deliveries/${deliveryId}/retry`)
  },
}
