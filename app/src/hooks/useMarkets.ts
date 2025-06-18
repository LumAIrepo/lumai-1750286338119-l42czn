import React from "react"
```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { toast } from 'sonner'

export interface Market {
  id: string
  title: string
  description: string
  category: string
  endDate: Date
  totalVolume: number
  yesPrice: number
  noPrice: number
  yesShares: number
  noShares: number
  resolved: boolean
  outcome?: boolean
  creator: string
  createdAt: Date
  participants: number
  liquidity: number
  status: 'active' | 'resolved' | 'cancelled'
  tags: string[]
  imageUrl?: string
}

export interface MarketFilters {
  category?: string
  status?: 'active' | 'resolved' | 'cancelled'
  search?: string
  sortBy?: 'volume' | 'endDate' | 'createdAt' | 'participants'
  sortOrder?: 'asc' | 'desc'
}

export interface UseMarketsReturn {
  markets: Market[]
  loading: boolean
  error: string | null
  totalMarkets: number
  filteredMarkets: Market[]
  filters: MarketFilters
  setFilters: (filters: MarketFilters) => void
  refreshMarkets: () => Promise<void>
  getMarketById: (id: string) => Market | undefined
  getUserMarkets: (userAddress: string) => Market[]
  getMarketsByCategory: (category: string) => Market[]
  createMarket: (marketData: Partial<Market>) => Promise<Market | null>
  resolveMarket: (marketId: string, outcome: boolean) => Promise<boolean>
}

export function useMarkets(): UseMarketsReturn {
  const { connection } = useConnection()
  const { publicKey, connected } = useWallet()
  
  const [markets, setMarkets] = useState<Market[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<MarketFilters>({
    sortBy: 'volume',
    sortOrder: 'desc'
  })

  const mockMarkets: Market[] = [
    {
      id: '1',
      title: 'Will Bitcoin reach $100,000 by end of 2024?',
      description: 'Prediction market for Bitcoin price reaching $100,000 USD by December 31, 2024',
      category: 'Cryptocurrency',
      endDate: new Date('2024-12-31'),
      totalVolume: 125000,
      yesPrice: 0.65,
      noPrice: 0.35,
      yesShares: 75000,
      noShares: 50000,
      resolved: false,
      creator: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
      createdAt: new Date('2024-01-15'),
      participants: 234,
      liquidity: 45000,
      status: 'active',
      tags: ['crypto', 'bitcoin', 'price'],
      imageUrl: '/images/bitcoin.png'
    },
    {
      id: '2',
      title: 'Will Solana TVL exceed $10B in 2024?',
      description: 'Total Value Locked in Solana DeFi protocols exceeding $10 billion',
      category: 'DeFi',
      endDate: new Date('2024-12-31'),
      totalVolume: 89000,
      yesPrice: 0.42,
      noPrice: 0.58,
      yesShares: 37380,
      noShares: 51620,
      resolved: false,
      creator: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
      createdAt: new Date('2024-02-01'),
      participants: 156,
      liquidity: 32000,
      status: 'active',
      tags: ['solana', 'defi', 'tvl'],
      imageUrl: '/images/solana.png'
    }
  ]

  const fetchMarkets = useCallback(async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In a real implementation, this would fetch from your Solana program
      setMarkets(mockMarkets)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch markets'
      setError(errorMessage)
      toast.error('Failed to load markets')
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshMarkets = useCallback(async (): Promise<void> => {
    await fetchMarkets()
  }, [fetchMarkets])

  const getMarketById = useCallback((id: string): Market | undefined => {
    return markets.find(market => market.id === id)
  }, [markets])

  const getUserMarkets = useCallback((userAddress: string): Market[] => {
    return markets.filter(market => market.creator === userAddress)
  }, [markets])

  const getMarketsByCategory = useCallback((category: string): Market[] => {
    return markets.filter(market => 
      market.category.toLowerCase() === category.toLowerCase()
    )
  }, [markets])

  const createMarket = useCallback(async (marketData: Partial<Market>): Promise<Market | null> => {
    try {
      if (!connected || !publicKey) {
        toast.error('Please connect your wallet')
        return null
      }

      setLoading(true)
      
      // In a real implementation, this would interact with your Solana program
      const newMarket: Market = {
        id: Date.now().toString(),
        title: marketData.title || '',
        description: marketData.description || '',
        category: marketData.category || 'Other',
        endDate: marketData.endDate || new Date(),
        totalVolume: 0,
        yesPrice: 0.5,
        noPrice: 0.5,
        yesShares: 0,
        noShares: 0,
        resolved: false,
        creator: publicKey.toString(),
        createdAt: new Date(),
        participants: 0,
        liquidity: 0,
        status: 'active',
        tags: marketData.tags || [],
        imageUrl: marketData.imageUrl
      }

      setMarkets(prev => [newMarket, ...prev])
      toast.success('Market created successfully')
      
      return newMarket
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create market'
      setError(errorMessage)
      toast.error('Failed to create market')
      return null
    } finally {
      setLoading(false)
    }
  }, [connected, publicKey])

  const resolveMarket = useCallback(async (marketId: string, outcome: boolean): Promise<boolean> => {
    try {
      if (!connected || !publicKey) {
        toast.error('Please connect your wallet')
        return false
      }

      setLoading(true)
      
      // In a real implementation, this would interact with your Solana program
      setMarkets(prev => prev.map(market => 
        market.id === marketId 
          ? { ...market, resolved: true, outcome, status: 'resolved' as const }
          : market
      ))
      
      toast.success('Market resolved successfully')
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resolve market'
      setError(errorMessage)
      toast.error('Failed to resolve market')
      return false
    } finally {
      setLoading(false)
    }
  }, [connected, publicKey])

  const filteredMarkets = markets.filter(market => {
    if (filters.category && market.category !== filters.category) {
      return false
    }
    
    if (filters.status && market.status !== filters.status) {
      return false
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      return (
        market.title.toLowerCase().includes(searchLower) ||
        market.description.toLowerCase().includes(searchLower) ||
        market.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }
    
    return true
  }).sort((a, b) => {
    const { sortBy = 'volume', sortOrder = 'desc' } = filters
    
    let aValue: number | Date
    let bValue: number | Date
    
    switch (sortBy) {
      case 'volume':
        aValue = a.totalVolume
        bValue = b.totalVolume
        break
      case 'endDate':
        aValue = a.endDate
        bValue = b.endDate
        break
      case 'createdAt':
        aValue = a.createdAt
        bValue = b.createdAt
        break
      case 'participants':
        aValue = a.participants
        bValue = b.participants
        break
      default:
        aValue = a.totalVolume
        bValue = b.totalVolume
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  useEffect(() => {
    fetchMarkets()
  }, [fetchMarkets])

  return {
    markets,
    loading,
    error,
    totalMarkets: markets.length,
    filteredMarkets,
    filters,
    setFilters,
    refreshMarkets,
    getMarketById,
    getUserMarkets,
    getMarketsByCategory,
    createMarket,
    resolveMarket
  }
}

export default useMarkets
```