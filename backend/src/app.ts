import express, { Express } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './swagger'
import { config } from './config'
import { logger } from './utils/logger'
import { errorHandler, notFoundHandler } from './middleware/errorHandler'
import { apiLimiter } from './middleware/rateLimiter'
import marketRoutes from './routes/marketRoutes'

export function createApp(): Express {
  const app = express()

  // Security middleware
  app.use(helmet())
  app.use(cors({
    origin: config.server.nodeEnv === 'production'
      ? ['https://yourfrontend.com']
      : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  }))

  // Compression
  app.use(compression())

  // Body parsing
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))

  // Logging
  if (config.server.nodeEnv !== 'test') {
    app.use(morgan('combined', {
      stream: { write: (message) => logger.info(message.trim()) },
    }))
  }

  // Rate limiting
  app.use('/api', apiLimiter)

  // Health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.server.nodeEnv,
    })
  })

  // API Documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Prediction Markets API Docs',
  }))

  // API Routes
  app.use('/api/markets', marketRoutes)

  // 404 handler
  app.use(notFoundHandler)

  // Error handler
  app.use(errorHandler)

  return app
}
