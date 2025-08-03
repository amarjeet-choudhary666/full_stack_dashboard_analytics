import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  trend?: 'up' | 'down' | 'neutral'
  icon: React.ReactNode
  loading?: boolean
  prefix?: string
  suffix?: string
}

export function MetricCard({
  title,
  value,
  change,
  trend = 'neutral',
  icon,
  loading = false,
  prefix = '',
  suffix = ''
}: MetricCardProps) {
  const [displayValue, setDisplayValue] = useState(0)

  // Animate number counting
  useEffect(() => {
    if (loading || typeof value !== 'number') return

    const duration = 1000
    const steps = 60
    const stepValue = value / steps
    let currentStep = 0

    const timer = setInterval(() => {
      currentStep++
      setDisplayValue(Math.floor(stepValue * currentStep))
      
      if (currentStep >= steps) {
        setDisplayValue(value)
        clearInterval(timer)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value, loading])

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3" />
      case 'down':
        return <TrendingDown className="h-3 w-3" />
      default:
        return <Minus className="h-3 w-3" />
    }
  }

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400'
      case 'down':
        return 'text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400'
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-950 dark:text-gray-400'
    }
  }

  if (loading) {
    return (
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-5 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-4 w-16" />
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <Card className="relative overflow-hidden h-full hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="text-muted-foreground">
            {icon}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-2">
            {prefix}
            {typeof value === 'number' ? displayValue.toLocaleString() : value}
            {suffix}
          </div>
          {change !== undefined && (
            <Badge
              variant="secondary"
              className={`text-xs ${getTrendColor()}`}
            >
              {getTrendIcon()}
              <span className="ml-1">
                {Math.abs(change)}%
              </span>
            </Badge>
          )}
        </CardContent>
        
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 pointer-events-none" />
      </Card>
    </motion.div>
  )
}