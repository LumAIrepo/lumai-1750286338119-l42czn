import React from "react"
```typescript
import { IdlAccounts, IdlTypes, Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

export type PredictionMarket = {
  "version": "0.1.0",
  "name": "prediction_market",
  "instructions": [
    {
      "name": "initializeMarket",
      "accounts": [
        {
          "name": "market",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "question",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "endTime",
          "type": "i64"
        },
        {
          "name": "resolutionTime",
          "type": "i64"
        }
      ]
    },
    {
      "name": "placeBet",
      "accounts": [
        {
          "name": "market",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bettor",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "prediction",
          "type": "bool"
        }
      ]
    },
    {
      "name": "resolveMarket",
      "accounts": [
        {
          "name": "market",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "outcome",
          "type": "bool"
        }
      ]
    },
    {
      "name": "claimWinnings",
      "accounts": [
        {
          "name": "market",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bettor",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "market",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "publicKey"
          },
          {
            "name": "question",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "endTime",
            "type": "i64"
          },
          {
            "name": "resolutionTime",
            "type": "i64"
          },
          {
            "name": "totalYesAmount",
            "type": "u64"
          },
          {
            "name": "totalNoAmount",
            "type": "u64"
          },
          {
            "name": "resolved",
            "type": "bool"
          },
          {
            "name": "outcome",
            "type": {
              "option": "bool"
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "bet",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "type": "publicKey"
          },
          {
            "name": "bettor",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "prediction",
            "type": "bool"
          },
          {
            "name": "claimed",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "MarketNotActive",
      "msg": "Market is not active for betting"
    },
    {
      "code": 6001,
      "name": "MarketNotResolved",
      "msg": "Market has not been resolved yet"
    },
    {
      "code": 6002,
      "name": "MarketAlreadyResolved",
      "msg": "Market has already been resolved"
    },
    {
      "code": 6003,
      "name": "UnauthorizedResolver",
      "msg": "Only the market creator can resolve the market"
    },
    {
      "code": 6004,
      "name": "BetAlreadyClaimed",
      "msg": "Winnings have already been claimed"
    },
    {
      "code": 6005,
      "name": "LosingBet",
      "msg": "This bet did not win"
    },
    {
      "code": 6006,
      "name": "InvalidAmount",
      "msg": "Bet amount must be greater than zero"
    }
  ]
};

export const IDL: PredictionMarket = {
  "version": "0.1.0",
  "name": "prediction_market",
  "instructions": [
    {
      "name": "initializeMarket",
      "accounts": [
        {
          "name": "market",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "question",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "endTime",
          "type": "i64"
        },
        {
          "name": "resolutionTime",
          "type": "i64"
        }
      ]
    },
    {
      "name": "placeBet",
      "accounts": [
        {
          "name": "market",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bettor",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "prediction",
          "type": "bool"
        }
      ]
    },
    {
      "name": "resolveMarket",
      "accounts": [
        {
          "name": "market",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "outcome",
          "type": "bool"
        }
      ]
    },
    {
      "name": "claimWinnings",
      "accounts": [
        {
          "name": "market",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bettor",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "market",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "publicKey"
          },
          {
            "name": "question",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "endTime",
            "type": "i64"
          },
          {
            "name": "resolutionTime",
            "type": "i64"
          },
          {
            "name": "totalYesAmount",
            "type": "u64"
          },
          {
            "name": "totalNoAmount",
            "type": "u64"
          },
          {
            "name": "resolved",
            "type": "bool"
          },
          {
            "name": "outcome",
            "type": {
              "option": "bool"
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "bet",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "type": "publicKey"
          },
          {
            "name": "bettor",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "prediction",
            "type": "bool"
          },
          {
            "name": "claimed",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "MarketNotActive",
      "msg": "Market is not active for betting"
    },
    {
      "code": 6001,
      "name": "MarketNotResolved",
      "msg": "Market has not been resolved yet"
    },
    {
      "code": 6002,
      "name": "MarketAlreadyResolved",
      "msg": "Market has already been resolved"
    },
    {
      "code": 6003,
      "name": "UnauthorizedResolver",
      "msg": "Only the market creator can resolve the market"
    },
    {
      "code": 6004,
      "name": "BetAlreadyClaimed",
      "msg": "Winnings have already been claimed"
    },
    {
      "code": 6005,
      "name": "LosingBet",
      "msg": "This bet did not win"
    },
    {
      "code": 6006,
      "name": "InvalidAmount",
      "msg": "Bet amount must be greater than zero"
    }
  ]
};

export type MarketAccount = IdlAccounts<PredictionMarket>["market"];
export type BetAccount = IdlAccounts<PredictionMarket>["bet"];

export type InitializeMarketArgs = IdlTypes<PredictionMarket>["InitializeMarketArgs"];
export type PlaceBetArgs = IdlTypes<PredictionMarket>["PlaceBetArgs"];
export type ResolveMarketArgs = IdlTypes<PredictionMarket>["ResolveMarketArgs"];

export interface PredictionMarketProgram extends Program<PredictionMarket> {}

export const PREDICTION_MARKET_PROGRAM_ID = new PublicKey("11111111111111111111111111111112");

export function getMarketPDA(creator: PublicKey, question: string): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("market"),
      creator.toBuffer(),
      Buffer.from(question.slice(0, 32))
    ],
    PREDICTION_MARKET_PROGRAM_ID
  );
}

export function getBetPDA(market: PublicKey, bettor: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("bet"),
      market.toBuffer(),
      bettor.toBuffer()
    ],
    PREDICTION_MARKET_PROGRAM_ID
  );
}

export interface MarketData {
  publicKey: PublicKey;
  account: MarketAccount;
}

export interface BetData {
  publicKey: PublicKey;
  account: BetAccount;
}

export enum MarketStatus {
  Active = "active",
  Ended = "ended",
  Resolved = "resolved"
}

export function getMarketStatus(market: MarketAccount): MarketStatus {
  const now = Date.now() / 1000;
  
  if (market.resolved) {
    return MarketStatus.Resolved;
  }
  
  if (now > market.endTime.toNumber()) {
    return MarketStatus.Ended;
  }
  
  return MarketStatus.Active;
}

export function calculateOdds(yesAmount: BN, noAmount: BN): { yesOdds: number; noOdds: number } {
  const totalAmount = yesAmount.add(noAmount);
  
  if (totalAmount.isZero()) {
    return { yesOdds: 1, noOdds: 1 };
  }
  
  const yesOdds = totalAmount.toNumber() / yesAmount.toNumber();
  const noOdds = totalAmount.toNumber() / noAmount.toNumber();
  
  return { yesOdds, noOdds };
}

export function calculatePotentialWinnings(
  betAmount: BN,
  prediction: boolean,
  yesAmount: BN,
  noAmount: BN
): BN {
  const { yesOdds, noOdds } = calculateOdds(yesAmount, noAmount);
  const odds = prediction ? yesOdds : noOdds;
  
  return betAmount.muln(odds);
}
```