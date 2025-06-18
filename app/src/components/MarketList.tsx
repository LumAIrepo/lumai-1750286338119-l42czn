import React from "react"
```typescript
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ChevronRight, Plus, User } from "lucide-react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Market {
  id: string;
  title: string;
  description: string;
  category: string;
  totalVolume: number;
  participants: number;
  endDate: Date;
  yesPrice: number;
  noPrice: number;
  status: 'active' | 'resolved' | 'closed';
  creator: string;
}

interface MarketListProps {
  className?: string;
}

export default function MarketList({ className }: MarketListProps) {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { connected, publicKey } = useWallet();
  const { connection } = useConnection();

  const categories = ['all', 'crypto', 'sports', 'politics', 'entertainment', 'technology'];

  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      const mockMarkets: Market[] = [
        {
          id: '1',
          title: 'Will Bitcoin reach $100,000 by end of 2024?',
          description: 'Prediction market for Bitcoin price reaching $100,000 USD by December 31, 2024',
          category: 'crypto',
          totalVolume: 125000,
          participants: 342,
          endDate: new Date('2024-12-31'),
          yesPrice: 0.65,
          noPrice: 0.35,
          status: 'active',
          creator: 'CryptoTrader123'
        },
        {
          id: '2',
          title: 'Will Ethereum 2.0 launch successfully?',
          description: 'Market predicting successful launch of Ethereum 2.0 upgrade',
          category: 'crypto',
          totalVolume: 89000,
          participants: 256,
          endDate: new Date('2024-06-30'),
          yesPrice: 0.78,
          noPrice: 0.22,
          status: 'active',
          creator: 'EthMaxi'
        },
        {
          id: '3',
          title: 'Next US Presidential Election Winner',
          description: 'Prediction market for the 2024 US Presidential Election outcome',
          category: 'politics',
          totalVolume: 450000,
          participants: 1250,
          endDate: new Date('2024-11-05'),
          yesPrice: 0.52,
          noPrice: 0.48,
          status: 'active',
          creator: 'PoliticalAnalyst'
        }
      ];
      
      setMarkets(mockMarkets);
    } catch (error) {
      console.error('Error fetching markets:', error);
      toast.error('Failed to load markets');
    } finally {
      setLoading(false);
    }
  };

  const filteredMarkets = markets.filter(market => {
    const matchesSearch = market.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         market.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || market.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const getStatusColor = (status: Market['status']) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'resolved':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'closed':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Active Markets</h2>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-slate-200 rounded"></div>
                  <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Active Markets</h2>
          <p className="text-slate-600 mt-1">
            Discover and participate in prediction markets
          </p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Create Market
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search markets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "whitespace-nowrap",
                selectedCategory === category && "bg-emerald-600 hover:bg-emerald-700"
              )}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {filteredMarkets.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-slate-500">
              <h3 className="text-lg font-medium mb-2">No markets found</h3>
              <p>Try adjusting your search or category filter</p>
            </div>
          </Card>
        ) : (
          filteredMarkets.map((market) => (
            <Card key={market.id} className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                      {market.title}
                    </CardTitle>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                      {market.description}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors ml-4" />
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Badge className={cn("text-xs", getStatusColor(market.status))}>
                    {market.status.charAt(0).toUpperCase() + market.status.slice(1)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {market.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 font-medium">Volume</p>
                    <p className="text-slate-900 font-semibold">
                      {formatCurrency(market.totalVolume)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Participants</p>
                    <p className="text-slate-900 font-semibold flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      {market.participants}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Yes Price</p>
                    <p className="text-emerald-600 font-semibold">
                      ${market.yesPrice.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Ends</p>
                    <p className="text-slate-900 font-semibold">
                      {formatDate(market.endDate)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                      Created by {market.creator}
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-xs">
                        View Details
                      </Button>
                      {connected && (
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs">
                          Trade
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {!connected && (
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-emerald-900 mb-2">
              Connect Your Wallet
            </h3>
            <p className="text-emerald-700 mb-4">
              Connect your Solana wallet to participate in prediction markets
            </p>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```