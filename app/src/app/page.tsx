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
import { ChevronRight, User, Settings, Plus, TrendingUp, Lock, Unlock, DollarSign } from "lucide-react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { PublicKey, Transaction } from "@solana/web3.js"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface PredictionMarket {
  id: string;
  title: string;
  description: string;
  endDate: Date;
  totalVolume: number;
  yesPrice: number;
  noPrice: number;
  status: 'active' | 'resolved' | 'expired';
  category: string;
}

interface UserPosition {
  marketId: string;
  position: 'yes' | 'no';
  amount: number;
  shares: number;
  currentValue: number;
}

export default function HomePage() {
  const { connected, publicKey } = useWallet();
  const { connection } = useConnection();
  const [markets, setMarkets] = useState<PredictionMarket[]>([]);
  const [userPositions, setUserPositions] = useState<UserPosition[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<PredictionMarket | null>(null);
  const [betAmount, setBetAmount] = useState('');
  const [betSide, setBetSide] = useState<'yes' | 'no'>('yes');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Mock data for demonstration
    const mockMarkets: PredictionMarket[] = [
      {
        id: '1',
        title: 'Will SOL reach $200 by end of 2024?',
        description: 'Solana (SOL) price prediction for end of year 2024',
        endDate: new Date('2024-12-31'),
        totalVolume: 125000,
        yesPrice: 0.65,
        noPrice: 0.35,
        status: 'active',
        category: 'Crypto'
      },
      {
        id: '2',
        title: 'Will Bitcoin ETF approval happen in Q1 2024?',
        description: 'SEC approval of Bitcoin spot ETF in first quarter',
        endDate: new Date('2024-03-31'),
        totalVolume: 89000,
        yesPrice: 0.42,
        noPrice: 0.58,
        status: 'active',
        category: 'Crypto'
      },
      {
        id: '3',
        title: 'Will Ethereum 2.0 staking rewards exceed 5%?',
        description: 'Annual percentage yield for ETH staking',
        endDate: new Date('2024-06-30'),
        totalVolume: 67000,
        yesPrice: 0.78,
        noPrice: 0.22,
        status: 'active',
        category: 'DeFi'
      }
    ];

    const mockPositions: UserPosition[] = [
      {
        marketId: '1',
        position: 'yes',
        amount: 100,
        shares: 153.8,
        currentValue: 115.2
      },
      {
        marketId: '2',
        position: 'no',
        amount: 50,
        shares: 86.2,
        currentValue: 48.7
      }
    ];

    setMarkets(mockMarkets);
    if (connected) {
      setUserPositions(mockPositions);
    }
  }, [connected]);

  const handleCreateMarket = async () => {
    if (!connected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setLoading(true);
    try {
      // Mock market creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Market created successfully!');
      setIsCreateDialogOpen(false);
    } catch (error) {
      toast.error('Failed to create market');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceBet = async () => {
    if (!connected || !selectedMarket) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!betAmount || parseFloat(betAmount) <= 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }

    setLoading(true);
    try {
      // Mock bet placement
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`Bet placed: ${betAmount} SOL on ${betSide.toUpperCase()}`);
      setSelectedMarket(null);
      setBetAmount('');
    } catch (error) {
      toast.error('Failed to place bet');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">SolanaPredict</h1>
            <p className="text-slate-600">Decentralized prediction markets on Solana</p>
          </div>
          <div className="flex items-center gap-4">
            {connected && (
              <Badge variant="outline" className="px-3 py-1">
                <User className="w-4 h-4 mr-2" />
                {publicKey?.toString().slice(0, 8)}...
              </Badge>
            )}
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
              disabled={!connected}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Market
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="rounded-xl border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Volume</p>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(281000)}</p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <DollarSign className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Active Markets</p>
                  <p className="text-2xl font-bold text-slate-900">{markets.filter(m => m.status === 'active').length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Your Positions</p>
                  <p className="text-2xl font-bold text-slate-900">{userPositions.length}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Lock className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Portfolio Value</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatCurrency(userPositions.reduce((sum, pos) => sum + pos.currentValue, 0))}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <Unlock className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="markets" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px] rounded-xl">
            <TabsTrigger value="markets" className="rounded-xl">Active Markets</TabsTrigger>
            <TabsTrigger value="positions" className="rounded-xl">My Positions</TabsTrigger>
          </TabsList>

          <TabsContent value="markets" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {markets.map((market) => (
                <Card key={market.id} className="rounded-xl border-slate-200 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <Badge variant="secondary" className="mb-2 rounded-lg">
                        {market.category}
                      </Badge>
                      <Badge 
                        variant={market.status === 'active' ? 'default' : 'secondary'}
                        className="rounded-lg"
                      >
                        {market.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg leading-tight">{market.title}</CardTitle>
                    <p className="text-sm text-slate-600">{market.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Volume:</span>
                      <span className="font-medium">{formatCurrency(market.totalVolume)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Ends:</span>
                      <span className="font-medium">{formatDate(market.endDate)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 rounded-xl border-green-200 hover:bg-green-50"
                        onClick={() => {
                          setSelectedMarket(market);
                          setBetSide('yes');
                        }}
                        disabled={!connected}
                      >
                        <div className="text-center">
                          <div className="text-sm font-medium text-green-600">YES</div>
                          <div className="text-xs text-slate-600">${market.yesPrice.toFixed(2)}</div>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 rounded-xl border-red-200 hover:bg-red-50"
                        onClick={() => {
                          setSelectedMarket(market);
                          setBetSide('no');
                        }}
                        disabled={!connected}
                      >
                        <div className="text-center">
                          <div className="text-sm font-medium text-red-600">NO</div>
                          <div className="text-xs text-slate-600">${market.noPrice.toFixed(2)}</div>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="positions" className="space-y-6">
            {!connected ? (
              <Card className="rounded-xl border-slate-200">
                <CardContent className="p-8 text-center">
                  <p className="text-slate-600 mb-4">Connect your wallet to view your positions</p>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                    Connect Wallet
                  </Button>
                </CardContent>
              </Card>
            ) : userPositions.length === 0 ? (
              <Card className="rounded-xl border-slate-200">
                <CardContent className="p-8 text-center">
                  <p className="text-slate-600 mb-4">You don't have any positions yet</p>
                  <Button 
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                  >
                    Place Your First Bet
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {userPositions.map((position) => {
                  const market = markets.find(m => m.id === position.marketId);
                  if (!market) return null;

                  const pnl = position.currentValue - position.amount;
                  const pnlPercentage = (pnl / position.amount) * 100;

                  return (
                    <Card key={position.marketId} className="rounded-xl border-slate-200">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-medium text-slate-900 mb-1">{market.title}</h3>
                            <div className="