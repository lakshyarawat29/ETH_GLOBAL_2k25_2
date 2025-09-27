import express from 'express';
import { BASKET_CONFIGS } from '@/config';

const router = express.Router();

/**
 * GET /api/baskets
 * Get all available baskets
 */
router.get('/', (req, res) => {
  try {
    const baskets = Object.entries(BASKET_CONFIGS).map(([id, config]) => ({
      id: parseInt(id),
      name: config.name,
      riskProfile: config.riskProfile,
      assets: config.assets,
    }));

    return res.json({
      success: true,
      data: baskets,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to get baskets',
    });
  }
});

/**
 * GET /api/baskets/:id
 * Get specific basket configuration
 */
router.get('/:id', (req, res) => {
  try {
    const basketId = parseInt(req.params.id);

    if (basketId < 0 || basketId > 2) {
      return res.status(400).json({
        success: false,
        error: 'Invalid basket ID. Must be 0, 1, or 2.',
      });
    }

    const config = BASKET_CONFIGS[basketId as keyof typeof BASKET_CONFIGS];

    if (!config) {
      return res.status(404).json({
        success: false,
        error: 'Basket not found',
      });
    }

    return res.json({
      success: true,
      data: {
        id: basketId,
        name: config.name,
        riskProfile: config.riskProfile,
        assets: config.assets,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to get basket',
    });
  }
});

export default router;
