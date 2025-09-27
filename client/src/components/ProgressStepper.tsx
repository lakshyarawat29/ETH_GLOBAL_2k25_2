import React from 'react';
import { motion } from 'framer-motion';
import { CheckIcon } from '@heroicons/react/24/solid';

interface Step {
  id: number;
  title: string;
  description: string;
}

interface ProgressStepperProps {
  steps: Step[];
  currentStep: number;
}

const ProgressStepper: React.FC<ProgressStepperProps> = ({ steps, currentStep }) => {
  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            {/* Step Circle */}
            <div className="relative flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  step.id < currentStep
                    ? 'bg-purple-600 border-purple-600 text-white'
                    : step.id === currentStep
                    ? 'bg-purple-100 border-purple-600 text-purple-600'
                    : 'bg-gray-100 border-gray-300 text-gray-400'
                }`}
              >
                {step.id < currentStep ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <CheckIcon className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <span className="text-sm font-medium">{step.id}</span>
                )}
              </motion.div>

              {/* Step Content */}
              <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-center">
                <p
                  className={`text-sm font-medium ${
                    step.id <= currentStep ? 'text-purple-600' : 'text-gray-400'
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-xs text-gray-500 mt-1 max-w-20">
                  {step.description}
                </p>
              </div>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 mx-4">
                <motion.div
                  className="h-0.5 bg-gray-200 relative overflow-hidden"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                >
                  <motion.div
                    className="h-full bg-purple-600 absolute top-0 left-0"
                    initial={{ width: '0%' }}
                    animate={{
                      width: step.id < currentStep ? '100%' : '0%',
                    }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                </motion.div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressStepper;