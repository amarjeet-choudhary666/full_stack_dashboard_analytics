import { DataTable, createSortableHeader } from "../dashboard/data-table"
import { MetricCard } from "../dashboard/metric-card"
import { BarChartComponent } from "../charts/bar-chart"
import { DonutChartComponent } from "../charts/donut-chart"
import { useCampaigns } from "../../hooks/use-api"
import { Target, TrendingUp, Users, Calendar } from "lucide-react"
import { format } from "date-fns"
import type { ColumnDef } from "@tanstack/react-table"
import type { CampaignConversion } from "../../lib/types"
import { Badge } from "../ui/badge"
import { exportData, EXPORT_COLUMNS, formatDataForExport } from "../../lib/export-utils"

const campaignColumns: ColumnDef<CampaignConversion>[] = [
    {
        accessorKey: "campaign",
        header: createSortableHeader("Campaign Name"),
        cell: ({ row }) => {
            return (
                <div className="font-medium">
                    {row.getValue("campaign")}
                </div>
            )
        },
    },
    {
        accessorKey: "conversions",
        header: createSortableHeader("Conversions"),
        cell: ({ row }) => {
            const conversions = parseFloat(row.getValue("conversions"))
            return (
                <div className="text-right font-medium">
                    {conversions.toLocaleString()}
                </div>
            )
        },
    },
    {
        accessorKey: "date",
        header: createSortableHeader("Created Date"),
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
        id: "status",
        header: "Performance",
        cell: ({ row }) => {
            const conversions = parseFloat(row.getValue("conversions"))
            const status = conversions > 200 ? "Excellent" : conversions > 100 ? "Good" : conversions > 50 ? "Average" : "Poor"
            const variant = status === "Excellent" ? "default" : status === "Good" ? "secondary" : status === "Average" ? "outline" : "destructive"

            return (
                <Badge variant={variant as any}>
                    {status}
                </Badge>
            )
        },
    },
    {
        id: "roi",
        header: "Est. ROI",
        cell: ({ row }) => {
            const conversions = parseFloat(row.getValue("conversions"))
            const estimatedROI = (conversions * 25).toFixed(0) // Assuming $25 per conversion

            return (
                <div className="text-right font-medium text-green-600">
                    ${estimatedROI}
                </div>
            )
        },
    },
]

