import { authedRequest } from './http'

export interface ExpertAnalyticsMetric {
  label: string
  value: string
  delta: string
}

export interface ExpertAnalyticsResponse {
  success: boolean
  metrics: {
    businessConversations: ExpertAnalyticsMetric
    proposalsSubmitted: ExpertAnalyticsMetric
    acceptanceRate: ExpertAnalyticsMetric
    avgMatchScore: ExpertAnalyticsMetric
    completedEngagements: ExpertAnalyticsMetric
    performanceScore: ExpertAnalyticsMetric
  }
  performanceOverTime: Array<{ label: string; count: number }>
  topIndustries: Array<{ name: string; count: number }>
  error?: string
}

export async function getExpertAnalytics(): Promise<ExpertAnalyticsResponse> {
  return authedRequest<ExpertAnalyticsResponse>('/api/expert/analytics')
}
