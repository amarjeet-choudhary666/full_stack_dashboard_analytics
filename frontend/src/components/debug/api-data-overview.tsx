import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { 
  useLatestOverviewMetrics, 
  useAllOverviewMetrics,
  useCampaigns, 
  useRevenueData,
  useHealthCheck
} from "../../hooks/use-api"
import { 
  Database, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  EyeOff
} from "lucide-react"
import { format } from "date-fns"

export function ApiDataOverview() {
  const [isVisible, setIsVisible] = useState(false)
  
  const { data: latestMetrics, isLoading: metricsLoading, error: metricsError, refetch: refetchLatest } = useLatestOverviewMetrics()
  const { data: allMetrics, isLoading: allMetricsLoading, error: allMetricsError, refetch: refetchAll } = useAllOverviewMetrics()
  const { data: campaigns, isLoading: campaignsLoading, error: campaignsError, refetch: refetchCampaigns } = useCampaigns()
  const { data: revenueData, isLoading: revenueLoading, error: revenueError, refetch: refetchRevenue } = useRevenueData()
  const { data: healthData, isLoading: healthLoading, error: healthError, refetch: refetchHealth } = useHealthCheck()

  const refreshAll = () => {
    refetchLatest()
    refetchAll()
    refetchCampaigns()
    refetchRevenue()
    refetchHealth()
  }

  const getStatusBadge = (isLoading: boolean, error: any, data: any) => {
    if (isLoading) {
      return <Badge variant="outline" className="text-blue-600"><RefreshCw className="w-3 h-3 mr-1 animate-spin" />Loading</Badge>
    }
    if (error) {
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Error</Badge>
    }
    if (data && (Array.isArray(data) ? data.length > 0 : true)) {
      return <Badge variant="default" className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Success</Badge>
    }
    return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />No Data</Badge>
  }

  const formatJson = (data: any) => {
    return JSON.stringify(data, null, 2)
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="shadow-lg"
        >
          <Database className="w-4 h-4 mr-2" />
          API Data
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed inset-4 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-lg shadow-2xl overflow-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Database className="w-6 h-6" />
            <h2 className="text-2xl font-bold">API Data Overview</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={refreshAll} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh All
            </Button>
            <Button onClick={() => setIsVisible(false)} variant="outline" size="sm">
              <EyeOff className="w-4 h-4 mr-2" />
              Hide
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Health Check */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                API Health
                {getStatusBadge(healthLoading, healthError, healthData)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {healthError ? (
                <div className="text-red-600 text-sm">
                  Error: {healthError.message}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Status:</span> {healthData?.status || 'Unknown'}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Base URL:</span> http://localhost:8080/api/v1
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Latest Overview Metrics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                Latest Overview
                {getStatusBadge(metricsLoading, metricsError, latestMetrics)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {metricsError ? (
                <div className="text-red-600 text-sm">
                  Error: {metricsError.message}
                </div>
              ) : latestMetrics ? (
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Revenue:</span> ${latestMetrics.revenue.toLocaleString()}</div>
                  <div><span className="font-medium">Users:</span> {latestMetrics.users.toLocaleString()}</div>
                  <div><span className="font-medium">Conversions:</span> {latestMetrics.conversions}</div>
                  <div><span className="font-medium">Growth:</span> {latestMetrics.growth}%</div>
                  <div><span className="font-medium">Date:</span> {format(new Date(latestMetrics.date), 'MMM dd, yyyy HH:mm')}</div>
                </div>
              ) : (
                <div className="text-muted-foreground text-sm">No data available</div>
              )}
            </CardContent>
          </Card>

          {/* All Overview Metrics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                All Overview Data
                {getStatusBadge(allMetricsLoading, allMetricsError, allMetrics)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {allMetricsError ? (
                <div className="text-red-600 text-sm">
                  Error: {allMetricsError.message}
                </div>
              ) : (
                <div className="text-sm">
                  <span className="font-medium">Total Records:</span> {allMetrics?.length || 0}
                  {allMetrics && allMetrics.length > 0 && (
                    <div className="mt-2">
                      <span className="font-medium">Date Range:</span> 
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(Math.min(...allMetrics.map(m => new Date(m.date).getTime()))), 'MMM dd, yyyy')} - 
                        {format(new Date(Math.max(...allMetrics.map(m => new Date(m.date).getTime()))), 'MMM dd, yyyy')}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Campaigns */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                Campaigns
                {getStatusBadge(campaignsLoading, campaignsError, campaigns)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {campaignsError ? (
                <div className="text-red-600 text-sm">
                  Error: {campaignsError.message}
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Total Campaigns:</span> {campaigns?.length || 0}</div>
                  {campaigns && campaigns.length > 0 && (
                    <>
                      <div><span className="font-medium">Total Conversions:</span> {campaigns.reduce((sum, c) => sum + c.conversions, 0)}</div>
                      <div><span className="font-medium">Top Campaign:</span> {campaigns.reduce((max, c) => c.conversions > max.conversions ? c : max).campaign}</div>
                      <div className="text-xs text-muted-foreground">
                        Latest: {campaigns.length > 0 ? format(new Date(Math.max(...campaigns.map(c => new Date(c.date).getTime()))), 'MMM dd, yyyy') : 'N/A'}
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Revenue Data */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                Revenue Data
                {getStatusBadge(revenueLoading, revenueError, revenueData)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {revenueError ? (
                <div className="text-red-600 text-sm">
                  Error: {revenueError.message}
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Total Records:</span> {revenueData?.length || 0}</div>
                  {revenueData && revenueData.length > 0 && (
                    <>
                      <div><span className="font-medium">Total Revenue:</span> ${revenueData.reduce((sum, r) => sum + r.revenue, 0).toLocaleString()}</div>
                      <div><span className="font-medium">Average:</span> ${Math.round(revenueData.reduce((sum, r) => sum + r.revenue, 0) / revenueData.length).toLocaleString()}</div>
                      <div><span className="font-medium">Highest:</span> ${Math.max(...revenueData.map(r => r.revenue)).toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">
                        Latest: {revenueData.length > 0 ? format(new Date(Math.max(...revenueData.map(r => new Date(r.date).getTime()))), 'MMM dd, yyyy') : 'N/A'}
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* API Endpoints */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Available Endpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-xs">
                <div className="font-mono">GET /api/v1/health</div>
                <div className="font-mono">GET /api/v1/overview</div>
                <div className="font-mono">GET /api/v1/overview/latest</div>
                <div className="font-mono">POST /api/v1/overview</div>
                <div className="font-mono">GET /api/v1/campaigns</div>
                <div className="font-mono">POST /api/v1/campaigns</div>
                <div className="font-mono">GET /api/v1/revenue</div>
                <div className="font-mono">POST /api/v1/revenue</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Raw Data Section */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Raw API Responses</h3>
          <div className="grid gap-4">
            {latestMetrics && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Latest Overview Metrics (Raw)</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                    {formatJson(latestMetrics)}
                  </pre>
                </CardContent>
              </Card>
            )}

            {campaigns && campaigns.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Campaigns (Raw)</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                    {formatJson(campaigns)}
                  </pre>
                </CardContent>
              </Card>
            )}

            {revenueData && revenueData.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Revenue Data (Raw)</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                    {formatJson(revenueData)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}