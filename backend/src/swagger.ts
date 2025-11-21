import swaggerJsdoc from 'swagger-jsdoc'
import { config } from './config'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Prediction Markets API',
      version: '1.0.0',
      description:
        'Enterprise API for aggregating prediction market data from Kalshi and Polymarket',
      contact: {
        name: 'API Support',
        email: 'support@predictionmarkets.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.server.port}`,
        description: 'Development server',
      },
      {
        url: 'https://api.predictionmarkets.com',
        description: 'Production server',
      },
    ],
    tags: [
      {
        name: 'Markets',
        description: 'Market data endpoints',
      },
      {
        name: 'Prices',
        description: 'Price and orderbook data',
      },
      {
        name: 'Stats',
        description: 'Statistics and analytics',
      },
    ],
    components: {
      schemas: {
        Market: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            source: { type: 'string', enum: ['kalshi', 'polymarket'] },
            title: { type: 'string' },
            question: { type: 'string' },
            description: { type: 'string' },
            category: { type: 'string' },
            status: { type: 'string', enum: ['active', 'closed', 'resolved'] },
            closeTime: { type: 'string', format: 'date-time' },
            volume24h: { type: 'number' },
            totalVolume: { type: 'number' },
            liquidity: { type: 'number' },
            outcomeTokens: {
              type: 'array',
              items: { $ref: '#/components/schemas/OutcomeToken' },
            },
          },
        },
        OutcomeToken: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            marketId: { type: 'string' },
            name: { type: 'string' },
            ticker: { type: 'string' },
            probability: { type: 'number' },
            price: { type: 'number' },
            lastPrice: { type: 'number' },
            volume24h: { type: 'number' },
          },
        },
        OrderBook: {
          type: 'object',
          properties: {
            marketId: { type: 'string' },
            outcomeId: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
            bids: {
              type: 'array',
              items: { $ref: '#/components/schemas/OrderBookLevel' },
            },
            asks: {
              type: 'array',
              items: { $ref: '#/components/schemas/OrderBookLevel' },
            },
          },
        },
        OrderBookLevel: {
          type: 'object',
          properties: {
            price: { type: 'number' },
            size: { type: 'number' },
            orders: { type: 'integer' },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
}

export const swaggerSpec = swaggerJsdoc(options)
