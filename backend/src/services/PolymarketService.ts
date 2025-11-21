import axios, { AxiosInstance } from 'axios'
import { config } from '@/config'
import { logger } from '@/utils/logger'
import { PolymarketMarket, PolymarketOrderBook, Market, OutcomeToken, OrderBook } from '@/types'

export class PolymarketService {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: config.polymarket.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        if (this.config.polymarket.apiKey) {
          config.headers['X-API-Key'] = this.config.polymarket.apiKey
        }
        return config
      },
      (error) => {
        logger.error('Polymarket request error:', error)
        return Promise.reject(error)
      }
    )

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        logger.error('Polymarket response error:', error.response?.data || error.message)
        return Promise.reject(error)
      }
    )
  }

  async getMarkets(params?: {
    active?: boolean
    closed?: boolean
    limit?: number
    offset?: number
  }): Promise<Market[]> {
    try {
      const response = await this.client.get<PolymarketMarket[]>('/markets', { params })
      return response.data.map((m) => this.normalizeMarket(m))
    } catch (error: any) {
      logger.error('Error fetching Polymarket markets:', error.message)
      throw error
    }
  }

  async getMarket(id: string): Promise<Market> {
    try {
      const response = await this.client.get<PolymarketMarket>(`/markets/${id}`)
      return this.normalizeMarket(response.data)
    } catch (error: any) {
      logger.error(`Error fetching Polymarket market ${id}:`, error.message)
      throw error
    }
  }

  async getOrderBook(tokenId: string): Promise<OrderBook> {
    try {
      const response = await this.client.get<PolymarketOrderBook>(`/book/${tokenId}`)
      return this.normalizeOrderBook(tokenId, response.data)
    } catch (error: any) {
      logger.error(`Error fetching Polymarket orderbook ${tokenId}:`, error.message)
      throw error
    }
  }

  async getPriceHistory(tokenId: string, params?: {
    startDate?: string
    endDate?: string
    interval?: string
  }): Promise<any[]> {
    try {
      const response = await this.client.get(`/prices/${tokenId}`, { params })
      return response.data || []
    } catch (error: any) {
      logger.error(`Error fetching Polymarket price history ${tokenId}:`, error.message)
      throw error
    }
  }

  async getTrades(marketId: string, params?: { limit?: number; offset?: number }): Promise<any[]> {
    try {
      const response = await this.client.get(`/trades/${marketId}`, { params })
      return response.data || []
    } catch (error: any) {
      logger.error(`Error fetching Polymarket trades ${marketId}:`, error.message)
      throw error
    }
  }

  async getMarketStats(marketId: string): Promise<any> {
    try {
      const response = await this.client.get(`/markets/${marketId}/stats`)
      return response.data
    } catch (error: any) {
      logger.error(`Error fetching Polymarket stats ${marketId}:`, error.message)
      throw error
    }
  }

  private normalizeMarket(market: PolymarketMarket): Market {
    const outcomeTokens: OutcomeToken[] = market.outcomes.map((outcome, index) => {
      const price = parseFloat(market.outcomePrices[index] || '0')
      return {
        id: `${market.id}-${index}`,
        marketId: market.id,
        name: outcome,
        ticker: `${market.id}-${outcome.toUpperCase()}`,
        probability: price,
        price: price,
        lastPrice: price,
        priceChange24h: 0,
        volume24h: parseFloat(market.volume) / market.outcomes.length,
      }
    })

    return {
      id: market.id,
      source: 'polymarket',
      title: market.question,
      question: market.question,
      description: market.description || '',
      category: market.tags[0] || 'Other',
      status: this.normalizeStatus(market.active, market.closed),
      closeTime: new Date(market.endDate),
      resolveTime: market.resolvedAt ? new Date(market.resolvedAt) : undefined,
      volume24h: parseFloat(market.volume),
      totalVolume: parseFloat(market.volume),
      liquidity: parseFloat(market.liquidity),
      outcomeTokens,
      metadata: {
        marketType: market.marketType,
        tags: market.tags,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  private normalizeOrderBook(tokenId: string, orderbook: PolymarketOrderBook): OrderBook {
    return {
      marketId: tokenId,
      outcomeId: tokenId,
      timestamp: new Date(orderbook.timestamp * 1000),
      bids: orderbook.bids.map((bid) => ({
        price: parseFloat(bid.price),
        size: parseFloat(bid.size),
        orders: 1,
      })),
      asks: orderbook.asks.map((ask) => ({
        price: parseFloat(ask.price),
        size: parseFloat(ask.size),
        orders: 1,
      })),
    }
  }

  private normalizeStatus(active: boolean, closed: boolean): 'active' | 'closed' | 'resolved' {
    if (active && !closed) return 'active'
    if (closed) return 'resolved'
    return 'closed'
  }
}
