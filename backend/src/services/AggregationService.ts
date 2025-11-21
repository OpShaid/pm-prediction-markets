import { KalshiService } from './KalshiService'
import { PolymarketService } from './PolymarketService'
import { CacheService } from './CacheService'
import { Market } from '@/types'
import { logger } from '@/utils/logger'

export class AggregationService {
  private kalshiService: KalshiService
  private polymarketService: PolymarketService
  private cacheService: CacheService

  constructor() {
    this.kalshiService = new KalshiService()
    this.polymarketService = new PolymarketService()
    this.cacheService = new CacheService()
  }

  async getAllMarkets(params?: {
    source?: 'kalshi' | 'polymarket' | 'all'
    status?: string
    category?: string
    limit?: number
  }): Promise<Market[]> {
    const source = params?.source || 'all'
    const cacheKey = `markets:${source}:${params?.status || 'all'}:${params?.category || 'all'}`

    try {
      return await this.cacheService.getOrSet(
        cacheKey,
        async () => {
          const markets: Market[] = []

          if (source === 'kalshi' || source === 'all') {
            try {
              const kalshiMarkets = await this.kalshiService.getMarkets({
                status: params?.status,
                limit: params?.limit,
              })
              markets.push(...kalshiMarkets)
            } catch (error: any) {
              logger.error('Error fetching Kalshi markets:', error.message)
            }
          }

          if (source === 'polymarket' || source === 'all') {
            try {
              const polymarketMarkets = await this.polymarketService.getMarkets({
                active: params?.status === 'active',
                closed: params?.status === 'closed',
                limit: params?.limit,
              })
              markets.push(...polymarketMarkets)
            } catch (error: any) {
              logger.error('Error fetching Polymarket markets:', error.message)
            }
          }

          // Filter by category if specified
          if (params?.category) {
            return markets.filter(
              (m) => m.category.toLowerCase() === params.category!.toLowerCase()
            )
          }

          return markets
        },
        30 // Cache for 30 seconds
      )
    } catch (error: any) {
      logger.error('Error in getAllMarkets:', error.message)
      throw error
    }
  }

  async getMarketById(id: string, source: 'kalshi' | 'polymarket'): Promise<Market> {
    const cacheKey = `market:${source}:${id}`

    return await this.cacheService.getOrSet(
      cacheKey,
      async () => {
        if (source === 'kalshi') {
          return await this.kalshiService.getMarket(id)
        } else {
          return await this.polymarketService.getMarket(id)
        }
      },
      15 // Cache for 15 seconds
    )
  }

  async getMarketsByCategory(category: string): Promise<Market[]> {
    const markets = await this.getAllMarkets()
    return markets.filter((m) => m.category.toLowerCase() === category.toLowerCase())
  }

  async getTrendingMarkets(limit: number = 10): Promise<Market[]> {
    const markets = await this.getAllMarkets({ status: 'active' })

    // Sort by 24h volume
    return markets
      .sort((a, b) => b.volume24h - a.volume24h)
      .slice(0, limit)
  }

  async searchMarkets(query: string): Promise<Market[]> {
    const markets = await this.getAllMarkets()
    const queryLower = query.toLowerCase()

    return markets.filter(
      (m) =>
        m.title.toLowerCase().includes(queryLower) ||
        m.question.toLowerCase().includes(queryLower) ||
        m.description.toLowerCase().includes(queryLower)
    )
  }

  async getCategories(): Promise<string[]> {
    const cacheKey = 'categories:all'

    return await this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const markets = await this.getAllMarkets()
        const categories = new Set(markets.map((m) => m.category))
        return Array.from(categories).sort()
      },
      300 // Cache for 5 minutes
    )
  }

  async getMarketStats(): Promise<{
    totalMarkets: number
    activeMarkets: number
    totalVolume24h: number
    totalLiquidity: number
    marketsBySource: Record<string, number>
  }> {
    const cacheKey = 'stats:global'

    return await this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const markets = await this.getAllMarkets()

        return {
          totalMarkets: markets.length,
          activeMarkets: markets.filter((m) => m.status === 'active').length,
          totalVolume24h: markets.reduce((sum, m) => sum + m.volume24h, 0),
          totalLiquidity: markets.reduce((sum, m) => sum + m.liquidity, 0),
          marketsBySource: {
            kalshi: markets.filter((m) => m.source === 'kalshi').length,
            polymarket: markets.filter((m) => m.source === 'polymarket').length,
          },
        }
      },
      60 // Cache for 1 minute
    )
  }
}

export const aggregationService = new AggregationService()
