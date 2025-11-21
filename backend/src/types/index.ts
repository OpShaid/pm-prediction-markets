export interface Market {
  id: string
  source: 'kalshi' | 'polymarket'
  title: string
  question: string
  description: string
  category: string
  status: 'active' | 'closed' | 'resolved'
  closeTime: Date
  resolveTime?: Date
  volume24h: number
  totalVolume: number
  liquidity: number
  outcomeTokens: OutcomeToken[]
  metadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface OutcomeToken {
  id: string
  marketId: string
  name: string
  ticker: string
  probability: number
  price: number
  lastPrice: number
  priceChange24h: number
  volume24h: number
  bestBid?: number
  bestAsk?: number
  spread?: number
}

export interface OrderBook {
  marketId: string
  outcomeId: string
  timestamp: Date
  bids: OrderBookLevel[]
  asks: OrderBookLevel[]
}

export interface OrderBookLevel {
  price: number
  size: number
  orders: number
}

export interface PriceHistory {
  marketId: string
  outcomeId: string
  timestamp: Date
  price: number
  volume: number
}

export interface MarketEvent {
  id: string
  marketId: string
  type: 'price_update' | 'volume_update' | 'status_change' | 'resolution'
  data: Record<string, any>
  timestamp: Date
}

// Kalshi specific types
export interface KalshiMarket {
  ticker: string
  event_ticker: string
  market_ticker: string
  title: string
  category: string
  subtitle: string
  close_time: string
  expiration_time: string
  open_time: string
  status: string
  yes_bid: number
  yes_ask: number
  no_bid: number
  no_ask: number
  last_price: number
  volume: number
  open_interest: number
  liquidity: number
}

export interface KalshiOrderBook {
  yes: Array<{ price: number; quantity: number }>
  no: Array<{ price: number; quantity: number }>
}

// Polymarket specific types
export interface PolymarketMarket {
  id: string
  question: string
  description: string
  marketType: string
  outcomes: string[]
  outcomePrices: string[]
  volume: string
  active: boolean
  closed: boolean
  resolvedAt?: string
  endDate: string
  liquidity: string
  tags: string[]
}

export interface PolymarketOrderBook {
  asset_id: string
  bids: Array<{ price: string; size: string }>
  asks: Array<{ price: string; size: string }>
  timestamp: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
