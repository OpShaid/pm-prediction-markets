import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { AuthResponse, User, Market, Position, Trade, ApiError, PaginatedResponse } from '@/types'

// Use production API URL if deployed, fallback gracefully if backend not available
const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:8000/api')

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('auth_token')
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        // Handle 401 unauthorized
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token')
          window.location.href = '/login'
        }

        // Handle 404 or network errors (backend not running/available)
        if (error.response?.status === 404 || error.code === 'ERR_NETWORK' || !error.response) {
          console.warn('API endpoint not available:', error.config?.url)
        }

        const apiError: ApiError = {
          message: error.response?.data?.message || error.message || 'Service temporarily unavailable',
          code: error.response?.data?.code,
          errors: error.response?.data?.errors,
        }

        return Promise.reject(apiError)
      }
    )
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/login', { email, password })
    return response.data
  }

  async register(email: string, username: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/register', {
      email,
      username,
      password,
    })
    return response.data
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<User>('/auth/me')
    return response.data
  }

  async logout(): Promise<void> {
    await this.client.post('/auth/logout')
    localStorage.removeItem('auth_token')
  }

  // Market endpoints
  async getMarkets(params?: {
    page?: number
    pageSize?: number
    category?: string
    status?: string
    search?: string
  }): Promise<PaginatedResponse<Market>> {
    const response = await this.client.get<PaginatedResponse<Market>>('/markets', { params })
    return response.data
  }

  async getMarket(id: string): Promise<Market> {
    const response = await this.client.get<Market>(`/markets/${id}`)
    return response.data
  }

  async createMarket(data: {
    title: string
    description: string
    category: string
    resolveDate: string
    options: string[]
    initialLiquidity?: number
  }): Promise<Market> {
    const response = await this.client.post<Market>('/markets', data)
    return response.data
  }

  async resolveMarket(id: string, winningOptionId: string): Promise<Market> {
    const response = await this.client.post<Market>(`/markets/${id}/resolve`, {
      winningOptionId,
    })
    return response.data
  }

  // Trading endpoints
  async executeTrade(data: {
    marketId: string
    optionId: string
    type: 'buy' | 'sell'
    shares: number
  }): Promise<Trade> {
    const response = await this.client.post<Trade>('/trades', data)
    return response.data
  }

  async getUserTrades(userId?: string): Promise<Trade[]> {
    const response = await this.client.get<Trade[]>('/trades', {
      params: { userId },
    })
    return response.data
  }

  // Position endpoints
  async getUserPositions(userId?: string): Promise<Position[]> {
    const response = await this.client.get<Position[]>('/positions', {
      params: { userId },
    })
    return response.data
  }

  async getMarketPositions(marketId: string): Promise<Position[]> {
    const response = await this.client.get<Position[]>(`/markets/${marketId}/positions`)
    return response.data
  }
}

export const apiClient = new ApiClient()
