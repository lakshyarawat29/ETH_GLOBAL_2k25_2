# 🏗️ Backend Service Architecture

## 📁 Directory Structure & Responsibilities

```
backend/src/
├── index.ts                 # 🚀 Main server entry point
├── config/
│   └── index.ts            # ⚙️ Environment configuration
├── database/
│   ├── connection.ts       # 🗄️ PostgreSQL + Redis connections
│   └── schema.sql          # 📋 Database schema
├── routes/
│   ├── health.ts           # ❤️ System health endpoints
│   ├── users.ts            # 👥 User management
│   ├── baskets.ts          # 🗂️ Basket operations
│   ├── yields.ts           # 📈 Yield data processing
│   ├── ai.ts               # 🤖 AI recommendations
│   ├── rebalancing.ts      # 🔄 1inch integration
│   └── consensus.ts        # 📝 Hedera logging
├── services/
│   ├── pythService.ts      # 💰 Price feed integration
│   ├── aiAgent.ts          # 🧠 AI decision engine
│   ├── oneInchService.ts   # 🔀 Cross-chain swaps
│   ├── hederaService.ts    # ⛓️ Hedera network integration
│   └── yieldService.ts     # 📊 Yield orchestration
├── types/
│   └── index.ts            # 🔧 TypeScript interfaces
└── utils/
    └── logger.ts           # 📝 Centralized logging
```

---

## 🔄 Service Interaction Flow

### **1. System Initialization (index.ts)**

```typescript
// Startup sequence
1. Load environment variables
2. Validate configuration
3. Initialize Express app
4. Setup middleware (CORS, security, rate limiting)
5. Connect to databases (PostgreSQL + Redis)
6. Initialize services (Pyth, Hedera, AI)
7. Register API routes
8. Start cron jobs for automated tasks
9. Start server on port 3000
```

### **2. Database Layer (connection.ts)**

```typescript
class Database {
  // PostgreSQL operations
  async query(sql: string, params?: any[]): Promise<any[]>;

  // Redis caching operations
  async redisGet(key: string): Promise<string | null>;
  async redisSet(key: string, value: string, ttl?: number): Promise<void>;
  async redisHGet(key: string, field: string): Promise<string | null>;
  async redisHSet(key: string, field: string, value: string): Promise<void>;

  // Health checks
  async healthCheck(): Promise<{ postgres: boolean; redis: boolean }>;
}
```

### **3. Service Layer Interactions**

#### **PythService → YieldService → Database**

```typescript
// Every 5 minutes (cron job)
PythService.fetchCurrentPrices()
  → YieldService.calculateBasketYields()
  → Database.storeYields()
  → Redis.cacheResults()
```

#### **AIAgent → Database → HederaService**

```typescript
// Every hour (cron job)
Database.getHistoricalYields()
  → AIAgent.recommendBasket()
  → Database.storeDecision()
  → HederaService.logAIRecommendation()
```

#### **OneInchService → HederaService → Database**

```typescript
// User-triggered rebalancing
OneInchService.getQuote()
  → OneInchService.executeSwap()
  → HederaService.logRebalancingSuccess()
  → Database.storeTransaction()
```

---

## 🎯 API Route Handlers

### **Health Routes (health.ts)**

```typescript
GET /api/health
├── Check PostgreSQL connection
├── Check Redis connection
├── Check Pyth service status
├── Check Hedera service status
├── Check AI service status
├── Check 1inch service status
└── Return comprehensive health report
```

### **User Routes (users.ts)**

```typescript
POST /api/users/register
├── Validate wallet address
├── Check if user exists
├── Store in PostgreSQL
├── Register with smart contract
└── Log to Hedera Consensus

GET /api/users
├── Fetch all users from database
├── Include pagination
└── Return user list

GET /api/users/:address
├── Find user by wallet address
└── Return user details
```

### **Basket Routes (baskets.ts)**

```typescript
GET /api/baskets
├── Return predefined basket configurations
├── Low Risk: USDC 60%, ETH 20%, BTC 20%
├── Medium Risk: ETH 40%, BTC 30%, SOL 20%, LINK 10%
└── High Risk: SOL 40%, AVAX 30%, LINK 20%, MATIC 10%

GET /api/baskets/:id
├── Return specific basket details
└── Include asset allocations
```

### **Yield Routes (yields.ts)**

```typescript
GET /api/yields/latest
├── Fetch current basket yields from database
├── Calculate weighted yields
└── Return formatted yield data

POST /api/yields/process
├── Trigger manual yield processing
├── Fetch prices from Pyth
├── Calculate basket yields
├── Store in database
└── Cache in Redis

GET /api/yields/assets
├── Return individual asset yields
└── Include historical data
```

### **AI Routes (ai.ts)**

```typescript
GET /api/ai/recommendations/recent
├── Fetch recent AI recommendations
├── Include confidence scores
└── Return recommendation history

POST /api/ai/analyze
├── Trigger AI analysis
├── Gather historical data
├── Call Google Gemini API
├── Store recommendation
└── Log to Hedera Consensus
```

