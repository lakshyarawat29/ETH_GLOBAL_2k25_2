// Real API service for connecting to backend
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

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
  recommendedChain: string;
  recommendedProtocol: string;
  riskScore: number;
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

export interface VaultState {
  totalValue: number;
  tokenBalances: Record<string, number>;
  utilization: number;
}

export interface YieldOpportunity {
  protocol: string;
  chain: string;
  apr: number;
  tvl: number;
  risk: string;
  token: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  // Vault operations
  async getVaultState(): Promise<VaultState> {
    return this.request<VaultState>('/api/vault/state');
  }

  async deposit(token: string, amount: number): Promise<{ txHash: string }> {
    return this.request<{ txHash: string }>('/api/vault/deposit', {
      method: 'POST',
      body: JSON.stringify({ token, amount }),
    });
  }

  async withdraw(token: string, amount: number): Promise<{ txHash: string }> {
    return this.request<{ txHash: string }>('/api/vault/withdraw', {
      method: 'POST',
      body: JSON.stringify({ token, amount }),
    });
  }

  async getUserBalance(userAddress: string, token: string): Promise<number> {
    const response = await this.request<{ balance: string }>(
      `/api/vault/balance/${userAddress}/${token}`
    );
    return parseFloat(response.balance);
  }

  // AI Predictions
  async getPredictions(): Promise<Prediction[]> {
    return this.request<Prediction[]>('/api/ai/predictions');
  }

  async triggerPrediction(): Promise<Prediction> {
    return this.request<Prediction>('/api/ai/predict', {
      method: 'POST',
    });
  }

  // Yield opportunities
  async getYieldOpportunities(): Promise<YieldOpportunity[]> {
    return this.request<YieldOpportunity[]>('/api/yield/opportunities');
  }

  // Price feeds
  async getPrices(): Promise<Record<string, number>> {
    return this.request<Record<string, number>>('/api/prices');
  }

  // Cross-chain operations
  async getCrossChainQuote(
    fromChain: string,
    toChain: string,
    fromToken: string,
    toToken: string,
    amount: number
  ): Promise<any> {
    return this.request('/api/crosschain/quote', {
      method: 'POST',
      body: JSON.stringify({
        fromChain,
        toChain,
        fromToken,
        toToken,
        amount,
      }),
    });
  }

  async executeCrossChainSwap(
    fromChain: string,
    toChain: string,
    fromToken: string,
    toToken: string,
    amount: number
  ): Promise<{ txHash: string }> {
    return this.request<{ txHash: string }>('/api/crosschain/execute', {
      method: 'POST',
      body: JSON.stringify({
        fromChain,
        toChain,
        fromToken,
        toToken,
        amount,
      }),
    });
  }

  // Hedera operations
  async getHederaBalance(): Promise<{ balance: string }> {
    return this.request<{ balance: string }>('/api/hedera/balance');
  }

  async getHederaTransactions(): Promise<Transaction[]> {
    return this.request<Transaction[]>('/api/hedera/transactions');
  }

  async mintRewardTokens(amount: number): Promise<{ txHash: string }> {
    return this.request<{ txHash: string }>('/api/hedera/mint', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  // Bot operations
  async startBot(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/api/bot/start', {
      method: 'POST',
    });
  }

  async stopBot(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/api/bot/stop', {
      method: 'POST',
    });
  }

  async getBotStatus(): Promise<{ isRunning: boolean; lastExecution: string }> {
    return this.request<{ isRunning: boolean; lastExecution: string }>(
      '/api/bot/status'
    );
  }

  // Health check
  async healthCheck(): Promise<{
    status: string;
    services: Record<string, boolean>;
  }> {
    return this.request<{ status: string; services: Record<string, boolean> }>(
      '/api/health'
    );
  }
}

export const apiService = new ApiService();

// Wallet-based API functions
export const fetchUserDashboard = async (walletAddress: string) => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/users/${walletAddress}/dashboard`
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}: ${data.message || 'Unknown error'}`
      );
    }

    return data.data;
  } catch (error) {
    console.error('Failed to fetch user dashboard:', error);
    throw error;
  }
};

export const fetchUserPortfolio = async (walletAddress: string) => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/users/${walletAddress}/portfolio`
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}: ${data.message || 'Unknown error'}`
      );
    }

    return data.data;
  } catch (error) {
    console.error('Failed to fetch user portfolio:', error);
    throw error;
  }
};

export const fetchUserTransactions = async (walletAddress: string) => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/users/${walletAddress}/transactions`
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}: ${data.message || 'Unknown error'}`
      );
    }

    return data.data;
  } catch (error) {
    console.error('Failed to fetch user transactions:', error);
    throw error;
  }
};

export const fetchBasketChart = async (
  basketId: number,
  timeframe: string = '7d'
) => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/yields/basket/${basketId}/chart?timeframe=${timeframe}`
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}: ${data.message || 'Unknown error'}`
      );
    }

    return data.data;
  } catch (error) {
    console.error('Failed to fetch basket chart:', error);
    throw error;
  }
};

