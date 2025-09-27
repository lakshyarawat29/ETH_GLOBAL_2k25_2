import React from 'react';
import { motion } from 'framer-motion';
import { 
  CurrencyDollarIcon, 
  ArrowTrendingUpIcon,
  ArrowPathIcon,
  SparklesIcon 
} from '@heroicons/react/24/outline';

interface DashboardCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  loading?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral',
  icon, 
  loading = false 
}) => {
  const changeColor = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600',
  };

  if (loading) {
    return (
      <motion.div
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
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, scale: 1.02 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className="text-purple-600">{icon}</div>
      </div>
      
      <div className="mb-2">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      
      {change && (
        <p className={`text-sm ${changeColor[changeType]} flex items-center space-x-1`}>
          <span>{change}</span>
          {changeType === 'positive' && <ArrowTrendingUpIcon className="w-3 h-3" />}
        </p>
      )}
    </motion.div>
  );
};

interface DashboardCardsProps {
  totalBalance: number;
  totalAPR: number;
  activeStrategies: number;
  predictionsCount: number;
  loading?: boolean;
}

const DashboardCards: React.FC<DashboardCardsProps> = ({
  totalBalance,
  totalAPR,
  activeStrategies,
  predictionsCount,
  loading = false,
}) => {
  const cards = [
    {
      title: 'Total Balance',
      value: `$${totalBalance.toLocaleString()}`,
      change: '+12.5% this week',
      changeType: 'positive' as const,
      icon: <CurrencyDollarIcon className="w-6 h-6" />,
    },
    {
      title: 'Average APR',
      value: `${totalAPR}%`,
      change: '+2.3% from last month',
      changeType: 'positive' as const,
      icon: <ArrowTrendingUpIcon className="w-6 h-6" />,
    },
    {
      title: 'Active Strategies',
      value: activeStrategies.toString(),
      change: 'Rebalanced 2h ago',
      changeType: 'neutral' as const,
      icon: <ArrowPathIcon className="w-6 h-6" />,
    },
    {
      title: 'AI Predictions',
      value: predictionsCount.toString(),
      change: '3 new opportunities',
      changeType: 'positive' as const,
      icon: <SparklesIcon className="w-6 h-6" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <DashboardCard {...card} loading={loading} />
        </motion.div>
      ))}
    </div>
  );
};

export default DashboardCards;