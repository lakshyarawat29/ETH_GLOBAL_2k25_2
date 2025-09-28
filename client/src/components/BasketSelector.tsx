import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

interface BasketSelectorProps {
  onSelect: (basketId: number) => void;
  currentBasket?: number;
  loading?: boolean;
}

const BASKET_OPTIONS = [
  {
    id: 0,
    name: 'Conservative',
    riskProfile: 'Low Risk',
    description: 'Stable returns with minimal volatility',
    assets: ['USDC 60%', 'ETH 20%', 'BTC 20%'],
    expectedYield: '4-6%',
    color: 'green',
  },
  {
    id: 1,
    name: 'Balanced',
    riskProfile: 'Medium Risk',
    description: 'Balanced growth with moderate risk',
    assets: ['ETH 40%', 'BTC 30%', 'SOL 20%', 'LINK 10%'],
    expectedYield: '8-12%',
    color: 'blue',
  },
  {
    id: 2,
    name: 'Growth',
    riskProfile: 'High Risk',
    description: 'Maximum growth potential with higher volatility',
    assets: ['SOL 40%', 'AVAX 30%', 'LINK 20%', 'MATIC 10%'],
    expectedYield: '12-20%',
    color: 'purple',
  },
];

const BasketSelector: React.FC<BasketSelectorProps> = ({
  onSelect,
  currentBasket,
  loading = false,
}) => {
  const [selectedBasket, setSelectedBasket] = useState<number | null>(null);

  const handleSelect = (basketId: number) => {
    setSelectedBasket(basketId);
    onSelect(basketId);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">
        Choose Your Investment Strategy
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {BASKET_OPTIONS.map((basket) => (
          <motion.div
            key={basket.id}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect(basket.id)}
            className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              selectedBasket === basket.id
                ? `border-${basket.color}-400 bg-${basket.color}-500/20`
                : 'border-gray-600 hover:border-gray-500 bg-white/5 hover:bg-white/10'
            }`}
          >
            {currentBasket === basket.id && (
              <div className="absolute top-3 right-3">
                <div
                  className={`w-6 h-6 rounded-full bg-${basket.color}-500 flex items-center justify-center`}
                >
                  <CheckIcon className="w-4 h-4 text-white" />
                </div>
              </div>
            )}

            <div className="text-center mb-4">
              <div
                className={`w-12 h-12 rounded-full bg-${basket.color}-500/20 flex items-center justify-center mx-auto mb-3`}
              >
                <span className="text-2xl font-bold text-white">
                  {basket.name.charAt(0)}
                </span>
              </div>
              <h4 className="text-xl font-bold text-white mb-1">
                {basket.name}
              </h4>
              <p className="text-sm text-gray-400">{basket.riskProfile}</p>
            </div>

            <div className="space-y-3">
              <p className="text-gray-300 text-sm">{basket.description}</p>

              <div>
                <p className="text-xs text-gray-400 mb-1">Expected Yield:</p>
                <p className="text-green-400 font-semibold">
                  {basket.expectedYield}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Asset Allocation:</p>
                <div className="space-y-1">
                  {basket.assets.map((asset, index) => (
                    <p key={index} className="text-xs text-gray-300">
                      {asset}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-600">
              <button
                disabled={loading}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  selectedBasket === basket.id
                    ? `bg-${basket.color}-600 text-white`
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Selecting...
                  </div>
                ) : selectedBasket === basket.id ? (
                  <div className="flex items-center justify-center">
                    Selected
                    <CheckIcon className="w-4 h-4 ml-2" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Select Strategy
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </div>
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {selectedBasket !== null && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-green-500/10 border border-green-400/30 rounded-lg"
        >
          <p className="text-green-300 text-sm">
            ✅ {BASKET_OPTIONS[selectedBasket].name} strategy selected. This
            will optimize your portfolio for{' '}
            {BASKET_OPTIONS[selectedBasket].riskProfile.toLowerCase()} returns.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default BasketSelector;
