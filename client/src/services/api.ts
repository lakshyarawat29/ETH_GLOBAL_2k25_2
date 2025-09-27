// Real API service for connecting to backend
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

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

// Legacy compatibility functions
export const fetchBalances = async (): Promise<Balance[]> => {
  try {
    const vaultState = await apiService.getVaultState();
    const prices = await apiService.getPrices();

    // Convert vault state to balance format
    return Object.entries(vaultState.tokenBalances).map(([token, amount]) => ({
      token,
      amount,
      usdValue: amount * (prices[token] || 1),
      chain: 'Ethereum', // Default chain, could be enhanced
    }));
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
    const opportunities = await apiService.getYieldOpportunities();
    return opportunities.map((opp) => ({
      protocol: opp.protocol,
      apr: opp.apr,
      tvl: opp.tvl,
      chain: opp.chain,
      risk: opp.risk as 'low' | 'medium' | 'high',
    }));
  } catch (error) {
    console.error('Failed to fetch APR data:', error);
    return [];
  }
};
