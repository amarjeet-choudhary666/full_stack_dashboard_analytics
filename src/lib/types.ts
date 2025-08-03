export interface OverviewMetrics {
  id: string;
  revenue: number;
  users: number;
  conversions: number;
  growth: number;
  date: string;
}

export interface CampaignConversion {
  id: string;
  campaign: string;
  conversions: number;
  date: string;
}

export interface RevenueDataPoint {
  id: string;
  date: string;
  revenue: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface MetricTrend {
  current: number;
  previous: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}

export interface ApiResponse<T> {
  data?: T;
  status: 'success' | 'error';
  message?: string;
}

export interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
  };
}
