import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const data = [
  { name: 'Jan', apr: 8.5, prediction: 9.2 },
  { name: 'Feb', apr: 10.2, prediction: 11.5 },
  { name: 'Mar', apr: 12.8, prediction: 14.1 },
  { name: 'Apr', apr: 15.3, prediction: 16.8 },
  { name: 'May', apr: 14.7, prediction: 15.9 },
  { name: 'Jun', apr: 16.2, prediction: 18.5 },
  { name: 'Jul', apr: 18.9, prediction: 21.2 },
];

const APRChart: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">APR Trends</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
            <span className="text-gray-600">Current APR</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-indigo-400 rounded-full opacity-70"></div>
            <span className="text-gray-600">AI Prediction</span>
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              stroke="#64748b"
              fontSize={12}
            />
            <YAxis 
              stroke="#64748b"
              fontSize={12}
              domain={['dataMin - 2', 'dataMax + 2']}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              }}
            />
            <Line 
              type="monotone" 
              dataKey="apr" 
              stroke="#7c3aed" 
              strokeWidth={3}
              dot={{ fill: '#7c3aed', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#7c3aed', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="prediction" 
              stroke="#6366f1" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#6366f1', strokeWidth: 2, r: 3 }}
              opacity={0.7}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default APRChart;