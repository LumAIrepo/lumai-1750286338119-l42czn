import React from "react"
```typescript
'use client'

import { useState, useEffect } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ChevronRight, User, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface WalletInfo {
  name: string
  publicKey: string
  balance: number
  connected: boolean
}

interface WalletConnectProps {
  className?: string
  onConnect?: (wallet: WalletInfo) => void
  onDisconnect?: () => void
}

export default function WalletConnect({ 
  className, 
  onConnect, 
  onDisconnect 
}: WalletConnectProps) {
  const { publicKey, wallet, connect, disconnect, connecting, connected } = useWallet()
  const { connection } = useConnection()
  const { setVisible } = useWalletModal()
  const [balance, setBalance] = useState<number>(0)
  const [showDetails, setShowDetails] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    if (connected && publicKey) {
      fetchBalance()
      const walletInfo: WalletInfo = {
        name: wallet?.adapter.name || 'Unknown',
        publicKey: publicKey.toString(),
        balance: balance,
        connected: true
      }
      onConnect?.(walletInfo)
    }
  }, [connected, publicKey, balance, wallet, onConnect])

  const fetchBalance = async () => {
    if (!publicKey || !connection) return
    
    try {
      setIsLoading(true)
      const balance = await connection.getBalance(publicKey)
      setBalance(balance / 1e9) // Convert lamports to SOL
    } catch (error) {
      console.error('Error fetching balance:', error)
      toast.error('Failed to fetch wallet balance')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnect = async () => {
    try {
      if (!wallet) {
        setVisible(true)
        return
      }
      await connect()
      toast.success('Wallet connected successfully')
    } catch (error) {
      console.error('Connection error:', error)
      toast.error('Failed to connect wallet')
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnect()
      setBalance(0)
      onDisconnect?.()
      toast.success('Wallet disconnected')
    } catch (error) {
      console.error('Disconnect error:', error)
      toast.error('Failed to disconnect wallet')
    }
  }

  const formatPublicKey = (key: string): string => {
    return `${key.slice(0, 4)}...${key.slice(-4)}`
  }

  if (!connected) {
    return (
      <Card className={cn('w-full max-w-md mx-auto', className)}>
        <CardHeader className="text-center">
          <CardTitle className="text-slate-900 font-inter">
            Connect Your Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleConnect}
            disabled={connecting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-inter"
          >
            {connecting ? 'Connecting...' : 'Connect Wallet'}
          </Button>
          <p className="text-sm text-slate-600 text-center font-inter">
            Connect your Solana wallet to start using SolanaPredict
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className={cn('w-full max-w-md mx-auto', className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-900 font-inter">
              Wallet Connected
            </CardTitle>
            <Badge 
              variant="secondary" 
              className="bg-emerald-100 text-emerald-800 rounded-xl"
            >
              Connected
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 font-inter">Wallet:</span>
              <span className="text-sm font-medium text-slate-900 font-inter">
                {wallet?.adapter.name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 font-inter">Address:</span>
              <span className="text-sm font-mono text-slate-900">
                {publicKey && formatPublicKey(publicKey.toString())}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 font-inter">Balance:</span>
              <span className="text-sm font-medium text-slate-900 font-inter">
                {isLoading ? 'Loading...' : `${balance.toFixed(4)} SOL`}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => setShowDetails(true)}
              variant="outline"
              size="sm"
              className="flex-1 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-inter"
            >
              <User className="w-4 h-4 mr-2" />
              Details
            </Button>
            <Button
              onClick={handleDisconnect}
              variant="outline"
              size="sm"
              className="flex-1 border-red-200 text-red-700 hover:bg-red-50 rounded-xl font-inter"
            >
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="bg-slate-50 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-inter">
              Wallet Details
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-sm text-slate-600 font-inter">Wallet Name:</span>
                <span className="text-sm font-medium text-slate-900 font-inter">
                  {wallet?.adapter.name}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-sm text-slate-600 font-inter">Public Key:</span>
                <span className="text-xs font-mono text-slate-900 break-all">
                  {publicKey?.toString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-sm text-slate-600 font-inter">Balance:</span>
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-900 font-inter">
                    {balance.toFixed(9)} SOL
                  </div>
                  <div className="text-xs text-slate-500 font-inter">
                    {(balance * 1e9).toLocaleString()} lamports
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={fetchBalance}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="flex-1 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-inter"
              >
                {isLoading ? 'Refreshing...' : 'Refresh Balance'}
              </Button>
              <Button
                onClick={() => setShowDetails(false)}
                size="sm"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-inter"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
```