# 🔄 Complete Backend Flow Architecture

## 📋 System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI-POWERED YIELD OPTIMIZATION SYSTEM        │
│                        (Hedera + Pyth + 1inch + AI)            │
└─────────────────────────────────────────────────────────────────┘
```

## 🏗️ Core Components

### 1. **Smart Contracts (Hedera EVM)**

- `BasketManager.sol` - Manages risk-based asset baskets
- `HederaConsensusLogger.sol` - Immutable event logging

### 2. **Backend Services (Node.js + TypeScript)**

- Express API server
- PostgreSQL database
- Redis caching
- Multiple service layers

### 3. **External Integrations**

- **Pyth Network** - Real-time price feeds
- **1inch API** - Cross-chain swaps
- **Google Gemini AI** - Basket recommendations
- **Hedera Consensus Service** - Immutable logging

---

## 🔄 Complete Backend Flow Sequence

### **Phase 1: System Initialization**

```
1. Server Startup (src/index.ts)
   ├── Load environment variables
   ├── Validate configuration
   ├── Initialize Express app
   ├── Setup middleware (CORS, Helmet, Rate limiting)
   └── Connect to databases (PostgreSQL + Redis)

2. Service Initialization
   ├── Database connection (src/database/connection.ts)
   ├── Pyth service (src/services/pythService.ts)
   ├── Hedera service (src/services/hederaService.ts)
   └── Create consensus topic for logging

3. Route Registration
   ├── /api/health - System health checks
   ├── /api/users - User management
   ├── /api/baskets - Basket operations
   ├── /api/yields - Yield data processing
   ├── /api/ai - AI recommendations
   ├── /api/rebalancing - 1inch integration
   └── /api/consensus - Event logging
```

### **Phase 2: User Registration Flow**

```
1. User Registration (POST /api/users/register)
   ├── Validate wallet address
   ├── Check if user exists
   ├── Store user in PostgreSQL
   ├── Register user with smart contract
   └── Log registration to Hedera Consensus

2. Basket Selection
   ├── User chooses risk profile (Low/Medium/High)
   ├── System assigns fixed basket allocation
   ├── Update user record with selectedBasket
   └── Return confirmation to frontend
```

### **Phase 3: Yield Data Processing (Automated)**

```
1. Cron Job Trigger (Every 5 minutes)
   ├── fetchCurrentPrices() - Get Pyth price feeds
   ├── calculateBasketYields() - Compute weighted yields
   ├── Store yields in PostgreSQL
   └── Cache results in Redis

2. Yield Calculation Process
   ├── Fetch asset prices from Pyth
   ├── Apply basket allocations (60% USDC, 20% ETH, 20% BTC)
   ├── Calculate weighted yield = Σ(assetAPR × allocation%)
   ├── Store in yields table
   └── Update basket_history table
```

### **Phase 4: AI Recommendation Engine**

```
1. AI Analysis Trigger (Every hour)
   ├── Gather historical yield data
   ├── Prepare analysis context
   ├── Call Google Gemini API
   ├── Parse AI response
   └── Store recommendation in decisions table

2. AI Decision Process
   ├── Input: Current + historical basket yields
   ├── AI analyzes market conditions
   ├── AI recommends best basket for next period
   ├── Confidence score calculation
   └── Log decision to Hedera Consensus
```

### **Phase 5: Rebalancing Execution**

```
1. User Triggers Rebalancing (POST /api/rebalancing/execute)
   ├── Validate user credentials
   ├── Get current basket allocation
   ├── Compare with AI recommendation
   ├── Calculate required swaps via 1inch API
   └── Execute swaps on-chain

2. 1inch Integration Process
   ├── Get quote from 1inch API
   ├── Prepare swap transaction
   ├── Execute on Hedera EVM
   ├── Monitor transaction status
   └── Update user portfolio
```

---

## 🗄️ Database Schema Flow

### **PostgreSQL Tables**

```sql
users (User Management)
├── id (UUID)
├── walletAddress (string)
├── selectedBasket (0=Low, 1=Medium, 2=High)
├── isRegistered (boolean)
└── timestamps

yields (Asset Yield Data)
├── asset (string) - USDC, ETH, BTC, etc.
├── apr (integer) - in basis points
├── source (string) - "pyth"
└── timestamp

basket_history (Basket Performance)
├── basketId (0, 1, 2)
├── weightedYield (integer) - calculated yield
└── timestamp

decisions (AI Recommendations)
├── basketId (recommended basket)
├── confidence (0-100)
├── reasoning (AI explanation)
└── timestamp

