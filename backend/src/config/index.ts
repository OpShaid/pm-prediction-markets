import dotenv from 'dotenv'

dotenv.config()

export const config = {
  server: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '8000', 10),
    host: process.env.HOST || '0.0.0.0',
  },
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    name: process.env.DATABASE_NAME || 'prediction_markets',
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'password',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  kalshi: {
    apiKey: process.env.KALSHI_API_KEY || '',
    apiSecret: process.env.KALSHI_API_SECRET || '',
    baseUrl: process.env.KALSHI_BASE_URL || 'https://api.kalshi.com/v1',
  },
  polymarket: {
    apiKey: process.env.POLYMARKET_API_KEY || '',
    baseUrl: process.env.POLYMARKET_BASE_URL || 'https://gamma-api.polymarket.com',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  cache: {
    ttlSeconds: parseInt(process.env.CACHE_TTL_SECONDS || '60', 10),
    marketDataRefreshInterval: parseInt(process.env.MARKET_DATA_REFRESH_INTERVAL || '30', 10),
  },
  websocket: {
    port: parseInt(process.env.WS_PORT || '8001', 10),
    heartbeatInterval: parseInt(process.env.WS_HEARTBEAT_INTERVAL || '30000', 10),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
}
