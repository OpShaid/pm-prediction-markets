import { Request, Response, NextFunction } from 'express'
import { aggregationService } from '@/services/AggregationService'
import { KalshiService } from '@/services/KalshiService'
import { PolymarketService } from '@/services/PolymarketService'
import { logger } from '@/utils/logger'
import { ApiResponse, PaginatedResponse } from '@/types'

const kalshiService = new KalshiService()
const polymarketService = new PolymarketService()

export class MarketController {
  async getAllMarkets(req: Request, res: Response, next: NextFunction) {
    try {
      const { source, status, category, limit } = req.query

      const markets = await aggregationService.getAllMarkets({
        source: source as 'kalshi' | 'polymarket' | 'all',
        status: status as string,
        category: category as string,
        limit: limit ? parseInt(limit as string) : undefined,
      })

      const response: ApiResponse<typeof markets> = {
        success: true,
        data: markets,
      }

      res.json(response)
    } catch (error: any) {
      logger.error('Error in getAllMarkets:', error)
      next(error)
    }
  }

  async getMarketById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const { source } = req.query

      if (!source || (source !== 'kalshi' && source !== 'polymarket')) {
        return res.status(400).json({
          success: false,
          error: 'Source parameter is required (kalshi or polymarket)',
        })
      }

      const market = await aggregationService.getMarketById(id, source as 'kalshi' | 'polymarket')

      const response: ApiResponse<typeof market> = {
        success: true,
        data: market,
      }

      res.json(response)
    } catch (error: any) {
      logger.error('Error in getMarketById:', error)
      next(error)
    }
  }

  async getTrendingMarkets(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit = 10 } = req.query
      const markets = await aggregationService.getTrendingMarkets(parseInt(limit as string))

      const response: ApiResponse<typeof markets> = {
        success: true,
        data: markets,
      }

      res.json(response)
    } catch (error: any) {
      logger.error('Error in getTrendingMarkets:', error)
      next(error)
    }
  }

  async searchMarkets(req: Request, res: Response, next: NextFunction) {
    try {
      const { q } = req.query

      if (!q) {
        return res.status(400).json({
          success: false,
          error: 'Query parameter "q" is required',
        })
      }

      const markets = await aggregationService.searchMarkets(q as string)

      const response: ApiResponse<typeof markets> = {
        success: true,
        data: markets,
      }

      res.json(response)
    } catch (error: any) {
      logger.error('Error in searchMarkets:', error)
      next(error)
    }
  }

  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await aggregationService.getCategories()

      const response: ApiResponse<typeof categories> = {
        success: true,
        data: categories,
      }

      res.json(response)
    } catch (error: any) {
      logger.error('Error in getCategories:', error)
      next(error)
    }
  }

  async getMarketsByCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { category } = req.params
      const markets = await aggregationService.getMarketsByCategory(category)

      const response: ApiResponse<typeof markets> = {
        success: true,
        data: markets,
      }

      res.json(response)
    } catch (error: any) {
      logger.error('Error in getMarketsByCategory:', error)
      next(error)
    }
  }

  async getOrderBook(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const { source } = req.query

      if (!source || (source !== 'kalshi' && source !== 'polymarket')) {
        return res.status(400).json({
          success: false,
          error: 'Source parameter is required (kalshi or polymarket)',
        })
      }

      let orderbook
      if (source === 'kalshi') {
        orderbook = await kalshiService.getOrderBook(id)
      } else {
        orderbook = await polymarketService.getOrderBook(id)
      }

      const response: ApiResponse<typeof orderbook> = {
        success: true,
        data: orderbook,
      }

      res.json(response)
    } catch (error: any) {
      logger.error('Error in getOrderBook:', error)
      next(error)
    }
  }

  async getMarketHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const { source, start_time, end_time, interval } = req.query

      if (!source || (source !== 'kalshi' && source !== 'polymarket')) {
        return res.status(400).json({
          success: false,
          error: 'Source parameter is required (kalshi or polymarket)',
        })
      }

      let history
      if (source === 'kalshi') {
        history = await kalshiService.getMarketHistory(id, {
          start_time: start_time as string,
          end_time: end_time as string,
          interval: interval as string,
        })
      } else {
        history = await polymarketService.getPriceHistory(id, {
          startDate: start_time as string,
          endDate: end_time as string,
          interval: interval as string,
        })
      }

      const response: ApiResponse<typeof history> = {
        success: true,
        data: history,
      }

      res.json(response)
    } catch (error: any) {
      logger.error('Error in getMarketHistory:', error)
      next(error)
    }
  }

  async getTrades(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const { source, limit, cursor, offset } = req.query

      if (!source || (source !== 'kalshi' && source !== 'polymarket')) {
        return res.status(400).json({
          success: false,
          error: 'Source parameter is required (kalshi or polymarket)',
        })
      }

      let trades
      if (source === 'kalshi') {
        trades = await kalshiService.getTrades(id, {
          limit: limit ? parseInt(limit as string) : undefined,
          cursor: cursor as string,
        })
      } else {
        trades = await polymarketService.getTrades(id, {
          limit: limit ? parseInt(limit as string) : undefined,
          offset: offset ? parseInt(offset as string) : undefined,
        })
      }

      const response: ApiResponse<typeof trades> = {
        success: true,
        data: trades,
      }

      res.json(response)
    } catch (error: any) {
      logger.error('Error in getTrades:', error)
      next(error)
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await aggregationService.getMarketStats()

      const response: ApiResponse<typeof stats> = {
        success: true,
        data: stats,
      }

      res.json(response)
    } catch (error: any) {
      logger.error('Error in getStats:', error)
      next(error)
    }
  }
}

export const marketController = new MarketController()