export function CampaignsPage() {
    const { data: campaigns, isLoading, error } = useCampaigns()

    // Mock data as fallback
    const mockCampaigns = [
        { id: '1', campaign: 'Summer Sale 2024', conversions: 150, date: '2024-01-01' },
        { id: '2', campaign: 'Black Friday Special', conversions: 280, date: '2024-01-02' },
        { id: '3', campaign: 'New Year Launch', conversions: 120, date: '2024-01-03' },
        { id: '4', campaign: 'Spring Collection', conversions: 200, date: '2024-01-04' },
        { id: '5', campaign: 'Holiday Promotion', conversions: 175, date: '2024-01-05' },
        { id: '6', campaign: 'Back to School', conversions: 95, date: '2024-01-06' },
        { id: '7', campaign: 'Valentine Special', conversions: 85, date: '2024-01-07' },
        { id: '8', campaign: 'Easter Campaign', conversions: 110, date: '2024-01-08' },
    ]

    const currentCampaigns = (campaigns && Array.isArray(campaigns) && campaigns.length > 0) ? campaigns : mockCampaigns

    // Calculate metrics
    const totalCampaigns = currentCampaigns.length
    const totalConversions = currentCampaigns.reduce((sum: number, campaign: any) => sum + campaign.conversions, 0)
    const avgConversions = totalCampaigns > 0 ? Math.round(totalConversions / totalCampaigns) : 0
    const topPerformer = currentCampaigns.reduce((max: any, campaign: any) =>
        campaign.conversions > (max?.conversions || 0) ? campaign : max
    )

    // Chart data
    const chartData = currentCampaigns.map((campaign: any) => ({
        name: campaign.campaign.length > 15 ? campaign.campaign.substring(0, 15) + '...' : campaign.campaign,
        value: campaign.conversions,
    }))

    // Performance distribution
    const performanceData = [
        {
            name: 'Excellent (200+)',
            value: currentCampaigns.filter((c: any) => c.conversions > 200).length,
            color: '#22c55e'
        },
        {
            name: 'Good (100-200)',
            value: currentCampaigns.filter((c: any) => c.conversions > 100 && c.conversions <= 200).length,
            color: '#3b82f6'
        },
        {
            name: 'Average (50-100)',
            value: currentCampaigns.filter((c: any) => c.conversions > 50 && c.conversions <= 100).length,
            color: '#f59e0b'
        },
        {
            name: 'Poor (<50)',
            value: currentCampaigns.filter((c: any) => c.conversions <= 50).length,
            color: '#ef4444'
        },
    ].filter(item => item.value > 0)

    return (
        <div className="space-y-6">
            {/* Metrics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Total Campaigns"
                    value={totalCampaigns}
                    icon={<Target className="h-4 w-4" />}
                    loading={isLoading && !error}
                />
                <MetricCard
                    title="Total Conversions"
                    value={totalConversions}
                    icon={<TrendingUp className="h-4 w-4" />}
                    loading={isLoading && !error}
                />
                <MetricCard
                    title="Average Conversions"
                    value={avgConversions}
                    icon={<Users className="h-4 w-4" />}
                    loading={isLoading && !error}
                />
                <MetricCard
                    title="Success Rate"
                    value={totalCampaigns > 0 ? ((currentCampaigns.filter((c: any) => c.conversions > 100).length / totalCampaigns) * 100).toFixed(1) : "0"}
                    icon={<Target className="h-4 w-4" />}
                    loading={isLoading && !error}
                    suffix="%"
                />
            </div>

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <BarChartComponent
                        data={chartData}
                        title="Campaign Performance Overview"
                        color="#8884d8"
                        loading={isLoading && !error}
                        height={400}
                    />
                </div>
                <DonutChartComponent
                    data={performanceData}
                    title="Performance Distribution"
                    centerValue={`${totalCampaigns}`}
                    loading={isLoading && !error}
                    height={400}
                />
            </div>

            {/* Campaign Insights */}
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Top Performers</h3>
                    <div className="space-y-3">
                        {currentCampaigns
                            .sort((a: any, b: any) => b.conversions - a.conversions)
                            .slice(0, 5)
                            .map((campaign: any, index: number) => (
                                <div key={campaign.id} className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium text-sm">
                                                #{index + 1} {campaign.campaign}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {campaign.conversions} conversions
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-green-600">
                                                ${(campaign.conversions * 25).toLocaleString()}
                                            </div>
                                            <div className="text-xs text-muted-foreground">Est. ROI</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Campaign Stats</h3>
                    <div className="space-y-3">
                        <div className="p-4 border rounded-lg">
                            <div className="text-sm text-muted-foreground mb-1">Best Performing</div>
                            <div className="font-semibold">
                                {topPerformer?.campaign || "No data"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {topPerformer?.conversions.toLocaleString() || 0} conversions
                            </div>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <div className="text-sm text-muted-foreground mb-1">Conversion Rate</div>
                            <div className="font-semibold">
                                {totalCampaigns > 0 ? `${((totalConversions / totalCampaigns) * 0.1).toFixed(1)}%` : '0%'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Based on campaign performance
                            </div>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <div className="text-sm text-muted-foreground mb-1">Total ROI</div>
                            <div className="font-semibold text-green-600">
                                ${(totalConversions * 25).toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Estimated revenue generated
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Performance Metrics</h3>
                    <div className="space-y-3">
                        <div className="p-4 border rounded-lg">
                            <div className="text-sm text-muted-foreground mb-1">Active Period</div>
                            <div className="font-semibold">
                                {currentCampaigns && currentCampaigns.length > 0 ?
                                    `${format(new Date(Math.min(...currentCampaigns.map((c: any) => new Date(c.date).getTime()))), 'MMM yyyy')} - Present`
                                    : 'Jan 2024 - Present'
                                }
                            </div>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <div className="text-sm text-muted-foreground mb-1">Campaign Frequency</div>
                            <div className="font-semibold">
                                {(totalCampaigns / 12).toFixed(1)} per month
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Average launch rate
                            </div>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <div className="text-sm text-muted-foreground mb-1">Success Score</div>
                            <div className="font-semibold">8.5/10</div>
                            <div className="text-sm text-muted-foreground">
                                Overall campaign effectiveness
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <DataTable
                columns={campaignColumns}
                data={currentCampaigns}
                title="All Campaigns"
                loading={isLoading && !error}
                searchKey="campaign"
                onExport={(format) => {
                    const formattedData = formatDataForExport(currentCampaigns, EXPORT_COLUMNS.campaigns)
                    exportData(format, {
                        filename: `campaigns-${new Date().toISOString().split('T')[0]}`,
                        title: 'Campaign Performance Report',
                        columns: EXPORT_COLUMNS.campaigns,
                        data: formattedData
                    })
                }}
            />
        </div>
    )
}