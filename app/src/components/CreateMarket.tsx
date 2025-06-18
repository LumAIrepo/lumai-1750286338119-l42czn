import React from "react"
```typescript
'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronRight, User, Settings, Plus } from "lucide-react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { PublicKey, Transaction } from "@solana/web3.js"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface MarketFormData {
  title: string;
  description: string;
  category: string;
  endDate: string;
  endTime: string;
  initialLiquidity: string;
  fee: string;
}

interface CreateMarketProps {
  isOpen: boolean;
  onClose: () => void;
  onMarketCreated?: (marketId: string) => void;
}

const MARKET_CATEGORIES = [
  'Sports',
  'Politics',
  'Crypto',
  'Entertainment',
  'Technology',
  'Weather',
  'Economics',
  'Other'
];

export default function CreateMarket({ isOpen, onClose, onMarketCreated }: CreateMarketProps) {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState<MarketFormData>({
    title: '',
    description: '',
    category: '',
    endDate: '',
    endTime: '',
    initialLiquidity: '',
    fee: '2.5'
  });

  const handleInputChange = (field: keyof MarketFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      toast.error('Market title is required');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('Market description is required');
      return false;
    }
    if (!formData.category) {
      toast.error('Please select a category');
      return false;
    }
    if (!formData.endDate || !formData.endTime) {
      toast.error('End date and time are required');
      return false;
    }
    if (!formData.initialLiquidity || parseFloat(formData.initialLiquidity) <= 0) {
      toast.error('Initial liquidity must be greater than 0');
      return false;
    }
    return true;
  };

  const handleCreateMarket = async () => {
    if (!publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Simulate market creation transaction
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
      const now = new Date();
      
      if (endDateTime <= now) {
        toast.error('End date must be in the future');
        setIsLoading(false);
        return;
      }

      // Here you would implement the actual Solana transaction
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockMarketId = `market_${Date.now()}`;
      
      toast.success('Market created successfully!');
      onMarketCreated?.(mockMarketId);
      onClose();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        endDate: '',
        endTime: '',
        initialLiquidity: '',
        fee: '2.5'
      });
    } catch (error) {
      console.error('Error creating market:', error);
      toast.error('Failed to create market. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1); // Minimum 1 hour from now
    return now.toISOString().slice(0, 16);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Plus className="h-6 w-6 text-emerald-600" />
            Create Prediction Market
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-100">
            <TabsTrigger value="basic" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="details" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              Details
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6 mt-6">
            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900">Market Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-slate-700 font-medium">
                    Market Title *
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Will Bitcoin reach $100,000 by end of 2024?"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
                    maxLength={200}
                  />
                  <p className="text-sm text-slate-500">
                    {formData.title.length}/200 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-slate-700 font-medium">
                    Description *
                  </Label>
                  <textarea
                    id="description"
                    placeholder="Provide detailed information about the market conditions and resolution criteria..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full min-h-[100px] px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600 focus:ring-opacity-20 resize-none"
                    maxLength={1000}
                  />
                  <p className="text-sm text-slate-500">
                    {formData.description.length}/1000 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">Category *</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {MARKET_CATEGORIES.map((category) => (
                      <Button
                        key={category}
                        variant={formData.category === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleInputChange('category', category)}
                        className={cn(
                          "justify-center",
                          formData.category === category
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "border-slate-300 text-slate-700 hover:bg-slate-100"
                        )}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-6 mt-6">
            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900">Market Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-slate-700 font-medium">
                      End Date *
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime" className="text-slate-700 font-medium">
                      End Time *
                    </Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => handleInputChange('endTime', e.target.value)}
                      className="border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
                    />
                  </div>
                </div>
                <p className="text-sm text-slate-500">
                  Market will close for trading at the specified date and time
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 mt-6">
            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900">Market Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="initialLiquidity" className="text-slate-700 font-medium">
                    Initial Liquidity (SOL) *
                  </Label>
                  <Input
                    id="initialLiquidity"
                    type="number"
                    placeholder="10.0"
                    value={formData.initialLiquidity}
                    onChange={(e) => handleInputChange('initialLiquidity', e.target.value)}
                    min="0.1"
                    step="0.1"
                    className="border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
                  />
                  <p className="text-sm text-slate-500">
                    Minimum 0.1 SOL required to create a market
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fee" className="text-slate-700 font-medium">
                    Trading Fee (%)
                  </Label>
                  <Input
                    id="fee"
                    type="number"
                    value={formData.fee}
                    onChange={(e) => handleInputChange('fee', e.target.value)}
                    min="0"
                    max="10"
                    step="0.1"
                    className="border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
                  />
                  <p className="text-sm text-slate-500">
                    Fee charged on each trade (0-10%)
                  </p>
                </div>

                <div className="bg-slate-100 p-4 rounded-xl">
                  <h4 className="font-medium text-slate-900 mb-2">Market Summary</h4>
                  <div className="space-y-1 text-sm text-slate-600">
                    <p><span className="font-medium">Title:</span> {formData.title || 'Not set'}</p>
                    <p><span className="font-medium">Category:</span> {formData.category || 'Not selected'}</p>
                    <p><span className="font-medium">End Date:</span> {formData.endDate && formData.endTime ? `${formData.endDate} ${formData.endTime}` : 'Not set'}</p>
                    <p><span className="font-medium">Initial Liquidity:</span> {formData.initialLiquidity ? `${formData.initialLiquidity} SOL` : 'Not set'}</p>
                    <p><span className="font-medium">Trading Fee:</span> {formData.fee}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-6 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </Button>
          <div className="flex gap-2">
            {activeTab !== 'settings' && (
              <Button
                onClick={() => {
                  const tabs = ['basic', 'details', 'settings'];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex < tabs.length - 1) {
                    setActiveTab(tabs[currentIndex + 1]);
                  }
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            {activeTab === 'settings' && (
              <Button
                onClick={handleCreateMarket}
                disabled={isLoading || !publicKey}
                className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Market'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```