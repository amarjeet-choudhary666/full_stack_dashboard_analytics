import { MetricCard } from "../dashboard/metric-card"
import { LineChartComponent } from "../charts/line-chart"
import { BarChartComponent } from "../charts/bar-chart"
import { DataTable, createSortableHeader } from "../dashboard/data-table"
import { useRevenueData } from "../../hooks/use-api"
import { DollarSign, TrendingUp, Calendar, BarChart3 } from "lucide-react"
import { format } from "date-fns"
import type { RevenueDataPoint } from "../../lib/types"
import type { ColumnDef } from "@tanstack/react-table"
import { exportData, EXPORT_COLUMNS, formatDataForExport } from "../../lib/export-utils"

const revenueColumns: ColumnDef<RevenueDataPoint>[] = [
  {
    accessorKey: "date",
    header: createSortableHeader("Date"),
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"))
      return (
        <div className="flex items-center">
          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
          {format(date, "MMM dd, yyyy")}
        </div>
      )
    },
  },
  {
    accessorKey: "revenue",
    header: createSortableHeader("Revenue"),
    cell: ({ row }) => {
      const revenue = parseFloat(row.getValue("revenue"))
      return (
        <div className="text-right font-medium text-green-600">
          ${revenue.toLocaleString()}
        </div>
      )
    },
  },
  {
    id: "growth",
    header: "Growth",
    cell: ({ row, table }) => {
      const currentRevenue = parseFloat(row.getValue("revenue"))
      const rowIndex = row.index
      const previousRow = table.getRowModel().rows[rowIndex + 1]
      
      if (!previousRow) return <div className="text-center text-muted-foreground">-</div>
      
      const previousRevenue = parseFloat(previousRow.getValue("revenue"))
      const growth = ((currentRevenue - previousRevenue) / previousRevenue) * 100
      
      return (
        <div className={`text-center font-medium ${growth > 0 ? 'text-green-600' : growth < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
          {growth > 0 ? '+' : ''}{growth.toFixed(1)}%
        </div>
      )
    },
  },
]

export function RevenuePage() {
  const { data: revenueData, isLoading, error } = useRevenueData()

  // Mock data as fallback
  const mockRevenueData = [
    { date: '2024-01-01', value: 45000 },
    { date: '2024-01-02', value: 52000 },
    { date: '2024-01-03', value: 48000 },
    { date: '2024-01-04', value: 61000 },
    { date: '2024-01-05', value: 55000 },
    { date: '2024-01-06', value: 58000 },
    { date: '2024-01-07', value: 63000 },
    { date: '2024-01-08', value: 59000 },
    { date: '2024-01-09', value: 67000 },
    { date: '2024-01-10', value: 72000 },
  ]

  // Transform data for charts - prioritize API data, fallback to mock data
  const chartData = (revenueData && Array.isArray(revenueData) && revenueData.length > 0)
    ? revenueData.map((item: RevenueDataPoint) => ({
        date: item.date,
        value: item.revenue,
      }))
    : mockRevenueData

  // Calculate metrics - prioritize API data, fallback to mock data
  const totalRevenue = (revenueData && Array.isArray(revenueData) && revenueData.length > 0) 
    ? revenueData.reduce((sum: number, item: RevenueDataPoint) => sum + item.revenue, 0) 
    : mockRevenueData.reduce((sum, item) => sum + item.value, 0)

  const avgRevenue = (revenueData && Array.isArray(revenueData) && revenueData.length > 0) 
    ? totalRevenue / revenueData.length 
    : mockRevenueData.reduce((sum, item) => sum + item.value, 0) / mockRevenueData.length

  const highestRevenue = (revenueData && Array.isArray(revenueData) && revenueData.length > 0)
    ? revenueData.reduce((max: RevenueDataPoint, item: RevenueDataPoint) => 
        item.revenue > max.revenue ? item : max
      )
    : { revenue: Math.max(...mockRevenueData.map(item => item.value)), date: '2024-01-10' }

  const dataPoints = (revenueData && Array.isArray(revenueData) && revenueData.length > 0) ? revenueData.length : mockRevenueData.length

  // Calculate growth trend - prioritize API data, fallback to mock calculation
  const calculateOverallGrowth = () => {
    const data = (revenueData && Array.isArray(revenueData) && revenueData.length > 1) 
      ? revenueData 
      : mockRevenueData.map(item => ({ revenue: item.value, date: item.date }))
    
    if (data.length < 2) return 0
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const firstRevenue = sortedData[0].revenue || (sortedData[0] as any).value
    const lastRevenue = sortedData[sortedData.length - 1].revenue || (sortedData[sortedData.length - 1] as any).value
    return ((lastRevenue - firstRevenue) / firstRevenue) * 100
  }

  const overallGrowth = calculateOverallGrowth()

  // Group revenue data by month for monthly breakdown - prioritize API data, fallback to mock data
  const monthlyData = (revenueData && Array.isArray(revenueData) && revenueData.length > 0)
    ? revenueData.reduce((acc: any[], item: RevenueDataPoint) => {
        const month = format(new Date(item.date), 'MMM')
        const existing = acc.find(m => m.name === month)
        if (existing) {
          existing.value += item.revenue
        } else {
          acc.push({ name: month, value: item.revenue })
        }
        return acc
      }, [])
    : [
        { name: 'Jan', value: 45000 },
        { name: 'Feb', value: 52000 },
        { name: 'Mar', value: 48000 },
        { name: 'Apr', value: 61000 },
        { name: 'May', value: 55000 },
        { name: 'Jun', value: 68000 },
      ]

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={totalRevenue}
          change={Math.abs(overallGrowth)}
          trend={overallGrowth > 0 ? 'up' : overallGrowth < 0 ? 'down' : 'neutral'}
          icon={<DollarSign className="h-4 w-4" />}
          loading={isLoading && !error}
          prefix="$"
        />
        <MetricCard
          title="Average Revenue"
          value={Math.round(avgRevenue)}
          icon={<BarChart3 className="h-4 w-4" />}
          loading={isLoading && !error}
          prefix="$"
        />
        <MetricCard
          title="Highest Revenue"
          value={highestRevenue?.revenue || 0}
          icon={<TrendingUp className="h-4 w-4" />}
          loading={isLoading && !error}
          prefix="$"
        />
        <MetricCard
          title="Data Points"
          value={dataPoints}
          icon={<Calendar className="h-4 w-4" />}
          loading={isLoading && !error}
        />
      </div>

      {/* Chart */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LineChartComponent
            data={chartData}
            title="Revenue Trend Over Time"
            color="#10b981"
            loading={isLoading && !error}
            height={400}
          />
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Revenue Insights</h3>
          <div className="space-y-3">
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Peak Revenue</div>
              <div className="font-semibold">
                ${(highestRevenue?.revenue || 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                {highestRevenue ? format(new Date(highestRevenue.date), 'MMM dd, yyyy') : 'Jan 10, 2024'}
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Growth Rate</div>
              <div className={`font-semibold ${overallGrowth > 0 ? 'text-green-600' : overallGrowth < 0 ? 'text-red-600' : ''}`}>
                {overallGrowth > 0 ? '+' : ''}{overallGrowth.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">
                Overall trend
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Tracking Period</div>
              <div className="font-semibold">
                {revenueData && Array.isArray(revenueData) && revenueData.length > 0 ? 
                  `${format(new Date(Math.min(...revenueData.map((r: RevenueDataPoint) => new Date(r.date).getTime()))), 'MMM yyyy')} - Present`
                  : 'Jan 2024 - Present'
                }
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Revenue Target</div>
              <div className="font-semibold">$75,000</div>
              <div className="text-sm text-muted-foreground">
                {((totalRevenue / 75000) * 100).toFixed(1)}% achieved
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min((totalRevenue / 75000) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        <BarChartComponent
          data={monthlyData}
          title="Monthly Revenue Breakdown"
          color="#3b82f6"
          loading={false}
          height={300}
        />
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Revenue Analysis</h3>
          <div className="space-y-3">
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Best Month</span>
                <span className="font-bold">
                  {monthlyData.length > 0 ? 
                    `${monthlyData.reduce((max, month) => month.value > max.value ? month : max).name} ($${Math.round(monthlyData.reduce((max, month) => month.value > max.value ? month : max).value / 1000)}K)` :
                    'June ($68K)'
                  }
                </span>
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Worst Month</span>
                <span className="font-bold">
                  {monthlyData.length > 0 ? 
                    `${monthlyData.reduce((min, month) => month.value < min.value ? month : min).name} ($${Math.round(monthlyData.reduce((min, month) => month.value < min.value ? month : min).value / 1000)}K)` :
                    'January ($45K)'
                  }
                </span>
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Monthly Average</span>
                <span className="font-bold">
                  ${monthlyData.length > 0 ? 
                    Math.round(monthlyData.reduce((sum, item) => sum + item.value, 0) / monthlyData.length / 1000) :
                    Math.round(329000 / 6 / 1000)
                  }K
                </span>
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Projected Annual</span>
                <span className="font-bold text-green-600">${Math.round((totalRevenue / dataPoints) * 365 / 1000)}K</span>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Data Table */}
        <DataTable
          columns={revenueColumns}
          data={chartData.map(item => ({
            id: `${item.date}-${item.value}`,
            date: item.date,
            revenue: item.value
          }))}
          title="Revenue Data"
          loading={isLoading && !error}
          searchKey="date"
          onExport={(format) => {
            const tableData = chartData.map(item => ({
              date: item.date,
              revenue: item.value
            }))
            const formattedData = formatDataForExport(tableData, EXPORT_COLUMNS.revenue)
            exportData(format, {
              filename: `revenue-data-${new Date().toISOString().split('T')[0]}`,
              title: 'Revenue Data Report',
              columns: EXPORT_COLUMNS.revenue,
              data: formattedData
            })
          }}
        />
      </div>
    </div>
  )
}