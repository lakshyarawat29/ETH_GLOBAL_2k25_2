import express from 'express';
import { aiAgent } from '@/services/aiAgent';
import { yieldService } from '@/services/yieldService';
import { logger } from '@/utils/logger';

const router = express.Router();

/**
 * POST /api/ai/recommend
 * Get AI recommendation for a user
 */
router.post('/recommend', async (req, res) => {
  try {
    const { userAddress } = req.body;

    if (!userAddress) {
      return res.status(400).json({
        success: false,
        error: 'User address is required',
      });
    }

    const recommendation = await yieldService.getUserRecommendation(
      userAddress
    );

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        error: 'No recommendation available for this user',
      });
    }

    return res.json({
      success: true,
      data: recommendation,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to get AI recommendation', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get AI recommendation',
    });
  }
});

/**
 * GET /api/ai/recommendations/recent
 * Get recent AI recommendations
 */
router.get('/recommendations/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const recommendations = await aiAgent.getRecentRecommendations(limit);

    return res.json({
      success: true,
      data: recommendations,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to get recent recommendations', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get recent recommendations',
    });
  }
});

/**
 * POST /api/ai/analyze
 * Analyze market data and get general recommendation
 */
router.post('/analyze', async (req, res) => {
  try {
    // This would typically use current market data
    // For demo purposes, we'll trigger a yield processing cycle first
    await yieldService.processAllYields();

    const basketYields = await yieldService.getLatestBasketYields();

    // Convert to asset yields format for AI analysis
    const assetYields = basketYields.flatMap((basket) => basket.assetYields);

    // Generate recommendation (this would normally use historical data)
    const recommendation = await aiAgent.recommendBasket(assetYields, []);

    return res.json({
      success: true,
      data: {
        recommendation,
        marketData: basketYields,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to analyze market data', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to analyze market data',
    });
  }
});

export default router;
