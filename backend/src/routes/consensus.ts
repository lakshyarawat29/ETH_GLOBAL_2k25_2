import express from 'express';
import { hederaService } from '@/services/hederaService';
import { logger } from '@/utils/logger';

const router = express.Router();

/**
 * GET /api/consensus/events
 * Get consensus events from Hedera
 */
router.get('/events', async (req, res) => {
  try {
    const { eventType, userAddress, limit } = req.query;
    const limitNum = parseInt(limit as string) || 50;

    const events = await hederaService.getConsensusEvents(
      eventType as string,
      userAddress as string,
      limitNum
    );

    return res.json({
      success: true,
      data: events,
      timestamp: new Date().toISOString(),
    });
    } catch (error) {
      logger.error('Failed to get consensus events', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to get consensus events',
      });
    }
});

/**
 * GET /api/consensus/topic
 * Get consensus topic information
 */
router.get('/topic', (req, res) => {
  try {
    const topicId = hederaService.getConsensusTopicId();

    return res.json({
      success: true,
      data: {
        topicId,
        network: process.env.HEDERA_NETWORK || 'testnet',
      },
      timestamp: new Date().toISOString(),
    });
    } catch (error) {
      logger.error('Failed to get consensus topic info', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to get consensus topic information',
      });
    }
});

export default router;
