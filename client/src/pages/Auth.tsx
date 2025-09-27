import React from 'react';
import { motion } from 'framer-motion';
import ConnectWalletButton from '../components/ConnectWalletButton';
import { ShieldCheckIcon, CpuChipIcon, GlobeAltIcon, SparklesIcon } from '@heroicons/react/24/outline';

const Auth: React.FC = () => {
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="min-h-screen bg-[url('assets/landing/About.svg')] bg-cover bg-center flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-6xl w-full relative z-10"
      >
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - Content */}
          <motion.div
            variants={itemVariants}
            className="space-y-8 order-2 xl:order-1"
          >
            <div className="text-center xl:text-left">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 backdrop-blur-sm border border-purple-500/30 rounded-full px-4 py-2 mb-6"
              >
                <SparklesIcon className="w-4 h-4 text-purple-300" />
                <span className="text-sm font-jetbrains text-purple-200">Connect & Earn</span>
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 font-satoshi leading-tight"
              >
                <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  Connect
                </span>{' '}
                Your Wallet
              </motion.h1>
              
              <motion.p
                variants={itemVariants}
                className="text-lg sm:text-xl text-gray-300 font-jetbrains leading-relaxed max-w-2xl xl:max-w-none"
              >
                Start your journey with autonomous DeFi yield optimization. 
                Connect your wallet to access AI-powered portfolio management and watch your crypto work smarter.
              </motion.p>
            </div>

            <motion.div
              variants={itemVariants}
              className="space-y-6"
            >
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.15, duration: 0.6 }}
                  whileHover={{ x: 5, transition: { duration: 0.2 } }}
                  className="flex items-start space-x-4 group cursor-pointer"
                >
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-12 h-12 bg-gradient-to-br from-purple-500/30 to-indigo-500/30 backdrop-blur-sm border border-purple-500/40 rounded-xl flex items-center justify-center text-purple-300 mt-1 group-hover:border-purple-400/60 transition-colors duration-300"
                  >
                    {benefit.icon}
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white font-satoshi text-lg group-hover:text-purple-200 transition-colors duration-300">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-400 font-jetbrains mt-1 group-hover:text-gray-300 transition-colors duration-300">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Side - Wallet Connection */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="order-1 xl:order-2"
          >
            <div className="bg-gradient-to-br from-[#0b0b12] via-[#101022] to-[#161639] border-2 border-purple-500/30 hover:border-purple-400/50 backdrop-blur-xl rounded-2xl p-8 sm:p-10 shadow-2xl shadow-purple-500/20 relative overflow-hidden transition-all duration-500">
              {/* Glowing effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-indigo-500/5 rounded-2xl"></div>
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                <div className="text-center mb-8">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-purple-500/30"
                  >
                    <span className="text-3xl font-bold text-white font-satoshi">DRY</span>
                  </motion.div>
                  
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-bold text-white mb-3 font-satoshi"
                  >
                    DeFi Agent
                  </motion.h2>
                  
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-gray-400 font-jetbrains"
                  >
                    Secure wallet connection powered by RainbowKit
                  </motion.p>
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-6"
                >
                  <div className="text-center mx-auto flex flex-col sm:flex-row items-center justify-center gap-4">
                    <ConnectWalletButton />
                  </div>
                  
                  <div className="text-center">
                    <p className="text-xs text-gray-500 font-jetbrains leading-relaxed">
                      By connecting, you agree to our{' '}
                      <motion.a 
                        href="#" 
                        whileHover={{ scale: 1.05 }}
                        className="text-purple-400 hover:text-purple-300 transition-colors duration-200 underline decoration-purple-400/50"
                      >
                        Terms of Service
                      </motion.a>{' '}
                      and{' '}
                      <motion.a 
                        href="#" 
                        whileHover={{ scale: 1.05 }}
                        className="text-purple-400 hover:text-purple-300 transition-colors duration-200 underline decoration-purple-400/50"
                      >
                        Privacy Policy
                      </motion.a>
                    </p>
                  </div>
                </motion.div>

                {/* Trust Indicators */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="mt-8 pt-6 border-t border-purple-500/20"
                >
                  <div className="flex items-center justify-center space-x-6 text-sm">
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center space-x-2 text-gray-400 hover:text-gray-300 transition-colors duration-200"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-jetbrains">Audited</span>
                    </motion.div>
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center space-x-2 text-gray-400 hover:text-gray-300 transition-colors duration-200"
                    >
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse animation-delay-1000"></div>
                      <span className="font-jetbrains">Non-Custodial</span>
                    </motion.div>
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center space-x-2 text-gray-400 hover:text-gray-300 transition-colors duration-200"
                    >
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse animation-delay-2000"></div>
                      <span className="font-jetbrains">Open Source</span>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;