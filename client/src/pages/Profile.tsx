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
    <div className="min-h-screen bg-[url('assets/landing/bg3.svg')] bg-cover bg-center py-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-5 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center lg:text-left"
        >
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 font-satoshi">
            Profile <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Settings</span>
          </h1>
          <p className="text-xl text-gray-300 font-jetbrains">
            Manage your profile and wallet connection
          </p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -5 }}
            className="xl:col-span-1 bg-gradient-to-br from-[#0b0b12] via-[#101022] to-[#161639] border-2 border-purple-500/30 hover:border-purple-400/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl shadow-purple-500/20 relative overflow-hidden h-fit"
          >
            {/* Glowing effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-indigo-500/5 rounded-2xl"></div>
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-8">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="w-24 h-24 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-purple-500/30"
                >
                  <UserIcon className="w-12 h-12 text-white" />
                </motion.div>

                {/* Editable Name */}
                {editingName ? (
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => setEditingName(false)}
                    className="text-center text-2xl font-semibold text-white mb-3 bg-transparent border-b-2 border-purple-400/50 focus:outline-none focus:border-purple-300 font-satoshi placeholder-gray-400"
                  />
                ) : (
                  <h3
                    className="text-2xl font-semibold text-white mb-3 cursor-pointer hover:text-purple-200 transition-colors font-satoshi"
                    onClick={() => setEditingName(true)}
                  >
                    {name || 'Click to set name'}
                  </h3>
                )}

                {isConnected && address && (
                  <p className="text-gray-400 font-mono text-sm bg-purple-500/10 px-3 py-1 rounded-lg">
                    {formatAddress(address)}
                  </p>
                )}
              </div>

              <div className="space-y-6 mb-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-purple-500/20 hover:border-purple-400/30 transition-colors"
                  >
                    <span className="text-gray-400 text-sm font-jetbrains">{stat.label}:</span>
                    <span className="font-medium text-white font-satoshi">{stat.value}</span>
                  </motion.div>
                ))}
              </div>

              {isConnected ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => disconnect()}
                  className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-xl font-medium hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg shadow-red-500/20 font-satoshi"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  <span>Disconnect Wallet</span>
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={openConnectModal}
                  className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-purple-500/30 font-satoshi"
                >
                  <WalletIcon className="w-5 h-5" />
                  <span>Connect Wallet</span>
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Right Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -2 }}
            className="xl:col-span-2 bg-gradient-to-br from-[#0b0b12] via-[#101022] to-[#161639] border-2 border-purple-500/30 hover:border-purple-400/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl shadow-purple-500/20 relative overflow-hidden"
          >
            {/* Glowing effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-indigo-500/5 rounded-2xl"></div>
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              {/* Risk Preferences */}
              <div className="mb-10">
                <h3 className="text-2xl font-semibold text-white mb-6 font-satoshi">
                  Risk Preferences
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['Conservative', 'Moderate', 'Aggressive'].map((level) => (
                    <motion.button
                      key={level}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setRiskPreference(level as any)}
                      className={`p-6 rounded-xl border-2 transition-all duration-300 group ${
                        riskPreference === level
                          ? 'border-purple-400 bg-purple-500/20 text-purple-200'
                          : 'border-purple-500/30 hover:border-purple-400/50 hover:bg-purple-500/10 text-gray-300 hover:text-white'
                      }`}
                    >
                      <p className="font-medium text-lg font-satoshi">{level}</p>
                      <p className="text-sm text-gray-400 mt-2 group-hover:text-gray-300 transition-colors font-jetbrains">
                        {level === 'Conservative' && 'Low risk, steady returns'}
                        {level === 'Moderate' && 'Balanced risk/reward'}
                        {level === 'Aggressive' && 'High risk, high returns'}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Deposit Amount */}
              <div className="mb-10">
                <h3 className="text-2xl font-semibold text-white mb-6 font-satoshi">
                  Initial Deposit Amount
                </h3>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-300 font-medium text-lg">
                    $
                  </span>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Enter amount (e.g., 1000)"
                    className="w-full pl-10 pr-4 py-4 bg-white/5 border-2 border-purple-500/30 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-lg text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-200 font-jetbrains"
                    min="0"
                    step="0.01"
                  />
                </div>
                <p className="text-sm text-gray-400 mt-3 font-jetbrains">
                  Minimum deposit: $100 • Recommended: $1,000+
                </p>
              </div>

              {/* Investment Period */}
              <div className="mb-10">
                <h3 className="text-2xl font-semibold text-white mb-6 font-satoshi">
                  Investment Period
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {['1 month', '3 months', '6 months', '1 year'].map((period) => (
                    <motion.button
                      key={period}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setInvestmentPeriod(period as any)}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 text-center ${
                        investmentPeriod === period
                          ? 'border-purple-400 bg-purple-500/20 text-purple-200'
                          : 'border-purple-500/30 hover:border-purple-400/50 hover:bg-purple-500/10 text-gray-300 hover:text-white'
                      }`}
                    >
                      <p className="font-medium font-satoshi">{period}</p>
                    </motion.button>
                  ))}
                </div>
                <p className="text-sm text-gray-400 mt-3 font-jetbrains">
                  Longer periods typically offer better returns and lower fees
                </p>
              </div>

              {/* Save Preferences Button */}
              <div className="mb-8 pt-6 border-t border-purple-500/20">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSavePreferences}
                  disabled={!name || !depositAmount}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30 font-satoshi text-lg"
                >
                  Save Preferences & Continue to Dashboard
                </motion.button>
                {(!name || !depositAmount) && (
                  <p className="text-sm text-red-400 mt-3 text-center font-jetbrains">
                    Please enter your name and deposit amount to continue
                  </p>
                )}
              </div>

              {/* Wallet Info */}
              {isConnected && (
                <div className="pt-6 border-t border-purple-500/20">
                  <h3 className="text-xl font-semibold text-white mb-6 font-satoshi">
                    Connected Wallet
                  </h3>
                  <div className="flex items-center justify-between p-6 bg-white/5 rounded-xl border border-purple-500/20 hover:border-purple-400/30 transition-colors">
                    <div className="flex items-center space-x-4">
                      <motion.div 
                        whileHover={{ rotate: 5, scale: 1.05 }}
                        className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg"
                      >
                        <WalletIcon className="w-6 h-6 text-white" />
                      </motion.div>
                      <div>
                        <p className="font-medium text-white font-satoshi text-lg">MetaMask</p>
                        {address && (
                          <p className="text-sm text-gray-400 font-mono bg-purple-500/10 px-2 py-1 rounded mt-1">
                            {formatAddress(address)}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium text-green-300 bg-green-500/20 border border-green-400/30 font-jetbrains">
                      Connected
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
