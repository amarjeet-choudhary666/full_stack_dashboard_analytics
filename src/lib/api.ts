import type { OverviewMetrics, CampaignConversion, RevenueDataPoint } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  async getLatestOverviewMetrics(): Promise<OverviewMetrics> {
    return this.request<OverviewMetrics>('/overview/latest');
  }

  async getAllOverviewMetrics(): Promise<OverviewMetrics[]> {
    return this.request<OverviewMetrics[]>('/overview');
  }

  async createOverviewMetrics(data: Omit<OverviewMetrics, 'id' | 'date'>): Promise<OverviewMetrics> {
    return this.request<OverviewMetrics>('/overview', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCampaigns(): Promise<CampaignConversion[]> {
    return this.request<CampaignConversion[]>('/campaigns');
  }

  async createCampaign(data: Omit<CampaignConversion, 'id' | 'date'>): Promise<CampaignConversion> {
    return this.request<CampaignConversion>('/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getRevenueData(): Promise<RevenueDataPoint[]> {
    return this.request<RevenueDataPoint[]>('/revenue');
  }

  async createRevenueDataPoint(data: Omit<RevenueDataPoint, 'id' | 'date'>): Promise<RevenueDataPoint> {
    return this.request<RevenueDataPoint>('/revenue', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async healthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health');
  }
}

export const apiClient = new ApiClient();
