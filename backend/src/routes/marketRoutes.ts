import { Router } from 'express'
import { marketController } from '@/controllers/MarketController'

const router = Router()

/**
 * @swagger
 * /api/markets:
 *   get:
 *     summary: Get all markets from Kalshi and Polymarket
 *     tags: [Markets]
 *     parameters:
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *           enum: [kalshi, polymarket, all]
 *         description: Filter by data source
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, closed, resolved]
 *         description: Filter by market status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limit number of results
 *     responses:
 *       200:
 *         description: List of markets
 */
router.get('/', marketController.getAllMarkets.bind(marketController))

/**
 * @swagger
 * /api/markets/trending:
 *   get:
 *     summary: Get trending markets by volume
 *     tags: [Markets]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of trending markets to return
 *     responses:
 *       200:
 *         description: List of trending markets
 */
router.get('/trending', marketController.getTrendingMarkets.bind(marketController))

/**
 * @swagger
 * /api/markets/search:
 *   get:
 *     summary: Search markets by query
 *     tags: [Markets]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', marketController.searchMarkets.bind(marketController))

/**
 * @swagger
 * /api/markets/categories:
 *   get:
 *     summary: Get all market categories
 *     tags: [Markets]
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/categories', marketController.getCategories.bind(marketController))

/**
 * @swagger
 * /api/markets/stats:
 *   get:
 *     summary: Get global market statistics
 *     tags: [Markets]
 *     responses:
 *       200:
 *         description: Market statistics
 */
router.get('/stats', marketController.getStats.bind(marketController))

/**
 * @swagger
 * /api/markets/category/{category}:
 *   get:
 *     summary: Get markets by category
 *     tags: [Markets]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Markets in the category
 */
router.get('/category/:category', marketController.getMarketsByCategory.bind(marketController))

/**
 * @swagger
 * /api/markets/{id}:
 *   get:
 *     summary: Get market by ID
 *     tags: [Markets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: source
 *         required: true
 *         schema:
 *           type: string
 *           enum: [kalshi, polymarket]
 *     responses:
 *       200:
 *         description: Market details
 */
router.get('/:id', marketController.getMarketById.bind(marketController))

/**
 * @swagger
 * /api/markets/{id}/orderbook:
 *   get:
 *     summary: Get order book for a market
 *     tags: [Markets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: source
 *         required: true
 *         schema:
 *           type: string
 *           enum: [kalshi, polymarket]
 *     responses:
 *       200:
 *         description: Order book data
 */
router.get('/:id/orderbook', marketController.getOrderBook.bind(marketController))

/**
 * @swagger
 * /api/markets/{id}/history:
 *   get:
 *     summary: Get price history for a market
 *     tags: [Markets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: source
 *         required: true
 *         schema:
 *           type: string
 *           enum: [kalshi, polymarket]
 *       - in: query
 *         name: start_time
 *         schema:
 *           type: string
 *       - in: query
 *         name: end_time
 *         schema:
 *           type: string
 *       - in: query
 *         name: interval
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Historical price data
 */
router.get('/:id/history', marketController.getMarketHistory.bind(marketController))

/**
 * @swagger
 * /api/markets/{id}/trades:
 *   get:
 *     summary: Get recent trades for a market
 *     tags: [Markets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: source
 *         required: true
 *         schema:
 *           type: string
 *           enum: [kalshi, polymarket]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Recent trades
 */
router.get('/:id/trades', marketController.getTrades.bind(marketController))

export default router
