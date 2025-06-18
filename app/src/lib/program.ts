import React from "react"
```typescript
import { Connection, PublicKey, Transaction, TransactionInstruction, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN, IdlAccounts } from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';

export interface PredictionMarket {
  publicKey: PublicKey;
  authority: PublicKey;
  title: string;
  description: string;
  endTime: BN;
  resolved: boolean;
  outcome: boolean | null;
  totalYesAmount: BN;
  totalNoAmount: BN;
  createdAt: BN;
}

export interface UserPrediction {
  publicKey: PublicKey;
  user: PublicKey;
  market: PublicKey;
  prediction: boolean;
  amount: BN;
  claimed: boolean;
  createdAt: BN;
}

export interface ProgramAccounts {
  predictionMarket: PredictionMarket;
  userPrediction: UserPrediction;
}

export class SolanaPredictProgram {
  private connection: Connection;
  private programId: PublicKey;

  constructor(connection: Connection, programId: string) {
    this.connection = connection;
    this.programId = new PublicKey(programId);
  }

  async createMarket(
    authority: PublicKey,
    title: string,
    description: string,
    endTime: number
  ): Promise<{ transaction: Transaction; marketPda: PublicKey }> {
    const marketKeypair = web3.Keypair.generate();
    const marketPda = marketKeypair.publicKey;

    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: marketPda, isSigner: true, isWritable: true },
        { pubkey: authority, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data: Buffer.from([
        0, // create_market instruction discriminator
        ...Buffer.from(title.slice(0, 64).padEnd(64, '\0')),
        ...Buffer.from(description.slice(0, 256).padEnd(256, '\0')),
        ...new BN(endTime).toArray('le', 8),
      ]),
    });

    const transaction = new Transaction().add(instruction);
    transaction.feePayer = authority;
    transaction.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;
    transaction.partialSign(marketKeypair);

    return { transaction, marketPda };
  }

  async placePrediction(
    user: PublicKey,
    marketPda: PublicKey,
    prediction: boolean,
    amount: number
  ): Promise<{ transaction: Transaction; predictionPda: PublicKey }> {
    const [predictionPda] = await PublicKey.findProgramAddress(
      [
        Buffer.from('prediction'),
        user.toBuffer(),
        marketPda.toBuffer(),
      ],
      this.programId
    );

    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: predictionPda, isSigner: false, isWritable: true },
        { pubkey: marketPda, isSigner: false, isWritable: true },
        { pubkey: user, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data: Buffer.from([
        1, // place_prediction instruction discriminator
        prediction ? 1 : 0,
        ...new BN(amount).toArray('le', 8),
      ]),
    });

    const transaction = new Transaction().add(instruction);
    transaction.feePayer = user;
    transaction.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;

    return { transaction, predictionPda };
  }

  async resolveMarket(
    authority: PublicKey,
    marketPda: PublicKey,
    outcome: boolean
  ): Promise<Transaction> {
    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: marketPda, isSigner: false, isWritable: true },
        { pubkey: authority, isSigner: true, isWritable: false },
      ],
      programId: this.programId,
      data: Buffer.from([
        2, // resolve_market instruction discriminator
        outcome ? 1 : 0,
      ]),
    });

    const transaction = new Transaction().add(instruction);
    transaction.feePayer = authority;
    transaction.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;

    return transaction;
  }

  async claimWinnings(
    user: PublicKey,
    marketPda: PublicKey,
    predictionPda: PublicKey
  ): Promise<Transaction> {
    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: predictionPda, isSigner: false, isWritable: true },
        { pubkey: marketPda, isSigner: false, isWritable: true },
        { pubkey: user, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data: Buffer.from([3]), // claim_winnings instruction discriminator
    });

    const transaction = new Transaction().add(instruction);
    transaction.feePayer = user;
    transaction.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;

    return transaction;
  }

  async getMarket(marketPda: PublicKey): Promise<PredictionMarket | null> {
    try {
      const accountInfo = await this.connection.getAccountInfo(marketPda);
      if (!accountInfo || !accountInfo.data) {
        return null;
      }

      const data = accountInfo.data;
      const authority = new PublicKey(data.slice(8, 40));
      const title = data.slice(40, 104).toString('utf8').replace(/\0/g, '');
      const description = data.slice(104, 360).toString('utf8').replace(/\0/g, '');
      const endTime = new BN(data.slice(360, 368), 'le');
      const resolved = data[368] === 1;
      const outcome = data[369] === 255 ? null : data[369] === 1;
      const totalYesAmount = new BN(data.slice(370, 378), 'le');
      const totalNoAmount = new BN(data.slice(378, 386), 'le');
      const createdAt = new BN(data.slice(386, 394), 'le');

      return {
        publicKey: marketPda,
        authority,
        title,
        description,
        endTime,
        resolved,
        outcome,
        totalYesAmount,
        totalNoAmount,
        createdAt,
      };
    } catch (error) {
      console.error('Error fetching market:', error);
      return null;
    }
  }

  async getUserPrediction(predictionPda: PublicKey): Promise<UserPrediction | null> {
    try {
      const accountInfo = await this.connection.getAccountInfo(predictionPda);
      if (!accountInfo || !accountInfo.data) {
        return null;
      }

      const data = accountInfo.data;
      const user = new PublicKey(data.slice(8, 40));
      const market = new PublicKey(data.slice(40, 72));
      const prediction = data[72] === 1;
      const amount = new BN(data.slice(73, 81), 'le');
      const claimed = data[81] === 1;
      const createdAt = new BN(data.slice(82, 90), 'le');

      return {
        publicKey: predictionPda,
        user,
        market,
        prediction,
        amount,
        claimed,
        createdAt,
      };
    } catch (error) {
      console.error('Error fetching user prediction:', error);
      return null;
    }
  }

  async getAllMarkets(): Promise<PredictionMarket[]> {
    try {
      const accounts = await this.connection.getProgramAccounts(this.programId, {
        filters: [
          {
            memcmp: {
              offset: 0,
              bytes: 'market',
            },
          },
        ],
      });

      const markets: PredictionMarket[] = [];
      for (const account of accounts) {
        const market = await this.getMarket(account.pubkey);
        if (market) {
          markets.push(market);
        }
      }

      return markets.sort((a, b) => b.createdAt.cmp(a.createdAt));
    } catch (error) {
      console.error('Error fetching all markets:', error);
      return [];
    }
  }

  async getUserPredictions(userPubkey: PublicKey): Promise<UserPrediction[]> {
    try {
      const accounts = await this.connection.getProgramAccounts(this.programId, {
        filters: [
          {
            memcmp: {
              offset: 8,
              bytes: userPubkey.toBase58(),
            },
          },
        ],
      });

      const predictions: UserPrediction[] = [];
      for (const account of accounts) {
        const prediction = await this.getUserPrediction(account.pubkey);
        if (prediction) {
          predictions.push(prediction);
        }
      }

      return predictions.sort((a, b) => b.createdAt.cmp(a.createdAt));
    } catch (error) {
      console.error('Error fetching user predictions:', error);
      return [];
    }
  }

  async getPredictionPda(user: PublicKey, market: PublicKey): Promise<PublicKey> {
    const [predictionPda] = await PublicKey.findProgramAddress(
      [
        Buffer.from('prediction'),
        user.toBuffer(),
        market.toBuffer(),
      ],
      this.programId
    );
    return predictionPda;
  }

  calculatePotentialWinnings(
    userAmount: BN,
    userPrediction: boolean,
    totalYesAmount: BN,
    totalNoAmount: BN
  ): BN {
    const totalPool = totalYesAmount.add(totalNoAmount);
    if (totalPool.isZero()) return new BN(0);

    const winningPool = userPrediction ? totalYesAmount : totalNoAmount;
    if (winningPool.isZero()) return new BN(0);

    return userAmount.mul(totalPool).div(winningPool);
  }

  calculateOdds(totalYesAmount: BN, totalNoAmount: BN): { yesOdds: number; noOdds: number } {
    const total = totalYesAmount.add(totalNoAmount);
    if (total.isZero()) {
      return { yesOdds: 50, noOdds: 50 };
    }

    const yesOdds = (totalYesAmount.toNumber() / total.toNumber()) * 100;
    const noOdds = (totalNoAmount.toNumber() / total.toNumber()) * 100;

    return { yesOdds, noOdds };
  }
}

export const PROGRAM_ID = process.env.NEXT_PUBLIC_PROGRAM_ID || 'SoLanaPredictProgramId11111111111111111111111';

export function createProgramInstance(connection: Connection): SolanaPredictProgram {
  return new SolanaPredictProgram(connection, PROGRAM_ID);
}

export default SolanaPredictProgram;
```