import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import ProgressStepper from '../components/ProgressStepper';
import { CheckIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { depositFunds } from '../utils/mockApi';

const Setup: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [depositAmount, setDepositAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [txHash, setTxHash] = useState('');

  const steps = [
    { id: 1, title: 'Deposit', description: 'Add funds' },
    { id: 2, title: 'Confirm', description: 'Review details' },
    { id: 3, title: 'Complete', description: 'All done!' },
  ];

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return;

    setIsDepositing(true);
    try {
      const hash = await depositFunds(parseFloat(depositAmount), 'USDC');
      setTxHash(hash);
      setCurrentStep(3);
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error('Deposit failed:', error);
    } finally {
      setIsDepositing(false);
    }
  };

  const handleComplete = () => {
    setIsSuccessModalOpen(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Set Up Your DeFi Agent
          </h1>
          <p className="text-gray-600">
            Get started by making your first deposit. Our AI will begin optimizing your yields immediately.
          </p>
        </motion.div>

        {/* Progress Stepper */}
        <ProgressStepper steps={steps} currentStep={currentStep} />

        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
        >
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <CurrencyDollarIcon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Initial Deposit
                </h2>
                <p className="text-gray-600">
                  Start with USDC to begin your autonomous yield farming journey
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                    Deposit Amount (USDC)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="amount"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="1000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                      min="0"
                      step="0.01"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                      USDC
                    </span>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-xl p-4">
                  <h3 className="font-semibold text-purple-900 mb-2">What happens next?</h3>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• AI analyzes optimal yield opportunities</li>
                    <li>• Funds are deployed across multiple protocols</li>
                    <li>• Automatic rebalancing begins immediately</li>
                    <li>• You can track performance in real-time</li>
                  </ul>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentStep(2)}
                  disabled={!depositAmount || parseFloat(depositAmount) <= 0}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </motion.button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Confirm Deposit
                </h2>
                <p className="text-gray-600">
                  Review your deposit details before proceeding
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Deposit Amount:</span>
                  <span className="font-semibold text-gray-900">{depositAmount} USDC</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Initial Strategy:</span>
                  <span className="font-semibold text-gray-900">Conservative Mix</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Expected APR:</span>
                  <span className="font-semibold text-green-600">12-18%</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">You'll Receive:</span>
                    <span className="font-bold text-purple-600">{depositAmount} DA-USDC</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Back
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeposit}
                  disabled={isDepositing}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50"
                >
                  {isDepositing ? 'Processing...' : 'Confirm Deposit'}
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Success Modal */}
      <Transition appear show={isSuccessModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => {}}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 text-center align-middle shadow-xl transition-all">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckIcon className="w-10 h-10 text-green-600" />
                  </motion.div>

                  <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900 mb-4">
                    Deposit Successful!
                  </Dialog.Title>

                  <p className="text-gray-600 mb-6">
                    Your funds have been deposited and our AI has begun optimizing your yield strategy.
                  </p>

                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-600 mb-1">Transaction Hash:</p>
                    <p className="text-sm font-mono text-gray-900 break-all">{txHash}</p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleComplete}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-200"
                  >
                    Go to Dashboard
                  </motion.button>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default Setup;