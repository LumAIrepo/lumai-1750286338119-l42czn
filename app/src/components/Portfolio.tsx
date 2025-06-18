import React from "react"
```typescript
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronRight, TrendingUp, TrendingDown, Clock, DollarSign, Activity, Eye } from "lucide-react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

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

interface Transaction {
  id: string
  type: 'deposit' | 'withdraw' | 'trade' | 'claim'
  market: string
  amount: number
  price?: number
  timestamp: number
  status: 'completed' | 'pending' | 'failed'
  signature: string
}

interface PortfolioStats {
  totalValue: number
  totalPnl: number
  totalPnlPercentage: number
  activePositions: number
  winRate: number
}

export default function Portfolio() {
  const { publicKey, connected } = useWallet()
  const { connection } = useConnection()
  const [positions, setPositions] = useState<Position[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState<PortfolioStats>({
    totalValue: 0,
    totalPnl: 0,
    totalPnlPercentage: 0,
    activePositions: 0,
    winRate: 0
  })
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null)
  const [isPositionDialogOpen, setIsPositionDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (connected && publicKey) {
      fetchPortfolioData()
    }
  }, [connected, publicKey])

  const fetchPortfolioData = async () => {
    try {
      setLoading(true)
      
      // Mock data - replace with actual API calls
      const mockPositions: Position[] = [
        {
          id: '1',
          market: 'SOL/USD',
          side: 'long',
          amount: 10,
          entryPrice: 95.50,
          currentPrice: 102.30,
          pnl: 68.00,
          pnlPercentage: 7.12,
          status: 'active',
          timestamp: Date.now() - 86400000
        },
        {
          id: '2',
          market: 'BTC/USD',
          side: 'short',
          amount: 0.5,
          entryPrice: 43500,
          currentPrice: 42800,
          pnl: 350.00,
          pnlPercentage: 1.61,
          status: 'active',
          timestamp: Date.now() - 172800000
        },
        {
          id: '3',
          market: 'ETH/USD',
          side: 'long',
          amount: 5,
          entryPrice: 2450,
          currentPrice: 2380,
          pnl: -350.00,
          pnlPercentage: -2.86,
          status: 'closed',
          timestamp: Date.now() - 259200000
        }
      ]

      const mockTransactions: Transaction[] = [
        {
          id: '1',
          type: 'trade',
          market: 'SOL/USD',
          amount: 10,
          price: 95.50,
          timestamp: Date.now() - 86400000,
          status: 'completed',
          signature: '5KJp7...'
        },
        {
          id: '2',
          type: 'deposit',
          market: 'USDC',
          amount: 5000,
          timestamp: Date.now() - 172800000,
          status: 'completed',
          signature: '3Hx9k...'
        },
        {
          id: '3',
          type: 'trade',
          market: 'BTC/USD',
          amount: 0.5,
          price: 43500,
          timestamp: Date.now() - 259200000,
          status: 'completed',
          signature: '7Mn2p...'
        }
      ]

      const mockStats: PortfolioStats = {
        totalValue: 12450.00,
        totalPnl: 68.00,
        totalPnlPercentage: 0.55,
        activePositions: 2,
        winRate: 66.7
      }

      setPositions(mockPositions)
      setTransactions(mockTransactions)
      setStats(mockStats)
    } catch (error) {
      console.error('Error fetching portfolio data:', error)
      toast.error('Failed to load portfolio data')
    } finally {
      setLoading(false)
    }
  }

  const handleClosePosition = async (positionId: string) => {
    try {
      // Mock close position - replace with actual transaction
      toast.success('Position closed successfully')
      setIsPositionDialogOpen(false)
      fetchPortfolioData()
    } catch (error) {
      console.error('Error closing position:', error)
      toast.error('Failed to close position')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Connect Wallet</h2>
              <p className="text-slate-600 mb-4">Please connect your wallet to view your portfolio</p>
            </div>
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
            <p className="text-slate-600">Track your positions and trading history</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Value</p>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalValue)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total P&L</p>
                  <p className={cn(
                    "text-2xl font-bold",
                    stats.totalPnl >= 0 ? "text-emerald-600" : "text-red-600"
                  )}>
                    {formatCurrency(stats.totalPnl)}
                  </p>
                  <p className={cn(
                    "text-sm",
                    stats.totalPnl >= 0 ? "text-emerald-600" : "text-red-600"
                  )}>
                    {stats.totalPnlPercentage >= 0 ? '+' : ''}{stats.totalPnlPercentage.toFixed(2)}%
                  </p>
                </div>
                {stats.totalPnl >= 0 ? (
                  <TrendingUp className="h-8 w-8 text-emerald-600" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-red-600" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Active Positions</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.activePositions}</p>
                </div>
                <Activity className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Win Rate</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.winRate.toFixed(1)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="positions" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="positions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Positions</CardTitle>
              </CardHeader>
              <CardContent>
                {positions.filter(p => p.status === 'active').length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-600">No active positions</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {positions.filter(p => p.status === 'active').map((position) => (
                      <div
                        key={position.id}
                        className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                        onClick={() => {
                          setSelectedPosition(position)
                          setIsPositionDialogOpen(true)
                        }}
                      >
                        <div className="flex items-center space-x-4">
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-slate-900">{position.market}</h3>
                              <Badge variant={position.side === 'long' ? 'default' : 'secondary'}>
                                {position.side.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600">
                              {position.amount} @ {formatCurrency(position.entryPrice)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={cn(
                            "font-semibold",
                            position.pnl >= 0 ? "text-emerald-600" : "text-red-600"
                          )}>
                            {formatCurrency(position.pnl)}
                          </p>
                          <p className={cn(
                            "text-sm",
                            position.pnl >= 0 ? "text-emerald-600" : "text-red-600"
                          )}>
                            {position.pnlPercentage >= 0 ? '+' : ''}{position.pnlPercentage.toFixed(2)}%
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-600">No transactions found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 border border-slate-200 rounded-xl"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            transaction.type === 'trade' ? "bg-emerald-100" :
                            transaction.type === 'deposit' ? "bg-blue-100" :
                            transaction.type === 'withdraw' ? "bg-red-100" :
                            "bg-slate-100"
                          )}>
                            {transaction.type === 'trade' && <Activity className="h-5 w-5 text-emerald-600" />}
                            {transaction.type === 'deposit' && <TrendingUp className="h-5 w-5 text-blue-600" />}
                            {transaction.type === 'withdraw' && <TrendingDown className="h-5 w-5 text