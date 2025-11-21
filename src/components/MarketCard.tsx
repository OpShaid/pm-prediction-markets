import { Market } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import { Calendar, TrendingUp } from 'lucide-react'

interface MarketCardProps {
  market: Market
}

export function MarketCard({ market }: MarketCardProps) {
  const navigate = useNavigate()

  const getStatusVariant = (status: Market['status']) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'resolved':
        return 'secondary'
      case 'cancelled':
        return 'destructive'
      default:
        return 'default'
    }
  }

  return (
    <Card
      className="group cursor-pointer transition-all duration-500 hover:shadow-2xl border-2 border-white/10 bg-black/80 backdrop-blur-md hover:bg-white hover:scale-105 hover:border-white overflow-hidden"
      onClick={() => navigate(`/markets/${market.id}`)}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl font-black text-white group-hover:text-black transition-colors duration-500 tracking-tight">{market.title}</CardTitle>
            <CardDescription className="mt-3 line-clamp-2 text-gray-400 group-hover:text-gray-700 transition-colors duration-500 text-base font-light">{market.description}</CardDescription>
          </div>
          <Badge
            variant={getStatusVariant(market.status)}
            className="font-bold text-xs px-3 py-1 group-hover:bg-black group-hover:text-white transition-colors duration-500"
          >
            {market.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-400 group-hover:text-black transition-colors duration-500">
              <Calendar className="h-5 w-5" />
              <span className="font-medium">{formatDate(market.resolveDate)}</span>
            </div>
            <Badge
              variant="outline"
              className="border-white/20 text-white group-hover:border-black group-hover:text-black transition-colors duration-500 font-bold"
            >
              {market.category}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 group-hover:bg-black/10 transition-colors duration-500">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-white group-hover:text-black transition-colors duration-500" />
              <span className="text-sm text-gray-400 group-hover:text-black font-medium transition-colors duration-500">Volume</span>
            </div>
            <span className="font-black text-white group-hover:text-black transition-colors duration-500 text-lg">{formatCurrency(market.totalVolume)}</span>
          </div>

          {market.options && market.options.length > 0 && (
            <div className="space-y-3">
              {market.options.slice(0, 2).map((option) => (
                <div
                  key={option.id}
                  className="flex items-center justify-between rounded-xl bg-white/5 group-hover:bg-black/10 p-3 border border-white/10 group-hover:border-black/20 transition-all duration-500"
                >
                  <span className="text-sm font-bold text-white group-hover:text-black transition-colors duration-500">{option.name}</span>
                  <span className="text-base font-black text-white group-hover:text-black transition-colors duration-500">
                    {(option.probability * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
              {market.options.length > 2 && (
                <p className="text-xs text-gray-400 group-hover:text-black text-center font-medium transition-colors duration-500">
                  +{market.options.length - 2} more options
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
