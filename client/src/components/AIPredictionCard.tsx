import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BoltIcon,
  SparklesIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { apiService } from '../services/api';

interface AIPrediction {
  predicted_apr: number;
  recommended_chain: string;
  recommended_protocol: string;
  confidence: number;
  expected_net_yield: number;
  risk_score: number;
}

const AIPredictionCard: React.FC = () => {
  const [prediction, setPrediction] = useState<AIPrediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePrediction = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiService.triggerPrediction();
      setPrediction(result);
    } catch (err) {
      setError('Failed to generate AI prediction');
      console.error('AI prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Generate initial prediction on mount
    generatePrediction();
  }, []);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.7) return 'text-green-600';
    if (confidence >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore <= 0.3) return 'text-green-600';
    if (riskScore <= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <BoltIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              AI Prediction
            </h3>
            <p className="text-sm text-gray-500">
              Real-time yield optimization
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={generatePrediction}
          disabled={loading}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50"
        >
          <SparklesIcon className="h-4 w-4" />
          <span>{loading ? 'Analyzing...' : 'Refresh'}</span>
        </motion.button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {loading && !prediction && (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      )}

      {prediction && (
        <div className="space-y-4">
          {/* Main Prediction */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">
                  Recommended Strategy
                </p>
                <p className="text-2xl font-bold text-green-800">
                  {prediction.predicted_apr.toFixed(2)}% APR
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-700">Expected Net Yield</p>
                <p className="text-xl font-semibold text-green-800">
                  {prediction.expected_net_yield.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Target Chain
              </p>
              <p className="text-sm font-medium text-gray-900 capitalize">
                {prediction.recommended_chain}
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Protocol
              </p>
              <p className="text-sm font-medium text-gray-900 capitalize">
                {prediction.recommended_protocol}
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Confidence
              </p>
              <p
                className={`text-sm font-medium ${getConfidenceColor(
                  prediction.confidence
                )}`}
              >
                {(prediction.confidence * 100).toFixed(1)}%
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Risk Score
              </p>
              <p
                className={`text-sm font-medium ${getRiskColor(
                  prediction.risk_score
                )}`}
              >
                {(prediction.risk_score * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Action Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-medium flex items-center justify-center space-x-2 hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
          >
            <ChartBarIcon className="h-5 w-5" />
            <span>Execute AI Strategy</span>
          </motion.button>
        </div>
      )}

      {/* Info Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          AI predictions are based on real-time market data and historical
          patterns. Past performance does not guarantee future results.
        </p>
      </div>
    </motion.div>
  );
};

export default AIPredictionCard;
