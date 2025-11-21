import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { TrendingUp, TrendingDown, Wallet, Activity } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { GitHubLoader } from '@/components/GitHubLoader'
import { ShaderBackground } from '@/components/ShaderBackground'

export function Portfolio() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const { data: positions, isLoading: positionsLoading } = useQuery({
    queryKey: ['positions', user?.id],
    queryFn: () => apiClient.getUserPositions(user?.id),
    enabled: !!user,
  })

  const { data: trades, isLoading: tradesLoading } = useQuery({
    queryKey: ['trades', user?.id],
    queryFn: () => apiClient.getUserTrades(user?.id),
    enabled: !!user,
  })

  const totalValue = positions?.reduce((sum, pos) => sum + pos.currentValue, 0) || 0
  const totalProfitLoss = positions?.reduce((sum, pos) => sum + pos.profitLoss, 0) || 0
  const profitLossPercentage = totalValue > 0 ? totalProfitLoss / totalValue : 0

  return (
    <div className="relative min-h-screen">
      {/* Shader Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <ShaderBackground className="fixed" />
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />
      </div>

      <div className="space-y-8 relative">
      <div>
        <h1 className="text-3xl font-bold">Portfolio</h1>
        <p className="text-muted-foreground mt-2">Track your positions and performance</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(user?.balance || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Available for trading</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {positions?.length || 0} active positions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            {totalProfitLoss >= 0 ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${totalProfitLoss >= 0 ? 'text-success' : 'text-destructive'}`}
            >
              {formatCurrency(totalProfitLoss)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatPercentage(profitLossPercentage)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Positions</CardTitle>
          <CardDescription>Your current market positions</CardDescription>
        </CardHeader>
        <CardContent>
          {positionsLoading && (
            <GitHubLoader text="Loading positions..." />
          )}

          {!positionsLoading && (!positions || positions.length === 0) && (
            <div className="py-8 text-center">
              <GitHubLoader text="" />
              <div className="mt-4 space-y-2">
                <p className="text-muted-foreground font-medium">No data available</p>
                <p className="text-sm text-muted-foreground">No active positions. Start trading to build your portfolio!</p>
              </div>
            </div>
          )}

          {positions && positions.length > 0 && (
            <div className="space-y-3">
              {positions.map((position) => (
                <div
                  key={position.id}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => navigate(`/markets/${position.marketId}`)}
                >
                  <div>
                    <h4 className="font-semibold">Market #{position.marketId.slice(0, 8)}</h4>
                    <p className="text-sm text-muted-foreground">
                      {position.shares} shares @ {formatCurrency(position.averagePrice)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(position.currentValue)}</p>
                    <p
                      className={`text-sm ${position.profitLoss >= 0 ? 'text-success' : 'text-destructive'}`}
                    >
                      {position.profitLoss >= 0 ? '+' : ''}
                      {formatCurrency(position.profitLoss)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Trades</CardTitle>
          <CardDescription>Your trading history</CardDescription>
        </CardHeader>
        <CardContent>
          {tradesLoading && (
            <GitHubLoader text="Loading trades..." />
          )}

          {!tradesLoading && (!trades || trades.length === 0) && (
            <div className="py-8 text-center">
              <GitHubLoader text="" />
              <div className="mt-4 space-y-2">
                <p className="text-muted-foreground font-medium">No data available</p>
                <p className="text-sm text-muted-foreground">No trades yet. Place your first trade to get started!</p>
              </div>
            </div>
          )}

          {trades && trades.length > 0 && (
            <div className="space-y-3">
              {trades.slice(0, 10).map((trade) => (
                <div
                  key={trade.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={trade.type === 'buy' ? 'success' : 'destructive'}>
                      {trade.type.toUpperCase()}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium">
                        {trade.shares} shares @ {formatCurrency(trade.price)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(trade.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold">{formatCurrency(trade.total)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
