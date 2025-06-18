import React from "react"
```typescript
'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface MarketCardProps {
  id: string
  title: string
  description: string
  category: string
  totalVolume: number
  yesPrice: number
  noPrice: number
  endDate: Date
  isActive: boolean
  participants: number
  className?: string
  onClick?: () => void
}

export default function MarketCard({
  id,
  title,
  description,
  category,
  totalVolume,
  yesPrice,
  noPrice,
  endDate,
  isActive,
  participants,
  className,
  onClick
}: MarketCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  const getDaysRemaining = () => {
    const now = new Date()
    const diffTime = endDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  const daysRemaining = getDaysRemaining()

  return (
    <Card 
      className={cn(
        "w-full bg-slate-50 border border-slate-200 hover:border-emerald-600 transition-all duration-200 cursor-pointer group",
        !isActive && "opacity-75",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                variant="secondary" 
                className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
              >
                {category}
              </Badge>
              <Badge 
                variant={isActive ? "default" : "secondary"}
                className={cn(
                  isActive 
                    ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                    : "bg-slate-200 text-slate-600"
                )}
              >
                {isActive ? "Active" : "Ended"}
              </Badge>
            </div>
            <CardTitle className="text-slate-900 text-lg font-semibold leading-tight mb-2 group-hover:text-emerald-700 transition-colors">
              {title}
            </CardTitle>
            <p className="text-slate-600 text-sm line-clamp-2">
              {description}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-600 transition-colors flex-shrink-0 ml-2" />
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <div className="text-xs text-slate-500 mb-1">YES</div>
              <div className="text-lg font-semibold text-emerald-600">
                {formatCurrency(yesPrice)}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <div className="text-xs text-slate-500 mb-1">NO</div>
              <div className="text-lg font-semibold text-red-500">
                {formatCurrency(noPrice)}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="text-slate-600">
              <span className="font-medium">{formatCurrency(totalVolume)}</span>
              <span className="ml-1">volume</span>
            </div>
            <div className="text-slate-600">
              <span className="font-medium">{participants}</span>
              <span className="ml-1">traders</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="text-slate-500">
              Ends {formatDate(endDate)}
            </div>
            {isActive && (
              <div className="text-emerald-600 font-medium">
                {daysRemaining === 0 ? "Ending today" : `${daysRemaining}d left`}
              </div>
            )}
          </div>

          {isActive && (
            <Button 
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={(e) => {
                e.stopPropagation()
                onClick?.()
              }}
            >
              Trade Now
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```