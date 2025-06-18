import React from "react"
```typescript
import { PublicKey, Connection } from "@solana/web3.js";

export interface Market {
  id: string;
  title: string;
  description: string;
  category: string;
  endDate: Date;
  totalVolume: number;
  yesPrice: number;
  noPrice: number;
  yesShares: number;
  noShares: number;
  resolved: boolean;
  outcome?: boolean;
  creator: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MarketPosition {
  marketId: string;
  userAddress: string;
  yesShares: number;
  noShares: number;
  totalInvested: number;
  currentValue: number;
  pnl: number;
}

export interface MarketOrder {
  id: string;
  marketId: string;
  userAddress: string;
  side: 'yes' | 'no';
  amount: number;
  price: number;
  filled: boolean;
  timestamp: Date;
}

export interface MarketStats {
  totalMarkets: number;
  totalVolume: number;
  activeMarkets: number;
  resolvedMarkets: number;
  totalUsers: number;
}

export class MarketService {
  private connection: Connection;
  private markets: Map<string, Market> = new Map();
  private positions: Map<string, MarketPosition[]> = new Map();
  private orders: Map<string, MarketOrder[]> = new Map();

  constructor(connection: Connection) {
    this.connection = connection;
  }

  async fetchMarkets(): Promise<Market[]> {
    try {
      // Simulate API call - replace with actual Solana program interaction
      const mockMarkets: Market[] = [
        {
          id: "market_1",
          title: "Will Bitcoin reach $100k by end of 2024?",
          description: "Prediction market for Bitcoin price reaching $100,000 USD by December 31, 2024",
          category: "Cryptocurrency",
          endDate: new Date("2024-12-31"),
          totalVolume: 50000,
          yesPrice: 0.65,
          noPrice: 0.35,
          yesShares: 32500,
          noShares: 17500,
          resolved: false,
          creator: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHU",
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date()
        },
        {
          id: "market_2",
          title: "Will Solana's price exceed $200 in 2024?",
          description: "Prediction market for Solana (SOL) price exceeding $200 USD in 2024",
          category: "Cryptocurrency",
          endDate: new Date("2024-12-31"),
          totalVolume: 25000,
          yesPrice: 0.45,
          noPrice: 0.55,
          yesShares: 11250,
          noShares: 13750,
          resolved: false,
          creator: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
          createdAt: new Date("2024-02-01"),
          updatedAt: new Date()
        }
      ];

      mockMarkets.forEach(market => {
        this.markets.set(market.id, market);
      });

      return mockMarkets;
    } catch (error) {
      console.error("Error fetching markets:", error);
      throw new Error("Failed to fetch markets");
    }
  }

  async getMarket(marketId: string): Promise<Market | null> {
    try {
      if (this.markets.has(marketId)) {
        return this.markets.get(marketId)!;
      }

      // Simulate fetching single market
      const markets = await this.fetchMarkets();
      return markets.find(m => m.id === marketId) || null;
    } catch (error) {
      console.error("Error getting market:", error);
      return null;
    }
  }

  async createMarket(marketData: Omit<Market, 'id' | 'createdAt' | 'updatedAt' | 'totalVolume' | 'yesShares' | 'noShares' | 'resolved'>): Promise<Market> {
    try {
      const newMarket: Market = {
        ...marketData,
        id: `market_${Date.now()}`,
        totalVolume: 0,
        yesShares: 0,
        noShares: 0,
        resolved: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.markets.set(newMarket.id, newMarket);
      return newMarket;
    } catch (error) {
      console.error("Error creating market:", error);
      throw new Error("Failed to create market");
    }
  }

  async placeBet(marketId: string, userAddress: string, side: 'yes' | 'no', amount: number): Promise<MarketOrder> {
    try {
      const market = await this.getMarket(marketId);
      if (!market) {
        throw new Error("Market not found");
      }

      if (market.resolved) {
        throw new Error("Market is already resolved");
      }

      if (market.endDate < new Date()) {
        throw new Error("Market has ended");
      }

      const price = side === 'yes' ? market.yesPrice : market.noPrice;
      const shares = amount / price;

      const order: MarketOrder = {
        id: `order_${Date.now()}`,
        marketId,
        userAddress,
        side,
        amount,
        price,
        filled: true,
        timestamp: new Date()
      };

      // Update market data
      market.totalVolume += amount;
      if (side === 'yes') {
        market.yesShares += shares;
      } else {
        market.noShares += shares;
      }

      // Recalculate prices based on new shares
      const totalShares = market.yesShares + market.noShares;
      market.yesPrice = market.yesShares / totalShares;
      market.noPrice = market.noShares / totalShares;
      market.updatedAt = new Date();

      this.markets.set(marketId, market);

      // Store order
      const userOrders = this.orders.get(userAddress) || [];
      userOrders.push(order);
      this.orders.set(userAddress, userOrders);

      // Update user position
      await this.updateUserPosition(marketId, userAddress, side, shares, amount);

      return order;
    } catch (error) {
      console.error("Error placing bet:", error);
      throw error;
    }
  }

  async getUserPositions(userAddress: string): Promise<MarketPosition[]> {
    try {
      return this.positions.get(userAddress) || [];
    } catch (error) {
      console.error("Error getting user positions:", error);
      return [];
    }
  }

  async getUserOrders(userAddress: string): Promise<MarketOrder[]> {
    try {
      return this.orders.get(userAddress) || [];
    } catch (error) {
      console.error("Error getting user orders:", error);
      return [];
    }
  }

  async resolveMarket(marketId: string, outcome: boolean): Promise<Market> {
    try {
      const market = await this.getMarket(marketId);
      if (!market) {
        throw new Error("Market not found");
      }

      if (market.resolved) {
        throw new Error("Market is already resolved");
      }

      market.resolved = true;
      market.outcome = outcome;
      market.updatedAt = new Date();

      this.markets.set(marketId, market);

      // Update all user positions for this market
      await this.updatePositionsAfterResolution(marketId, outcome);

      return market;
    } catch (error) {
      console.error("Error resolving market:", error);
      throw error;
    }
  }

  async getMarketStats(): Promise<MarketStats> {
    try {
      const markets = Array.from(this.markets.values());
      
      return {
        totalMarkets: markets.length,
        totalVolume: markets.reduce((sum, market) => sum + market.totalVolume, 0),
        activeMarkets: markets.filter(m => !m.resolved && m.endDate > new Date()).length,
        resolvedMarkets: markets.filter(m => m.resolved).length,
        totalUsers: this.positions.size
      };
    } catch (error) {
      console.error("Error getting market stats:", error);
      throw new Error("Failed to get market stats");
    }
  }

  private async updateUserPosition(marketId: string, userAddress: string, side: 'yes' | 'no', shares: number, amount: number): Promise<void> {
    const userPositions = this.positions.get(userAddress) || [];
    const existingPosition = userPositions.find(p => p.marketId === marketId);

    if (existingPosition) {
      if (side === 'yes') {
        existingPosition.yesShares += shares;
      } else {
        existingPosition.noShares += shares;
      }
      existingPosition.totalInvested += amount;
      existingPosition.currentValue = await this.calculatePositionValue(existingPosition);
      existingPosition.pnl = existingPosition.currentValue - existingPosition.totalInvested;
    } else {
      const newPosition: MarketPosition = {
        marketId,
        userAddress,
        yesShares: side === 'yes' ? shares : 0,
        noShares: side === 'no' ? shares : 0,
        totalInvested: amount,
        currentValue: amount,
        pnl: 0
      };
      userPositions.push(newPosition);
    }

    this.positions.set(userAddress, userPositions);
  }

  private async calculatePositionValue(position: MarketPosition): Promise<number> {
    const market = await this.getMarket(position.marketId);
    if (!market) return 0;

    if (market.resolved) {
      if (market.outcome === true) {
        return position.yesShares;
      } else {
        return position.noShares;
      }
    }

    return (position.yesShares * market.yesPrice) + (position.noShares * market.noPrice);
  }

  private async updatePositionsAfterResolution(marketId: string, outcome: boolean): Promise<void> {
    for (const [userAddress, positions] of this.positions.entries()) {
      const position = positions.find(p => p.marketId === marketId);
      if (position) {
        position.currentValue = outcome ? position.yesShares : position.noShares;
        position.pnl = position.currentValue - position.totalInvested;
      }
    }
  }
}

export const createMarketService = (connection: Connection): MarketService => {
  return new MarketService(connection);
};

export default MarketService;
```