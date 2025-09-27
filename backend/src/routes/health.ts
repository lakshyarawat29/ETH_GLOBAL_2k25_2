import express from 'express';
import { db } from '@/database/connection';
import { pythService } from '@/services/pythService';
import { hederaService } from '@/services/hederaService';
import { yieldService } from '@/services/yieldService';
import { logger } from '@/utils/logger';

const router = express.Router();

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/', async (req, res) => {
  try {
    const startTime = Date.now();

    // Check database connections
    const dbHealth = await db.healthCheck();

    // Check service status
    const processingStatus = yieldService.getProcessingStatus();
    const consensusTopicId = hederaService.getConsensusTopicId();

    const responseTime = Date.now() - startTime;

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      services: {
        database: {
          postgres: dbHealth.postgres ? 'healthy' : 'unhealthy',
          redis: dbHealth.redis ? 'healthy' : 'unhealthy',
        },
        pyth: 'healthy', // Assume healthy if no errors
        hedera: consensusTopicId ? 'healthy' : 'initializing',
        ai: 'healthy', // Assume healthy if no errors
        oneinch: 'healthy', // Assume healthy if no errors
      },
      processing: {
        isProcessing: processingStatus.isProcessing,
        lastProcessTime:
          processingStatus.lastProcessTime?.toISOString() || null,
      },
      consensus: {
        topicId: consensusTopicId,
      },
    };

    const isHealthy = dbHealth.postgres && dbHealth.redis && consensusTopicId;
    const statusCode = isHealthy ? 200 : 503;

    res.status(statusCode).json(health);
  } catch (error) {
    logger.error('Health check failed', error);

    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      services: {
        database: { postgres: 'unhealthy', redis: 'unhealthy' },
        pyth: 'unhealthy',
        hedera: 'unhealthy',
        ai: 'unhealthy',
        oneinch: 'unhealthy',
      },
    });
  }
});

/**
 * GET /api/health/detailed
 * Detailed health check with service-specific information
 */
router.get('/detailed', async (req, res) => {
  try {
    const detailedHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: await getDatabaseHealth(),
        pyth: await getPythHealth(),
        hedera: await getHederaHealth(),
        yieldProcessing: yieldService.getProcessingStatus(),
      },
    };

    const hasUnhealthyServices = Object.values(detailedHealth.services).some(
      (service) => service.status === 'unhealthy'
    );

    const statusCode = hasUnhealthyServices ? 503 : 200;

    res.status(statusCode).json(detailedHealth);
  } catch (error) {
    logger.error('Detailed health check failed', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Detailed health check failed',
    });
  }
});

/**
 * GET /api/health/ready
 * Readiness check for Kubernetes
 */
router.get('/ready', async (req, res) => {
  try {
    const dbHealth = await db.healthCheck();
    const consensusTopicId = hederaService.getConsensusTopicId();

    const isReady = dbHealth.postgres && dbHealth.redis && consensusTopicId;

    if (isReady) {
      res.status(200).json({ status: 'ready' });
    } else {
      res.status(503).json({ status: 'not ready' });
    }
  } catch (error) {
    logger.error('Readiness check failed', error);
    res.status(503).json({ status: 'not ready', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * GET /api/health/live
 * Liveness check for Kubernetes
 */
router.get('/live', (req, res) => {
  res.status(200).json({ status: 'alive' });
});

// Helper functions for detailed health checks
async function getDatabaseHealth(): Promise<any> {
  try {
    const dbHealth = await db.healthCheck();
    const connectionCount = await db.query(
      'SELECT count(*) FROM pg_stat_activity'
    );

    return {
      status: dbHealth.postgres && dbHealth.redis ? 'healthy' : 'unhealthy',
      postgres: {
        connected: dbHealth.postgres,
        connectionCount: connectionCount.rows[0].count,
      },
      redis: {
        connected: dbHealth.redis,
      },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function getPythHealth(): Promise<any> {
  try {
    // Try to fetch current prices to test Pyth connection
    const prices = await pythService.fetchCurrentPrices();

    return {
      status: 'healthy',
      priceFeeds: prices.size,
      lastUpdate: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function getHederaHealth(): Promise<any> {
  try {
    const consensusTopicId = hederaService.getConsensusTopicId();

    return {
      status: consensusTopicId ? 'healthy' : 'initializing',
      consensusTopicId,
      network: process.env.HEDERA_NETWORK || 'testnet',
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export default router;
