import axios, { AxiosInstance } from 'axios'
import { config } from '@/config'
import { logger } from '@/utils/logger'
import { KalshiMarket, KalshiOrderBook, Market, OutcomeToken, OrderBook } from '@/types'

export class KalshiService {
  private client: AxiosInstance
  private authToken?: string
  private tokenExpiry?: Date

  constructor() {
    this.client = axios.create({
      baseURL: config.kalshi.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      async (config) => {
        await this.ensureAuthenticated()
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`
        }
        return config
      },
      (error) => {
        logger.error('Kalshi request error:', error)
        return Promise.reject(error)
      }
    )

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          this.authToken = undefined
          await this.authenticate()
          return this.client.request(error.config)
        }
        logger.error('Kalshi response error:', error.response?.data || error.message)
        return Promise.reject(error)
      }
    )
  }

  private async ensureAuthenticated() {
    if (!this.authToken || (this.tokenExpiry && new Date() >= this.tokenExpiry)) {
      await this.authenticate()
    }
  }

  private async authenticate() {
    try {
      const response = await axios.post(
        `${config.kalshi.baseUrl}/login`,
        {
          email: config.kalshi.apiKey,
          password: config.kalshi.apiSecret,
        },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      )

      this.authToken = response.data.token
      this.tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      logger.info('Kalshi authentication successful')
    } catch (error: any) {
      logger.error('Kalshi authentication failed:', error.message)
      throw new Error('Failed to authenticate with Kalshi')
    }
  }

  async getMarkets(params?: {
    status?: string
    limit?: number
    cursor?: string
  }): Promise<Market[]> {
    try {
      const response = await this.client.get<{ markets: KalshiMarket[]; cursor?: string }>(
        '/markets',
        { params }
      )

      return response.data.markets.map((m) => this.normalizeMarket(m))
    } catch (error: any) {
      logger.error('Error fetching Kalshi markets:', error.message)
      throw error
    }
  }

  async getMarket(ticker: string): Promise<Market> {
    try {
      const response = await this.client.get<{ market: KalshiMarket }>(`/markets/${ticker}`)
      return this.normalizeMarket(response.data.market)
    } catch (error: any) {
      logger.error(`Error fetching Kalshi market ${ticker}:`, error.message)
      throw error
    }
  }

  async getOrderBook(ticker: string): Promise<OrderBook> {
    try {
      const response = await this.client.get<KalshiOrderBook>(`/markets/${ticker}/orderbook`)
      return this.normalizeOrderBook(ticker, response.data)
    } catch (error: any) {
      logger.error(`Error fetching Kalshi orderbook ${ticker}:`, error.message)
      throw error
    }
  }

  async getMarketHistory(ticker: string, params?: {
    start_time?: string
    end_time?: string
    interval?: string
  }): Promise<any[]> {
    try {
      const response = await this.client.get(`/markets/${ticker}/history`, { params })
      return response.data.history || []
    } catch (error: any) {
      logger.error(`Error fetching Kalshi market history ${ticker}:`, error.message)
      throw error
    }
  }

  async getTrades(ticker: string, params?: { limit?: number; cursor?: string }): Promise<any[]> {
    try {
      const response = await this.client.get(`/markets/${ticker}/trades`, { params })
      return response.data.trades || []
    } catch (error: any) {
      logger.error(`Error fetching Kalshi trades ${ticker}:`, error.message)
      throw error
    }
  }

  async getEvents(params?: { status?: string; limit?: number }): Promise<any[]> {
    try {
      const response = await this.client.get('/events', { params })
      return response.data.events || []
    } catch (error: any) {
      logger.error('Error fetching Kalshi events:', error.message)
      throw error
    }
  }

  private normalizeMarket(market: KalshiMarket): Market {
    const yesToken: OutcomeToken = {
      id: `${market.ticker}-yes`,
      marketId: market.ticker,
      name: 'Yes',
      ticker: `${market.ticker}-YES`,
      probability: market.last_price / 100,
      price: market.last_price / 100,
      lastPrice: market.last_price / 100,
      priceChange24h: 0,
      volume24h: market.volume,
      bestBid: market.yes_bid / 100,
      bestAsk: market.yes_ask / 100,
      spread: (market.yes_ask - market.yes_bid) / 100,
    }

    const noToken: OutcomeToken = {
      id: `${market.ticker}-no`,
      marketId: market.ticker,
      name: 'No',
      ticker: `${market.ticker}-NO`,
      probability: 1 - market.last_price / 100,
      price: (100 - market.last_price) / 100,
      lastPrice: (100 - market.last_price) / 100,
      priceChange24h: 0,
      volume24h: market.volume,
      bestBid: market.no_bid / 100,
      bestAsk: market.no_ask / 100,
      spread: (market.no_ask - market.no_bid) / 100,
    }

    return {
      id: market.ticker,
      source: 'kalshi',
      title: market.title,
      question: market.subtitle || market.title,
      description: market.subtitle || '',
      category: market.category,
      status: this.normalizeStatus(market.status),
      closeTime: new Date(market.close_time),
      resolveTime: market.expiration_time ? new Date(market.expiration_time) : undefined,
      volume24h: market.volume,
      totalVolume: market.volume,
      liquidity: market.liquidity,
      outcomeTokens: [yesToken, noToken],
      metadata: {
        event_ticker: market.event_ticker,
        open_interest: market.open_interest,
        open_time: market.open_time,
      },
      createdAt: new Date(market.open_time),
      updatedAt: new Date(),
    }
  }

  private normalizeOrderBook(ticker: string, orderbook: KalshiOrderBook): OrderBook {
    return {
      marketId: ticker,
      outcomeId: `${ticker}-yes`,
      timestamp: new Date(),
      bids: orderbook.yes.map((level) => ({
        price: level.price / 100,
        size: level.quantity,
        orders: 1,
      })),
      asks: orderbook.yes.map((level) => ({
        price: level.price / 100,
        size: level.quantity,
        orders: 1,
      })),
    }
  }

  private normalizeStatus(status: string): 'active' | 'closed' | 'resolved' {
    const statusLower = status.toLowerCase()
    if (statusLower === 'active' || statusLower === 'open') return 'active'
    if (statusLower === 'closed') return 'closed'
    return 'resolved'
  }
}
