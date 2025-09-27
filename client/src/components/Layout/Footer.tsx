import React from 'react';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[url('assets/footer/bg.svg')] bg-cover bg-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-md">DRY</span>
              </div>
              {/* <span className="font-bold text-xl text-gray-900">DeFi Agent</span> */}
            </div>
            <p className="text-gray-100 max-w-md mb-4">
              Autonomous DeFi yield optimization powered by AI. Scan multiple blockchains, 
              predict optimal strategies, and rebalance funds in real-time.
            </p>
            <div className="flex space-x-4">
              {['Twitter', 'Discord', 'GitHub'].map((platform) => (
                <motion.a
                  key={platform}
                  href="#"
                  whileHover={{ scale: 1.1 }}
                  className="text-gray-400 hover:text-purple-600 transition-colors"
                >
                  {platform}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Platform</h3>
            <ul className="space-y-2">
              {['Dashboard', 'Features', 'Pricing', 'Security'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-100 hover:text-purple-600 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Resources</h3>
            <ul className="space-y-2">
              {['Documentation', 'API', 'Support', 'Status'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-100 hover:text-purple-600 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm">
            © 2025 DeFi Agent. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
              <a
                key={item}
                href="#"
                className="text-gray-600 hover:text-purple-600 text-sm transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;