import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface BasketChartProps {
  chartData: {
    basketId: number;
    basketName: string;
    timeframe: string;
    chartData: {
      prices: Array<{
        timestamp: string;
        totalValue: number;
        assets: Array<{
          symbol: string;
          price: number;
          allocation: number;
        }>;
      }>;
      yields: any[];
      portfolio: Array<{
        timestamp: string;
        value: number;
        assets: any[];
      }>;
    };
    metadata: {
      totalPoints: number;
      startDate: string;
      endDate: string;
      assets: string[];
    };
  };
  loading?: boolean;
  onTimeframeChange?: (timeframe: string) => void;
}

const BasketChart: React.FC<BasketChartProps> = ({
  chartData,
  loading = false,
  onTimeframeChange,
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');

  const timeframes = [
    { value: '1d', label: '1 Day' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
  ];

  const handleTimeframeChange = (timeframe: string) => {
    setSelectedTimeframe(timeframe);
    onTimeframeChange?.(timeframe);
  };

  // Format data for the chart
  const formatChartData = () => {
    if (!chartData?.chartData?.prices) return [];

    return chartData.chartData.prices.map((point, index) => ({
      time: new Date(point.timestamp).toLocaleDateString(),
      value: point.totalValue,
      timestamp: point.timestamp,
    }));
  };

  const chartDataFormatted = formatChartData();

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </motion.div>
    );
  }

  if (!chartData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <div className="text-center py-12">
          <p className="text-gray-500">No chart data available</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {chartData.basketName} Portfolio Performance
          </h3>
          <p className="text-sm text-gray-500">
            {chartData.metadata.assets.join(', ')} •{' '}
            {chartData.metadata.totalPoints} data points
          </p>
        </div>

        <div className="flex space-x-2">
          {timeframes.map((timeframe) => (
            <button
              key={timeframe.value}
              onClick={() => handleTimeframeChange(timeframe.value)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                selectedTimeframe === timeframe.value
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {timeframe.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartDataFormatted}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="time"
              stroke="#6b7280"
              fontSize={12}
              tick={{ fill: '#6b7280' }}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tick={{ fill: '#6b7280' }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value: number) => [
                `$${value.toLocaleString()}`,
                'Portfolio Value',
              ]}
              labelStyle={{ color: '#374151' }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <span>
          From {new Date(chartData.metadata.startDate).toLocaleDateString()} to{' '}
          {new Date(chartData.metadata.endDate).toLocaleDateString()}
        </span>
        <span>{chartData.metadata.totalPoints} data points</span>
      </div>
    </motion.div>
  );
};

export default BasketChart;
