import React from "react"
```typescript
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronRight, User, Settings, Plus, TrendingUp, TrendingDown, Clock, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"
import MarketChart from "@/components/market-chart"
import BettingInterface from "@/components/betting-interface"
import MarketActivity from "@/components/market-activity"

interface Market {
  id: string
  title: string
  description: string
  category: string
  endDate: string
  totalVolume: number
  yesPrice: number
  noPrice: number
  yesShares: number
  noShares: number
  status: 'active' | 'resolved' | 'closed'
  resolution: 'yes' | 'no' | null
  createdBy: string
  createdAt: string
}

interface MarketPageProps {
  params: Promise<{ id: string }>
}

async function getMarket(id: string): Promise<Market | null> {
  // Mock data - replace with actual API call
  const markets: Market[] = [
    {
      id: '1',
      title: 'Will Bitcoin reach $100,000 by end of 2024?',
      description: 'This market resolves to YES if Bitcoin (BTC) reaches or exceeds $100,000 USD on any major exchange by December 31, 2024, 11:59 PM UTC.',
      category: 'Cryptocurrency',
      endDate: '2024-12-31T23:59:59Z',
      totalVolume: 125000,
      yesPrice: 0.65,
      noPrice: 0.35,
      yesShares: 75000,
      noShares: 50000,
      status: 'active',
      resolution: null,
      createdBy: 'CryptoAnalyst',
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      title: 'Will Ethereum 2.0 staking rewards exceed 5% APY?',
      description: 'This market resolves to YES if Ethereum 2.0 staking rewards consistently exceed 5% APY for 30 consecutive days before the end date.',
      category: 'Cryptocurrency',
      endDate: '2024-06-30T23:59:59Z',
      totalVolume: 89000,
      yesPrice: 0.42,
      noPrice: 0.58,
      yesShares: 37380,
      noShares: 51620,
      status: 'active',
      resolution: null,
      createdBy: 'ETHValidator',
      createdAt: '2024-02-01T14:30:00Z'
    }
  ]
  
  return markets.find(market => market.id === id) || null
}

function MarketHeader({ market }: { market: Market }) {
  const timeRemaining = new Date(market.endDate).getTime() - Date.now()
  const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24))
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <span>Markets</span>
        <ChevronRight className="h-4 w-4" />
        <span>{market.category}</span>
        <ChevronRight className="h-4 w-4" />
        <span className="text-slate-900">{market.title}</span>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">{market.title}</h1>
          <Badge 
            variant={market.status === 'active' ? 'default' : 'secondary'}
            className={cn(
              market.status === 'active' && 'bg-emerald-100 text-emerald-800 border-emerald-200'
            )}
          >
            {market.status}
          </Badge>
        </div>
        
        <p className="text-slate-600 leading-relaxed">{market.description}</p>
        
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-500" />
            <span className="text-slate-600">
              {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Ended'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-slate-500" />
            <span className="text-slate-600">
              ${market.totalVolume.toLocaleString()} volume
            </span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-slate-500" />
            <span className="text-slate-600">Created by {market.createdBy}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function MarketPrices({ market }: { market: Market }) {
  const yesChange = 0.05 // Mock change
  const noChange = -0.05 // Mock change
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="border-emerald-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">YES</span>
            <div className="flex items-center gap-1 text-sm">
              {yesChange > 0 ? (
                <TrendingUp className="h-3 w-3 text-emerald-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span className={cn(
                "font-medium",
                yesChange > 0 ? "text-emerald-600" : "text-red-600"
              )}>
                {yesChange > 0 ? '+' : ''}{(yesChange * 100).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mb-1">
            ${market.yesPrice.toFixed(2)}
          </div>
          <div className="text-sm text-slate-500">
            {market.yesShares.toLocaleString()} shares
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">NO</span>
            <div className="flex items-center gap-1 text-sm">
              {noChange > 0 ? (
                <TrendingUp className="h-3 w-3 text-emerald-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span className={cn(
                "font-medium",
                noChange > 0 ? "text-emerald-600" : "text-red-600"
              )}>
                {noChange > 0 ? '+' : ''}{(noChange * 100).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mb-1">
            ${market.noPrice.toFixed(2)}
          </div>
          <div className="text-sm text-slate-500">
            {market.noShares.toLocaleString()} shares
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function MarketContent({ market }: { market: Market }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Price Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <MarketChart marketId={market.id} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Market Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <MarketActivity marketId={market.id} />
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-6">
        <BettingInterface market={market} />
        
        <Card>
          <CardHeader>
            <CardTitle>Market Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-slate-600">Category</span>
              <span className="font-medium">{market.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Created</span>
              <span className="font-medium">
                {new Date(market.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">End Date</span>
              <span className="font-medium">
                {new Date(market.endDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Total Volume</span>
              <span className="font-medium">
                ${market.totalVolume.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="h-4 bg-slate-200 rounded w-1/3 animate-pulse" />
            <div className="h-8 bg-slate-200 rounded w-2/3 animate-pulse" />
            <div className="h-16 bg-slate-200 rounded animate-pulse" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-32 bg-slate-200 rounded-xl animate-pulse" />
            <div className="h-32 bg-slate-200 rounded-xl animate-pulse" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="h-96 bg-slate-200 rounded-xl animate-pulse" />
            </div>
            <div className="h-96 bg-slate-200 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function MarketPage({ params }: MarketPageProps) {
  const { id } = await params
  const market = await getMarket(id)
  
  if (!market) {
    notFound()
  }
  
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <MarketHeader market={market} />
          <MarketPrices market={market} />
          <Suspense fallback={<LoadingSkeleton />}>
            <MarketContent market={market} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
```