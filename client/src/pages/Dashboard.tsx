import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import DashboardCards from '../components/DashboardCards';
import PersonalizedDashboardCards from '../components/PersonalizedDashboardCards';
import BasketChart from '../components/BasketChart';
import APRChart from '../components/Charts/APRChart';
import PredictionList from '../components/PredictionList';
import TransactionsTable from '../components/TransactionsTable';
import AIPredictionCard from '../components/AIPredictionCard';
import { usePersonalizedDashboard } from '../hooks/usePersonalizedDashboard';
import { apiService } from '../services/api';
import {
  fetchBalances,
  fetchPredictions,
  fetchTransactions,
  fetchAPRData,
} from '../services/api';
import type {
  Balance,
  Prediction,
  Transaction,
  APRData,
} from '../services/api';

// Basket configurations matching the backend
const BASKET_CONFIGS = {
  0: {
    name: 'Conservative',
    riskProfile: 'Low',
    assets: [
      { symbol: 'USDC', allocation: 6000 },
      { symbol: 'ETH', allocation: 2000 },
      { symbol: 'BTC', allocation: 2000 },
    ],
  },
  1: {
    name: 'Balanced',
    riskProfile: 'Medium',
    assets: [
      { symbol: 'ETH', allocation: 4000 },
      { symbol: 'BTC', allocation: 3000 },
      { symbol: 'SOL', allocation: 2000 },
      { symbol: 'LINK', allocation: 1000 },
    ],
  },
  2: {
    name: 'Growth',
    riskProfile: 'High',
    assets: [
      { symbol: 'SOL', allocation: 4000 },
      { symbol: 'AVAX', allocation: 3000 },
      { symbol: 'LINK', allocation: 2000 },
      { symbol: 'MATIC', allocation: 1000 },
    ],
  },
};

const Dashboard: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [balances, setBalances] = useState<Balance[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Personalized dashboard hook
  const {
    data: personalizedData,
    portfolio,
    transactions: userTransactions,
    chartData,
    loading: personalizedLoading,
    error: personalizedError,
    refetch: refetchPersonalized,
    loadChartData,
  } = usePersonalizedDashboard(isConnected ? address || null : null);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [balanceData, predictionData, transactionData] =
          await Promise.all([
            fetchBalances(),
            fetchPredictions(),
            fetchTransactions(),
          ]);

        setBalances(balanceData);
        setPredictions(predictionData);
        setTransactions(transactionData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const totalBalance = balances.reduce(
    (sum, balance) => sum + balance.usdValue,
    0
  );

  const [aprData, setAprData] = useState<APRData[]>([]);

  useEffect(() => {
    const loadAPRData = async () => {
      try {
        const data = await fetchAPRData();
        setAprData(data);
      } catch (error) {
        console.error('Failed to load APR data:', error);
      }
    };
    loadAPRData();
  }, []);

  const averageAPR =
    aprData.length > 0
      ? aprData.reduce((sum, apr) => sum + apr.apr, 0) / aprData.length
      : 0;

  // Debug logging
  console.log('📊 Dashboard Data:', {
    balances,
    totalBalance,
    predictions,
    transactions,
    aprData,
    averageAPR,
  });

  return (
    <div className="min-h-screen bg-[url('assets/landing/bg.svg')] bg-cover bg-center py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Monitor your DeFi portfolio performance and AI-generated insights
          </p>
        </motion.div>

        {/* Dashboard Cards */}
        <div className="mb-8">
          {isConnected && personalizedData ? (
            <PersonalizedDashboardCards
              data={personalizedData.dashboard}
              loading={personalizedLoading}
            />
          ) : (
            <DashboardCards
              totalBalance={totalBalance}
              totalAPR={parseFloat(averageAPR.toFixed(1))}
              activeStrategies={balances.length > 0 ? balances.length * 2 : 4}
              predictionsCount={predictions.length}
              loading={loading}
            />
          )}
        </div>

        {/* Personalized Chart for Connected Users */}
        {isConnected && personalizedData && chartData && (
          <div className="mb-8">
            <BasketChart
              chartData={chartData}
              loading={personalizedLoading}
              onTimeframeChange={loadChartData}
            />
          </div>
        )}

        {/* AI Prediction Card - Full Width */}
        <div className="mb-8">
          <AIPredictionCard />
        </div>

        {/* Charts and Predictions Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* APR Chart */}
          <APRChart />

          {/* Historical Predictions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Historical Predictions
              </h3>
              <span className="text-sm text-gray-500">Past insights</span>
            </div>
            <div className="max-h-96 overflow-y-auto pr-2">
              <PredictionList
                predictions={
                  personalizedData?.performance?.predictions?.map(
                    (pred: any) => ({
                      id: pred.id,
                      strategy: `${
                        BASKET_CONFIGS[
                          pred.recommended_basket as keyof typeof BASKET_CONFIGS
                        ]?.name || 'Unknown'
                      } Basket`,
                      expectedReturn: (
                        pred.expected_yield_basis_points / 100
                      ).toFixed(1),
                      confidence: pred.confidence_score,
                      timeframe: 'Next Period',
                      description: pred.reasoning,
                      timestamp: new Date(pred.timestamp),
                    })
                  ) || []
                }
                loading={personalizedLoading}
              />
            </div>
          </motion.div>
        </div>

        {/* Portfolio Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Balance Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              {isConnected && personalizedData
                ? 'Your Portfolio'
                : 'Portfolio Distribution'}
            </h3>

            {isConnected && personalizedData && portfolio ? (
              <div className="space-y-4">
                {portfolio.portfolio.map((asset: any, index: number) => (
                  <motion.div
                    key={asset.symbol}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {asset.symbol.slice(0, 1)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {asset.symbol}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(asset.allocation * 100).toFixed(1)}% allocation
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        ${asset.usdValue.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {asset.amount.toFixed(4)} {asset.symbol}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : loading || personalizedLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse flex items-center justify-between p-4"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {balances.map((balance, index) => (
                  <motion.div
                    key={balance.token}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {balance.token.slice(0, 1)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {balance.token}
                        </p>
                        <p className="text-sm text-gray-500">{balance.chain}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        ${balance.usdValue.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {balance.amount} {balance.token}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Quick Actions
            </h3>
            <div className="space-y-3">
              {[
                {
                  label: 'Deposit Funds',
                  color: 'bg-green-600 hover:bg-green-700',
                },
                { label: 'Withdraw', color: 'bg-red-600 hover:bg-red-700' },
                {
                  label: 'Rebalance Now',
                  color: 'bg-purple-600 hover:bg-purple-700',
                },
                {
                  label: 'View Analytics',
                  color: 'bg-blue-600 hover:bg-blue-700',
                },
              ].map((action, index) => (
                <motion.button
                  key={action.label}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full ${action.color} text-white py-3 rounded-xl font-medium transition-all duration-200`}
                >
                  {action.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Transactions Table */}
        <TransactionsTable
          transactions={
            isConnected && userTransactions
              ? userTransactions.map((tx: any) => ({
                  id: tx.id,
                  type: 'rebalance' as const,
                  amount:
                    tx.swap_data?.toTokens?.reduce(
                      (sum: number, token: any) => sum + token.amount,
                      0
                    ) || 0,
                  token: tx.swap_data?.toTokens?.[0]?.symbol || 'ETH',
                  hash: tx.transaction_hash || '',
                  timestamp: new Date(tx.timestamp),
                  status: tx.status,
                }))
              : transactions
          }
          loading={loading || personalizedLoading}
        />
      </div>
    </div>
  );
};

export default Dashboard;
