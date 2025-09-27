import React from 'react';
import { motion } from 'framer-motion';
import {
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowPathIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

interface PersonalizedDashboardCardsProps {
  data: {
    totalBalance: number;
    currentAPR: number;
    activeStrategies: number;
    aiPredictions: number;
    basketConfig: {
      name: string;
      riskProfile: string;
      assets: Array<{ symbol: string; allocation: number }>;
    };
    portfolio: {
      totalValue: number;
      lastRebalance: string | null;
    };
  };
  loading?: boolean;
}

const PersonalizedDashboardCards: React.FC<PersonalizedDashboardCardsProps> = ({
  data,
  loading = false,
}) => {
  const cards = [
    {
      title: 'Total Balance',
      value: `$${data.totalBalance ? data.totalBalance.toLocaleString() : '0'}`,
      change: data.currentAPR
        ? `+${((data.currentAPR / 100) * 12).toFixed(1)}% this year`
        : 'No data available',
      changeType: 'positive' as const,
      icon: <CurrencyDollarIcon className="w-6 h-6" />,
    },
    {
      title: 'Current APR',
      value: data.currentAPR ? `${data.currentAPR.toFixed(2)}%` : '0.00%',
      change: `${data.basketConfig.name} basket`,
      changeType: 'neutral' as const,
      icon: <ArrowTrendingUpIcon className="w-6 h-6" />,
    },
    {
      title: 'Active Strategies',
      value: data.activeStrategies.toString(),
      change: data.portfolio.lastRebalance
        ? `Rebalanced ${new Date(
            data.portfolio.lastRebalance
          ).toLocaleDateString()}`
        : 'Never rebalanced',
      changeType: 'neutral' as const,
      icon: <ArrowPathIcon className="w-6 h-6" />,
    },
    {
      title: 'AI Predictions',
      value: data.aiPredictions.toString(),
      change: 'Based on your basket performance',
      changeType: 'positive' as const,
      icon: <SparklesIcon className="w-6 h-6" />,
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -2, scale: 1.02 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">{card.title}</h3>
            <div className="text-purple-600">{card.icon}</div>
          </div>

          <div className="mb-2">
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
          </div>

          <p
            className={`text-sm flex items-center space-x-1 ${
              card.changeType === 'positive'
                ? 'text-green-600'
                : card.changeType === 'negative'
                ? 'text-red-600'
                : 'text-gray-600'
            }`}
          >
            <span>{card.change}</span>
            {card.changeType === 'positive' && (
              <ArrowTrendingUpIcon className="w-3 h-3" />
            )}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

export default PersonalizedDashboardCards;
