import express from 'express';
import { yieldService } from '@/services/yieldService';
import { pythService } from '@/services/pythService';
import { logger } from '@/utils/logger';
import { BASKET_CONFIGS } from '@/config';
import { db } from '@/database/connection';

const router = express.Router();

/**
 * POST /api/yields/process
 * Trigger yield processing manually
 */
router.post('/process', async (req, res) => {
  try {
    await yieldService.processAllYields();

    return res.json({
      success: true,
      message: 'Yield processing completed successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Manual yield processing failed', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process yields',
    });
  }
});

/**
 * GET /api/yields/latest
 * Get latest yield data for all baskets
 */
router.get('/latest', async (req, res) => {
  try {
    const basketYields = await yieldService.getLatestBasketYields();

    return res.json({
      success: true,
      data: basketYields,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to get latest yields', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get latest yields',
    });
  }
});

/**
 * GET /api/yields/assets
 * Get latest yield data for individual assets
 */
router.get('/assets', async (req, res) => {
  try {
    const assetYields = await pythService.getLatestYields();

    return res.json({
      success: true,
      data: assetYields,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to get asset yields', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get asset yields',
    });
  }
});

/**
 * GET /api/yields/processing-status
 * Get yield processing status
 */
router.get('/processing-status', (req, res) => {
  try {
    const status = yieldService.getProcessingStatus();

    return res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to get processing status', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get processing status',
    });
  }
});

/**
 * GET /api/yields/basket/:basketId/chart
 * Get basket price chart data using Pyth historical data
 */
router.get('/basket/:basketId/chart', async (req, res) => {
  try {
    const { basketId } = req.params;
    const { timeframe = '7d' } = req.query;

    if (!['0', '1', '2'].includes(basketId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid basket ID. Must be 0, 1, or 2.',
      });
    }

    const basketConfig =
      BASKET_CONFIGS[parseInt(basketId) as keyof typeof BASKET_CONFIGS];

    // Calculate days based on timeframe
    let days = 7;
    switch (timeframe) {
      case '1d':
        days = 1;
        break;
      case '7d':
        days = 7;
        break;
      case '30d':
        days = 30;
        break;
      case '90d':
        days = 90;
        break;
      default:
        days = 7;
    }

    // Get historical yields for the basket
    const yieldsResult = await db.query(
      `SELECT * FROM basket_history WHERE basket_id = $1 AND timestamp >= NOW() - INTERVAL '${days} days' ORDER BY timestamp ASC`,
      [basketId]
    );

    // Get historical asset prices (mock data for now - in production, use Pyth historical data)
    const mockHistoricalData = generateMockHistoricalData(basketConfig, days);

    logger.info(
      `Retrieved chart data for basket ${basketId}, timeframe: ${timeframe}`
    );

    return res.status(200).json({
      success: true,
      data: {
        basketId: parseInt(basketId),
        basketName: basketConfig.name,
        timeframe,
        chartData: {
          prices: mockHistoricalData.prices,
          yields: yieldsResult.rows,
          portfolio: mockHistoricalData.portfolio,
        },
        metadata: {
          totalPoints: mockHistoricalData.prices.length,
          startDate: mockHistoricalData.prices[0]?.timestamp,
          endDate:
            mockHistoricalData.prices[mockHistoricalData.prices.length - 1]
              ?.timestamp,
          assets: basketConfig.assets.map((asset: any) => asset.symbol),
        },
      },
    });
  } catch (error) {
    logger.error('Error retrieving basket chart data:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Helper function to generate mock historical data
 * In production, this would fetch real data from Pyth Network
 */
function generateMockHistoricalData(basketConfig: any, days: number) {
  const now = new Date();
  const prices = [];
  const portfolio = [];

  // Generate hourly data points
  const hours = days * 24;

  for (let i = hours; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);

    // Mock price data with some volatility
    const basePrices = {
      USDC: 1.0,
      ETH: 2500.0,
      BTC: 45000.0,
      SOL: 100.0,
      LINK: 15.0,
      AVAX: 25.0,
      MATIC: 0.8,
    };

    const assetPrices = basketConfig.assets.map((asset: any) => {
      const basePrice =
        basePrices[asset.symbol as keyof typeof basePrices] || 1;
      const volatility = 0.02; // 2% volatility
      const randomFactor = 1 + (Math.random() - 0.5) * volatility;
      const price = basePrice * randomFactor;

      return {
        symbol: asset.symbol,
        price: price,
        allocation: asset.allocation / 100,
      };
    });

    // Calculate weighted portfolio value
    const totalValue = assetPrices.reduce(
      (sum: number, asset: any) => sum + asset.price * asset.allocation * 10000,
      0
    );

    prices.push({
      timestamp: timestamp.toISOString(),
      assets: assetPrices,
      totalValue: totalValue,
    });

    portfolio.push({
      timestamp: timestamp.toISOString(),
      value: totalValue,
      assets: assetPrices,
    });
  }

  return { prices, portfolio };
}

export default router;
