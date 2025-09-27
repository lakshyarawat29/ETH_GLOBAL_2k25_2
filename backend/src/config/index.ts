import { config } from 'dotenv';
import { AppConfig } from '@/types';

config();

export const appConfig: AppConfig = {
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  rebalanceIntervalHours: parseInt(
    process.env.REBALANCE_INTERVAL_HOURS || '24'
  ),
  minConfidenceThreshold: parseFloat(
    process.env.MIN_CONFIDENCE_THRESHOLD || '0.7'
  ),

  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'hedera_basket_db',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
  },

  hedera: {
    accountId: process.env.HEDERA_ACCOUNT_ID || '',
    privateKey: process.env.HEDERA_PRIVATE_KEY || '',
    network: (process.env.HEDERA_NETWORK as 'testnet' | 'mainnet') || 'testnet',
    mirrorNodeUrl:
      process.env.HEDERA_MIRROR_NODE_URL ||
      'https://testnet.mirrornode.hedera.com',
    basketManagerContract:
      process.env.BASKET_MANAGER_CONTRACT ||
      '0x02d7964772e88392fB866e0f7376a61999ecB90a',
    consensusLoggerContract:
      process.env.HEDERA_CONSENSUS_LOGGER_CONTRACT ||
      '0x83D5c59380c916Bab6e477E94A302c650A5899ca',
  },

  pyth: {
    networkRpc: process.env.PYTH_NETWORK_RPC || 'https://hermes.pyth.network',
    priceServiceUrl:
      process.env.PYTH_PRICE_SERVICE_URL || 'https://hermes.pyth.network',
    contractAddress:
      process.env.PYTH_CONTRACT_ADDRESS ||
      '0xff1a0f4744e8582DF1aE09D5619b897c4f04365E',
  },

  oneInch: {
    apiKey: process.env.ONEINCH_API_KEY || '',
    baseUrl: process.env.ONEINCH_BASE_URL || 'https://api.1inch.io/v5.0',
  },

  ai: {
    apiKey: process.env.AI_API_KEY || '',
    provider:
      (process.env.AI_PROVIDER as 'gemini' | 'openai' | 'anthropic') ||
      'gemini',
    model: process.env.AI_MODEL || 'gemini-pro',
  },
};

// Validation function to check required environment variables
export function validateConfig(): void {
  const required = [
    'HEDERA_ACCOUNT_ID',
    'HEDERA_PRIVATE_KEY',
    'AI_API_KEY',
    'ONEINCH_API_KEY',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}

// Basket configurations matching the smart contracts
export const BASKET_CONFIGS = {
  [0]: {
    name: 'Conservative',
    riskProfile: 'Low',
    assets: [
      { symbol: 'USDC', allocation: 6000 },
      { symbol: 'ETH', allocation: 2000 },
      { symbol: 'BTC', allocation: 2000 },
    ],
  },
  [1]: {
    name: 'Balanced',
    riskProfile: 'Medium',
    assets: [
      { symbol: 'ETH', allocation: 4000 },
      { symbol: 'BTC', allocation: 3000 },
      { symbol: 'SOL', allocation: 2000 },
      { symbol: 'LINK', allocation: 1000 },
    ],
  },
  [2]: {
    name: 'Aggressive',
    riskProfile: 'High',
    assets: [
      { symbol: 'SOL', allocation: 4000 },
      { symbol: 'AVAX', allocation: 3000 },
      { symbol: 'LINK', allocation: 2000 },
      { symbol: 'MATIC', allocation: 1000 },
    ],
  },
};

// Pyth price feed IDs for supported assets
export const PYTH_PRICE_FEEDS = {
  USDC: '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
  ETH: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
  BTC: '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
  SOL: '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
  LINK: '0x83be4ed61dd8a3518d198098ce66b1ce0973146b8c98219162d14410ba1c685',
  AVAX: '0x93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb',
  MATIC: '0x5de33a9112c2b700b8d30b8a3402c103578ccfa2765696471cc672bd5cf6bd52',
};

// Token addresses for Hedera testnet (placeholder - update with actual addresses)
export const HEDERA_TOKEN_ADDRESSES = {
  USDC: '0x0000000000000000000000000000000000000001',
  ETH: '0x0000000000000000000000000000000000000002',
  BTC: '0x0000000000000000000000000000000000000003',
  SOL: '0x0000000000000000000000000000000000000004',
  LINK: '0x0000000000000000000000000000000000000005',
  AVAX: '0x0000000000000000000000000000000000000006',
  MATIC: '0x0000000000000000000000000000000000000007',
};