// Legacy compatibility functions (for backward compatibility)
export const fetchBalances = async (
  walletAddress?: string
): Promise<Balance[]> => {
  try {
    if (walletAddress) {
      // Use personalized portfolio data
      const portfolio = await fetchUserPortfolio(walletAddress);
      return portfolio.portfolio.map((asset: any) => ({
        token: asset.symbol,
        amount: asset.amount,
        usdValue: asset.usdValue,
        chain: 'Hedera',
      }));
    }

    // Fallback to global data
    const response = await fetch('http://localhost:3000/api/users');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    // Convert users data to balance format
    const userCount = data.data?.length || 0;
    const estimatedBalancePerUser = 10000; // $10k per user

    return [
      {
        token: 'USDC',
        amount: userCount * 0.6, // 60% allocation
        usdValue: userCount * estimatedBalancePerUser * 0.6,
        chain: 'Hedera',
      },
      {
        token: 'ETH',
        amount: userCount * 0.2, // 20% allocation
        usdValue: userCount * estimatedBalancePerUser * 0.2,
        chain: 'Hedera',
      },
      {
        token: 'BTC',
        amount: userCount * 0.2, // 20% allocation
        usdValue: userCount * estimatedBalancePerUser * 0.2,
        chain: 'Hedera',
      },
    ];
  } catch (error) {
    console.error('Failed to fetch balances:', error);
    // Return empty array on error
    return [];
  }
};

export const fetchPredictions = async (): Promise<Prediction[]> => {
  try {
    return await apiService.getPredictions();
  } catch (error) {
    console.error('Failed to fetch predictions:', error);
    return [];
  }
};

export const fetchTransactions = async (): Promise<Transaction[]> => {
  try {
    return await apiService.getHederaTransactions();
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    return [];
  }
};

export const fetchAPRData = async (): Promise<APRData[]> => {
  try {
    // Use your actual backend API for yields
    const response = await fetch('http://localhost:3000/api/yields/latest');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    // Convert yields data to APR format
    return (
      data.data?.map((basket: any) => ({
        protocol: basket.basketName,
        apr: basket.weightedYield / 100, // Convert basis points to percentage
        tvl: 1000000, // Mock TVL
        chain: 'Hedera',
        risk: basket.riskProfile?.toLowerCase() as 'low' | 'medium' | 'high',
      })) || []
    );
  } catch (error) {
    console.error('Failed to fetch APR data:', error);
    return [];
  }
};

// Profile API functions
export interface UserProfile {
  id: string;
  walletAddress: string;
  displayName?: string;
  selectedBasket: number;
  riskPreference?: 'Conservative' | 'Moderate' | 'Aggressive';
  initialDepositAmount?: number;
  investmentPeriod?: '1 month' | '3 months' | '6 months' | '1 year';
  totalDeposits?: number;
  totalEarned?: number;
  activeSince?: string;
  registrationTimestamp: string;
  isRegistered: boolean;
  createdAt: string;
  updatedAt: string;
}

export const fetchUserProfile = async (
  walletAddress: string
): Promise<UserProfile | null> => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/users/${walletAddress}/profile`
    );
    if (!response.ok) {
      if (response.status === 404) {
        return null; // User not found
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const updateUserProfile = async (
  walletAddress: string,
  profileData: Partial<
    Pick<
      UserProfile,
      | 'displayName'
      | 'riskPreference'
      | 'initialDepositAmount'
      | 'investmentPeriod'
    >
  >
): Promise<UserProfile | null> => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/users/${walletAddress}/profile`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
};

export const completeUserProfile = async (
  walletAddress: string,
  profileData: {
    displayName: string;
    riskPreference: 'Conservative' | 'Moderate' | 'Aggressive';
    initialDepositAmount: number;
    investmentPeriod: '1 month' | '3 months' | '6 months' | '1 year';
  }
): Promise<UserProfile | null> => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/users/${walletAddress}/profile/complete`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error completing user profile:', error);
    return null;
  }
};

// Wallet API functions
export interface WalletBalance {
  address: string;
  ethBalance: string;
  usdcBalance: string;
  wethBalance: string;
  totalValueUSD: number;
}

export interface DepositValidation {
  isValid: boolean;
  requestedAmount: string;
  token: string;
  availableBalance: string;
  totalValueUSD: number;
}

export interface DepositTransaction {
  transaction: {
    to: string;
    value: string;
    data: string;
    gasLimit: string;
  };
  amount: string;
  token: string;
  from: string;
}

export interface TransactionStatus {
  hash: string;
  from: string;
  to: string;
  value: string;
  token: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}

export const fetchWalletBalance = async (
  walletAddress: string
): Promise<WalletBalance | null> => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/users/${walletAddress}/wallet/balance`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return null;
  }
};

export const validateDeposit = async (
  walletAddress: string,
  amount: string,
  token: 'ETH' | 'USDC' = 'ETH'
): Promise<DepositValidation | null> => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/users/${walletAddress}/wallet/validate-deposit`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, token }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error validating deposit:', error);
    return null;
  }
};

export const prepareDepositTransaction = async (
  walletAddress: string,
  amount: string,
  token: 'ETH' | 'USDC' = 'ETH'
): Promise<DepositTransaction | null> => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/users/${walletAddress}/wallet/prepare-deposit`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, token }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error preparing deposit transaction:', error);
    return null;
  }
};

export const getTransactionStatus = async (
  walletAddress: string,
  txHash: string
): Promise<TransactionStatus | null> => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/users/${walletAddress}/wallet/transaction/${txHash}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching transaction status:', error);
    return null;
  }
};
