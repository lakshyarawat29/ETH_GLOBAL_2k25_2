import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useAccount } from 'wagmi';
import {
  fetchUserProfile,
  updateUserProfile,
  completeUserProfile,
  fetchWalletBalance,
  validateDeposit,
  fetchUserDashboard,
  fetchUserPortfolio,
  fetchUserTransactions,
  fetchBasketChart,
} from '../services/api';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  duration?: number;
}

const FeatureTestPanel: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTest = async (
    testName: string,
    testFn: () => Promise<any>
  ): Promise<TestResult> => {
    const startTime = Date.now();
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      return {
        name: testName,
        status: 'success',
        message: 'Test passed successfully',
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        name: testName,
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration,
      };
    }
  };

  const runAllTests = async () => {
    if (!address || !isConnected) {
      alert('Please connect your wallet first!');
      return;
    }

    setIsRunning(true);
    setTestResults([]);

    const tests = [
      {
        name: 'Fetch User Profile',
        test: () => fetchUserProfile(address),
      },
      {
        name: 'Fetch Wallet Balance',
        test: () => fetchWalletBalance(address),
      },
      {
        name: 'Validate Deposit (1 ETH)',
        test: () => validateDeposit(address, '1.0', 'ETH'),
      },
      {
        name: 'Fetch User Dashboard',
        test: () => fetchUserDashboard(address),
      },
      {
        name: 'Fetch User Portfolio',
        test: () => fetchUserPortfolio(address),
      },
      {
        name: 'Fetch User Transactions',
        test: () => fetchUserTransactions(address),
      },
      {
        name: 'Fetch Basket Chart Data',
        test: () => fetchBasketChart(2, '7d'),
      },
      {
        name: 'Update User Profile',
        test: () =>
          updateUserProfile(address, {
            displayName: 'Test User Updated',
            riskPreference: 'Moderate',
            initialDepositAmount: 1500,
            investmentPeriod: '6 months',
          }),
      },
    ];

    const results: TestResult[] = [];

    for (const test of tests) {
      const result = await runTest(test.name, test.test);
      results.push(result);
      setTestResults([...results]);

      // Small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-400" />;
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'border-green-400/30 bg-green-500/10';
      case 'error':
        return 'border-red-400/30 bg-red-500/10';
      case 'pending':
        return 'border-yellow-400/30 bg-yellow-500/10';
    }
  };

  const successCount = testResults.filter((r) => r.status === 'success').length;
  const errorCount = testResults.filter((r) => r.status === 'error').length;
  const totalTests = testResults.length;

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Feature Test Panel</h3>
        <button
          onClick={runAllTests}
          disabled={isRunning || !isConnected}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          {isRunning ? 'Running Tests...' : 'Run All Tests'}
        </button>
      </div>

      {!isConnected && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-400/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
            <p className="text-yellow-300">
              Please connect your wallet to run tests
            </p>
          </div>
        </div>
      )}

      {totalTests > 0 && (
        <div className="mb-6 p-4 bg-white/5 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-400">
                {successCount}
              </p>
              <p className="text-sm text-gray-400">Passed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">{errorCount}</p>
              <p className="text-sm text-gray-400">Failed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalTests}</p>
              <p className="text-sm text-gray-400">Total</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {testResults.map((result, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(result.status)}
                <div>
                  <p className="text-white font-medium">{result.name}</p>
                  <p className="text-sm text-gray-400">{result.message}</p>
                </div>
              </div>
              {result.duration && (
                <p className="text-sm text-gray-400">{result.duration}ms</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {isRunning && (
        <div className="mt-6 text-center">
          <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-400">Running tests...</p>
        </div>
      )}
    </div>
  );
};

export default FeatureTestPanel;
