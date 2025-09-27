import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardCards from '../components/DashboardCards';
import APRChart from '../components/Charts/APRChart';
import PredictionList from '../components/PredictionList';
import TransactionsTable from '../components/TransactionsTable';
import AIPredictionCard from '../components/AIPredictionCard';
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

const Dashboard: React.FC = () => {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

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
          <DashboardCards
            totalBalance={totalBalance}
            totalAPR={parseFloat(averageAPR.toFixed(1))}
            activeStrategies={4}
            predictionsCount={predictions.length}
            loading={loading}
          />
        </div>

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
              <PredictionList predictions={predictions} loading={loading} />
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
              Portfolio Distribution
            </h3>

            {loading ? (
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
        <TransactionsTable transactions={transactions} loading={loading} />
      </div>
    </div>
  );
};

export default Dashboard;
