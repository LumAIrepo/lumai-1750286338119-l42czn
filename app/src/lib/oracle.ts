import React from "react"
```typescript
import { Connection, PublicKey, AccountInfo } from '@solana/web3.js';

export interface OracleData {
  eventId: string;
  outcome: number | null;
  confidence: number;
  timestamp: number;
  source: string;
  verified: boolean;
}

export interface EventData {
  id: string;
  title: string;
  description: string;
  category: string;
  endTime: number;
  resolved: boolean;
  outcome: number | null;
  totalVolume: number;
  participants: number;
}

export interface OracleConfig {
  programId: PublicKey;
  oracleAuthority: PublicKey;
  connection: Connection;
}

export class Oracle {
  private config: OracleConfig;
  private cache: Map<string, { data: OracleData; expiry: number }>;
  private readonly CACHE_DURATION = 30000; // 30 seconds

  constructor(config: OracleConfig) {
    this.config = config;
    this.cache = new Map();
  }

  async getEventData(eventId: string): Promise<EventData | null> {
    try {
      const cached = this.cache.get(`event_${eventId}`);
      if (cached && cached.expiry > Date.now()) {
        return cached.data as unknown as EventData;
      }

      const eventPubkey = this.deriveEventPDA(eventId);
      const accountInfo = await this.config.connection.getAccountInfo(eventPubkey);
      
      if (!accountInfo) {
        return null;
      }

      const eventData = this.deserializeEventData(accountInfo.data);
      
      this.cache.set(`event_${eventId}`, {
        data: eventData as unknown as OracleData,
        expiry: Date.now() + this.CACHE_DURATION
      });

      return eventData;
    } catch (error) {
      console.error('Error fetching event data:', error);
      return null;
    }
  }

  async getOracleData(eventId: string): Promise<OracleData | null> {
    try {
      const cached = this.cache.get(`oracle_${eventId}`);
      if (cached && cached.expiry > Date.now()) {
        return cached.data;
      }

      const oraclePubkey = this.deriveOraclePDA(eventId);
      const accountInfo = await this.config.connection.getAccountInfo(oraclePubkey);
      
      if (!accountInfo) {
        return null;
      }

      const oracleData = this.deserializeOracleData(accountInfo.data);
      
      this.cache.set(`oracle_${eventId}`, {
        data: oracleData,
        expiry: Date.now() + this.CACHE_DURATION
      });

      return oracleData;
    } catch (error) {
      console.error('Error fetching oracle data:', error);
      return null;
    }
  }

  async getAllEvents(): Promise<EventData[]> {
    try {
      const accounts = await this.config.connection.getProgramAccounts(
        this.config.programId,
        {
          filters: [
            {
              memcmp: {
                offset: 0,
                bytes: 'event'
              }
            }
          ]
        }
      );

      const events: EventData[] = [];
      
      for (const account of accounts) {
        try {
          const eventData = this.deserializeEventData(account.account.data);
          events.push(eventData);
        } catch (error) {
          console.error('Error deserializing event:', error);
        }
      }

      return events.sort((a, b) => b.endTime - a.endTime);
    } catch (error) {
      console.error('Error fetching all events:', error);
      return [];
    }
  }

  async subscribeToEvent(eventId: string, callback: (data: EventData) => void): Promise<number> {
    const eventPubkey = this.deriveEventPDA(eventId);
    
    return this.config.connection.onAccountChange(
      eventPubkey,
      (accountInfo: AccountInfo<Buffer>) => {
        try {
          const eventData = this.deserializeEventData(accountInfo.data);
          callback(eventData);
        } catch (error) {
          console.error('Error in event subscription:', error);
        }
      }
    );
  }

  async subscribeToOracle(eventId: string, callback: (data: OracleData) => void): Promise<number> {
    const oraclePubkey = this.deriveOraclePDA(eventId);
    
    return this.config.connection.onAccountChange(
      oraclePubkey,
      (accountInfo: AccountInfo<Buffer>) => {
        try {
          const oracleData = this.deserializeOracleData(accountInfo.data);
          callback(oracleData);
        } catch (error) {
          console.error('Error in oracle subscription:', error);
        }
      }
    );
  }

  unsubscribe(subscriptionId: number): void {
    this.config.connection.removeAccountChangeListener(subscriptionId);
  }

  private deriveEventPDA(eventId: string): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('event'), Buffer.from(eventId)],
      this.config.programId
    );
    return pda;
  }

  private deriveOraclePDA(eventId: string): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('oracle'), Buffer.from(eventId)],
      this.config.programId
    );
    return pda;
  }

  private deserializeEventData(data: Buffer): EventData {
    let offset = 0;
    
    // Skip discriminator (8 bytes)
    offset += 8;
    
    // Read event ID (32 bytes)
    const eventIdBytes = data.slice(offset, offset + 32);
    const eventId = eventIdBytes.toString('utf8').replace(/\0/g, '');
    offset += 32;
    
    // Read title length and title
    const titleLength = data.readUInt32LE(offset);
    offset += 4;
    const title = data.slice(offset, offset + titleLength).toString('utf8');
    offset += titleLength;
    
    // Read description length and description
    const descLength = data.readUInt32LE(offset);
    offset += 4;
    const description = data.slice(offset, offset + descLength).toString('utf8');
    offset += descLength;
    
    // Read category length and category
    const categoryLength = data.readUInt32LE(offset);
    offset += 4;
    const category = data.slice(offset, offset + categoryLength).toString('utf8');
    offset += categoryLength;
    
    // Read end time (8 bytes)
    const endTime = Number(data.readBigUInt64LE(offset));
    offset += 8;
    
    // Read resolved flag (1 byte)
    const resolved = data.readUInt8(offset) === 1;
    offset += 1;
    
    // Read outcome (4 bytes, -1 for null)
    const outcomeValue = data.readInt32LE(offset);
    const outcome = outcomeValue === -1 ? null : outcomeValue;
    offset += 4;
    
    // Read total volume (8 bytes)
    const totalVolume = Number(data.readBigUInt64LE(offset));
    offset += 8;
    
    // Read participants (4 bytes)
    const participants = data.readUInt32LE(offset);
    
    return {
      id: eventId,
      title,
      description,
      category,
      endTime,
      resolved,
      outcome,
      totalVolume,
      participants
    };
  }

  private deserializeOracleData(data: Buffer): OracleData {
    let offset = 0;
    
    // Skip discriminator (8 bytes)
    offset += 8;
    
    // Read event ID (32 bytes)
    const eventIdBytes = data.slice(offset, offset + 32);
    const eventId = eventIdBytes.toString('utf8').replace(/\0/g, '');
    offset += 32;
    
    // Read outcome (4 bytes, -1 for null)
    const outcomeValue = data.readInt32LE(offset);
    const outcome = outcomeValue === -1 ? null : outcomeValue;
    offset += 4;
    
    // Read confidence (4 bytes as float)
    const confidence = data.readFloatLE(offset);
    offset += 4;
    
    // Read timestamp (8 bytes)
    const timestamp = Number(data.readBigUInt64LE(offset));
    offset += 8;
    
    // Read source length and source
    const sourceLength = data.readUInt32LE(offset);
    offset += 4;
    const source = data.slice(offset, offset + sourceLength).toString('utf8');
    offset += sourceLength;
    
    // Read verified flag (1 byte)
    const verified = data.readUInt8(offset) === 1;
    
    return {
      eventId,
      outcome,
      confidence,
      timestamp,
      source,
      verified
    };
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}

export function createOracle(connection: Connection, programId: string, oracleAuthority: string): Oracle {
  const config: OracleConfig = {
    programId: new PublicKey(programId),
    oracleAuthority: new PublicKey(oracleAuthority),
    connection
  };
  
  return new Oracle(config);
}

export default Oracle;
```