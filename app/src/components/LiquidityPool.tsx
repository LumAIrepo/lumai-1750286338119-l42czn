import React from "react"
```typescript
'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronRight, Plus, Settings } from "lucide-react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { PublicKey, Transaction } from "@solana/web3.js"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface LiquidityPosition {
  id: string
  tokenA: string
  tokenB: string
  amountA: number
  amountB: number
  lpTokens: number
  apy: number
  value: number
  status: 'active' | 'pending' | 'withdrawn'
}

interface PoolStats {
  totalValueLocked: number
  volume24h: number
  fees24h: number
  apy: number
}

interface TokenBalance {
  mint: string
  symbol: string
  balance: number
  decimals: number
}

export default function LiquidityPool() {
  const { publicKey, connected } = useWallet()
  const { connection } = useConnection()
  const [isAddLiquidityOpen, setIsAddLiquidityOpen] = useState(false)
  const [isRemoveLiquidityOpen, setIsRemoveLiquidityOpen] = useState(false)
  const [tokenAAmount, setTokenAAmount] = useState('')
  const [tokenBAmount, setTokenBAmount] = useState('')
  const [removeAmount, setRemoveAmount] = useState('')
  const [selectedPosition, setSelectedPosition] = useState<LiquidityPosition | null>(null)
  const [positions, setPositions] = useState<LiquidityPosition[]>([])
  const [poolStats, setPoolStats] = useState<PoolStats>({
    totalValueLocked: 0,
    volume24h: 0,
    fees24h: 0,
    apy: 0
  })
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (connected && publicKey) {
      fetchUserPositions()
      fetchPoolStats()
      fetchTokenBalances()
    }
  }, [connected, publicKey])

  const fetchUserPositions = async () => {
    try {
      setLoading(true)
      // Mock data - replace with actual Solana program calls
      const mockPositions: LiquidityPosition[] = [
        {
          id: '1',
          tokenA: 'SOL',
          tokenB: 'USDC',
          amountA: 10.5,
          amountB: 2100,
          lpTokens: 148.32,
          apy: 12.5,
          value: 4200,
          status: 'active'
        },
        {
          id: '2',
          tokenA: 'RAY',
          tokenB: 'USDC',
          amountA: 500,
          amountB: 1000,
          lpTokens: 70.71,
          apy: 18.2,
          value: 2000,
          status: 'active'
        }
      ]
      setPositions(mockPositions)
    } catch (error) {
      console.error('Error fetching positions:', error)
      toast.error('Failed to fetch liquidity positions')
    } finally {
      setLoading(false)
    }
  }

  const fetchPoolStats = async () => {
    try {
      // Mock data - replace with actual pool stats
      setPoolStats({
        totalValueLocked: 125000000,
        volume24h: 8500000,
        fees24h: 25500,
        apy: 15.8
      })
    } catch (error) {
      console.error('Error fetching pool stats:', error)
    }
  }

  const fetchTokenBalances = async () => {
    try {
      // Mock data - replace with actual token balance fetching
      const mockBalances: TokenBalance[] = [
        { mint: 'So11111111111111111111111111111111111111112', symbol: 'SOL', balance: 25.5, decimals: 9 },
        { mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', symbol: 'USDC', balance: 5000, decimals: 6 },
        { mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', symbol: 'RAY', balance: 1200, decimals: 6 }
      ]
      setTokenBalances(mockBalances)
    } catch (error) {
      console.error('Error fetching token balances:', error)
    }
  }

  const handleAddLiquidity = async () => {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet')
      return
    }

    if (!tokenAAmount || !tokenBAmount) {
      toast.error('Please enter amounts for both tokens')
      return
    }

    try {
      setLoading(true)
      // Mock transaction - replace with actual Solana program interaction
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Liquidity added successfully!')
      setIsAddLiquidityOpen(false)
      setTokenAAmount('')
      setTokenBAmount('')
      await fetchUserPositions()
    } catch (error) {
      console.error('Error adding liquidity:', error)
      toast.error('Failed to add liquidity')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveLiquidity = async () => {
    if (!connected || !publicKey || !selectedPosition) {
      toast.error('Please connect your wallet and select a position')
      return
    }

    if (!removeAmount) {
      toast.error('Please enter the amount to remove')
      return
    }

    try {
      setLoading(true)
      // Mock transaction - replace with actual Solana program interaction
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Liquidity removed successfully!')
      setIsRemoveLiquidityOpen(false)
      setRemoveAmount('')
      setSelectedPosition(null)
      await fetchUserPositions()
    } catch (error) {
      console.error('Error removing liquidity:', error)
      toast.error('Failed to remove liquidity')
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(2)}K`
    }
    return `$${num.toFixed(2)}`
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
              Please connect your wallet to access liquidity pools
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Liquidity Pools</h1>
            <p className="text-slate-600 mt-1">Provide liquidity and earn fees</p>
          </div>
          <Button 
            onClick={() => setIsAddLiquidityOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Liquidity
          </Button>
        </div>

        {/* Pool Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="rounded-xl border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Value Locked</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatNumber(poolStats.totalValueLocked)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">24h Volume</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatNumber(poolStats.volume24h)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">24h Fees</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatNumber(poolStats.fees24h)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Average APY</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {poolStats.apy.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Positions */}
        <Card className="rounded-xl border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900">Your Liquidity Positions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-slate-600">Loading positions...</p>
              </div>
            ) : positions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-600">No liquidity positions found</p>
                <Button 
                  onClick={() => setIsAddLiquidityOpen(true)}
                  className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                >
                  Add Your First Position
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {positions.map((position) => (
                  <div 
                    key={position.id}
                    className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-emerald-600">
                            {position.tokenA.charAt(0)}
                          </span>
                        </div>
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-blue-600">
                            {position.tokenB.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {position.tokenA}/{position.tokenB}
                        </p>
                        <p className="text-sm text-slate-600">
                          {position.amountA} {position.tokenA} + {position.amountB} {position.tokenB}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">
                          {formatNumber(position.value)}
                        </p>
                        <p className="text-sm text-slate-600">
                          {position.lpTokens.toFixed(2)} LP tokens
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                          {position.apy.toFixed(1)}% APY
                        </Badge>
                        <p className="text-sm text-slate-600 mt-1">
                          {position.status}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPosition(position)
                          setIsRemoveLiquidityOpen(true)
                        }}
                        className="rounded-xl"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Liquidity Dialog */}
        <Dialog open={isAddLiquidityOpen} onOpenChange={setIsAddLiquidityOpen}>
          <DialogContent className="sm:max-w-md rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-slate-900">Add Liquidity</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tokenA" className="text-slate-700">Token A Amount</Label>
                <Input
                  id="tokenA"
                  type="number"
                  placeholder="0.00"
                  value={tokenAAmount}
                  onChange={(e) => setTokenAAmount(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tokenB" className="