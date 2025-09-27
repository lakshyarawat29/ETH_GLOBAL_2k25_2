import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  SparklesIcon, 
  ChartBarIcon, 
  CpuChipIcon, 
  ShieldCheckIcon,
  ArrowRightIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import ConnectWalletButton from '../components/ConnectWalletButton';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const stats = [
    { image: 'assets/landing/v1.svg', label: 'Seamless swaps via 1inch Fusion+.', value: 'Cross-Chain Prediction' },
    { image: 'assets/landing/v2.svg', label:'Pyth Network price feeds ensure accuracy.', value: 'Real-Time Data' },
    { image: 'assets/landing/v3.svg', label: 'On-chain AI predicts where yield flows next.', value: 'AI Optimization' },
    // { label: 'Successful Rebalances', value: '450K+' },
  ];

  return (
    <div className=" min-h-screen">
      {/* Hero Section */}
      <section className="min-h-screen bg-[url('assets/landing/bg.svg')] bg-cover bg-center relative px-4 sm:px-6 lg:px-8 pt-10 pb-16">
        {/* Top Right Buttons for md+ screens */}
        <div className="max-w-8xl mx-auto hidden md:flex items-center gap-4 justify-end">
          {/* <ConnectWalletButton /> */}
            <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/auth')}
            className="flex items-center space-x-2 px-6 py-2 text-white font-satoshi font-semibold rounded-2xl bg-gradient-to-br from-[#0b0b12] via-[#101022] to-[#161639] border-2 border-[#a855f7] hover:border-[#c084fc] shadow-[0_0_14px_rgba(168,85,247,0.25)] hover:shadow-[0_0_24px_rgba(192,132,252,0.45)] transition-all duration-200"
            >
            Connect Wallet
            </motion.button>
            <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-2 px-6 py-2 text-white font-satoshi font-semibold rounded-2xl bg-gradient-to-br from-[#0b0b12] via-[#101022] to-[#161639] border-2 border-[#a855f7] hover:border-[#c084fc] shadow-[0_0_14px_rgba(168,85,247,0.25)] hover:shadow-[0_0_24px_rgba(192,132,252,0.45)] transition-all duration-200"
            >
            <PlayIcon className="w-5 h-5 opacity-90" />
            <span className="font-jetbrains">Watch Demo</span>
            </motion.button>
        </div>
        
        <div className="mt-16 max-w-8xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-satoshi text-4xl sm:text-6xl lg:text-8xl font-bold text-white mb-10">
              Decentralized{' '}
              <span className="font-satoshi bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Rebalancer Yielder
              </span>
            </h1>
            
            <p className="font-jetbrains text-xl sm:text-3xl text-white mb-12 max-w-5xl mx-auto">
              An AI agent that predicts yields, swaps across chains, and rebalances automatically so your crypto works smarter, not harder.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 md:hidden">
              <ConnectWalletButton />
              <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center space-x-2 px-4 py-2 border border-purple-600 text-white rounded-xl hover:bg-purple-50 transition-all duration-200"
              >
          <PlayIcon className="w-5 h-5" />
          <span className='font-jetbrains'>Watch Demo</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-20 w-[70%] h-80 mx-auto pt-8"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl">
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="text-center bg-gradient-to-br from-[#0b0b12] via-[#101022] to-[#161639] border-2 border-[#a855f7] hover:border-[#c084fc] shadow-[0_0_14px_rgba(168,85,247,0.25)] hover:shadow-[0_0_24px_rgba(192,132,252,0.45)] p-6 rounded-2xl min-h-80 flex flex-col justify-center transition-all duration-200"
          >
            <img src={stat.image} className="w-12 h-12 mx-auto mb-4 opacity-90" alt="Stat Icon" />
            <div className="font-satoshi text-2xl sm:text-3xl font-semibold text-white mb-3">
              {stat.value}
            </div>
            <div className="font-jetbrains text-purple-200/90">
              {stat.label}
            </div>
          </motion.div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

    <section className="min-h-screen bg-[url('assets/landing/About.svg')] bg-cover  text-white px-6 md:px-12 py-12">
      {/* Heading + CTA */}
      {/* <div className="absolute top-0 left-0 w-full h-1/5 bg-gradient-to-t from-transparent to-black"></div> */}
      <div className="flex flex-col md:flex-row justify-center items-center mb-16 max-w-8xl mx-auto">
        <h1 className="text-3xl md:text-8xl font-bold text-[#a8a8a890]">
          One deposit. Infinite opportunities
        </h1>
        {/* <button className="mt-6 md:mt-0 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-full font-semibold transition">
          Become a member →
        </button> */}
      </div>

      {/* Main 2 Column Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 ">
        {/* Column 1 */}
        <div className="flex flex-col gap-10">
          {/* About Us */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white/5 backdrop-blur-md p-8   border-b-4 border-r-4 border-purple-600 rounded-xl"
          >
            <h2 className="text-2xl md:text-4xl font-mono text-[#BDBDBD]  mb-4">[About Us]</h2>
            <p className="mb-4 text-[#BDBDBD]">
              Our platform is an autonomous AI agent that constantly scans
              multiple chains, predicts where liquidity earns the highest yield,
              and rebalances funds in real time.
            </p>
            <p className="mb-4 text-[#BDBDBD]">
              Users deposit once, and the agent does the rest: swapping, reallocating, even leveraging flash loans for aggressive rebalancing. With gamified rewards and community incentives, DRY is not just a tool it’s a new standard for how DeFi should work.
            </p>
            <p className="italic text-[#DDDDDD]">
              Our mission: to make decentralized finance effortless, autonomous,
              and maximally rewarding.
            </p>
          </motion.div>

          {/* Vault Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-end"
          >
            <img
              src="assets/landing/i1.svg"
              alt="Vault Illustration"
              className="w-full max-w-lg object-contain"
            />
          </motion.div>
        </div>

        {/* Column 2 */}
        <div className="flex flex-col gap-10">
          {/* Hand Illustration (overlaps vault slightly) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="items-center md:block hidden"
          >
            <img
              src="assets/landing/i2.svg"
              alt="AI Bot Illustration"
              className="w-full max-w-lg object-contain"
            />
          </motion.div>

          {/* How It Works */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white/5 backdrop-blur-md p-8 rounded-2xl border-b-4 border-r-4 border-purple-600"
          >
            <h2 className="text-2xl md:text-4xl font-mono text-[#BDBDBD] mb-6">[How It Works]</h2>
            <ol className="space-y-2 mb-6 text-[#BDBDBD] list-decimal list-inside">
              <li>Deposit USDC/ETH into DRY vault.</li>
              <li>Agent scans chains with Pyth price feeds.</li>
              <li>Swaps via 1inch Fusion+ into best yield pool.</li>
              <li>Funds rebalance automatically.</li>
            </ol>
            <div className="flex justify-center pb-5 gap-4 text-purple-400">
              {/* <span>🔐 Vault</span>
              <span>🧠 AI Brain</span>
              <span>🔗 Chain Bridge</span>
              <span>♻️ Auto-refresh</span> */}
              <img src="assets/landing/steps.svg" alt="How It Works Illustration" className="w-full max-w-96 object-contain" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-[url('assets/footer/bg.svg')] bg-cover bg-center">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-satoshi sm:text-4xl font-bold text-white mb-6">
              Ready to Maximize Your DeFi Yields?
            </h2>
            <p className="text-xl font-jetbrains text-purple-100 mb-8">
              Join thousands of users who trust our AI to manage their DeFi investments.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
                >
                  <span className='font-jetbrains'>Get Started Now</span>
                  <ArrowRightIcon className="w-5 h-5" />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
