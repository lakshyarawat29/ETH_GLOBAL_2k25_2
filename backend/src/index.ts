import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from 'dotenv';
import { validateConfig } from '@/config';
import { db } from '@/database/connection';
import { pythService } from '@/services/pythService';
import { hederaService } from '@/services/hederaService';
import { yieldService } from '@/services/yieldService';
import { logger, httpLogStream } from '@/utils/logger';

// Import routes
import userRoutes from '@/routes/users';
import yieldRoutes from '@/routes/yields';
import basketRoutes from '@/routes/baskets';
import aiRoutes from '@/routes/ai';
import rebalancingRoutes from '@/routes/rebalancing';
import consensusRoutes from '@/routes/consensus';
import healthRoutes from '@/routes/health';

// Load environment variables
config();

// Validate configuration
try {
  validateConfig();
} catch (error) {
  logger.error('Configuration validation failed', error);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production' ? ['https://yourdomain.com'] : true,
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Body parsing middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http(`${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/yields', yieldRoutes);
app.use('/api/baskets', basketRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/rebalancing', rebalancingRoutes);
app.use('/api/consensus', consensusRoutes);
app.use('/api/health', healthRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Hedera AI Basket System API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      users: '/api/users',
      yields: '/api/yields',
      baskets: '/api/baskets',
      ai: '/api/ai',
      rebalancing: '/api/rebalancing',
      consensus: '/api/consensus',
      health: '/api/health',
    },
  });
});

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logger.error('Unhandled error', {
      error: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
    });

    res.status(err.status || 500).json({
      success: false,
      error:
        process.env.NODE_ENV === 'production'
          ? 'Internal server error'
          : err.message,
      timestamp: new Date().toISOString(),
    });
  }
);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
});

// Initialize services
async function initializeServices(): Promise<void> {
  try {
    logger.info('Initializing services...');

    // Connect to databases
    await db.connect();
    logger.info('Database connections established');

    // Initialize Pyth service
    await pythService.initialize();
    logger.info('Pyth service initialized');

    // Initialize Hedera service
    await hederaService.initialize();
    logger.info('Hedera service initialized');

    logger.info('All services initialized successfully');
  } catch (error) {
    logger.error('Service initialization failed', error);
    throw error;
  }
}

// Start server
async function startServer(): Promise<void> {
  try {
    await initializeServices();

    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🔗 API Documentation: http://localhost:${PORT}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);

      server.close(async () => {
        try {
          await db.disconnect();
          await pythService.close();
          await hederaService.close();
          logger.info('All services closed successfully');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown', error);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
startServer().catch((error) => {
  logger.error('Failed to start application', error);
  process.exit(1);
});

export default app;
