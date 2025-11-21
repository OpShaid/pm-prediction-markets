# PredictMarkets - Enterprise Prediction Markets Platform

A modern, enterprise-level prediction markets trading platform built with cutting-edge technologies. Trade on real-world events with institutional-grade infrastructure and intuitive user experience.

## Features

### Core Functionality
- **Real-Time Trading** - Execute trades instantly with live price updates
- **Market Creation** - Create custom prediction markets with flexible resolution criteria
- **Portfolio Management** - Track positions, P&L, and trading history
- **Advanced Analytics** - Visualize market trends and performance metrics

### Enterprise Features
- **Type Safety** - Full TypeScript coverage with strict mode
- **State Management** - Zustand for global state + React Query for server state
- **API Client** - Axios with interceptors, retry logic, and error handling
- **Authentication** - JWT-based auth with automatic token refresh
- **Form Validation** - React Hook Form + Zod schemas
- **Animations** - GSAP and Framer Motion for smooth interactions
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Component Library** - Shadcn/ui with Radix UI primitives
- **Code Quality** - ESLint, Prettier, and TypeScript strict mode
- **Testing Ready** - Vitest + React Testing Library setup
- **Docker Support** - Multi-stage builds with nginx
- **Performance** - Code splitting, lazy loading, and optimized bundles

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS + CSS-in-JS
- **UI Components**: Shadcn/ui + Radix UI
- **State Management**: Zustand + React Query
- **Routing**: React Router 6
- **Forms**: React Hook Form + Zod
- **Animations**: GSAP + Framer Motion
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Icons**: Lucide React

### Development
- **Language**: TypeScript 5
- **Linting**: ESLint
- **Formatting**: Prettier
- **Testing**: Vitest + Testing Library
- **Package Manager**: npm

### Infrastructure
- **Containerization**: Docker
- **Web Server**: Nginx
- **CI/CD**: GitHub Actions ready

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd prediction-markets-api
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and configure:
```env
VITE_API_URL=http://localhost:8000/api
```

4. **Start development server**
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Available Scripts

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Format code with Prettier
npm run type-check   # Check TypeScript types
```

### Testing
```bash
npm run test         # Run tests
npm run test:ui      # Run tests with UI
npm run test:coverage # Generate coverage report
```

## Project Structure

```
prediction-markets-api/
├── src/
│   ├── components/      # React components
│   │   ├── ui/         # Base UI components (shadcn/ui)
│   │   ├── Layout.tsx  # App layout wrapper
│   │   └── MarketCard.tsx
│   ├── pages/          # Page components
│   │   ├── Home.tsx
│   │   ├── Markets.tsx
│   │   ├── MarketDetail.tsx
│   │   ├── CreateMarket.tsx
│   │   ├── Portfolio.tsx
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── hooks/          # Custom React hooks
│   │   ├── useImageFadeIn.ts
│   │   ├── useScrollPosition.ts
│   │   └── useIntersectionObserver.ts
│   ├── services/       # API clients and services
│   │   └── api.ts
│   ├── store/          # Zustand stores
│   │   └── authStore.ts
│   ├── types/          # TypeScript type definitions
│   │   └── index.ts
│   ├── lib/            # Utility functions
│   │   └── utils.ts
│   ├── styles/         # Global styles
│   │   └── globals.css
│   ├── App.tsx         # Root component
│   └── main.tsx        # Application entry point
├── public/             # Static assets
├── .env.example        # Environment variables template
├── Dockerfile          # Docker configuration
├── docker-compose.yml  # Docker Compose setup
├── nginx.conf          # Nginx configuration
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── vite.config.ts      # Vite configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── README.md
```

## Deployment Options

### 🚀 Deploy to Vercel (Recommended)

The easiest way to deploy this application:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/OpShaid/prediction-markets-api)

See [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) for detailed instructions.

**Quick steps:**
1. Push code to GitHub
2. Import to Vercel
3. Add environment variables (Kalshi & Polymarket API keys)
4. Deploy!

Your app will be live at: `https://your-app.vercel.app`

### 🐳 Docker Deployment

For self-hosting with Docker:

```bash
# Build and run
docker build -t prediction-markets-frontend .
docker run -p 3000:80 prediction-markets-frontend

# Or use Docker Compose
docker-compose up -d
```

This will start:
- Frontend (nginx): `http://localhost:3000`
- Backend API: `http://localhost:8000`
- Redis cache
- PostgreSQL database

## API Integration

The frontend connects to the prediction markets API. Configure the API URL in `.env`:

```env
VITE_API_URL=http://localhost:8000/api
```

### API Endpoints Used
- `POST /auth/login` - User authentication
- `POST /auth/register` - User registration
- `GET /auth/me` - Get current user
- `GET /markets` - List markets
- `GET /markets/:id` - Get market details
- `POST /markets` - Create market
- `POST /trades` - Execute trade
- `GET /positions` - Get user positions
- `GET /trades` - Get trade history

## Performance Optimizations

### Code Splitting
- Route-based code splitting
- Component lazy loading
- Vendor chunk splitting

### Caching
- React Query for API response caching
- Service Worker for offline support (ready)
- CDN-ready static assets

### Bundle Optimization
- Tree shaking
- Minification
- Gzip compression

## Security

### Implemented
- XSS protection headers
- CSRF token handling
- JWT secure storage
- Input validation with Zod
- Secure HTTP-only cookies (backend)
- Content Security Policy ready

### Best Practices
- No sensitive data in localStorage
- API requests use HTTPS (production)
- Environment variables for secrets
- Regular dependency updates

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Code Standards

- **TypeScript**: Strict mode enabled
- **Formatting**: Prettier with 100 character line length
- **Linting**: ESLint with recommended rules
- **Naming**: camelCase for variables, PascalCase for components
- **Testing**: Minimum 80% coverage for critical paths

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: [Create an issue]
- Documentation: [Visit docs]
- Email: support@predictmarkets.com

---

Built with ❤️ using modern web technologies