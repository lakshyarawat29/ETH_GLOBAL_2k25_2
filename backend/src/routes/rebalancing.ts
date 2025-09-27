import express from 'express';
import { oneInchService } from '@/services/oneInchService';
import { yieldService } from '@/services/yieldService';
import { logger } from '@/utils/logger';

const router = express.Router();

/**
 * POST /api/rebalancing/execute
 * Execute rebalancing for a user
 */
router.post('/execute', async (req, res) => {
  try {
    const { userAddress, userPrivateKey } = req.body;

    if (!userAddress || !userPrivateKey) {
      return res.status(400).json({
        success: false,
        error: 'User address and private key are required',
      });
    }

    // Execute rebalancing
    await yieldService.executeUserRebalancing(userAddress, userPrivateKey);

    return res.json({
      success: true,
      message: 'Rebalancing executed successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Rebalancing execution failed', error);
    return res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to execute rebalancing',
    });
  }
});

/**
 * GET /api/rebalancing/history/:userAddress
 * Get rebalancing history for a user
 */
router.get('/history/:userAddress', async (req, res) => {
  try {
    const { userAddress } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    const history = await oneInchService.getUserRebalancingHistory(
      userAddress,
      limit
    );

    return res.json({
      success: true,
      data: history,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to get rebalancing history', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get rebalancing history',
    });
  }
});

/**
 * GET /api/rebalancing/tokens
 * Get supported tokens for rebalancing
 */
router.get('/tokens', async (req, res) => {
  try {
    const tokens = await oneInchService.getSupportedTokens();

    return res.json({
      success: true,
      data: tokens,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to get supported tokens', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get supported tokens',
    });
  }
});

export default router;
