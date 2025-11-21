export interface User {
  id: string
  email: string
  username: string
  balance: number
  createdAt: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface Market {
  id: string
  title: string
  description: string
  category: string
  creatorId: string
  createdAt: string
  resolveDate: string
  status: 'active' | 'resolved' | 'cancelled'
  totalVolume: number
  totalLiquidity: number
  options: MarketOption[]
  resolution?: string
}

export interface MarketOption {
  id: string
  marketId: string
  name: string
  probability: number
  shares: number
  lastPrice: number
}

export interface Position {
  id: string
  userId: string
  marketId: string
  optionId: string
  shares: number
  averagePrice: number
  currentValue: number
  profitLoss: number
}

export interface Trade {
  id: string
  marketId: string
  userId: string
  optionId: string
  type: 'buy' | 'sell'
  shares: number
  price: number
  total: number
  createdAt: string
}

export interface ApiError {
  message: string
  code?: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface MarketFilters {
  category?: string
  status?: Market['status']
  search?: string
  sortBy?: 'volume' | 'liquidity' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}
