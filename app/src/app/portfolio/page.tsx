import React from "react"
```typescript
'use client'

import { useState, useEffect } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChevronRight, User, Settings, Plus, TrendingUp, TrendingDown, Clock, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Position {
  id: string
  market: string
  side: 'long' | 'short'
  amount: number
  entryPrice: number
  currentPrice: number
  pnl: number
  pnlPercentage: number
  status: 'active' | 'closed'
  timestamp: number
}

interface PredictionHistory {
  id: string
  market: string
  prediction: 'up' | 'down'
  amount: number
  targetPrice: number
  currentPrice: number
  outcome: 'pending' | 'won' | 'lost'
  payout: number
  timestamp: number
}

interface PortfolioStats {
  totalValue: number
  totalPnl: number
  totalPnlPercentage: number
  activePositions: number
  winRate: number
  totalTrades: number
}

export default function PortfolioPage() {
  const { publicKey, connected } = useWallet()
  const { connection } = useConnection()
  const [loading, setLoading] = useState(true)
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats>({
    totalValue: 0,
    totalPnl: 0,
    totalPnlPercentage: 0,
    activePositions: 0,
    winRate: 0,
    totalTrades: 0
  })
  const [positions, setPositions] = useState<Position[]>([])
  const [predictionHistory, setPredictionHistory] = useState<PredictionHistory[]>([])
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')

  useEffect(() => {
    if (connected && publicKey) {
      loadPortfolioData()
    }
  }, [connected, publicKey])

  const loadPortfolioData = async () => {
    try {
      setLoading(true)
      
      // Mock data - replace with actual API calls
      const mockStats: PortfolioStats = {
        totalValue: 2450.75,
        totalPnl: 325.50,
        totalPnlPercentage: 15.3,
        activePositions: 3,
        winRate: 68.5,
        totalTrades: 47
      }

      const mockPositions: Position[] = [
        {
          id: '1',
          market: 'SOL/USD',
          side: 'long',
          amount: 500,
          entryPrice: 98.50,
          currentPrice: 102.30,
          pnl: 19.29,
          pnlPercentage: 3.86,
          status: 'active',
          timestamp: Date.now() - 3600000
        },
        {
          id: '2',
          market: 'BTC/USD',
          side: 'short',
          amount: 1000,
          entryPrice: 43250,
          currentPrice: 42800,
          pnl: 10.41,
          pnlPercentage: 1.04,
          status: 'active',
          timestamp: Date.now() - 7200000
        },
        {
          id: '3',
          market: 'ETH/USD',
          side: 'long',
          amount: 750,
          entryPrice: 2650,
          currentPrice: 2720,
          pnl: 19.81,
          pnlPercentage: 2.64,
          status: 'active',
          timestamp: Date.now() - 1800000
        }
      ]

      const mockHistory: PredictionHistory[] = [
        {
          id: '1',
          market: 'SOL/USD',
          prediction: 'up',
          amount: 100,
          targetPrice: 105,
          currentPrice: 102.30,
          outcome: 'pending',
          payout: 0,
          timestamp: Date.now() - 1800000
        },
        {
          id: '2',
          market: 'BTC/USD',
          prediction: 'down',
          amount: 200,
          targetPrice: 42000,
          currentPrice: 42800,
          outcome: 'won',
          payout: 380,
          timestamp: Date.now() - 86400000
        },
        {
          id: '3',
          market: 'ETH/USD',
          prediction: 'up',
          amount: 150,
          targetPrice: 2700,
          currentPrice: 2720,
          outcome: 'won',
          payout: 285,
          timestamp: Date.now() - 172800000
        }
      ]

      setPortfolioStats(mockStats)
      setPositions(mockPositions)
      setPredictionHistory(mockHistory)
    } catch (error) {
      console.error('Error loading portfolio data:', error)
      toast.error('Failed to load portfolio data')
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    try {
      // Implement withdrawal logic here
      toast.success(`Withdrawal of ${withdrawAmount} SOL initiated`)
      setShowWithdrawDialog(false)
      setWithdrawAmount('')
    } catch (error) {
      console.error('Withdrawal error:', error)
      toast.error('Withdrawal failed')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-slate-900">Connect Wallet</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-slate-600 mb-4">
              Please connect your wallet to view your portfolio
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Portfolio</h1>
            <p className="text-slate-600">Track your predictions and positions</p>
          </div>
          <Button
            onClick={() => setShowWithdrawDialog(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Withdraw
          </Button>
        </div>

        {/* Portfolio Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-xl border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Value</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatCurrency(portfolioStats.totalValue)}
                  </p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <DollarSign className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total P&L</p>
                  <p className={cn(
                    "text-2xl font-bold",
                    portfolioStats.totalPnl >= 0 ? "text-emerald-600" : "text-red-500"
                  )}>
                    {formatCurrency(portfolioStats.totalPnl)}
                  </p>
                  <p className={cn(
                    "text-sm",
                    portfolioStats.totalPnlPercentage >= 0 ? "text-emerald-600" : "text-red-500"
                  )}>
                    {formatPercentage(portfolioStats.totalPnlPercentage)}
                  </p>
                </div>
                <div className={cn(
                  "p-3 rounded-xl",
                  portfolioStats.totalPnl >= 0 ? "bg-emerald-100" : "bg-red-100"
                )}>
                  {portfolioStats.totalPnl >= 0 ? (
                    <TrendingUp className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-red-500" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active Positions</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {portfolioStats.activePositions}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Win Rate</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {portfolioStats.winRate.toFixed(1)}%
                  </p>
                  <p className="text-sm text-slate-600">
                    {portfolioStats.totalTrades} trades
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="positions" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white rounded-xl p-1">
            <TabsTrigger value="positions" className="rounded-xl">Active Positions</TabsTrigger>
            <TabsTrigger value="history" className="rounded-xl">Prediction History</TabsTrigger>
          </TabsList>

          <TabsContent value="positions" className="space-y-4">
            <Card className="rounded-xl border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-900">Active Positions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {positions.map((position) => (
                    <div
                      key={position.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                    >
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-semibold text-slate-900">{position.market}</p>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={position.side === 'long' ? 'default' : 'secondary'}
                              className={cn(
                                "rounded-lg",
                                position.side === 'long' 
                                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                                  : "bg-red-100 text-red-700 hover:bg-red-100"
                              )}
                            >
                              {position.side.toUpperCase()}
                            </Badge>
                            <span className="text-sm text-slate-600">
                              {formatCurrency(position.amount)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "font-semibold",
                          position.pnl >= 0 ? "text-emerald-600" : "text-red-500"
                        )}>
                          {formatCurrency(position.pnl)}
                        </p>
                        <p className={cn(
                          "text-sm",
                          position.pnlPercentage >= 0 ? "text-emerald-600" : "text-red-500"
                        )}>
                          {formatPercentage(position.pnlPercentage)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card className="rounded-xl border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-900">Prediction History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">