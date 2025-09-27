import express from 'express';
import { yieldService } from '@/services/yieldService';
import { pythService } from '@/services/pythService';
import { logger } from '@/utils/logger';

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

export default router;
