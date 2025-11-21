import { createApp } from './app'
import { config } from './config'
import { logger } from './utils/logger'
import { cacheService } from './services/CacheService'
import { WebSocketServer } from './websocket/WebSocketServer'
import http from 'http'

async function startServer() {
  try {
    // Connect to Redis
    await cacheService.connect()
    logger.info('Redis connected successfully')

    // Create Express app
    const app = createApp()

    // Create HTTP server
    const server = http.createServer(app)

    // Initialize WebSocket server
    const wsServer = new WebSocketServer(server)
    logger.info('WebSocket server initialized')

    // Start listening
    server.listen(config.server.port, config.server.host, () => {
      logger.info(`
┌─────────────────────────────────────────────────┐
│  Prediction Markets API Server                 │
├─────────────────────────────────────────────────┤
│  Environment: ${config.server.nodeEnv.padEnd(35)} │
│  Port:        ${config.server.port.toString().padEnd(35)} │
│  Host:        ${config.server.host.padEnd(35)} │
│  API Docs:    http://${config.server.host}:${config.server.port}/api-docs ${' '.padEnd(7)} │
│  Health:      http://${config.server.host}:${config.server.port}/health ${' '.padEnd(10)} │
│  WebSocket:   ws://${config.server.host}:${config.server.port}/ws ${' '.padEnd(13)} │
└─────────────────────────────────────────────────┘
      `)
    })

    // Graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down gracefully...')

      server.close(() => {
        logger.info('HTTP server closed')
      })

      wsServer.stop()
      await cacheService.disconnect()

      process.exit(0)
    }

    process.on('SIGTERM', shutdown)
    process.on('SIGINT', shutdown)

  } catch (error) {
    logger.error('Error starting server:', error)
    process.exit(1)
  }
}

startServer()
