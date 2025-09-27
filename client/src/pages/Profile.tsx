import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  UserIcon, 
  WalletIcon, 
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';
import { useAccount, useDisconnect } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { toast } from 'react-hot-toast';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();

  const [riskPreference, setRiskPreference] = useState<'Conservative' | 'Moderate' | 'Aggressive'>('Moderate');
  const [name, setName] = useState<string>(''); // user-entered name
  const [editingName, setEditingName] = useState<boolean>(true);
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [investmentPeriod, setInvestmentPeriod] = useState<'1 month' | '3 months' | '6 months' | '1 year'>('3 months');

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleSavePreferences = () => {
    // Here you would typically save the preferences to your backend/database
    const preferences = {
      name,
      riskPreference,
      depositAmount,
      investmentPeriod,
      walletAddress: address,
    };
    
    console.log('Saving preferences:', preferences);
    
    // Show success message (you could add a toast notification here)
    toast.success('Preferences saved successfully!', {
      duration: 3000,
      position: 'top-right',
      style: {
        background: '#FFFFFF',
        color: '#111827',
        border: '1px solid #F3F4F6',
        borderRadius: '0.75rem',
        boxShadow:
          '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
      },
      iconTheme: {
        primary: '#7C3AED',
        secondary: '#FFFFFF',
      },
    });
    
    // Redirect to dashboard
    navigate('/dashboard');
  };

  const stats = [
    { label: 'Total Deposits', value: '$26,390.50' }, // ideally replace with API data
    { label: 'Total Earned', value: '$3,247.83' },
    { label: 'Active Since', value: 'Jan 2025' },
    { label: 'Risk Level', value: riskPreference },
  ];

  return (
    <div className="min-h-screen bg-[url('assets/landing/bg.svg')] bg-cover bg-center py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-100 mb-2">
            Profile
          </h1>
          <p className="text-gray-600">
            Manage your profile and wallet connection
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-fit"
          >
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <UserIcon className="w-10 h-10 text-white" />
              </div>

              {/* Editable Name */}
              {editingName ? (
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setEditingName(false)}
                  className="text-center text-xl font-semibold text-gray-900 mb-1 border-b border-gray-300 focus:outline-none focus:border-purple-500"
                />
              ) : (
                <h3
                  className="text-xl font-semibold text-gray-900 mb-1 cursor-pointer"
                  onClick={() => setEditingName(true)}
                >
                  {name || 'Click to set name'}
                </h3>
              )}

              {isConnected && address && (
                <p className="text-gray-500 font-mono text-sm">
                  {formatAddress(address)}
                </p>
              )}
            </div>

            <div className="space-y-4 mb-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex justify-between items-center"
                >
                  <span className="text-gray-600 text-sm">{stat.label}:</span>
                  <span className="font-medium text-gray-900">{stat.value}</span>
                </motion.div>
              ))}
            </div>

            {isConnected ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => disconnect()}
                className="w-full flex items-center justify-center space-x-2 bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span>Disconnect Wallet</span>
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={openConnectModal}
                className="w-full flex items-center justify-center space-x-2 bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors"
              >
                <WalletIcon className="w-5 h-5" />
                <span>Connect Wallet</span>
              </motion.button>
            )}
          </motion.div>

          {/* Right Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            {/* Risk Preferences */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Risk Preferences
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {['Conservative', 'Moderate', 'Aggressive'].map((level) => (
                  <motion.button
                    key={level}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setRiskPreference(level as any)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      riskPreference === level
                        ? 'border-purple-600 bg-purple-50 text-purple-600'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                    }`}
                  >
                    <p className="font-medium">{level}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {level === 'Conservative' && 'Low risk, steady returns'}
                      {level === 'Moderate' && 'Balanced risk/reward'}
                      {level === 'Aggressive' && 'High risk, high returns'}
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Deposit Amount */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Initial Deposit Amount
              </h3>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  $
                </span>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Enter amount (e.g., 1000)"
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                  min="0"
                  step="0.01"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Minimum deposit: $100 • Recommended: $1,000+
              </p>
            </div>

            {/* Investment Period */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Investment Period
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['1 month', '3 months', '6 months', '1 year'].map((period) => (
                  <motion.button
                    key={period}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setInvestmentPeriod(period as any)}
                    className={`p-3 rounded-xl border-2 transition-all text-center ${
                      investmentPeriod === period
                        ? 'border-purple-600 bg-purple-50 text-purple-600'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                    }`}
                  >
                    <p className="font-medium">{period}</p>
                  </motion.button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Longer periods typically offer better returns and lower fees
              </p>
            </div>

            {/* Save Preferences Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSavePreferences}
                disabled={!name || !depositAmount}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Preferences & Continue to Dashboard
              </motion.button>
              {(!name || !depositAmount) && (
                <p className="text-sm text-red-500 mt-2 text-center">
                  Please enter your name and deposit amount to continue
                </p>
              )}
            </div>

            {/* Wallet Info */}
            {isConnected && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Connected Wallet
                </h3>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <WalletIcon className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">MetaMask</p>
                      {address && (
                        <p className="text-sm text-gray-600 font-mono">
                          {formatAddress(address)}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium text-green-600 bg-green-100">
                    Connected
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
