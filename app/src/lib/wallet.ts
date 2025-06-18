import React from "react"
```typescript
import { Connection, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js'
import { WalletAdapter } from '@solana/wallet-adapter-base'

export interface WalletState {
  connected: boolean
  connecting: boolean
  disconnecting: boolean
  publicKey: PublicKey | null
  wallet: WalletAdapter | null
}

export interface WalletContextState extends WalletState {
  connect(): Promise<void>
  disconnect(): Promise<void>
  sendTransaction(transaction: Transaction | VersionedTransaction): Promise<string>
  signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T>
  signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]>
  signMessage(message: Uint8Array): Promise<Uint8Array>
}

export class WalletError extends Error {
  error: any

  constructor(message?: string, error?: any) {
    super(message)
    this.error = error
  }
}

export class WalletNotConnectedError extends WalletError {
  name = 'WalletNotConnectedError'
}

export class WalletNotReadyError extends WalletError {
  name = 'WalletNotReadyError'
}

export class WalletConnectionError extends WalletError {
  name = 'WalletConnectionError'
}

export class WalletDisconnectionError extends WalletError {
  name = 'WalletDisconnectionError'
}

export class WalletSignTransactionError extends WalletError {
  name = 'WalletSignTransactionError'
}

export class WalletSendTransactionError extends WalletError {
  name = 'WalletSendTransactionError'
}

export class WalletSignMessageError extends WalletError {
  name = 'WalletSignMessageError'
}

export const formatWalletAddress = (address: string | PublicKey, length: number = 4): string => {
  const addressString = typeof address === 'string' ? address : address.toString()
  if (addressString.length <= length * 2) return addressString
  return `${addressString.slice(0, length)}...${addressString.slice(-length)}`
}

export const validatePublicKey = (address: string): boolean => {
  try {
    new PublicKey(address)
    return true
  } catch {
    return false
  }
}

export const getWalletBalance = async (
  connection: Connection,
  publicKey: PublicKey
): Promise<number> => {
  try {
    const balance = await connection.getBalance(publicKey)
    return balance / 1e9 // Convert lamports to SOL
  } catch (error) {
    throw new WalletError('Failed to fetch wallet balance', error)
  }
}

export const confirmTransaction = async (
  connection: Connection,
  signature: string,
  commitment: 'processed' | 'confirmed' | 'finalized' = 'confirmed'
): Promise<boolean> => {
  try {
    const result = await connection.confirmTransaction(signature, commitment)
    return !result.value.err
  } catch (error) {
    throw new WalletError('Failed to confirm transaction', error)
  }
}

export const getRecentBlockhash = async (connection: Connection): Promise<string> => {
  try {
    const { blockhash } = await connection.getLatestBlockhash()
    return blockhash
  } catch (error) {
    throw new WalletError('Failed to get recent blockhash', error)
  }
}

export const estimateTransactionFee = async (
  connection: Connection,
  transaction: Transaction
): Promise<number> => {
  try {
    const fee = await connection.getFeeForMessage(transaction.compileMessage())
    return fee?.value || 0
  } catch (error) {
    throw new WalletError('Failed to estimate transaction fee', error)
  }
}

export const isWalletInstalled = (walletName: string): boolean => {
  if (typeof window === 'undefined') return false
  
  switch (walletName.toLowerCase()) {
    case 'phantom':
      return !!(window as any).phantom?.solana
    case 'solflare':
      return !!(window as any).solflare
    case 'backpack':
      return !!(window as any).backpack
    case 'glow':
      return !!(window as any).glow
    default:
      return false
  }
}

export const getWalletIcon = (walletName: string): string => {
  const icons: Record<string, string> = {
    phantom: '/icons/phantom.svg',
    solflare: '/icons/solflare.svg',
    backpack: '/icons/backpack.svg',
    glow: '/icons/glow.svg',
    'wallet-connect': '/icons/walletconnect.svg'
  }
  
  return icons[walletName.toLowerCase()] || '/icons/wallet.svg'
}

export const SUPPORTED_WALLETS = [
  {
    name: 'Phantom',
    url: 'https://phantom.app/',
    icon: getWalletIcon('phantom'),
    adapter: 'phantom'
  },
  {
    name: 'Solflare',
    url: 'https://solflare.com/',
    icon: getWalletIcon('solflare'),
    adapter: 'solflare'
  },
  {
    name: 'Backpack',
    url: 'https://backpack.app/',
    icon: getWalletIcon('backpack'),
    adapter: 'backpack'
  },
  {
    name: 'Glow',
    url: 'https://glow.app/',
    icon: getWalletIcon('glow'),
    adapter: 'glow'
  }
]

export const WALLET_ERRORS = {
  NOT_CONNECTED: 'Wallet not connected',
  NOT_READY: 'Wallet not ready',
  CONNECTION_FAILED: 'Failed to connect wallet',
  DISCONNECTION_FAILED: 'Failed to disconnect wallet',
  SIGN_TRANSACTION_FAILED: 'Failed to sign transaction',
  SEND_TRANSACTION_FAILED: 'Failed to send transaction',
  SIGN_MESSAGE_FAILED: 'Failed to sign message',
  INSUFFICIENT_FUNDS: 'Insufficient funds',
  TRANSACTION_REJECTED: 'Transaction rejected by user',
  NETWORK_ERROR: 'Network error'
}

export default {
  WalletError,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletConnectionError,
  WalletDisconnectionError,
  WalletSignTransactionError,
  WalletSendTransactionError,
  WalletSignMessageError,
  formatWalletAddress,
  validatePublicKey,
  getWalletBalance,
  confirmTransaction,
  getRecentBlockhash,
  estimateTransactionFee,
  isWalletInstalled,
  getWalletIcon,
  SUPPORTED_WALLETS,
  WALLET_ERRORS
}
```