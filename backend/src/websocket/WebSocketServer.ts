import WebSocket, { WebSocketServer as WSServer } from 'ws'
import { Server } from 'http'
import { logger } from '@/utils/logger'
import { config } from '@/config'
import { KalshiService } from '@/services/KalshiService'
import { PolymarketService } from '@/services/PolymarketService'

interface WebSocketClient extends WebSocket {
  isAlive: boolean
  subscriptions: Set<string>
}

export class WebSocketServer {
  private wss: WSServer
  private kalshiService: KalshiService
  private polymarketService: PolymarketService
  private updateInterval?: NodeJS.Timeout
  private heartbeatInterval?: NodeJS.Timeout

  constructor(server: Server) {
    this.wss = new WSServer({ server, path: '/ws' })
    this.kalshiService = new KalshiService()
    this.polymarketService = new PolymarketService()
    this.initialize()
  }

  private initialize() {
    this.wss.on('connection', (ws: WebSocketClient) => {
      logger.info('New WebSocket client connected')

      ws.isAlive = true
      ws.subscriptions = new Set()

      ws.on('pong', () => {
        ws.isAlive = true
      })

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message.toString())
          this.handleMessage(ws, data)
        } catch (error) {
          logger.error('Error parsing WebSocket message:', error)
          ws.send(JSON.stringify({ type: 'error', error: 'Invalid message format' }))
        }
      })

      ws.on('close', () => {
        logger.info('WebSocket client disconnected')
      })

      ws.on('error', (error) => {
        logger.error('WebSocket error:', error)
      })

      // Send welcome message
      ws.send(
        JSON.stringify({
          type: 'connected',
          message: 'Connected to Prediction Markets WebSocket',
        })
      )
    })

    // Start heartbeat check
    this.startHeartbeat()

    // Start market data updates
    this.startMarketUpdates()

    logger.info('WebSocket server initialized')
  }

  private handleMessage(ws: WebSocketClient, data: any) {
    const { type, payload } = data

    switch (type) {
      case 'subscribe':
        this.handleSubscribe(ws, payload)
        break
      case 'unsubscribe':
        this.handleUnsubscribe(ws, payload)
        break
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }))
        break
      default:
        ws.send(JSON.stringify({ type: 'error', error: 'Unknown message type' }))
    }
  }

  private handleSubscribe(ws: WebSocketClient, payload: any) {
    const { marketId, source } = payload

    if (!marketId || !source) {
      ws.send(JSON.stringify({ type: 'error', error: 'marketId and source are required' }))
      return
    }

    const subscriptionKey = `${source}:${marketId}`
    ws.subscriptions.add(subscriptionKey)

    ws.send(
      JSON.stringify({
        type: 'subscribed',
        marketId,
        source,
      })
    )

    logger.info(`Client subscribed to ${subscriptionKey}`)
  }

  private handleUnsubscribe(ws: WebSocketClient, payload: any) {
    const { marketId, source } = payload

    if (!marketId || !source) {
      ws.send(JSON.stringify({ type: 'error', error: 'marketId and source are required' }))
      return
    }

    const subscriptionKey = `${source}:${marketId}`
    ws.subscriptions.delete(subscriptionKey)

    ws.send(
      JSON.stringify({
        type: 'unsubscribed',
        marketId,
        source,
      })
    )

    logger.info(`Client unsubscribed from ${subscriptionKey}`)
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.wss.clients.forEach((ws: WebSocket) => {
        const client = ws as WebSocketClient

        if (client.isAlive === false) {
          logger.info('Terminating inactive client')
          return client.terminate()
        }

        client.isAlive = false
        client.ping()
      })
    }, config.websocket.heartbeatInterval)
  }

  private startMarketUpdates() {
    // Update market data every 30 seconds
    this.updateInterval = setInterval(async () => {
      await this.broadcastMarketUpdates()
    }, config.cache.marketDataRefreshInterval * 1000)
  }

  private async broadcastMarketUpdates() {
    try {
      // Get all unique subscriptions across all clients
      const allSubscriptions = new Set<string>()
      this.wss.clients.forEach((ws: WebSocket) => {
        const client = ws as WebSocketClient
        client.subscriptions.forEach((sub) => allSubscriptions.add(sub))
      })

      // Fetch updates for subscribed markets
      for (const subscription of allSubscriptions) {
        const [source, marketId] = subscription.split(':')

        try {
          let marketData
          if (source === 'kalshi') {
            marketData = await this.kalshiService.getMarket(marketId)
          } else if (source === 'polymarket') {
            marketData = await this.polymarketService.getMarket(marketId)
          }

          if (marketData) {
            this.broadcast({
              type: 'market_update',
              source,
              marketId,
              data: marketData,
              timestamp: new Date().toISOString(),
            }, subscription)
          }
        } catch (error: any) {
          logger.error(`Error fetching update for ${subscription}:`, error.message)
        }
      }
    } catch (error: any) {
      logger.error('Error in broadcastMarketUpdates:', error)
    }
  }

  private broadcast(message: any, subscriptionKey?: string) {
    this.wss.clients.forEach((ws: WebSocket) => {
      const client = ws as WebSocketClient

      if (ws.readyState === WebSocket.OPEN) {
        // If subscriptionKey provided, only send to subscribed clients
        if (!subscriptionKey || client.subscriptions.has(subscriptionKey)) {
          ws.send(JSON.stringify(message))
        }
      }
    })
  }

  public stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }
    this.wss.close()
    logger.info('WebSocket server stopped')
  }
}
