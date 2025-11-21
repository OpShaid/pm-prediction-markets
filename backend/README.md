# Prediction Markets Backend API

Enterprise-grade backend API that aggregates prediction market data from **Kalshi** and **Polymarket**, providing unified endpoints for real-time prices, market metadata, historical data, order books, and event-level information.

## Features

### Data Sources
- **Kalshi Integration** - Real-time markets, prices, and orderbook data
- **Polymarket Integration** - Decentralized prediction markets on Polygon
- **Unified API** - Normalized data format across both platforms

### Core Capabilities
- **Real-Time Data** - WebSocket support for live market updates
- **Historical Data** - Time series price data and trade history
- **Order Books** - Live bid/ask data for all markets
- **Market Discovery** - Search, filter, and browse markets
- **Analytics** - Market statistics and trending analysis
- **Caching** - Redis-powered caching for performance
- **Rate Limiting** - Protection against abuse
- **API Documentation** - Interactive Swagger/OpenAPI docs

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript 5
- **WebSocket**: ws library
- **Caching**: Redis
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Winston
- **Container**: Docker

## API Endpoints

### Markets

```
GET  /api/markets                    # Get all markets
GET  /api/markets/trending           # Get trending markets
GET  /api/markets/search?q=          # Search markets
GET  /api/markets/categories         # List all categories
GET  /api/markets/category/:category # Markets by category
GET  /api/markets/:id                # Get market by ID
GET  /api/markets/:id/orderbook      # Get order book
GET  /api/markets/:id/history        # Get price history
GET  /api/markets/:id/trades         # Get recent trades
GET  /api/markets/stats              # Global statistics
```

### WebSocket

```
ws://localhost:8000/ws

Messages:
- subscribe: { type: 'subscribe', payload: { marketId, source } }
- unsubscribe: { type: 'unsubscribe', payload: { marketId, source } }
- ping: { type: 'ping' }
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Redis (optional, for caching)

### Installation

1. **Install dependencies**
```bash
cd backend
npm install
```

2. **Configure environment**
```bash
cp .env.example .env
```

Edit `.env` with your API keys:
```env
# Required
KALSHI_API_KEY=your-kalshi-email
KALSHI_API_SECRET=your-kalshi-password

# Optional
POLYMARKET_API_KEY=your-polymarket-key
REDIS_HOST=localhost
REDIS_PORT=6379
```

3. **Start development server**
```bash
npm run dev
```

The API will be available at `http://localhost:8000`

### Development Commands

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Format code with Prettier
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

## Docker Deployment

### Build and run

```bash
# Build image
docker build -t prediction-markets-backend .

# Run container
docker run -p 8000:8000 \
  -e KALSHI_API_KEY=your-key \
  -e KALSHI_API_SECRET=your-secret \
  prediction-markets-backend
```

### Docker Compose

```bash
# From root directory
docker-compose up -d
```

This starts:
- Backend API (port 8000)
- Redis (port 6379)
- PostgreSQL (port 5432)

## API Documentation

Interactive API documentation is available at:
- Development: `http://localhost:8000/api-docs`
- Production: `https://api.yourdom ain.com/api-docs`

## Project Structure

```
backend/
├── src/
│   ├── config/              # Configuration
│   │   └── index.ts
│   ├── controllers/         # Route controllers
│   │   └── MarketController.ts
│   ├── middleware/          # Express middleware
│   │   ├── errorHandler.ts
│   │   └── rateLimiter.ts
│   ├── routes/              # API routes
│   │   └── marketRoutes.ts
│   ├── services/            # Business logic
│   │   ├── KalshiService.ts      # Kalshi API integration
│   │   ├── PolymarketService.ts  # Polymarket API integration
│   │   ├── CacheService.ts       # Redis caching
│   │   └── AggregationService.ts # Data aggregation
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   ├── utils/               # Utilities
│   │   └── logger.ts
│   ├── websocket/           # WebSocket server
│   │   └── WebSocketServer.ts
│   ├── app.ts               # Express app setup
│   ├── swagger.ts           # API documentation
│   └── index.ts             # Entry point
├── logs/                    # Log files
├── package.json
├── tsconfig.json
├── Dockerfile
└── README.md
```

## Data Models

### Market

```typescript
interface Market {
  id: string
  source: 'kalshi' | 'polymarket'
  title: string
  question: string
  description: string
  category: string
  status: 'active' | 'closed' | 'resolved'
  closeTime: Date
  volume24h: number
  totalVolume: number
  liquidity: number
  outcomeTokens: OutcomeToken[]
}
```

### OutcomeToken

```typescript
interface OutcomeToken {
  id: string
  marketId: string
  name: string
  ticker: string
  probability: number
  price: number
  volume24h: number
  bestBid?: number
  bestAsk?: number
  spread?: number
}
```

### OrderBook

```typescript
interface OrderBook {
  marketId: string
  outcomeId: string
  timestamp: Date
  bids: OrderBookLevel[]
  asks: OrderBookLevel[]
}
```

## API Examples

### Get All Active Markets

```bash
curl http://localhost:8000/api/markets?status=active
```

### Get Trending Markets

```bash
curl http://localhost:8000/api/markets/trending?limit=10
```

### Search Markets

```bash
curl http://localhost:8000/api/markets/search?q=bitcoin
```

### Get Order Book

```bash
curl "http://localhost:8000/api/markets/MARKET_ID/orderbook?source=kalshi"
```

### Get Price History

```bash
curl "http://localhost:8000/api/markets/MARKET_ID/history?source=polymarket&interval=1h"
```

### WebSocket Connection

```javascript
const ws = new WebSocket('ws://localhost:8000/ws')

ws.on('open', () => {
  // Subscribe to market updates
  ws.send(JSON.stringify({
    type: 'subscribe',
    payload: { marketId: 'MARKET_ID', source: 'kalshi' }
  }))
})

ws.on('message', (data) => {
  const message = JSON.parse(data)
  console.log('Market update:', message)
})
```

## Performance & Caching

- Redis caching with configurable TTL
- Market data cached for 30 seconds
- Order books cached for 15 seconds
- Categories cached for 5 minutes
- Automatic cache invalidation

## Security

- Helmet.js for HTTP security headers
- CORS configuration
- Rate limiting (100 req/15min per IP)
- Input validation
- API key authentication for external APIs
- No sensitive data in logs

## Monitoring

- Health check endpoint: `GET /health`
- Structured logging with Winston
- Error tracking and stack traces
- Request/response logging with Morgan
- WebSocket connection monitoring

## Error Handling

All errors return a consistent format:

```json
{
  "success": false,
  "error": "Error message here",
  "stack": "Stack trace (dev only)"
}
```

HTTP Status Codes:
- `200` - Success
- `400` - Bad Request
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License

## Support

For issues and questions:
- GitHub Issues
- Email: support@predictionmarkets.com

---

Built for enterprise-grade prediction market data aggregation