### **Rebalancing Routes (rebalancing.ts)**

```typescript
POST /api/rebalancing/execute
├── Validate user credentials
├── Get current basket allocation
├── Get 1inch quote
├── Execute swap transaction
├── Monitor transaction status
├── Update user portfolio
└── Log to Hedera Consensus

GET /api/rebalancing/history/:address
├── Fetch user's rebalancing history
└── Return transaction details
```

### **Consensus Routes (consensus.ts)**

```typescript
GET /api/consensus/events
├── Fetch events from Hedera Consensus Service
├── Include AI decisions and rebalancing events
└── Return formatted event log
```

---

## 🔧 Service Implementations

### **PythService (pythService.ts)**

```typescript
class PythService {
  // Initialize connection to Pyth Network
  async initialize(): Promise<void>;

  // Fetch current asset prices
  async fetchCurrentPrices(): Promise<Map<string, PythPriceData>>;

  // Fetch historical price data
  async fetchHistoricalPrices(
    symbol: string,
    days: number
  ): Promise<PythPriceData[]>;

  // Calculate APR from price data
  async calculateAPR(asset: string): Promise<number>;

  // Get latest yields from database
  async getLatestYields(): Promise<any[]>;
}
```

### **AIAgent (aiAgent.ts)**

```typescript
class AIAgent {
  // Generate basket recommendation
  async recommendBasket(): Promise<AIRecommendation>;

  // Prepare analysis data for AI
  private prepareAnalysisData(): Promise<AnalysisData>;

  // Calculate expected yields for each basket
  private calculateBasketYields(): Promise<BasketYield[]>;

  // Generate prompt for LLM
  private generatePrompt(data: AnalysisData): string;

  // Parse AI response
  private parseAIResponse(response: string): AIRecommendation;
}
```

### **OneInchService (oneInchService.ts)**

```typescript
class OneInchService {
  // Get swap quote from 1inch
  async getQuote(params: SwapParams): Promise<QuoteResponse>;

  // Execute rebalancing swaps
  async executeRebalancing(userAddress: string): Promise<RebalancingResult>;

  // Calculate required swaps
  private calculateRequiredSwaps(
    currentBasket: Basket,
    targetBasket: Basket
  ): Swap[];

  // Execute individual swap
  private async executeSwap(swap: Swap): Promise<TransactionResult>;

  // Get token address on Hedera
  private getTokenAddress(symbol: string): string;
}
```

### **HederaService (hederaService.ts)**

```typescript
class HederaService {
  // Create consensus topic
  async createConsensusTopic(): Promise<string>;

  // Submit message to consensus topic
  async submitConsensusMessage(message: string): Promise<void>;

  // Log AI recommendation
  async logAIRecommendation(recommendation: AIRecommendation): Promise<void>;

  // Log rebalancing events
  async logRebalancingStart(params: RebalancingParams): Promise<void>;
  async logRebalancingSuccess(result: RebalancingResult): Promise<void>;
  async logRebalancingFailed(error: Error): Promise<void>;

  // Log user registration
  async logUserRegistration(user: User): Promise<void>;
}
```

### **YieldService (yieldService.ts)**

```typescript
class YieldService {
  // Process all yields (orchestrator)
  async processAllYields(): Promise<void>;

  // Calculate basket yields
  async calculateBasketYields(): Promise<BasketYield[]>;

  // Generate AI recommendations
  async generateAIRecommendations(): Promise<void>;

  // Execute user rebalancing
  async executeUserRebalancing(userAddress: string): Promise<void>;

  // Store yield data
  private async storeYieldData(yields: YieldData[]): Promise<void>;
}
```

---

## ⏰ Automated Processes (Cron Jobs)

### **Yield Processing (Every 5 minutes)**

```typescript
// In index.ts
cron.schedule('*/5 * * * *', async () => {
  await yieldService.processAllYields();
});
```

### **AI Analysis (Every hour)**

```typescript
cron.schedule('0 * * * *', async () => {
  await yieldService.generateAIRecommendations();
});
```

---

## 🔗 Frontend Integration Points

### **Dashboard Data Flow**

```typescript
// Frontend calls these endpoints in sequence:
1. GET /api/health - Check system status
2. GET /api/users - Get user count (for balance calculation)
3. GET /api/baskets - Get basket configurations
4. GET /api/yields/latest - Get current yields (for APR)
5. GET /api/ai/recommendations/recent - Get AI predictions

// Data transformation in frontend:
const totalBalance = userCount * 10000; // $10k per user
const averageAPR = yields.reduce((sum, basket) =>
  sum + (basket.weightedYield / 100), 0) / yields.length;
const activeStrategies = users.filter(u => u.isRegistered).length;
const predictionsCount = recommendations.length;
```

This architecture provides a robust, scalable system with clear separation of concerns and automated data processing workflows.