consensus_events (Hedera Logging)
├── eventType (AI_RECOMMENDATION, REBALANCING, etc.)
├── data (JSON payload)
└── consensusTimestamp
```

---

## 🔗 API Endpoints Flow

### **Frontend → Backend Communication**

```
Dashboard Load Sequence:
1. GET /api/health - Check system status
2. GET /api/users - Get all users (for balance calculation)
3. GET /api/baskets - Get basket configurations
4. GET /api/yields/latest - Get current yield data
5. GET /api/ai/recommendations/recent - Get AI predictions

User Actions:
1. POST /api/users/register - Register new user
2. POST /api/rebalancing/execute - Execute rebalancing
3. GET /api/rebalancing/history/:address - Get user history
```

---

## ⚡ Real-Time Data Flow

### **Price Feed Integration**

```
Pyth Network → Backend → Frontend
├── Real-time price updates (USDC, ETH, BTC, SOL, etc.)
├── Historical price data for analysis
├── Yield calculations based on current prices
└── Basket performance tracking
```

### **AI Decision Flow**

```
Historical Data → AI Analysis → Recommendation → Execution
├── Collect 30 days of yield history
├── Send to Google Gemini API
├── AI analyzes patterns and market conditions
├── Return recommendation with confidence score
└── Store decision for user execution
```

---

## 🔄 Complete User Journey

### **Step 1: User Onboarding**

```
Frontend → Backend → Smart Contract → Database
├── User connects wallet
├── Frontend calls /api/users/register
├── Backend stores user in PostgreSQL
├── Smart contract registers user with basket
└── Hedera Consensus logs registration
```

### **Step 2: Dashboard Display**

```
Backend → Frontend (Real-time updates)
├── Calculate total balance (users × $10k)
├── Fetch current yields from Pyth
├── Compute average APR across baskets
├── Count active strategies (registered users)
└── Get recent AI predictions
```

### **Step 3: AI Recommendation**

```
Automated Process (Every hour)
├── Gather historical yield data
├── Prepare context for AI analysis
├── Call Google Gemini API
├── Store recommendation in database
├── Log to Hedera Consensus
└── Frontend polls for updates
```

### **Step 4: Rebalancing Execution**

```
User Action → 1inch → Hedera EVM → Database
├── User clicks "Rebalance Now"
├── Frontend calls /api/rebalancing/execute
├── Backend gets 1inch quote
├── Execute swap on Hedera EVM
├── Update user portfolio
└── Log transaction to Hedera Consensus
```

---

## 🎯 Frontend Integration Points

### **Dashboard Data Sources**

```typescript
// Total Balance Calculation
const userCount = await fetch('/api/users').then((r) => r.json());
const totalBalance = userCount.data.length * 10000; // $10k per user

// Average APR Calculation
const yields = await fetch('/api/yields/latest').then((r) => r.json());
const averageAPR =
  yields.data.reduce((sum, basket) => sum + basket.weightedYield / 100, 0) /
  yields.data.length;

// Active Strategies
const activeStrategies = userCount.data.filter(
  (user) => user.isRegistered && user.selectedBasket !== null
).length;

// AI Predictions
const predictions = await fetch('/api/ai/recommendations/recent').then((r) =>
  r.json()
);
const predictionsCount = predictions.data.length;
```

---

## 🔧 Key Service Interactions

### **PythService**

- Fetches real-time asset prices
- Calculates APRs for each asset
- Stores historical data for AI analysis

### **AIAgent**

- Processes yield data for patterns
- Calls Google Gemini API
- Generates basket recommendations
- Provides confidence scores

### **OneInchService**

- Gets swap quotes
- Executes rebalancing transactions
- Monitors transaction status

### **HederaService**

- Creates consensus topics
- Logs all major events
- Provides immutable audit trail

---

## 📊 Data Flow Summary

```
External APIs → Backend Processing → Database Storage → Frontend Display
     ↓              ↓                    ↓               ↓
Pyth Prices → Yield Calculation → PostgreSQL → Dashboard Cards
1inch API → Swap Execution → Transaction Log → User Interface
Gemini AI → Recommendation → Decision Store → AI Predictions
Hedera → Consensus Logging → Event History → Audit Trail
```

This architecture ensures:

- **Real-time data** from multiple sources
- **AI-powered decisions** based on historical analysis
- **Immutable logging** via Hedera Consensus Service
- **Seamless user experience** with automated rebalancing
