// Core types for the Hedera AI Basket System

export enum RiskProfile {
  Low = 0,
  Medium = 1,
  High = 2,
}

export interface Asset {
  tokenAddress: string;
  symbol: string;
  allocation: number; // In basis points (10000 = 100%)
}

export interface Basket {
  riskProfile: RiskProfile;
  name: string;
  assets: Asset[];
  isActive: boolean;
  totalAllocation: number;
}

export interface UserProfile {
  userId: string;
  walletAddress: string;
  selectedBasket: RiskProfile;
  registrationTimestamp: Date;
  isRegistered: boolean;
}

export interface YieldData {
  asset: string;
  symbol: string;
  apr: number; // Annual Percentage Rate in basis points
  timestamp: Date;
  source: 'pyth' | 'manual';
}

export interface BasketYield {
  basketId: number;
  basketName: string;
  averageYield: number;
  weightedYield: number;
  assetYields: YieldData[];
  timestamp: Date;
}

export interface AIRecommendation {
  recommendedBasket: RiskProfile;
  confidence: number; // 0-100
  reasoning: string;
  expectedYield: number;
  riskScore: number;
  timestamp: Date;
}

export interface RebalancingTransaction {
  userAddress: string;
  fromBasket: RiskProfile;
  toBasket: RiskProfile;
  swapData: any;
  transactionHash?: string;
  status: 'pending' | 'completed' | 'failed';
  gasUsed?: number;
  errorMessage?: string;
  timestamp: Date;
}

export interface PythPriceData {
  id: string;
  price: {
    price: string;
    conf: string;
    expo: number;
    publish_time: number;
  };
}

export interface OneInchSwapData {
  fromTokenAddress: string;
  toTokenAddress: string;
  amount: string;
  fromAddress: string;
  slippage: number;
  protocols?: string[];
  destReceiver?: string;
}

export interface OneInchQuoteResponse {
  fromToken: {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
  };
  toToken: {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
  };
  toTokenAmount: string;
  fromTokenAmount: string;
  protocols: any[][];
  estimatedGas: string;
}

export interface HederaConsensusEvent {
  eventType:
    | 'AI_DECISION'
    | 'REBALANCING_START'
    | 'REBALANCING_SUCCESS'
    | 'REBALANCING_FAILED'
    | 'YIELD_UPDATE'
    | 'USER_REGISTRATION';
  user?: string;
  basketId?: number;
  timestamp: Date;
  dataHash: string;
  message: string;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
}

export interface HederaConfig {
  accountId: string;
  privateKey: string;
  network: 'testnet' | 'mainnet';
  mirrorNodeUrl: string;
  basketManagerContract: string;
  consensusLoggerContract: string;
}

export interface PythConfig {
  networkRpc: string;
  priceServiceUrl: string;
  contractAddress: string;
}

export interface OneInchConfig {
  apiKey: string;
  baseUrl: string;
}

export interface AIConfig {
  apiKey: string;
  provider: 'gemini' | 'openai' | 'anthropic';
  model: string;
}

export interface AppConfig {
  port: number;
  nodeEnv: string;
  rebalanceIntervalHours: number;
  minConfidenceThreshold: number;
  database: DatabaseConfig;
  redis: RedisConfig;
  hedera: HederaConfig;
  pyth: PythConfig;
  oneInch: OneInchConfig;
  ai: AIConfig;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
