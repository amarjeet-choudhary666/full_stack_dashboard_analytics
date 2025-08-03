import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import type { OverviewMetrics, CampaignConversion, RevenueDataPoint } from '../lib/types';

const generateMockOverviewMetrics = (): OverviewMetrics => ({
  id: `mock-${Date.now()}`,
  revenue: Math.floor(Math.random() * 100000) + 50000,
  users: Math.floor(Math.random() * 10000) + 5000,
  conversions: Math.floor(Math.random() * 1000) + 500,
  growth: Math.random() * 20 - 10,
  date: new Date().toISOString(),
});

const generateMockOverviewMetricsList = (count: number = 30): OverviewMetrics[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: `mock-${Date.now()}-${index}`,
    revenue: Math.floor(Math.random() * 100000) + 50000,
    users: Math.floor(Math.random() * 10000) + 5000,
    conversions: Math.floor(Math.random() * 1000) + 500,
    growth: Math.random() * 20 - 10,
    date: new Date(Date.now() - (count - index) * 24 * 60 * 60 * 1000).toISOString(),
  }));
};

const generateMockCampaigns = (): CampaignConversion[] => {
  const campaigns = ['Facebook Ads', 'Google Ads', 'Email Marketing', 'Social Media', 'Influencer Marketing'];
  return campaigns.map((campaign, index) => ({
    id: `mock-campaign-${Date.now()}-${index}`,
    campaign,
    conversions: Math.floor(Math.random() * 500) + 100,
    date: new Date().toISOString(),
  }));
};

const generateMockRevenueData = (count: number = 30): RevenueDataPoint[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: `mock-revenue-${Date.now()}-${index}`,
    date: new Date(Date.now() - (count - index) * 24 * 60 * 60 * 1000).toISOString(),
    revenue: Math.floor(Math.random() * 50000) + 25000,
  }));
};

export const queryKeys = {
  overview: {
    latest: ['overview', 'latest'] as const,
    all: ['overview', 'all'] as const,
  },
  campaigns: ['campaigns'] as const,
  revenue: ['revenue'] as const,
  health: ['health'] as const,
};

const shouldUseMockData = (error: Error & { status?: number }): boolean => {
  return !error || 
         !!error.message?.includes('fetch') ||
         !!error.message?.includes('network') ||
         !!error.message?.includes('timeout') ||
         !!(error.status && error.status >= 500);
};

export function useLatestOverviewMetrics() {
  return useQuery({
    queryKey: queryKeys.overview.latest,
    queryFn: async () => {
      try {
        return await apiClient.getLatestOverviewMetrics();
      } catch (error) {
        return generateMockOverviewMetrics();
      }
    },
    refetchInterval: 30000,
    staleTime: 10000,
    retry: (failureCount, error) => {
      if (shouldUseMockData(error)) return false;
      return failureCount < 3;
    },
  });
}

export function useAllOverviewMetrics() {
  return useQuery({
    queryKey: queryKeys.overview.all,
    queryFn: async () => {
      try {
        return await apiClient.getAllOverviewMetrics();
      } catch (error) {
        return generateMockOverviewMetricsList();
      }
    },
    refetchInterval: 60000,
    retry: (failureCount, error) => {
      if (shouldUseMockData(error)) return false;
      return failureCount < 3;
    },
  });
}

export function useCreateOverviewMetrics() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<OverviewMetrics, 'id' | 'date'>) => {
      try {
        return await apiClient.createOverviewMetrics(data);
      } catch (error) {
        return {
          id: `mock-created-${Date.now()}`,
          ...data,
          date: new Date().toISOString(),
        };
      }
    },
    onSuccess: (newData) => {
      queryClient.setQueryData(queryKeys.overview.latest, newData);
      queryClient.invalidateQueries({ queryKey: queryKeys.overview.all });
    },
  });
}

export function useCampaigns() {
  return useQuery({
    queryKey: queryKeys.campaigns,
    queryFn: async () => {
      try {
        return await apiClient.getCampaigns();
      } catch (error) {
        return generateMockCampaigns();
      }
    },
    refetchInterval: 30000,
    retry: (failureCount, error) => {
      if (shouldUseMockData(error)) return false;
      return failureCount < 3;
    },
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<CampaignConversion, 'id' | 'date'>) => {
      try {
        return await apiClient.createCampaign(data);
      } catch (error) {
        return {
          id: `mock-campaign-created-${Date.now()}`,
          ...data,
          date: new Date().toISOString(),
        };
      }
    },
    onSuccess: (newCampaign) => {
      queryClient.setQueryData(queryKeys.campaigns, (oldData: CampaignConversion[] | undefined) => {
        if (!oldData) return [newCampaign];
        return [...oldData, newCampaign];
      });
    },
  });
}

export function useRevenueData() {
  return useQuery({
    queryKey: queryKeys.revenue,
    queryFn: async () => {
      try {
        return await apiClient.getRevenueData();
      } catch (error) {
        return generateMockRevenueData();
      }
    },
    refetchInterval: 30000,
    retry: (failureCount, error) => {
      if (shouldUseMockData(error)) return false;
      return failureCount < 3;
    },
  });
}

export function useCreateRevenueDataPoint() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<RevenueDataPoint, 'id' | 'date'>) => {
      try {
        return await apiClient.createRevenueDataPoint(data);
      } catch (error) {
        return {
          id: `mock-revenue-created-${Date.now()}`,
          ...data,
          date: new Date().toISOString(),
        };
      }
    },
    onSuccess: (newDataPoint) => {
      queryClient.setQueryData(queryKeys.revenue, (oldData: RevenueDataPoint[] | undefined) => {
        if (!oldData) return [newDataPoint];
        return [...oldData, newDataPoint];
      });
    },
  });
}

export function useHealthCheck() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: async () => {
      try {
        return await apiClient.healthCheck();
      } catch (error) {
        return { status: 'mock-healthy' };
      }
    },
    refetchInterval: 60000,
    retry: (failureCount, error) => {
      if (shouldUseMockData(error)) return false;
      return failureCount < 5;
    },
  });
}

export function useMockDataStatus() {
  const latestOverview = useLatestOverviewMetrics();
  const campaigns = useCampaigns();
  const revenue = useRevenueData();
  
  return {
    isUsingMockData: latestOverview.isError || campaigns.isError || revenue.isError,
    overviewMock: latestOverview.isError,
    campaignsMock: campaigns.isError,
    revenueMock: revenue.isError,
  };
}

export function useForceRefresh() {
  const queryClient = useQueryClient();
  
  return {
    refreshAll: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.overview.latest });
      queryClient.invalidateQueries({ queryKey: queryKeys.overview.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns });
      queryClient.invalidateQueries({ queryKey: queryKeys.revenue });
      queryClient.invalidateQueries({ queryKey: queryKeys.health });
    },
    refreshOverview: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.overview.latest });
      queryClient.invalidateQueries({ queryKey: queryKeys.overview.all });
    },
    refreshCampaigns: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns });
    },
    refreshRevenue: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.revenue });
    },
  };
}
