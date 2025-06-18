import React from "react"
```typescript
export interface Market {
  id: string;
  title: string;
  description: string;
  category: MarketCategory;
  creator: string;
  createdAt: Date;
  endDate: Date;
  resolutionDate?: Date;
  status: MarketStatus;
  totalVolume: number;
  totalLiquidity: number;
  outcomeTokens: OutcomeToken[];
  metadata: MarketMetadata;
  fees: MarketFees;
  oracle?: string;
  tags: string[];
}

export interface OutcomeToken {
  id: string;
  marketId: string;
  name: string;
  symbol: string;
  mint: string;
  price: number;
  totalSupply: number;
  volume24h: number;
  holders: number;
  probability: number;
}

export interface MarketMetadata {
  imageUrl?: string;
  externalUrl?: string;
  sourceUrl?: string;
  resolutionSource?: string;
  additionalInfo?: Record<string, any>;
}

export interface MarketFees {
  creatorFee: number;
  platformFee: number;
  liquidityFee: number;
}

export interface Position {
  id: string;
  marketId: string;
  userId: string;
  outcomeTokenId: string;
  shares: number;
  averagePrice: number;
  currentValue: number;
  unrealizedPnl: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Trade {
  id: string;
  marketId: string;
  userId: string;
  outcomeTokenId: string;
  type: TradeType;
  shares: number;
  price: number;
  amount: number;
  fees: number;
  signature: string;
  createdAt: Date;
}

export interface MarketOrder {
  id: string;
  marketId: string;
  userId: string;
  outcomeTokenId: string;
  type: OrderType;
  side: OrderSide;
  shares: number;
  price: number;
  filled: number;
  remaining: number;
  status: OrderStatus;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LiquidityPool {
  id: string;
  marketId: string;
  totalLiquidity: number;
  reserves: Record<string, number>;
  lpTokenSupply: number;
  lpTokenMint: string;
  fees24h: number;
  volume24h: number;
  apy: number;
}

export interface MarketResolution {
  id: string;
  marketId: string;
  winningOutcomeId: string;
  resolvedBy: string;
  resolvedAt: Date;
  evidence?: string;
  disputed: boolean;
  finalizedAt?: Date;
}

export enum MarketStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  CLOSED = 'CLOSED',
  RESOLVED = 'RESOLVED',
  DISPUTED = 'DISPUTED',
  CANCELLED = 'CANCELLED'
}

export enum MarketCategory {
  SPORTS = 'SPORTS',
  POLITICS = 'POLITICS',
  CRYPTO = 'CRYPTO',
  ENTERTAINMENT = 'ENTERTAINMENT',
  SCIENCE = 'SCIENCE',
  WEATHER = 'WEATHER',
  ECONOMICS = 'ECONOMICS',
  OTHER = 'OTHER'
}

export enum TradeType {
  BUY = 'BUY',
  SELL = 'SELL'
}

export enum OrderType {
  MARKET = 'MARKET',
  LIMIT = 'LIMIT'
}

export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  FILLED = 'FILLED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

export type MarketFilters = {
  category?: MarketCategory;
  status?: MarketStatus;
  minVolume?: number;
  maxVolume?: number;
  endsBefore?: Date;
  endsAfter?: Date;
  creator?: string;
  tags?: string[];
  search?: string;
};

export type MarketSortBy = 
  | 'volume'
  | 'liquidity'
  | 'created'
  | 'ending'
  | 'activity';

export type MarketSortOrder = 'asc' | 'desc';

export interface MarketListParams {
  filters?: MarketFilters;
  sortBy?: MarketSortBy;
  sortOrder?: MarketSortOrder;
  limit?: number;
  offset?: number;
}

export interface CreateMarketParams {
  title: string;
  description: string;
  category: MarketCategory;
  endDate: Date;
  outcomeNames: string[];
  initialLiquidity: number;
  creatorFee: number;
  metadata?: Partial<MarketMetadata>;
  tags?: string[];
}

export interface MarketStats {
  totalMarkets: number;
  activeMarkets: number;
  totalVolume: number;
  totalLiquidity: number;
  uniqueTraders: number;
  marketsResolved: number;
  averageMarketDuration: number;
  topCategories: Array<{
    category: MarketCategory;
    count: number;
    volume: number;
  }>;
}
```