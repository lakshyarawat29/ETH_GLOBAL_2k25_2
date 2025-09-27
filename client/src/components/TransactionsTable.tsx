import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  ArrowPathIcon, 
  ArrowsRightLeftIcon,
   ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import type { Transaction } from '../utils/mockApi';

interface TransactionsTableProps {
  transactions: Transaction[];
  loading?: boolean;
}

const getTransactionIcon = (type: Transaction['type']) => {
  switch (type) {
    case 'deposit':
      return <ArrowDownIcon className="w-5 h-5 text-green-600" />;
    case 'withdraw':
      return <ArrowUpIcon className="w-5 h-5 text-red-600" />;
    case 'rebalance':
      return <ArrowPathIcon className="w-5 h-5 text-blue-600" />;
    case 'swap':
      return <ArrowsRightLeftIcon className="w-5 h-5 text-purple-600" />;
    default:
      return null;
  }
};

const getStatusColor = (status: Transaction['status']) => {
  switch (status) {
    case 'completed':
      return 'text-green-600 bg-green-100';
    case 'pending':
      return 'text-yellow-600 bg-yellow-100';
    case 'failed':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

const LoadingSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="p-6 border-b border-gray-100">
      <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
    </div>
    <div className="divide-y divide-gray-100">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="p-4">
          <div className="flex items-center justify-between animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
            <div className="text-right">
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const TransactionsTable: React.FC<TransactionsTableProps> = ({ transactions, loading = false }) => {
  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
      </div>

      <div className="divide-y divide-gray-100">
        {transactions.map((transaction, index) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ backgroundColor: '#fafafa' }}
            className="p-4 hover:bg-gray-50 transition-colors duration-150"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  {getTransactionIcon(transaction.type)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-900 capitalize">
                      {transaction.type}
                    </p>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {transaction.amount} {transaction.token}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-600">
                    {new Date(transaction.timestamp).toLocaleDateString()}
                  </p>
                  <motion.a
                    href={`https://etherscan.io/tx/${transaction.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    < ArrowTopRightOnSquareIcon className="w-4 h-4" />
                  </motion.a>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {transaction.hash.slice(0, 10)}...
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default TransactionsTable;