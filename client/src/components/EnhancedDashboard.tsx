import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  BoltIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  CogIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { useAccount } from 'wagmi';
import { usePersonalizedDashboard } from '../hooks/usePersonalizedDashboard';
import { fetchUserProfile, type UserProfile } from '../services/api';
import PortfolioChart from './PortfolioChart';
import QuickActions from './QuickActions';
import FeatureTestPanel from './FeatureTestPanel';

// Basket configurations
const BASKET_CONFIGS = {
  0: { name: 'Conservative', riskProfile: 'Low', color: 'green' },
  1: { name: 'Balanced', riskProfile: 'Medium', color: 'blue' },
  2: { name: 'Growth', riskProfile: 'High', color: 'purple' },
};

const EnhancedDashboard: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'predictions' | 'portfolio' | 'actions' | 'tests'
  >('overview');

  const {
    data: personalizedData,
    portfolio,
    transactions,
    chartData,
    loading,
    error,
    refetch,
    loadChartData,
  } = usePersonalizedDashboard(address);

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      if (address) {
        const profile = await fetchUserProfile(address);
        setUserProfile(profile);
      }
    };
    loadProfile();
  }, [address]);

  if (!isConnected || !address) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <SparklesIcon className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Connect Your Wallet
          </h2>
          <p className="text-gray-300">
            Please connect your wallet to view your personalized dashboard
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <ArrowTrendingDownIcon className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={refetch}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const currentBasket = personalizedData?.user?.selectedBasket ?? 0;
  const basketConfig =
    BASKET_CONFIGS[currentBasket as keyof typeof BASKET_CONFIGS];
  const predictions =
    personalizedData?.dashboard?.performance?.predictions || [];
  const recentTransactions = transactions || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {userProfile?.displayName || 'Trader'}
          </h1>
          <p className="text-gray-300">
            Your {basketConfig?.name} portfolio is performing well
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Balance</p>
                <p className="text-2xl font-bold text-white">
                  $
                  {personalizedData?.dashboard?.totalBalance?.toLocaleString() ||
                    '0'}
                </p>
              </div>
              <CurrencyDollarIcon className="w-8 h-8 text-green-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Current APR</p>
                <p className="text-2xl font-bold text-white">
                  {(
                    (personalizedData?.dashboard?.currentAPR || 0) * 100
                  ).toFixed(2)}
                  %
                </p>
              </div>
              <ChartBarIcon className="w-8 h-8 text-blue-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">AI Predictions</p>
                <p className="text-2xl font-bold text-white">
                  {predictions.length}
                </p>
              </div>
              <SparklesIcon className="w-8 h-8 text-purple-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Active Strategies</p>
                <p className="text-2xl font-bold text-white">
                  {personalizedData?.dashboard?.activeStrategies || 0}
                </p>
              </div>
              <BoltIcon className="w-8 h-8 text-yellow-400" />
            </div>
          </motion.div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white/10 backdrop-blur-lg rounded-lg p-1 border border-white/20">
            {[
              { id: 'overview', label: 'Overview', icon: EyeIcon },
              {
                id: 'predictions',
                label: 'AI Predictions',
                icon: SparklesIcon,
              },
              { id: 'portfolio', label: 'Portfolio', icon: ChartBarIcon },
              { id: 'actions', label: 'Quick Actions', icon: CogIcon },
              { id: 'tests', label: 'Tests', icon: CogIcon },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === id
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Portfolio Chart */}
                <PortfolioChart
                  data={chartData}
                  loading={loading}
                  onTimeframeChange={loadChartData}
                  currentBasket={currentBasket}
                />

                {/* Recent Transactions */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Recent Transactions
                  </h3>
                  {recentTransactions.length > 0 ? (
                    <div className="space-y-3">
                      {recentTransactions
                        .slice(0, 5)
                        .map((tx: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                          >
                            <div>
                              <p className="text-white font-medium">
                                Rebalancing
                              </p>
                              <p className="text-gray-400 text-sm">
                                {new Date(tx.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-green-400 font-medium">
                                +${tx.amount || '0'}
                              </p>
                              <p className="text-gray-400 text-sm capitalize">
                                {tx.status}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No transactions yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'predictions' && (
              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-4">
                    AI Predictions & Recommendations
                  </h3>
                  {predictions.length > 0 ? (
                    <div className="space-y-4">
                      {predictions
                        .slice(0, 5)
                        .map((prediction: any, index: number) => (
                          <div
                            key={index}
                            className="p-4 bg-white/5 rounded-lg border border-white/10"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-white font-medium">
                                {
                                  BASKET_CONFIGS[
                                    prediction.recommended_basket as keyof typeof BASKET_CONFIGS
                                  ]?.name
                                }{' '}
                                Basket
                              </h4>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-400">
                                  {prediction.confidence_score}% confidence
                                </span>
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              </div>
                            </div>
                            <p className="text-gray-300 text-sm mb-2">
                              {prediction.reasoning}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-green-400 font-medium">
                                Expected Yield:{' '}
                                {(
                                  prediction.expected_yield_basis_points / 100
                                ).toFixed(2)}
                                %
                              </span>
                              <span className="text-gray-400 text-xs">
                                {new Date(
                                  prediction.timestamp
                                ).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <SparklesIcon className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                      <p className="text-gray-400">
                        No AI predictions available yet
                      </p>
                      <button
                        onClick={refetch}
                        className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Generate Predictions
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'portfolio' && (
              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Current Portfolio
                  </h3>
                  {personalizedData?.dashboard?.basketConfig?.assets ? (
                    <div className="space-y-4">
                      <div className="text-center mb-6">
                        <h4 className="text-2xl font-bold text-white mb-2">
                          {basketConfig?.name} Strategy
                        </h4>
                        <p className="text-gray-400">
                          Risk Level: {basketConfig?.riskProfile}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {personalizedData.dashboard.basketConfig.assets.map(
                          (asset: any, index: number) => (
                            <div
                              key={index}
                              className="text-center p-4 bg-white/5 rounded-lg"
                            >
                              <p className="text-white font-bold text-lg">
                                {asset.symbol}
                              </p>
                              <p className="text-gray-400">
                                {(asset.allocation / 100).toFixed(1)}%
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400">
                        Portfolio data not available
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'actions' && (
              <QuickActions
                onRefetch={refetch}
                userProfile={userProfile}
                currentBasket={currentBasket}
              />
            )}

            {activeTab === 'tests' && <FeatureTestPanel />}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Strategy */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-bold text-white mb-4">
                Current Strategy
              </h3>
              <div className="text-center">
                <div
                  className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                    basketConfig?.color === 'green'
                      ? 'bg-green-500/20 border border-green-400/30'
                      : basketConfig?.color === 'blue'
                      ? 'bg-blue-500/20 border border-blue-400/30'
                      : 'bg-purple-500/20 border border-purple-400/30'
                  }`}
                >
                  <span className="text-2xl font-bold text-white">
                    {basketConfig?.name?.charAt(0)}
                  </span>
                </div>
                <h4 className="text-xl font-bold text-white mb-1">
                  {basketConfig?.name}
                </h4>
                <p className="text-gray-400 mb-4">
                  {basketConfig?.riskProfile} Risk
                </p>
                <div className="text-sm text-gray-300">
                  <p>
                    Expected Yield:{' '}
                    {(
                      (personalizedData?.dashboard?.currentAPR || 0) * 100
                    ).toFixed(2)}
                    %
                  </p>
                  <p>Last Updated: {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-bold text-white mb-4">AI Insights</h3>
              {predictions.length > 0 ? (
                <div className="space-y-3">
                  <div className="p-3 bg-white/5 rounded-lg">
                    <p className="text-white text-sm font-medium">
                      Latest Recommendation
                    </p>
                    <p className="text-gray-300 text-xs">
                      {
                        BASKET_CONFIGS[
                          predictions[0]
                            .recommended_basket as keyof typeof BASKET_CONFIGS
                        ]?.name
                      }{' '}
                      Basket
                    </p>
                    <p className="text-green-400 text-xs">
                      {predictions[0].confidence_score}% confidence
                    </p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg">
                    <p className="text-white text-sm font-medium">
                      Expected Return
                    </p>
                    <p className="text-green-400 text-sm font-bold">
                      {(
                        predictions[0].expected_yield_basis_points / 100
                      ).toFixed(2)}
                      %
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-400 text-sm">No insights available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;
