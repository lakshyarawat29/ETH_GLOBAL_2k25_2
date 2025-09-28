import React from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

interface PortfolioChartProps {
  data: any;
  loading: boolean;
  onTimeframeChange: (timeframe: string) => void;
  currentBasket: number;
}

const BASKET_CONFIGS = {
  0: { name: 'Conservative', color: '#10B981' },
  1: { name: 'Balanced', color: '#3B82F6' },
  2: { name: 'Growth', color: '#8B5CF6' },
};

const PortfolioChart: React.FC<PortfolioChartProps> = ({
  data,
  loading,
  onTimeframeChange,
  currentBasket,
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = React.useState('7d');

  const handleTimeframeChange = (timeframe: string) => {
    setSelectedTimeframe(timeframe);
    onTimeframeChange(timeframe);
  };

  const basketConfig =
    BASKET_CONFIGS[currentBasket as keyof typeof BASKET_CONFIGS];

  // Generate mock portfolio data based on basket selection
  const generatePortfolioData = () => {
    const timeframes = {
      '1d': 24,
      '7d': 7,
      '30d': 30,
      '90d': 90,
    };

    const points =
      timeframes[selectedTimeframe as keyof typeof timeframes] || 7;
    const data = [];

    // Base values based on basket type
    const baseValues = {
      0: { initial: 10000, volatility: 0.02 }, // Conservative
      1: { initial: 10000, volatility: 0.04 }, // Balanced
      2: { initial: 10000, volatility: 0.08 }, // Growth
    };

    const config =
      baseValues[currentBasket as keyof typeof baseValues] || baseValues[1];
    let currentValue = config.initial;

    for (let i = 0; i < points; i++) {
      // Generate realistic price movements
      const change = (Math.random() - 0.5) * config.volatility;
      currentValue = currentValue * (1 + change);

      const date = new Date();
      if (selectedTimeframe === '1d') {
        date.setHours(date.getHours() - (points - i));
        data.push({
          time: date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          value: Math.round(currentValue),
          timestamp: date.getTime(),
        });
      } else {
        date.setDate(date.getDate() - (points - i));
        data.push({
          time: date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          value: Math.round(currentValue),
          timestamp: date.getTime(),
        });
      }
    }

    return data;
  };

  const portfolioData = generatePortfolioData();
  const currentValue = portfolioData[portfolioData.length - 1]?.value || 10000;
  const initialValue = portfolioData[0]?.value || 10000;
  const performance = ((currentValue - initialValue) / initialValue) * 100;

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">
          Portfolio Performance
        </h3>
        <div className="h-64 bg-gray-800/50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-400">Loading chart data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Portfolio Performance</h3>
        <div className="flex items-center space-x-2">
          {['1d', '7d', '30d', '90d'].map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => handleTimeframeChange(timeframe)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedTimeframe === timeframe
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {timeframe}
            </button>
          ))}
        </div>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <p className="text-gray-400 text-sm">Current Value</p>
          <p className="text-2xl font-bold text-white">
            ${currentValue.toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-sm">Performance</p>
          <p
            className={`text-2xl font-bold ${
              performance >= 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {performance >= 0 ? '+' : ''}
            {performance.toFixed(2)}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-sm">Strategy</p>
          <p className="text-2xl font-bold text-white">{basketConfig?.name}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={portfolioData}>
            <defs>
              <linearGradient
                id={`colorGradient-${currentBasket}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={basketConfig?.color}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={basketConfig?.color}
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
            <YAxis
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB',
              }}
              formatter={(value: any) => [
                `$${value.toLocaleString()}`,
                'Portfolio Value',
              ]}
              labelFormatter={(label) => `Time: ${label}`}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={basketConfig?.color}
              strokeWidth={2}
              fill={`url(#colorGradient-${currentBasket})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Legend */}
      <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: basketConfig?.color }}
          ></div>
          <span className="text-gray-400">Portfolio Value</span>
        </div>
        <div className="text-gray-400">
          {basketConfig?.name} Strategy • {selectedTimeframe} performance
        </div>
      </div>
    </div>
  );
};

export default PortfolioChart;
