# Hedera AI Basket System

A comprehensive blockchain + AI system that integrates Hedera, Pyth Network, AI-based decisioning, and 1inch for automated yield optimization.

## 🎯 Project Overview

This system provides AI-powered yield optimization for DeFi portfolios with three risk profiles:

- **Conservative (Low Risk)**: USDC 60%, ETH 20%, BTC 20%
- **Balanced (Medium Risk)**: ETH 40%, BTC 30%, SOL 20%, LINK 10%
- **Aggressive (High Risk)**: SOL 40%, AVAX 30%, LINK 20%, MATIC 10%

### Key Features

- ✅ **Smart Contracts**: Hedera EVM with fixed basket allocations
- ✅ **Real-time Data**: Pyth Network price feeds for live and historical data
- ✅ **AI Decisioning**: Google Gemini API for basket recommendations
- ✅ **Automated Rebalancing**: 1inch API integration for cross-chain swaps
- ✅ **Immutable Logging**: Hedera Consensus Service for all events
- ✅ **RESTful API**: Complete backend with TypeScript and Express

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Smart         │    │   Backend       │    │   External      │
│   Contracts     │    │   Services      │    │   Services      │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • BasketManager │◄──►│ • Pyth Service  │◄──►│ • Pyth Network  │
│ • Consensus     │    │ • AI Agent      │◄──►│ • Google Gemini │
│   Logger        │    │ • 1inch Service │◄──►│ • 1inch API     │
└─────────────────┘    │ • Hedera Service│◄──►│ • Hedera        │
                       │ • Yield Service │    │   Network       │
                       └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Foundry (for smart contracts)
- PostgreSQL 14+
- Redis 6+
- Hedera testnet account
- API keys for Google Gemini and 1inch

### 1. Clone and Install

```bash
git clone <repository-url>
cd eth_pro2

# Install root dependencies
npm install

# Install contract dependencies
cd contracts
forge install
cd ..

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Environment Setup

Copy the example environment file and configure:

```bash
cp env.example .env
```

Update `.env` with your credentials:

```bash
# Hedera Configuration
HEDERA_ACCOUNT_ID="0.0.xxxxx"
HEDERA_PRIVATE_KEY="0x..."

# AI Configuration
AI_API_KEY="your-gemini-api-key"
AI_PROVIDER="gemini"

# 1inch Configuration
ONEINCH_API_KEY="your-1inch-api-key"

# Database Configuration
DATABASE_URL="postgresql://user:pass@localhost:5432/hedera_basket_db"
REDIS_URL="redis://localhost:6379"
```

### 3. Database Setup

```bash
# Start PostgreSQL and Redis
# Create database
createdb hedera_basket_db

# Run schema
psql hedera_basket_db < backend/src/database/schema.sql
```

### 4. Deploy Smart Contracts

```bash
cd contracts

# Deploy to Hedera testnet
forge script script/DeployAndVerify.s.sol:DeployAndVerify --rpc-url hedera-testnet --broadcast --verify

# Update .env with deployed addresses
```

### 5. Start Backend Services

```bash
cd backend

# Development mode
npm run dev

# Production mode
npm run build
npm start
```

### 6. Verify Deployment

```bash
# Check health
curl http://localhost:3000/api/health

# Get baskets
curl http://localhost:3000/api/baskets

# Register a user
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "0x...", "selectedBasket": 1}'
```

## 📚 API Documentation

### Core Endpoints

#### Users

- `POST /api/users/register` - Register user with risk profile
- `GET /api/users/:walletAddress` - Get user information
- `PUT /api/users/:walletAddress/basket` - Update user's basket

#### Yields

- `POST /api/yields/process` - Trigger yield processing
- `GET /api/yields/latest` - Get latest basket yields
- `GET /api/yields/assets` - Get asset yields

#### AI

- `POST /api/ai/recommend` - Get AI recommendation for user
- `POST /api/ai/analyze` - Analyze market data
- `GET /api/ai/recommendations/recent` - Get recent recommendations

#### Rebalancing

- `POST /api/rebalancing/execute` - Execute rebalancing
- `GET /api/rebalancing/history/:userAddress` - Get rebalancing history

#### Consensus

- `GET /api/consensus/events` - Get Hedera consensus events
- `GET /api/consensus/topic` - Get consensus topic info

### Example Usage

```bash
# 1. Register user
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x742d35Cc6634C0532925a3b8D0e7C6C9C2b5b5b5",
    "selectedBasket": 1
  }'

# 2. Process yields
curl -X POST http://localhost:3000/api/yields/process

# 3. Get AI recommendation
curl -X POST http://localhost:3000/api/ai/recommend \
  -H "Content-Type: application/json" \
  -d '{"userAddress": "0x742d35Cc6634C0532925a3b8D0e7C6C9C2b5b5b5"}'

# 4. Execute rebalancing
curl -X POST http://localhost:3000/api/rebalancing/execute \
  -H "Content-Type: application/json" \
  -d '{
    "userAddress": "0x742d35Cc6634C0532925a3b8D0e7C6C9C2b5b5b5",
    "userPrivateKey": "0x..."
  }'
```

## 🔧 Configuration

### Smart Contracts

The system deploys two main contracts:

1. **BasketManager**: Manages user registrations and basket allocations
2. **HederaConsensusLogger**: Logs events to Hedera Consensus Service

### Backend Services

- **PythService**: Fetches real-time and historical price data
- **AIAgent**: Generates basket recommendations using Gemini API
- **OneInchService**: Executes rebalancing transactions
- **HederaService**: Manages consensus service interactions
- **YieldService**: Orchestrates the entire yield processing pipeline

### Database Schema

- `users`: User registrations and basket selections
- `yields`: Individual asset yield data
- `basket_history`: Historical basket performance
- `decisions`: AI recommendations
- `rebalancing_transactions`: Rebalancing execution history
- `consensus_events`: Hedera consensus service logs

## 🧪 Testing

### Smart Contracts

```bash
cd contracts
forge test
```

### Backend

```bash
cd backend
npm test
```

### Integration Testing

```bash
# Test complete flow
npm run test:integration
```

## 📊 Monitoring

### Health Checks

- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed service status
- `GET /api/health/ready` - Kubernetes readiness probe
- `GET /api/health/live` - Kubernetes liveness probe

### Logging

All events are logged to:

- Application logs (Winston)
- Hedera Consensus Service (immutable)
- Database (structured queries)

## 🚀 Deployment

### Production Deployment

1. **Infrastructure**:

   - PostgreSQL database
   - Redis cache
   - Load balancer
   - SSL certificates

2. **Environment**:

   - Set `NODE_ENV=production`
   - Configure production database URLs
   - Set up monitoring and alerting

3. **Security**:
   - Use environment variables for secrets
   - Enable rate limiting
   - Configure CORS properly
   - Use HTTPS

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Create GitHub issues for bugs or feature requests
- **Discord**: Join the ETHGlobal Discord #partner-1inch channel

## 🏆 Competition Requirements

This project satisfies the requirements for:

- **1inch Cross-chain Swap (Fusion+)**: Bidirectional swaps with escrow contracts
- **Pyth Network**: Pull oracle integration with live and historical data
- **Hedera**: AI integration with Consensus Service logging

### Key Features Demonstrated

✅ **1inch Integration**: Cross-chain swap functionality with Limit Order Protocol
✅ **Pyth Integration**: Pull oracle for price feeds and yield calculations
✅ **Hedera Integration**: AI-powered agents with Consensus Service logging
✅ **End-to-End Flow**: Complete user registration → AI recommendation → rebalancing cycle
