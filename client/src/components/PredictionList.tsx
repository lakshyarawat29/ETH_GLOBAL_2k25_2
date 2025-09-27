import React from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon, ClockIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import type { Prediction } from '../utils/mockApi';

interface PredictionListProps {
  predictions: Prediction[];
  loading?: boolean;
}

const PredictionCard: React.FC<{ prediction: Prediction; index: number }> = ({ 
  prediction, 
  index 
}) => {
  const confidenceColor = prediction.confidence >= 80 
    ? 'text-green-600 bg-green-100' 
    : prediction.confidence >= 60 
    ? 'text-yellow-600 bg-yellow-100' 
    : 'text-red-600 bg-red-100';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, x: 4 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{prediction.strategy}</h4>
            <div className="flex items-center space-x-2 mt-1">
              <ClockIcon className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">{prediction.timeframe}</span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center space-x-2">
            <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />
            <span className="font-semibold text-green-600">
              +{prediction.expectedReturn}%
            </span>
          </div>
          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${confidenceColor} mt-1`}>
            {prediction.confidence}% confidence
          </span>
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-4">{prediction.description}</p>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {new Date(prediction.timestamp).toLocaleString()}
        </span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
        >
          Execute
        </motion.button>
      </div>
    </motion.div>
  );
};

const LoadingSkeleton: React.FC = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, index) => (
      <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
            <div className="text-right">
              <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
          <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="flex justify-between items-center">
            <div className="h-3 bg-gray-200 rounded w-24"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const PredictionList: React.FC<PredictionListProps> = ({ predictions, loading = false }) => {
  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-4">
      {predictions.map((prediction, index) => (
        <PredictionCard 
          key={prediction.id} 
          prediction={prediction} 
          index={index}
        />
      ))}
    </div>
  );
};

export default PredictionList;