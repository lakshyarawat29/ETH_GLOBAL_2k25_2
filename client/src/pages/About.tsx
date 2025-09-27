import React from 'react';
import { motion } from 'framer-motion';
import { 
  CpuChipIcon, 
  ChartBarIcon, 
  GlobeAltIcon, 
  ShieldCheckIcon,
  BoltIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';

const About: React.FC = () => {
  const features = [
    {
      icon: <CpuChipIcon className="w-8 h-8" />,
      title: '1inch Fusion+ Integration',
      description: 'Leverage 1inch Fusion+ for optimal cross-chain swaps with minimal slippage and MEV protection. Our AI identifies the best routes across multiple DEXs.',
    },
    {
      icon: <ChartBarIcon className="w-8 h-8" />,
      title: 'Pyth Network Price Feeds',
      description: 'Real-time, high-fidelity price data from Pyth Network ensures accurate valuations and optimal entry/exit points for your DeFi positions.',
    },
    {
      icon: <BoltIcon className="w-8 h-8" />,
      title: 'AI Engine',
      description: 'Advanced machine learning algorithms analyze market trends, predict yield opportunities, and automatically rebalance your portfolio for maximum returns.',
    },
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Market Analysis',
      description: 'Our AI continuously scans multiple blockchains (Ethereum, Polygon, BSC, Arbitrum) to identify the highest-yielding opportunities.',
    },
    {
      step: '02',
      title: 'Strategy Optimization',
      description: 'Machine learning models predict market movements and optimize yield farming strategies based on historical data and current conditions.',
    },
    {
      step: '03',
      title: 'Automated Execution',
      description: 'Smart contracts automatically execute trades, rebalance positions, and compound rewards to maximize your returns.',
    },
    {
      step: '04',
      title: 'Risk Management',
      description: 'Built-in safety mechanisms monitor protocol health, impermanent loss risks, and automatically adjust positions to protect your capital.',
    },
  ];

  const protocols = [
    { name: 'Aave', description: 'Leading lending protocol' },
    { name: 'Compound', description: 'Algorithmic money markets' },
    { name: 'Curve', description: 'Stablecoin & asset swaps' },
    { name: 'Uniswap', description: 'Decentralized exchange' },
    { name: 'Sushi', description: 'Community-driven DEX' },
    { name: 'Yearn', description: 'Yield optimization' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              About DeFi Agent
            </h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              The future of autonomous DeFi yield optimization, powered by cutting-edge AI 
              and integrated with the best protocols in the ecosystem.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Core Integrations */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Powered by Industry Leaders
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform integrates with the most trusted and innovative protocols 
              in the DeFi ecosystem to deliver superior results.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="bg-gradient-to-br from-white to-purple-50 p-8 rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center text-white mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our autonomous system works around the clock to optimize your DeFi yields 
              through advanced AI and smart contract automation.
            </p>
          </motion.div>

          <div className="space-y-12">
            {howItWorks.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`flex flex-col lg:flex-row items-center gap-8 ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className="lg:w-1/2">
                  <div className="relative">
                    <div className="text-6xl font-bold text-purple-100 mb-4">
                      {item.step}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-lg">
                      {item.description}
                    </p>
                  </div>
                </div>
                <div className="lg:w-1/2">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    className="w-64 h-64 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto"
                  >
                    <div className="w-32 h-32 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
                      <ArrowPathIcon className="w-16 h-16 text-white" />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Protocols */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Supported Protocols
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We integrate with the most trusted and battle-tested protocols 
              to ensure optimal yields and maximum security.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {protocols.map((protocol, index) => (
              <motion.div
                key={protocol.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4, scale: 1.05 }}
                className="bg-gray-50 p-6 rounded-xl text-center hover:bg-purple-50 hover:border-purple-200 border border-transparent transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {protocol.name.charAt(0)}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {protocol.name}
                </h3>
                <p className="text-xs text-gray-500">
                  {protocol.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Trust */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Security First
              </h2>
              <p className="text-xl text-purple-100 mb-8">
                Your funds are protected by industry-leading security measures, 
                audited smart contracts, and non-custodial architecture.
              </p>
              <div className="space-y-4">
                {[
                  'Smart contract audited by top security firms',
                  'Non-custodial - you always control your funds',
                  'Multi-signature wallet protection',
                  'Real-time monitoring and risk assessment',
                ].map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <ShieldCheckIcon className="w-6 h-6 text-purple-200 flex-shrink-0" />
                    <span className="text-purple-100">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="w-full h-80 bg-white bg-opacity-10 rounded-3xl p-8 backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-4 h-full">
                  {[
                    { title: 'Uptime', value: '99.99%' },
                    { title: 'TVL Secured', value: '$125M+' },
                    { title: 'Audits', value: '3' },
                    { title: 'Users', value: '12.8K' },
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.title}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.2 }}
                      className="bg-white bg-opacity-10 rounded-xl p-4 text-center"
                    >
                      <div className="text-2xl font-bold text-white mb-1">
                        {stat.value}
                      </div>
                      <div className="text-purple-200 text-sm">
                        {stat.title}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;