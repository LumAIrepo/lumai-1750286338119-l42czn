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
import { ChevronRight, User, Settings, Plus } from "lucide-react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { PublicKey, Transaction } from "@solana/web3.js"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface BettingMarket {
  id: string;
  title: string;
  description: string;
  yesOdds: number;
  noOdds: number;
  totalVolume: number;
  endDate: Date;
  status: 'active' | 'closed' | 'resolved';
  category: string;
}

interface BetPosition {
  id: string;
  marketId: string;
  side: 'yes' | 'no';
  amount: number;
  odds: number;
  timestamp: Date;
  status: 'pending' | 'matched' | 'settled';
}

interface BettingInterfaceProps {
  className?: string;
}

export default function BettingInterface({ className }: BettingInterfaceProps) {
  const { connected, publicKey } = useWallet();
  const { connection } = useConnection();
  const [selectedMarket, setSelectedMarket] = useState<BettingMarket | null>(null);
  const [betAmount, setBetAmount] = useState<string>('');
  const [selectedSide, setSelectedSide] = useState<'yes' | 'no'>('yes');
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [showBetDialog, setShowBetDialog] = useState(false);
  const [markets, setMarkets] = useState<BettingMarket[]>([]);
  const [userPositions, setUserPositions] = useState<BetPosition[]>([]);
  const [activeTab, setActiveTab] = useState('markets');

  useEffect(() => {
    // Mock data - replace with actual API calls
    setMarkets([
      {
        id: '1',
        title: 'SOL Price Above $100 by End of Month',
        description: 'Will Solana (SOL) price be above $100 USD by the end of this month?',
        yesOdds: 1.65,
        noOdds: 2.35,
        totalVolume: 15420,
        endDate: new Date('2024-12-31'),
        status: 'active',
        category: 'Crypto'
      },
      {
        id: '2',
        title: 'Bitcoin ETF Approval This Quarter',
        description: 'Will a Bitcoin ETF be approved by the SEC this quarter?',
        yesOdds: 2.1,
        noOdds: 1.8,
        totalVolume: 8750,
        endDate: new Date('2024-12-31'),
        status: 'active',
        category: 'Crypto'
      },
      {
        id: '3',
        title: 'Ethereum 2.0 Staking Rewards Above 5%',
        description: 'Will Ethereum 2.0 staking rewards exceed 5% APY this month?',
        yesOdds: 1.9,
        noOdds: 1.95,
        totalVolume: 12300,
        endDate: new Date('2024-12-31'),
        status: 'active',
        category: 'DeFi'
      }
    ]);

    setUserPositions([
      {
        id: '1',
        marketId: '1',
        side: 'yes',
        amount: 100,
        odds: 1.65,
        timestamp: new Date('2024-12-01'),
        status: 'matched'
      }
    ]);
  }, []);

  const handlePlaceBet = async () => {
    if (!connected || !publicKey || !selectedMarket) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!betAmount || parseFloat(betAmount) <= 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }

    setIsPlacingBet(true);

    try {
      // Mock transaction - replace with actual Solana program interaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newPosition: BetPosition = {
        id: Date.now().toString(),
        marketId: selectedMarket.id,
        side: selectedSide,
        amount: parseFloat(betAmount),
        odds: selectedSide === 'yes' ? selectedMarket.yesOdds : selectedMarket.noOdds,
        timestamp: new Date(),
        status: 'pending'
      };

      setUserPositions(prev => [...prev, newPosition]);
      setBetAmount('');
      setShowBetDialog(false);
      toast.success('Bet placed successfully!');
    } catch (error) {
      console.error('Error placing bet:', error);
      toast.error('Failed to place bet. Please try again.');
    } finally {
      setIsPlacingBet(false);
    }
  };

  const formatOdds = (odds: number): string => {
    return odds.toFixed(2);
  };

  const calculatePotentialWin = (amount: number, odds: number): number => {
    return amount * odds;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800';
      case 'closed':
        return 'bg-slate-100 text-slate-800';
      case 'resolved':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className={cn("min-h-screen bg-slate-50 p-6", className)}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Prediction Markets</h1>
          <p className="text-slate-600">Trade on the outcome of future events</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="markets">Active Markets</TabsTrigger>
            <TabsTrigger value="positions">My Positions</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="markets" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {markets.map((market) => (
                <Card key={market.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{market.title}</CardTitle>
                        <p className="text-sm text-slate-600 mb-3">{market.description}</p>
                      </div>
                      <Badge className={getStatusColor(market.status)}>
                        {market.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          className="flex flex-col items-center p-4 h-auto border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50"
                          onClick={() => {
                            setSelectedMarket(market);
                            setSelectedSide('yes');
                            setShowBetDialog(true);
                          }}
                        >
                          <span className="text-sm font-medium text-slate-600">YES</span>
                          <span className="text-lg font-bold text-emerald-600">
                            {formatOdds(market.yesOdds)}
                          </span>
                        </Button>
                        <Button
                          variant="outline"
                          className="flex flex-col items-center p-4 h-auto border-red-200 hover:border-red-300 hover:bg-red-50"
                          onClick={() => {
                            setSelectedMarket(market);
                            setSelectedSide('no');
                            setShowBetDialog(true);
                          }}
                        >
                          <span className="text-sm font-medium text-slate-600">NO</span>
                          <span className="text-lg font-bold text-red-600">
                            {formatOdds(market.noOdds)}
                          </span>
                        </Button>
                      </div>
                      <div className="flex justify-between text-sm text-slate-600">
                        <span>Volume: ${market.totalVolume.toLocaleString()}</span>
                        <span>Ends: {market.endDate.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="positions" className="space-y-6">
            {userPositions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <User className="h-12 w-12 text-slate-400 mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No positions yet</h3>
                  <p className="text-slate-600 text-center mb-4">
                    Start trading on prediction markets to see your positions here
                  </p>
                  <Button onClick={() => setActiveTab('markets')}>
                    Browse Markets
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {userPositions.map((position) => {
                  const market = markets.find(m => m.id === position.marketId);
                  if (!market) return null;

                  return (
                    <Card key={position.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-slate-900 mb-1">{market.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-slate-600">
                              <span>Side: <Badge variant={position.side === 'yes' ? 'default' : 'secondary'}>{position.side.toUpperCase()}</Badge></span>
                              <span>Amount: ${position.amount}</span>
                              <span>Odds: {formatOdds(position.odds)}</span>
                              <span>Potential Win: ${calculatePotentialWin(position.amount, position.odds).toFixed(2)}</span>
                            </div>
                          </div>
                          <Badge className={getStatusColor(position.status)}>
                            {position.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Settings className="h-12 w-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No trading history</h3>
                <p className="text-slate-600 text-center">
                  Your completed trades will appear here
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={showBetDialog} onOpenChange={setShowBetDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Place Bet</DialogTitle>
            </DialogHeader>
            {selectedMarket && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-slate-900 mb-2">{selectedMarket.title}</h3>
                  <p className="text-sm text-slate-600">{selectedMarket.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={selectedSide === 'yes' ? 'default' : 'outline'}
                    className={cn(
                      "flex flex-col items-center p-4 h-auto",
                      selectedSide === 'yes' ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-emerald-200 hover:border-emerald-300'
                    )}
                    onClick={() => setSelectedSide('yes')}
                  >
                    <span className="text-sm font-medium">YES</span>
                    <span className="text-lg font-bold">
                      {formatOdds(selectedMarket.yesOdds)}
                    </span>
                  </Button>
                  <Button
                    variant={selectedSide === 'no' ? 'default' : 'outline'}
                    className={cn(
                      "flex flex-col items-center p-4 h-auto",
                      selectedSide === 'no' ? 'bg-red-600 hover:bg-red-700' : 'border-red-200 hover:border-red-300'
                    )}
                    onClick={() => setSelectedSide('no')}
                  >
                    <span className="text-sm font-medium">NO</span>
                    <span className="text-lg font-bold">
                      {formatOdds(selectedMarket.noOdds)}
                    </span>
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="betAmount">Bet Amount (USD)</Label>
                  <Input
                    id="betAmount"
                    type="number"
                    placeholder="Enter amount"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>

                {betAmount && parseFloat(betAmount) > 0 && (
                  <div className="bg-slate-100 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Bet Amount:</span>
                      <span>${