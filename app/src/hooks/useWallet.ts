import React from "react"
```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWallet as useSolanaWallet, useConnection } from '@solana/wallet-adapter-react'
import { PublicKey, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { toast } from 'sonner'

interface WalletState {
  isConnected: boolean
  publicKey: PublicKey | null
  balance: number
  isLoading: boolean
  error: string | null
}

interface UseWalletReturn extends WalletState {
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  sendTransaction: (transaction: Transaction) => Promise<string | null>
  refreshBalance: () => Promise<void>
}

export function useWallet(): UseWalletReturn {
  const { publicKey, connected, connect: walletConnect, disconnect: walletDisconnect, sendTransaction: walletSendTransaction } = useSolanaWallet()
  const { connection } = useConnection()
  
  const [balance, setBalance] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const refreshBalance = useCallback(async () => {
    if (!publicKey || !connection) {
      setBalance(0)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const lamports = await connection.getBalance(publicKey)
      setBalance(lamports / LAMPORTS_PER_SOL)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch balance'
      setError(errorMessage)
      toast.error('Failed to fetch wallet balance')
    } finally {
      setIsLoading(false)
    }
  }, [publicKey, connection])

  const connect = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      await walletConnect()
      toast.success('Wallet connected successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet'
      setError(errorMessage)
      toast.error('Failed to connect wallet')
    } finally {
      setIsLoading(false)
    }
  }, [walletConnect])

  const disconnect = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      await walletDisconnect()
      setBalance(0)
      toast.success('Wallet disconnected')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disconnect wallet'
      setError(errorMessage)
      toast.error('Failed to disconnect wallet')
    } finally {
      setIsLoading(false)
    }
  }, [walletDisconnect])

  const sendTransaction = useCallback(async (transaction: Transaction): Promise<string | null> => {
    if (!publicKey || !walletSendTransaction) {
      setError('Wallet not connected')
      toast.error('Wallet not connected')
      return null
    }

    try {
      setIsLoading(true)
      setError(null)
      const signature = await walletSendTransaction(transaction, connection)
      await connection.confirmTransaction(signature, 'confirmed')
      toast.success('Transaction sent successfully')
      await refreshBalance()
      return signature
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transaction failed'
      setError(errorMessage)
      toast.error('Transaction failed')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [publicKey, walletSendTransaction, connection, refreshBalance])

  useEffect(() => {
    if (connected && publicKey) {
      refreshBalance()
    } else {
      setBalance(0)
      setError(null)
    }
  }, [connected, publicKey, refreshBalance])

  return {
    isConnected: connected,
    publicKey,
    balance,
    isLoading,
    error,
    connect,
    disconnect,
    sendTransaction,
    refreshBalance
  }
}

export default useWallet
```