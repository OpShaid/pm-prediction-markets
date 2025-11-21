import { createClient, RedisClientType } from 'redis'
import { config } from '@/config'
import { logger } from '@/utils/logger'

export class CacheService {
  private client: RedisClientType
  private isConnected = false

  constructor() {
    this.client = createClient({
      socket: {
        host: config.redis.host,
        port: config.redis.port,
      },
      password: config.redis.password,
    })

    this.client.on('error', (err) => {
      logger.error('Redis Client Error:', err)
      this.isConnected = false
    })

    this.client.on('connect', () => {
      logger.info('Redis Client Connected')
      this.isConnected = true
    })
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect()
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.disconnect()
      this.isConnected = false
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key)
      return value ? JSON.parse(value) : null
    } catch (error: any) {
      logger.error(`Cache get error for key ${key}:`, error.message)
      return null
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      const ttl = ttlSeconds || config.cache.ttlSeconds
      await this.client.setEx(key, ttl, JSON.stringify(value))
    } catch (error: any) {
      logger.error(`Cache set error for key ${key}:`, error.message)
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key)
    } catch (error: any) {
      logger.error(`Cache delete error for key ${key}:`, error.message)
    }
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern)
      if (keys.length > 0) {
        await this.client.del(keys)
      }
    } catch (error: any) {
      logger.error(`Cache delete pattern error for ${pattern}:`, error.message)
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key)
      return result === 1
    } catch (error: any) {
      logger.error(`Cache exists error for key ${key}:`, error.message)
      return false
    }
  }

  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlSeconds?: number
  ): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const value = await fetchFn()
    await this.set(key, value, ttlSeconds)
    return value
  }
}

export const cacheService = new CacheService()
