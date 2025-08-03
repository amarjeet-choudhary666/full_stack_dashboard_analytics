import { useState } from "react"
import { motion } from "framer-motion"
import {
  BarChart3,
  DollarSign,
  Users,
  TrendingUp,
  Menu,
  X,
  Home,
  Activity,
  PieChart
} from "lucide-react"
import { Button } from "../ui/button"
import { Sheet, SheetContent } from "../ui/sheet"
import { ThemeToggle } from "../theme-toggle"
import { MetricCard } from "./metric-card"
import { LineChartComponent } from "../charts/line-chart"
import { BarChartComponent } from "../charts/bar-chart"
import { DonutChartComponent } from "../charts/donut-chart"
import {
  useLatestOverviewMetrics,
  useCampaigns,
  useRevenueData
} from "../../hooks/use-api"
import type { CampaignConversion, RevenueDataPoint } from "../../lib/types"
import { AddDataForm } from "./add-data-form"
import { AnalyticsPage } from "../pages/analytics-page"
import { RevenuePage } from "../pages/revenue-page"
import { CampaignsPage } from "../pages/campaigns-page"
import { UsersPage } from "../pages/users-page"
import { ApiDataOverview } from "../debug/api-data-overview"

const navigation = [
  { name: 'Overview', id: 'overview', icon: Home },
  { name: 'Analytics', id: 'analytics', icon: BarChart3 },
  { name: 'Campaigns', id: 'campaigns', icon: TrendingUp },
  { name: 'Revenue', id: 'revenue', icon: DollarSign },
  { name: 'Users', id: 'users', icon: Users },
  { name: 'Reports', id: 'reports', icon: PieChart },
]

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activePage, setActivePage] = useState('overview')

  const { data: latestMetrics, isLoading: metricsLoading, error: metricsError } = useLatestOverviewMetrics()
  const { data: campaigns, isLoading: campaignsLoading } = useCampaigns()
  const { data: revenueData, isLoading: revenueLoading } = useRevenueData()

  // Mock data as fallbacks
  const mockRevenueData = [
    { date: '2024-01-01', value: 45000 },
    { date: '2024-01-02', value: 52000 },
    { date: '2024-01-03', value: 48000 },
    { date: '2024-01-04', value: 61000 },
    { date: '2024-01-05', value: 55000 },
  ]

  const mockCampaignData = [
    { name: 'Summer Sale', value: 150 },
    { name: 'Black Friday', value: 280 },
    { name: 'New Year', value: 120 },
    { name: 'Spring Launch', value: 200 },
  ]

  const mockMetrics = {
    revenue: 50000,
    users: 1250,
    conversions: 320,
    growth: 15.2
  }

  // Transform data for charts - prioritize API data, fallback to mock data
  const revenueChartData = (revenueData && Array.isArray(revenueData) && revenueData.length > 0) 
    ? revenueData.map((item: RevenueDataPoint) => ({
        date: item.date,
        value: item.revenue,
      }))
    : mockRevenueData

  const campaignBarData = (campaigns && Array.isArray(campaigns) && campaigns.length > 0)
    ? campaigns.map((campaign: CampaignConversion) => ({
        name: campaign.campaign.length > 15 ? campaign.campaign.substring(0, 15) + '...' : campaign.campaign,
        value: campaign.conversions,
      }))
    : mockCampaignData

  const currentMetrics = latestMetrics || mockMetrics

  const metricsDonutData = currentMetrics ? [
    { name: 'Revenue', value: currentMetrics.revenue / 1000, color: '#8884d8' },
    { name: 'Users', value: currentMetrics.users, color: '#82ca9d' },
    { name: 'Conversions', value: currentMetrics.conversions * 10, color: '#ffc658' },
  ] : []

  // Calculate trends based on growth data from API
  const revenueTrend = currentMetrics ? { change: currentMetrics.growth, trend: currentMetrics.growth > 0 ? 'up' as const : currentMetrics.growth < 0 ? 'down' as const : 'neutral' as const } : undefined
  const usersTrend = currentMetrics ? { change: Math.abs(currentMetrics.growth * 0.8), trend: currentMetrics.growth > 0 ? 'up' as const : 'down' as const } : undefined
  const conversionsTrend = currentMetrics ? { change: Math.abs(currentMetrics.growth * 0.6), trend: currentMetrics.growth > 0 ? 'up' as const : 'down' as const } : undefined
  const growthTrend = currentMetrics ? { change: Math.abs(currentMetrics.growth), trend: currentMetrics.growth > 0 ? 'up' as const : 'down' as const } : undefined

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col h-full ${mobile ? 'w-full' : 'w-64'}`}>
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ADmyBRAND
          </span>
        </div>
        {mobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => (
          <button
            key={item.name}
            onClick={() => {
              setActivePage(item.id)
              mobile && setSidebarOpen(false)
            }}
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 w-full text-left ${
              activePage === item.id
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.name}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground">
          © 2024 ADmyBRAND Insights
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow border-r bg-card">
          <Sidebar />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar mobile />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-2xl font-bold"
              >
                {navigation.find(nav => nav.id === activePage)?.name || 'Dashboard'}
              </motion.h1>
            </div>

            <div className="flex items-center space-x-4">
              <AddDataForm onSuccess={() => {
                // Optionally refresh data or show success message
                console.log('Data added successfully!')
              }} />
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6 space-y-6"
          >
            {/* Page Content */}
            {activePage === 'overview' && (
              <>
                {/* Metrics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Total Revenue"
                value={currentMetrics?.revenue || 0}
                change={revenueTrend?.change}
                trend={revenueTrend?.trend}
                icon={<DollarSign className="h-4 w-4" />}
                loading={metricsLoading && !metricsError}
                prefix="$"
              />
              <MetricCard
                title="Total Users"
                value={currentMetrics?.users || 0}
                change={usersTrend?.change}
                trend={usersTrend?.trend}
                icon={<Users className="h-4 w-4" />}
                loading={metricsLoading && !metricsError}
              />
              <MetricCard
                title="Conversions"
                value={currentMetrics?.conversions || 0}
                change={conversionsTrend?.change}
                trend={conversionsTrend?.trend}
                icon={<TrendingUp className="h-4 w-4" />}
                loading={metricsLoading && !metricsError}
              />
              <MetricCard
                title="Growth Rate"
                value={currentMetrics?.growth || 0}
                change={growthTrend?.change}
                trend={growthTrend?.trend}
                icon={<BarChart3 className="h-4 w-4" />}
                loading={metricsLoading && !metricsError}
                suffix="%"
              />
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <LineChartComponent
                  data={revenueChartData}
                  title="Revenue Over Time"
                  color="#8884d8"
                  loading={revenueLoading}
                  height={350}
                />
              </div>
              <DonutChartComponent
                data={metricsDonutData}
                title="Metrics Distribution"
                centerValue={latestMetrics ? `$${(latestMetrics.revenue / 1000).toFixed(0)}K` : undefined}
                loading={metricsLoading}
                height={350}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <BarChartComponent
                data={campaignBarData}
                title="Campaign Conversions"
                color="#82ca9d"
                loading={campaignsLoading}
                height={300}
              />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Quick Stats</h3>
                <div className="grid gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Active Campaigns</span>
                      <span className="font-bold">{(campaigns && Array.isArray(campaigns)) ? campaigns.length : 0}</span>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Avg. Conversion Rate</span>
                      <span className="font-bold">
                        {(campaigns && Array.isArray(campaigns) && campaigns.length > 0)
                          ? `${(campaigns.reduce((sum: number, c: CampaignConversion) => sum + c.conversions, 0) / campaigns.length).toFixed(1)}%`
                          : '0%'
                        }
                      </span>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Revenue</span>
                      <span className="font-bold">
                        ${(revenueData && Array.isArray(revenueData) ? revenueData.reduce((sum: number, r: RevenueDataPoint) => sum + r.revenue, 0) : 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </>
            )}

            {/* Other Pages */}
            {activePage === 'analytics' && <AnalyticsPage />}
            {activePage === 'revenue' && <RevenuePage />}
            {activePage === 'campaigns' && <CampaignsPage />}
            {activePage === 'users' && <UsersPage />}
            {activePage === 'reports' && (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">Reports Coming Soon</h3>
                <p className="text-muted-foreground">Advanced reporting features will be available soon.</p>
              </div>
            )}
          </motion.div>
        </main>
      </div>

      {/* API Data Overview - Debug Component */}
      <ApiDataOverview />
    </div>
  )
}