import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowPathIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { useAccount } from 'wagmi';
import { toast } from 'react-hot-toast';

interface QuickActionsProps {
  onRefetch: () => void;
  userProfile: any;
  currentBasket: number;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onRefetch,
  userProfile,
  currentBasket,
}) => {
  const { address } = useAccount();
  const [loading, setLoading] = useState<string | null>(null);

  const handleRebalance = async () => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    setLoading('rebalance');
    try {
      // Simulate rebalancing process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success('Portfolio rebalanced successfully!', {
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#10B981',
          color: '#FFFFFF',
          borderRadius: '0.75rem',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
        },
      });

      onRefetch();
    } catch (error) {
      toast.error('Failed to rebalance portfolio');
    } finally {
      setLoading(null);
    }
  };

  const handleAnalytics = async () => {
    setLoading('analytics');
    try {
      // Simulate analytics generation
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success('Analytics report generated!', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#3B82F6',
          color: '#FFFFFF',
          borderRadius: '0.75rem',
        },
      });
    } catch (error) {
      toast.error('Failed to generate analytics');
    } finally {
      setLoading(null);
    }
  };

  const handleAddFunds = async () => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    setLoading('funds');
    try {
      // Simulate deposit process
      await new Promise((resolve) => setTimeout(resolve, 2500));

      toast.success('Funds added successfully!', {
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#10B981',
          color: '#FFFFFF',
          borderRadius: '0.75rem',
        },
      });

      onRefetch();
    } catch (error) {
      toast.error('Failed to add funds');
    } finally {
      setLoading(null);
    }
  };

  const handleSettings = async () => {
    setLoading('settings');
    try {
      // Simulate settings update
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('Settings updated!', {
        duration: 2000,
        position: 'top-right',
        style: {
          background: '#F59E0B',
          color: '#FFFFFF',
          borderRadius: '0.75rem',
        },
      });
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setLoading(null);
    }
  };

  const actions = [
    {
      id: 'rebalance',
      title: 'Rebalance Portfolio',
      description: 'Execute AI recommendations',
      icon: ArrowPathIcon,
      color: 'purple',
      onClick: handleRebalance,
      requiresWallet: true,
    },
    {
      id: 'analytics',
      title: 'View Analytics',
      description: 'Detailed performance metrics',
      icon: ChartBarIcon,
      color: 'blue',
      onClick: handleAnalytics,
      requiresWallet: false,
    },
    {
      id: 'funds',
      title: 'Add Funds',
      description: 'Deposit to your portfolio',
      icon: CurrencyDollarIcon,
      color: 'green',
      onClick: handleAddFunds,
      requiresWallet: true,
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Manage preferences',
      icon: CogIcon,
      color: 'yellow',
      onClick: handleSettings,
      requiresWallet: false,
    },
  ];

  const getButtonClasses = (color: string, isLoading: boolean) => {
    const baseClasses =
      'p-4 rounded-lg transition-all duration-200 flex items-center space-x-3';
    const disabledClasses = 'opacity-50 cursor-not-allowed';

    const colorClasses = {
      purple:
        'bg-purple-600/20 border border-purple-400/30 hover:bg-purple-600/30',
      blue: 'bg-blue-600/20 border border-blue-400/30 hover:bg-blue-600/30',
      green: 'bg-green-600/20 border border-green-400/30 hover:bg-green-600/30',
      yellow:
        'bg-yellow-600/20 border border-yellow-400/30 hover:bg-yellow-600/30',
    };

    return `${baseClasses} ${
      colorClasses[color as keyof typeof colorClasses]
    } ${isLoading ? disabledClasses : ''}`;
  };

  const getIconColor = (color: string) => {
    const colors = {
      purple: 'text-purple-400',
      blue: 'text-blue-400',
      green: 'text-green-400',
      yellow: 'text-yellow-400',
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actions.map((action) => {
            const isLoading = loading === action.id;
            const Icon = action.icon;

            return (
              <motion.button
                key={action.id}
                whileHover={!isLoading ? { scale: 1.02, y: -2 } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
                onClick={action.onClick}
                disabled={isLoading}
                className={getButtonClasses(action.color, isLoading)}
              >
                <div className="flex items-center space-x-3 w-full">
                  <div className="flex-shrink-0">
                    {isLoading ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Icon
                        className={`w-6 h-6 ${getIconColor(action.color)}`}
                      />
                    )}
                  </div>

                  <div className="text-left flex-1">
                    <p className="text-white font-medium">
                      {action.title}
                      {isLoading && '...'}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {action.description}
                    </p>
                  </div>

                  {action.requiresWallet && !address && (
                    <ExclamationTriangleIcon className="w-4 h-4 text-yellow-400" />
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Action Status */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-blue-500/10 border border-blue-400/30 rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-blue-300 text-sm">
                Processing {loading} request...
              </p>
            </div>
          </motion.div>
        )}

        {/* Wallet Warning */}
        {!address && (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-400/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <InformationCircleIcon className="w-4 h-4 text-yellow-400" />
              <p className="text-yellow-300 text-sm">
                Connect your wallet to access all features
              </p>
            </div>
          </div>
        )}

        {/* Current Strategy Info */}
        <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
          <h4 className="text-white font-medium mb-2">Current Strategy</h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">
                {userProfile?.riskPreference || 'Moderate'} Risk Portfolio
              </p>
              <p className="text-gray-400 text-xs">
                Basket {currentBasket} • Last updated:{' '}
                {new Date().toLocaleDateString()}
              </p>
            </div>
            <CheckCircleIcon className="w-5 h-5 text-green-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
