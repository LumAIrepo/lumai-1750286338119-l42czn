import React from "react"
```typescript
'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronRight, Plus, Calendar, DollarSign, Users, TrendingUp } from "lucide-react"
import { useWallet } from "@solana/wallet-adapter-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface MarketFormData {
  title: string
  description: string
  category: string
  endDate: string
  initialLiquidity: string
  fee: string
}

interface MarketCategory {
  id: string
  name: string
  icon: React.ReactNode
  description: string
}

const marketCategories: MarketCategory[] = [
  {
    id: 'crypto',
    name: 'Cryptocurrency',
    icon: <TrendingUp className="h-5 w-5" />,
    description: 'Price predictions for digital assets'
  },
  {
    id: 'sports',
    name: 'Sports',
    icon: <Users className="h-5 w-5" />,
    description: 'Outcomes of sporting events'
  },
  {
    id: 'politics',
    name: 'Politics',
    icon: <Calendar className="h-5 w-5" />,
    description: 'Political events and elections'
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: <DollarSign className="h-5 w-5" />,
    description: 'Awards, releases, and pop culture'
  }
]

export default function CreatePage() {
  const { connected, publicKey } = useWallet()
  const [isCreating, setIsCreating] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [formData, setFormData] = useState<MarketFormData>({
    title: '',
    description: '',
    category: '',
    endDate: '',
    initialLiquidity: '',
    fee: '2.5'
  })

  const handleInputChange = (field: keyof MarketFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    handleInputChange('category', categoryId)
  }

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      toast.error('Market title is required')
      return false
    }
    if (!formData.description.trim()) {
      toast.error('Market description is required')
      return false
    }
    if (!formData.category) {
      toast.error('Please select a category')
      return false
    }
    if (!formData.endDate) {
      toast.error('End date is required')
      return false
    }
    if (!formData.initialLiquidity || parseFloat(formData.initialLiquidity) <= 0) {
      toast.error('Initial liquidity must be greater than 0')
      return false
    }
    return true
  }

  const handleCreateMarket = async () => {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!validateForm()) {
      return
    }

    setIsCreating(true)
    try {
      // Simulate market creation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Market created successfully!')
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        endDate: '',
        initialLiquidity: '',
        fee: '2.5'
      })
      setSelectedCategory('')
    } catch (error) {
      console.error('Error creating market:', error)
      toast.error('Failed to create market. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const minDate = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Prediction Market</h1>
          <p className="text-slate-600">
            Create a new prediction market and let users bet on future outcomes
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-slate-900">Market Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-slate-700 font-medium">
                    Market Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Will Bitcoin reach $100,000 by end of 2024?"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="border-slate-200 focus:border-emerald-600 focus:ring-emerald-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-slate-700 font-medium">
                    Description
                  </Label>
                  <textarea
                    id="description"
                    placeholder="Provide detailed information about the market conditions and resolution criteria..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 resize-none"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-slate-700 font-medium">Category</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {marketCategories.map((category) => (
                      <div
                        key={category.id}
                        onClick={() => handleCategorySelect(category.id)}
                        className={cn(
                          "p-4 border rounded-xl cursor-pointer transition-all hover:shadow-sm",
                          selectedCategory === category.id
                            ? "border-emerald-600 bg-emerald-50"
                            : "border-slate-200 hover:border-slate-300"
                        )}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            selectedCategory === category.id
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-slate-100 text-slate-600"
                          )}>
                            {category.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-slate-900">{category.name}</h3>
                            <p className="text-sm text-slate-600 mt-1">{category.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-slate-700 font-medium">
                      End Date
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      min={minDate}
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      className="border-slate-200 focus:border-emerald-600 focus:ring-emerald-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="initialLiquidity" className="text-slate-700 font-medium">
                      Initial Liquidity (SOL)
                    </Label>
                    <Input
                      id="initialLiquidity"
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="10.0"
                      value={formData.initialLiquidity}
                      onChange={(e) => handleInputChange('initialLiquidity', e.target.value)}
                      className="border-slate-200 focus:border-emerald-600 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fee" className="text-slate-700 font-medium">
                    Trading Fee (%)
                  </Label>
                  <Input
                    id="fee"
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={formData.fee}
                    onChange={(e) => handleInputChange('fee', e.target.value)}
                    className="border-slate-200 focus:border-emerald-600 focus:ring-emerald-600"
                  />
                  <p className="text-sm text-slate-500">
                    Fee charged on each trade (recommended: 2.5%)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900">Market Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-slate-900 mb-2">
                    {formData.title || 'Market Title'}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {formData.description || 'Market description will appear here...'}
                  </p>
                </div>

                {formData.category && (
                  <div>
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                      {marketCategories.find(c => c.id === formData.category)?.name}
                    </Badge>
                  </div>
                )}

                {formData.endDate && (
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <Calendar className="h-4 w-4" />
                    <span>Ends: {new Date(formData.endDate).toLocaleDateString()}</span>
                  </div>
                )}

                {formData.initialLiquidity && (
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <DollarSign className="h-4 w-4" />
                    <span>Liquidity: {formData.initialLiquidity} SOL</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900">Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    connected ? "bg-emerald-500" : "bg-slate-300"
                  )} />
                  <span className={connected ? "text-slate-900" : "text-slate-500"}>
                    Wallet Connected
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    formData.initialLiquidity && parseFloat(formData.initialLiquidity) > 0 
                      ? "bg-emerald-500" : "bg-slate-300"
                  )} />
                  <span className={
                    formData.initialLiquidity && parseFloat(formData.initialLiquidity) > 0
                      ? "text-slate-900" : "text-slate-500"
                  }>
                    Initial Liquidity
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    formData.title && formData.description && formData.category && formData.endDate
                      ? "bg-emerald-500" : "bg-slate-300"
                  )} />
                  <span className={
                    formData.title && formData.description && formData.category && formData.endDate
                      ? "text-slate-900" : "text-slate-500"
                  }>
                    All Fields Complete
                  </span>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleCreateMarket}
              disabled={!connected || isCreating}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12"
            >
              {isCreating ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating Market...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Create Market</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
```