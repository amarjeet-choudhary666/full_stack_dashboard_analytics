import { MetricCard } from "../dashboard/metric-card"
import { LineChartComponent } from "../charts/line-chart"
import { BarChartComponent } from "../charts/bar-chart"
import { DonutChartComponent } from "../charts/donut-chart"
import {
  useLatestOverviewMetrics,
  useCampaigns,
  useRevenueData,
  useMockDataStatus
} from "../../hooks/use-api"
import {
  DollarSign,
  Users,
  TrendingUp,
  Target,
  BarChart3,
  PieChart,
  Activity,
  AlertTriangle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import type { CampaignConversion, RevenueDataPoint } from "../../lib/types"

export function AnalyticsPage() {
  const { data: latestMetrics, isLoading: metricsLoading, error: metricsError } = useLatestOverviewMetrics()
  const { data: campaigns, isLoading: campaignsLoading, error: campaignsError } = useCampaigns()
  const { data: revenueData, isLoading: revenueLoading, error: revenueError } = useRevenueData()
  
  // We're not using allMetrics data in this component, so we don't need to fetch it
  // const { data: allMetrics, isLoading: allMetricsLoading } = useAllOverviewMetrics()
  
  // Check if we're using mock data
  const { isUsingMockData } = useMockDataStatus()

  // Transform data for comprehensive analytics - API data with mock fallback is now handled in hooks
  const revenueChartData = revenueData?.map((item: RevenueDataPoint) => ({
    date: item.date,
    value: item.revenue,
  })) || []

  const campaignBarData = campaigns?.slice(0, 10).map((campaign: CampaignConversion) => ({
    name: campaign.campaign.length > 12 ? campaign.campaign.substring(0, 12) + '...' : campaign.campaign,
    value: campaign.conversions,
  })) || []

  const currentMetrics = latestMetrics || {
    revenue: 0,
    users: 0,
    conversions: 0,
    growth: 0
  }

  const performanceDonutData = currentMetrics ? [
    { name: 'Revenue', value: currentMetrics.revenue / 1000, color: '#8884d8' },
    { name: 'Users', value: currentMetrics.users, color: '#82ca9d' },
    { name: 'Conversions', value: currentMetrics.conversions * 10, color: '#ffc658' },
  ] : []

  // Calculate comprehensive metrics from API data
  const totalRevenue = (revenueData && Array.isArray(revenueData)) ? revenueData.reduce((sum: number, item: RevenueDataPoint) => sum + item.revenue, 0) : (currentMetrics?.revenue || 0)
  const totalCampaigns = (campaigns && Array.isArray(campaigns)) ? campaigns.length : 0
  const totalConversions = (campaigns && Array.isArray(campaigns)) ? campaigns.reduce((sum: number, campaign: CampaignConversion) => sum + campaign.conversions, 0) : (currentMetrics?.conversions || 0)
  const avgConversionRate = totalCampaigns > 0 ? (totalConversions / totalCampaigns) * 0.1 : 0

  return (
    <div className="space-y-6">
      {/* Mock Data Warning */}
      {isUsingMockData && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Demo Mode</span>
              <span className="text-sm">Showing mock data - backend connection unavailable</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={totalRevenue}
          change={currentMetrics?.growth}
          trend={currentMetrics?.growth && currentMetrics.growth > 0 ? "up" : currentMetrics?.growth && currentMetrics.growth < 0 ? "down" : "neutral"}
          icon={<DollarSign className="h-4 w-4" />}
          loading={revenueLoading && !revenueError}
          prefix="$"
        />
        <MetricCard
          title="Active Users"
          value={currentMetrics?.users || 0}
          change={currentMetrics?.growth && Math.abs(currentMetrics.growth * 0.8)}
          trend={currentMetrics?.growth && currentMetrics.growth > 0 ? "up" : "down"}
          icon={<Users className="h-4 w-4" />}
          loading={metricsLoading && !metricsError}
        />
        <MetricCard
          title="Conversion Rate"
          value={avgConversionRate.toFixed(1)}
          change={currentMetrics?.growth && Math.abs(currentMetrics.growth * 0.3)}
          trend={currentMetrics?.growth && currentMetrics.growth > 0 ? "up" : "down"}
          icon={<Target className="h-4 w-4" />}
          loading={campaignsLoading && !campaignsError}
          suffix="%"
        />
        <MetricCard
          title="Growth Rate"
          value={currentMetrics?.growth || 0}
          change={currentMetrics?.growth && Math.abs(currentMetrics.growth)}
          trend={currentMetrics?.growth && currentMetrics.growth > 0 ? "up" : "down"}
          icon={<TrendingUp className="h-4 w-4" />}
          loading={metricsLoading && !metricsError}
          suffix="%"
        />
      </div>

      {/* Main Analytics Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LineChartComponent
            data={revenueChartData}
            title="Revenue Performance Analysis"
            color="#8884d8"
            loading={revenueLoading && !revenueError}
            height={400}
          />
        </div>
        <DonutChartComponent
          data={performanceDonutData}
          title="Performance Distribution"
          centerValue={`$${(totalRevenue / 1000 || currentMetrics.revenue / 1000).toFixed(0)}K`}
          loading={metricsLoading && !metricsError}
          height={400}
        />
      </div>

      {/* Secondary Analytics */}
      <div className="grid gap-6 lg:grid-cols-2">
        <BarChartComponent
          data={campaignBarData}
          title="Top Campaign Performance"
          color="#82ca9d"
          loading={campaignsLoading && !campaignsError}
          height={350}
        />

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Analytics Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Total Campaigns</div>
                  <div className="text-2xl font-bold">{totalCampaigns}</div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Avg Revenue</div>
                  <div className="text-2xl font-bold">
                    ${revenueData && Array.isArray(revenueData) && revenueData.length > 0 ? Math.round(totalRevenue / revenueData.length).toLocaleString() : (currentMetrics ? Math.round(currentMetrics.revenue).toLocaleString() : '0')}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">Revenue Growth</span>
                  <span className={`font-bold ${currentMetrics?.growth && currentMetrics.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {currentMetrics?.growth ? `${currentMetrics.growth > 0 ? '+' : ''}${currentMetrics.growth.toFixed(1)}%` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">User Engagement</span>
                  <span className={`font-bold ${currentMetrics?.growth && currentMetrics.growth > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {currentMetrics?.growth ? `${currentMetrics.growth > 0 ? '+' : ''}${(currentMetrics.growth * 0.8).toFixed(1)}%` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">Campaign Success</span>
                  <span className={`font-bold ${currentMetrics?.growth && currentMetrics.growth > 0 ? 'text-purple-600' : 'text-red-600'}`}>
                    {currentMetrics?.growth ? `${currentMetrics.growth > 0 ? '+' : ''}${(currentMetrics.growth * 1.2).toFixed(1)}%` : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="text-sm text-muted-foreground mb-2">Performance Score</div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                  <span className="text-sm font-bold">78/100</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Bounce Rate</div>
              <div className="text-xl font-bold">24.5%</div>
            </div>
            <BarChart3 className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Session Duration</div>
              <div className="text-xl font-bold">4m 32s</div>
            </div>
            <Activity className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Page Views</div>
              <div className="text-xl font-bold">12.4K</div>
            </div>
            <PieChart className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">CTR</div>
              <div className="text-xl font-bold">3.2%</div>
            </div>
            <Target className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">ROI</div>
              <div className="text-xl font-bold">245%</div>
            </div>
            <TrendingUp className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">ROAS</div>
              <div className="text-xl font-bold">4.2x</div>
            </div>
            <DollarSign className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
      </div>
    </div>
  )
}