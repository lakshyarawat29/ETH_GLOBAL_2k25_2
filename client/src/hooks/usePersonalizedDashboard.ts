import { useState, useEffect } from 'react';
import {
  fetchUserDashboard,
  fetchUserPortfolio,
  fetchUserTransactions,
  fetchBasketChart,
} from '../services/api';

interface PersonalizedDashboardData {
  user: any;
  dashboard: {
    totalBalance: number;
    currentAPR: number;
    activeStrategies: number;
    aiPredictions: number;
    basketConfig: any;
    portfolio: {
      allocations: any[];
      totalValue: number;
      lastRebalance: string | null;
    };
    performance: {
      yields: any[];
      predictions: any[];
      transactions: any[];
    };
  };
}

interface PersonalizedDashboardHook {
  data: PersonalizedDashboardData | null;
  portfolio: any;
  transactions: any[];
  chartData: any;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  loadChartData: (timeframe: string) => Promise<void>;
}

export const usePersonalizedDashboard = (
  walletAddress: string | null
): PersonalizedDashboardHook => {
  const [data, setData] = useState<PersonalizedDashboardData | null>(null);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    if (!walletAddress) {
      setError('No wallet address provided');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Loading personalized dashboard for:', walletAddress);

      // Load dashboard data
      const dashboardData = await fetchUserDashboard(walletAddress);
      setData(dashboardData);

      // Load portfolio data
      const portfolioData = await fetchUserPortfolio(walletAddress);
      setPortfolio(portfolioData);

      // Load transactions
      const transactionsData = await fetchUserTransactions(walletAddress);
      setTransactions(transactionsData);

      // Load chart data for user's basket
      if (dashboardData.user.selectedBasket !== null) {
        const chartDataResult = await fetchBasketChart(
          dashboardData.user.selectedBasket,
          '7d'
        );
        setChartData(chartDataResult);
      }

      console.log('✅ Personalized dashboard loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load personalized dashboard:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to load dashboard'
      );
    } finally {
      setLoading(false);
    }
  };

  const loadChartData = async (timeframe: string) => {
    if (!data?.user.selectedBasket && data?.user.selectedBasket !== 0) {
      return;
    }

    try {
      console.log(
        `📊 Loading chart data for basket ${data.user.selectedBasket}, timeframe: ${timeframe}`
      );
      const chartDataResult = await fetchBasketChart(
        data.user.selectedBasket,
        timeframe
      );
      setChartData(chartDataResult);
    } catch (error) {
      console.error('❌ Failed to load chart data:', error);
    }
  };

  const refetch = async () => {
    await loadDashboardData();
  };

  useEffect(() => {
    if (walletAddress) {
      loadDashboardData();
    }
  }, [walletAddress]);

  return {
    data,
    portfolio,
    transactions,
    chartData,
    loading,
    error,
    refetch,
    loadChartData,
  };
};
