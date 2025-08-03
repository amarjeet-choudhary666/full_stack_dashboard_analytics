import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, DollarSign, Users, TrendingUp } from "lucide-react"
import { useCreateCampaign, useCreateRevenueDataPoint, useCreateOverviewMetrics } from "@/hooks/use-api"

interface AddDataFormProps {
  onSuccess?: () => void
}

export function AddDataForm({ onSuccess }: AddDataFormProps) {
  const [activeTab, setActiveTab] = useState<'campaign' | 'revenue' | 'overview'>('campaign')
  const [isOpen, setIsOpen] = useState(false)

  // Form states
  const [campaignForm, setCampaignForm] = useState({
    campaign: '',
    conversions: ''
  })

  const [revenueForm, setRevenueForm] = useState({
    revenue: ''
  })

  const [overviewForm, setOverviewForm] = useState({
    revenue: '',
    users: '',
    conversions: '',
    growth: ''
  })

  // Mutations
  const createCampaign = useCreateCampaign()
  const createRevenue = useCreateRevenueDataPoint()
  const createOverview = useCreateOverviewMetrics()

  const handleCampaignSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createCampaign.mutateAsync({
        campaign: campaignForm.campaign,
        conversions: parseInt(campaignForm.conversions)
      })
      setCampaignForm({ campaign: '', conversions: '' })
      setIsOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error('Error creating campaign:', error)
    }
  }

  const handleRevenueSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createRevenue.mutateAsync({
        revenue: parseFloat(revenueForm.revenue)
      })
      setRevenueForm({ revenue: '' })
      setIsOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error('Error creating revenue:', error)
    }
  }

  const handleOverviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createOverview.mutateAsync({
        revenue: parseFloat(overviewForm.revenue),
        users: parseInt(overviewForm.users),
        conversions: parseInt(overviewForm.conversions),
        growth: parseFloat(overviewForm.growth)
      })
      setOverviewForm({ revenue: '', users: '', conversions: '', growth: '' })
      setIsOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error('Error creating overview:', error)
    }
  }

  const tabs = [
    { id: 'campaign', label: 'Campaign', icon: TrendingUp },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'overview', label: 'Overview', icon: Users },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Data
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Data</DialogTitle>
          <DialogDescription>
            Add new campaign, revenue, or overview data to your dashboard.
          </DialogDescription>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Campaign Form */}
        {activeTab === 'campaign' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add Campaign</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCampaignSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Campaign Name</label>
                  <Input
                    placeholder="e.g., Summer Sale 2024"
                    value={campaignForm.campaign}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, campaign: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Conversions</label>
                  <Input
                    type="number"
                    placeholder="e.g., 150"
                    value={campaignForm.conversions}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, conversions: e.target.value }))}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createCampaign.isPending}
                >
                  {createCampaign.isPending ? 'Adding...' : 'Add Campaign'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Revenue Form */}
        {activeTab === 'revenue' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRevenueSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Revenue Amount ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g., 5000.00"
                    value={revenueForm.revenue}
                    onChange={(e) => setRevenueForm(prev => ({ ...prev, revenue: e.target.value }))}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createRevenue.isPending}
                >
                  {createRevenue.isPending ? 'Adding...' : 'Add Revenue'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Overview Form */}
        {activeTab === 'overview' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add Overview Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleOverviewSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Revenue ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="50000"
                      value={overviewForm.revenue}
                      onChange={(e) => setOverviewForm(prev => ({ ...prev, revenue: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Users</label>
                    <Input
                      type="number"
                      placeholder="1250"
                      value={overviewForm.users}
                      onChange={(e) => setOverviewForm(prev => ({ ...prev, users: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Conversions</label>
                    <Input
                      type="number"
                      placeholder="320"
                      value={overviewForm.conversions}
                      onChange={(e) => setOverviewForm(prev => ({ ...prev, conversions: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Growth (%)</label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="15.2"
                      value={overviewForm.growth}
                      onChange={(e) => setOverviewForm(prev => ({ ...prev, growth: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createOverview.isPending}
                >
                  {createOverview.isPending ? 'Adding...' : 'Add Overview Metrics'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  )
}