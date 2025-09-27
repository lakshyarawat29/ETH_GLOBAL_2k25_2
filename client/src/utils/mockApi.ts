// Mock API utilities for DeFi data
export interface Balance {
  token: string;
  amount: number;
  usdValue: number;
  chain: string;
}

export interface APRData {
  protocol: string;
  apr: number;
  tvl: number;
  chain: string;
  risk: 'low' | 'medium' | 'high';
}

export interface Prediction {
  id: string;
  strategy: string;
  expectedReturn: number;
  confidence: number;
  timeframe: string;
  description: string;
  timestamp: Date;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'rebalance' | 'swap';
  amount: number;
  token: string;
  hash: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
}

// Mock data generators
export const mockBalances: Balance[] = [
  { token: 'USDC', amount: 12500.50, usdValue: 12500.50, chain: 'Ethereum' },
  { token: 'ETH', amount: 3.25, usdValue: 8125.00, chain: 'Ethereum' },
  { token: 'MATIC', amount: 850.0, usdValue: 765.00, chain: 'Polygon' },
  { token: 'USDT', amount: 5000.00, usdValue: 5000.00, chain: 'BSC' },
];

export const mockAPRData: APRData[] = [
  { protocol: 'Aave V3', apr: 12.5, tvl: 2500000, chain: 'Ethereum', risk: 'low' },
  { protocol: 'Compound', apr: 8.3, tvl: 1800000, chain: 'Ethereum', risk: 'low' },
  { protocol: 'Curve', apr: 15.7, tvl: 3200000, chain: 'Ethereum', risk: 'medium' },
  { protocol: 'Uniswap V3', apr: 22.1, tvl: 950000, chain: 'Ethereum', risk: 'high' },
  { protocol: 'PancakeSwap', apr: 18.5, tvl: 1200000, chain: 'BSC', risk: 'medium' },
];

export const mockPredictions: Prediction[] = [
  {
    id: '1',
    strategy: 'ETH-USDC LP Migration',
    expectedReturn: 18.5,
    confidence: 87,
    timeframe: '7 days',
    description: 'Migrate liquidity to Curve ETH-USDC pool for higher yields',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: '2',
    strategy: 'Cross-chain Arbitrage',
    expectedReturn: 12.3,
    confidence: 74,
    timeframe: '3 days',
    description: 'Arbitrage opportunity between Ethereum and Polygon USDT pools',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: '3',
    strategy: 'Yield Farming Optimization',
    expectedReturn: 25.7,
    confidence: 92,
    timeframe: '14 days',
    description: 'Optimize yield farming across multiple DeFi protocols',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'deposit',
    amount: 5000,
    token: 'USDC',
    hash: '0x1234...abcd',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    status: 'completed',
  },
  {
    id: '2',
    type: 'rebalance',
    amount: 2500,
    token: 'ETH',
    hash: '0x5678...efgh',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
    status: 'completed',
  },
  {
    id: '3',
    type: 'swap',
    amount: 1000,
    token: 'MATIC',
    hash: '0x9abc...ijkl',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
    status: 'pending',
  },
];

// Mock API functions
export const fetchBalances = (): Promise<Balance[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockBalances), 1000);
  });
};

export const fetchAPRData = (): Promise<APRData[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockAPRData), 800);
  });
};

export const fetchPredictions = (): Promise<Prediction[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockPredictions), 1200);
  });
};

export const fetchTransactions = (): Promise<Transaction[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockTransactions), 600);
  });
};

export const connectWallet = (walletType: 'metamask' | 'walletconnect'): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('0x742d35Cc6634C0532925a3b8D00416145047d2B8');
    }, 2000);
  });
};

export const depositFunds = (amount: number, token: string): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`0x${Math.random().toString(16).slice(2)}`);
    }, 3000);
  });
};