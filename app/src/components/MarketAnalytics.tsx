import React from "react"
```typescript
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, BarChart3, PieChart, Activity, DollarSign, Users, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface MarketData {
  totalVolume: number
  totalMarkets: number
  activeUsers: number
  totalValueLocked: number
  volumeChange24h: number
  marketsChange24h: number
  usersChange24h: number
  tvlChange24h: number
}

interface MarketMetric {
  id: string
  name: string
  category: string
  volume24h: number
  totalVolume: number
  participants: number
  endDate: string
  status: 'active' | 'resolved' | 'pending'
  odds: {
    yes: number
    no: number
  }
}

interface ChartDataPoint {
  timestamp: string
  volume: number
  markets: number
  users: number
}

export default function MarketAnalytics() {
  const [marketData, setMarketData] = useState<MarketData>({
    totalVolume: 0,
    totalMarkets: 0,
    activeUsers: 0,
    totalValueLocked: 0,
    volumeChange24h: 0,
    marketsChange24h: 0,
    usersChange24h: 0,
    tvlChange24h: 0
  })

  const [topMarkets, setTopMarkets] = useState<MarketMetric[]>([])
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d'>('24h')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMarketData()
    fetchTopMarkets()
    fetchChartData()
  }, [selectedTimeframe])

  const fetchMarketData = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setMarketData({
        totalVolume: 2847392.45,
        totalMarkets: 1247,
        activeUsers: 8934,
        totalValueLocked: 15847293.67,
        volumeChange24h: 12.4,
        marketsChange24h: 3.2,
        usersChange24h: 8.7,
        tvlChange24h: 5.9
      })
    } catch (error) {
      console.error('Failed to fetch market data:', error)
    }
  }

  const fetchTopMarkets = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setTopMarkets([
        {
          id: '1',
          name: 'Will Bitcoin reach $100k by end of 2024?',
          category: 'Crypto',
          volume24h: 45892.34,
          totalVolume: 234567.89,
          participants: 1247,
          endDate: '2024-12-31',
          status: 'active',
          odds: { yes: 0.67, no: 0.33 }
        },
        {
          id: '2',
          name: 'US Presidential Election 2024 Winner',
          category: 'Politics',
          volume24h: 38472.91,
          totalVolume: 189234.56,
          participants: 2134,
          endDate: '2024-11-05',
          status: 'active',
          odds: { yes: 0.52, no: 0.48 }
        },
        {
          id: '3',
          name: 'Ethereum 2.0 Full Launch by Q2 2024',
          category: 'Crypto',
          volume24h: 29384.72,
          totalVolume: 156789.23,
          participants: 892,
          endDate: '2024-06-30',
          status: 'resolved',
          odds: { yes: 0.78, no: 0.22 }
        }
      ])
    } catch (error) {
      console.error('Failed to fetch top markets:', error)
    }
  }

  const fetchChartData = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600))
      
      const mockData: ChartDataPoint[] = []
      const now = new Date()
      const days = selectedTimeframe === '24h' ? 1 : selectedTimeframe === '7d' ? 7 : 30
      
      for (let i = days; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        mockData.push({
          timestamp: date.toISOString(),
          volume: Math.random() * 100000 + 50000,
          markets: Math.floor(Math.random() * 50 + 20),
          users: Math.floor(Math.random() * 1000 + 500)
        })
      }
      
      setChartData(mockData)
      setIsLoading(false)
    } catch (error) {
      console.error('Failed to fetch chart data:', error)
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const getStatusBadgeColor = (status: string): string => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'resolved':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  const renderChangeIndicator = (change: number) => {
    const isPositive = change >= 0
    return (
      <div className={cn(
        "flex items-center gap-1 text-sm font-medium",
        isPositive ? "text-emerald-600" : "text-red-600"
      )}>
        {isPositive ? (
          <TrendingUp className="h-4 w-4" />
        ) : (
          <TrendingDown className="h-4 w-4" />
        )}
        {Math.abs(change).toFixed(1)}%
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded-xl w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
              ))}
            </div>
            <div className="h-96 bg-slate-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Market Analytics</h1>
          <div className="flex items-center gap-3">
            <Button
              variant={selectedTimeframe === '24h' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeframe('24h')}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              24H
            </Button>
            <Button
              variant={selectedTimeframe === '7d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeframe('7d')}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              7D
            </Button>
            <Button
              variant={selectedTimeframe === '30d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeframe('30d')}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              30D
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Volume</CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {formatCurrency(marketData.totalVolume)}
              </div>
              {renderChangeIndicator(marketData.volumeChange24h)}
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Active Markets</CardTitle>
              <BarChart3 className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {formatNumber(marketData.totalMarkets)}
              </div>
              {renderChangeIndicator(marketData.marketsChange24h)}
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Active Users</CardTitle>
              <Users className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {formatNumber(marketData.activeUsers)}
              </div>
              {renderChangeIndicator(marketData.usersChange24h)}
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Value Locked</CardTitle>
              <Activity className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {formatCurrency(marketData.totalValueLocked)}
              </div>
              {renderChangeIndicator(marketData.tvlChange24h)}
            </CardContent>
          </Card>
        </div>

        {/* Charts and Analytics */}
        <Tabs defaultValue="volume" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-100">
            <TabsTrigger value="volume" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              Volume Trends
            </TabsTrigger>
            <TabsTrigger value="markets" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              Market Activity
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              User Engagement
            </TabsTrigger>
          </TabsList>

          <TabsContent value="volume" className="space-y-6">
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-900">Volume Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center bg-slate-50 rounded-xl">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-600">Chart visualization would be implemented here</p>
                    <p className="text-sm text-slate-500">Using libraries like Recharts or Chart.js</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="markets" className="space-y-6">
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-900">Market Creation Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center bg-slate-50 rounded-xl">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-600">Market activity chart would be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-900">User Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center bg-slate-50 rounded-xl">