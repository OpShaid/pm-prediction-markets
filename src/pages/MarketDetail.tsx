import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, formatPercentage } from '@/lib/utils'
import { TrendingUp, Calendar, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'
import { ShaderBackground } from '@/components/ShaderBackground'
import { GitHubLoader } from '@/components/GitHubLoader'

export function MarketDetail() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const { user, updateBalance } = useAuthStore()
  const [selectedOption, setSelectedOption] = useState<string>('')
  const [shares, setShares] = useState<string>('10')

  const { data: market, isLoading } = useQuery({
    queryKey: ['market', id],
    queryFn: () => apiClient.getMarket(id!),
    enabled: !!id,
  })

  const tradeMutation = useMutation({
    mutationFn: (data: { optionId: string; shares: number; type: 'buy' | 'sell' }) =>
      apiClient.executeTrade({ marketId: id!, ...data }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['market', id] })
      queryClient.invalidateQueries({ queryKey: ['positions'] })
      toast.success(`Trade executed successfully!`)
      // Update user balance (this should come from the API response)
      if (user) {
        updateBalance(user.balance - data.total)
      }
      setShares('10')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Trade failed')
    },
  })

  const handleTrade = (type: 'buy' | 'sell') => {
    if (!selectedOption) {
      toast.error('Please select an option')
      return
    }

    const shareCount = parseInt(shares)
    if (isNaN(shareCount) || shareCount <= 0) {
      toast.error('Please enter a valid number of shares')
      return
    }

    tradeMutation.mutate({
      optionId: selectedOption,
      shares: shareCount,
      type,
    })
  }

  if (isLoading) {
    return (
      <div className="relative min-h-screen">
        <div className="fixed inset-0 -z-10 overflow-hidden bg-black">
          <ShaderBackground className="fixed" />
        </div>
        <Card className="border-2 bg-card/50 backdrop-blur-sm">
          <GitHubLoader text="Loading market..." />
        </Card>
      </div>
    )
  }

  if (!market) {
    return (
      <div className="relative min-h-screen">
        <div className="fixed inset-0 -z-10 overflow-hidden bg-black">
          <ShaderBackground className="fixed" />
        </div>
        <Card className="p-12 text-center border-2 bg-card/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-6">
            <GitHubLoader text="" />
            <div className="space-y-2">
              <p className="text-muted-foreground font-medium text-lg">No data available</p>
              <p className="text-muted-foreground text-sm">Market not found or no longer available.</p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      {/* Shader Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <ShaderBackground className="fixed" />
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />
      </div>

      <div className="space-y-6 relative">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl">{market.title}</CardTitle>
              <CardDescription className="mt-2 text-base">{market.description}</CardDescription>
            </div>
            <Badge variant={market.status === 'active' ? 'success' : 'secondary'}>
              {market.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Resolve Date</p>
                <p className="font-semibold">{formatDate(market.resolveDate)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total Volume</p>
                <p className="font-semibold">{formatCurrency(market.totalVolume)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Liquidity</p>
                <p className="font-semibold">{formatCurrency(market.totalLiquidity)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Market Options</CardTitle>
            <CardDescription>Select an option to trade</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {market.options.map((option) => (
              <div
                key={option.id}
                className={`cursor-pointer rounded-lg border-2 p-4 transition-all hover:border-white ${
                  selectedOption === option.id ? 'border-white bg-white/5' : 'border-border'
                }`}
                onClick={() => setSelectedOption(option.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold">{option.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {option.shares.toLocaleString()} shares
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">
                      {formatPercentage(option.probability)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(option.lastPrice)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Place Trade</CardTitle>
            <CardDescription>Buy or sell shares</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Number of Shares</label>
              <Input
                type="number"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                min="1"
                placeholder="10"
              />
            </div>

            {selectedOption && (
              <div className="rounded-lg bg-muted p-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price per share</span>
                  <span className="font-medium">
                    {formatCurrency(
                      market.options.find((o) => o.id === selectedOption)?.lastPrice || 0
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated total</span>
                  <span className="font-semibold">
                    {formatCurrency(
                      (market.options.find((o) => o.id === selectedOption)?.lastPrice || 0) *
                        parseInt(shares || '0')
                    )}
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => handleTrade('buy')}
                disabled={!selectedOption || tradeMutation.isPending || market.status !== 'active'}
                className="w-full"
                variant="success"
              >
                {tradeMutation.isPending ? 'Trading...' : 'Buy'}
              </Button>
              <Button
                onClick={() => handleTrade('sell')}
                disabled={!selectedOption || tradeMutation.isPending || market.status !== 'active'}
                className="w-full"
                variant="destructive"
              >
                {tradeMutation.isPending ? 'Trading...' : 'Sell'}
              </Button>
            </div>

            <div className="text-xs text-muted-foreground text-center">
              Your balance: {formatCurrency(user?.balance || 0)}
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  )
}
