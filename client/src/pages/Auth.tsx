import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import ConnectWalletButton from '../components/ConnectWalletButton';
import { ShieldCheckIcon, CpuChipIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected } = useWallet();

  // useEffect(() => {
  //   if (isConnected) {
  //     navigate('/setup');
  //   }
  // }, [isConnected, navigate]);

  const benefits = [
    {
      icon: <ShieldCheckIcon className="w-6 h-6" />,
      title: 'Secure & Non-Custodial',
      description: 'Your keys, your funds. We never have access to your private keys.',
    },
    {
      icon: <CpuChipIcon className="w-6 h-6" />,
      title: 'AI-Powered Analytics',
      description: 'Advanced algorithms analyze market trends in real-time.',
    },
    {
      icon: <GlobeAltIcon className="w-6 h-6" />,
      title: 'Multi-Chain Support',
      description: 'Works across Ethereum, Polygon, BSC, and more.',
    },
  ];

  return (
    <div className="min-h-screen bg-[url('assets/landing/About.svg')] bg-cover bg-center flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full ">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-gray-900/40 backdrop-blur-xl rounded-2xl p-10 shadow-2xl border border-white/10">
          {/* Left Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div>
              <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-bold text-gray-300 mb-4 font-satoshi"
              >
          <span className="text-purple-600">Connect</span> Your Wallet
              </motion.h1>
              <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-gray-300 font-jetbrains"
              >
          Start your journey with autonomous DeFi yield optimization. 
          Connect your wallet to access AI-powered portfolio management.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              {benefits.map((benefit, index) => (
          <motion.div
            key={benefit.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="flex items-start space-x-3"
          >
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-300 mt-1">
              {benefit.icon}
            </div>
            <div>
              <h3 className="font-semibold text-gray-100 font-satoshi">{benefit.title}</h3>
              <p className="text-gray-300 font-jetbrains">{benefit.description}</p>
            </div>
          </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Side - Wallet Connection */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-white/10"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">DRY</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
          DeFi Agent
              </h2>
              <p className="text-gray-900">
          We use Rainbow Kit to connect your wallet
              </p>
            </div>

            <div className="space-y-4 flex flex-col justify-center align-middle mx-auto">
              <div className="text-center mx-auto mb-2">
          <ConnectWalletButton />
              </div>
              
              <div className="text-center">
          <p className="text-xs text-gray-400">
            By connecting, you agree to our{' '}
            <a href="#" className="text-purple-400 hover:text-purple-300">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-purple-400 hover:text-purple-300">
              Privacy Policy
            </a>
          </p>
              </div>
            </div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-8 pt-6 border-t border-white/10"
            >
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Audited</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Non-Custodial</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>Open Source</span>
          </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Auth;