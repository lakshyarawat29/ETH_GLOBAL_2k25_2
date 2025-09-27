import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import ConnectWalletButton from '../ConnectWalletButton';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'About', href: '/about' },
    { name: 'Profile', href: '/profile' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-black/20 backdrop-blur-lg border-b border-purple-500/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25"
            >
              <span className="text-white font-bold text-lg font-satoshi">DRY</span>
            </motion.div>
            {/* <span className="hidden sm:block font-bold text-xl text-white font-satoshi">DeFi Agent</span> */}
          </Link>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-8 bg-white/5 backdrop-blur-sm rounded-full px-8 py-3 border border-purple-500/20">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`relative px-4 py-2 text-lg font-medium transition-all duration-300 font-satoshi ${
                    isActive(item.href)
                      ? 'text-purple-300 scale-105'
                      : 'text-gray-200 hover:text-purple-300 hover:scale-105'
                  }`}
                >
                  <span className="relative z-10">{item.name}</span>
                  {isActive(item.href) && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 bg-purple-500/20 rounded-lg border border-purple-400/30"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  {!isActive(item.href) && (
                    <motion.div
                      className="absolute inset-0 bg-purple-500/10 rounded-lg opacity-0"
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Connect Wallet Button - Desktop */}
          <div className="hidden md:flex ">
            <ConnectWalletButton />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl text-gray-200 hover:text-purple-300 hover:bg-purple-500/10 border border-purple-500/20 transition-all duration-200"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="md:hidden bg-black/40 backdrop-blur-lg border-t border-purple-500/20"
        >
          <div className="px-4 py-6 space-y-3">
            {navItems.map((item) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Link
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-3 text-lg font-medium rounded-xl transition-all duration-200 font-satoshi ${
                    isActive(item.href)
                      ? 'text-purple-300 bg-purple-500/20 border border-purple-400/30'
                      : 'text-gray-200 hover:text-purple-300 hover:bg-purple-500/10'
                  }`}
                >
                  {item.name}
                </Link>
              </motion.div>
            ))}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="px-4 py-2"
            >
              <ConnectWalletButton />
            </motion.div>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;