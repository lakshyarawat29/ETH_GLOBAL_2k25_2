import { pythService } from './pythService';
import { aiAgent } from './aiAgent';
import { oneInchService } from './oneInchService';
import { hederaService } from './hederaService';
import { BASKET_CONFIGS } from '@/config';
import { YieldData, BasketYield, AIRecommendation, RiskProfile } from '@/types';
import { db } from '@/database/connection';
import { logger } from '@/utils/logger';

export class YieldService {
  private isProcessing = false;
  private lastProcessTime: Date | null = null;

  /**
   * Process all yields and generate AI recommendations
   */
  public async processAllYields(): Promise<void> {
    if (this.isProcessing) {
      logger.warn('Yield processing already in progress, skipping...');
      return;
    }

    this.isProcessing = true;
    const startTime = Date.now();

    try {
      logger.info('Starting yield processing cycle');

      // Step 1: Fetch and process yield data from Pyth
      const yieldData = await pythService.processAllYields();
      logger.info(`Processed ${yieldData.length} asset yields`);

      // Step 2: Calculate basket yields
      const basketYields = await this.calculateBasketYields(yieldData);
      logger.info(`Calculated ${basketYields.length} basket yields`);

      // Step 3: Store basket yields in database
      await this.storeBasketYields(basketYields);

      // Step 4: Generate AI recommendations
      const recommendations = await this.generateAIRecommendations(
        basketYields
      );
      logger.info(`Generated ${recommendations.length} AI recommendations`);

      // Step 5: Log yield updates to Hedera
      await this.logYieldUpdates(basketYields);

      this.lastProcessTime = new Date();

      const duration = Date.now() - startTime;
      logger.info(`Yield processing completed in ${duration}ms`);
    } catch (error) {
      logger.error('Yield processing failed', error);
      throw error;
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Calculate yields for all baskets based on asset yields
   */
  private async calculateBasketYields(
    assetYields: YieldData[]
  ): Promise<BasketYield[]> {
    const basketYields: BasketYield[] = [];

    // Create a map for quick asset lookup
    const assetYieldMap = new Map<string, YieldData>();
    assetYields.forEach((yieldData) => {
      assetYieldMap.set(yieldData.asset, yieldData);
    });

    // Calculate yields for each basket
    for (const [basketId, config] of Object.entries(BASKET_CONFIGS)) {
      const basketIdNum = parseInt(basketId);

      let weightedYield = 0;
      let totalAllocation = 0;
      const assetYieldsForBasket: YieldData[] = [];

      // Calculate weighted yield for this basket
      for (const asset of config.assets) {
        const assetYield = assetYieldMap.get(asset.symbol);
        if (assetYield) {
          const allocation = asset.allocation / 10000; // Convert from basis points
          const contribution = assetYield.apr * allocation;
          weightedYield += contribution;
          totalAllocation += allocation;

          assetYieldsForBasket.push({
            ...assetYield,
            apr: Math.round(assetYield.apr * allocation), // Weighted APR contribution
          });
        }
      }

      // Calculate average yield (simple average of asset yields)
      const averageYield =
        assetYieldsForBasket.length > 0
          ? assetYieldsForBasket.reduce(
              (sum, yieldData) => sum + yieldData.apr,
              0
            ) / assetYieldsForBasket.length
          : 0;

      const basketYield: BasketYield = {
        basketId: basketIdNum,
        basketName: config.name,
        averageYield: Math.round(averageYield),
        weightedYield: Math.round(weightedYield),
        assetYields: assetYieldsForBasket,
        timestamp: new Date(),
      };

      basketYields.push(basketYield);

      // Cache basket yield
      await db.cacheBasketYield(basketIdNum, basketYield, 300); // 5 minutes cache
    }

    return basketYields;
  }

  /**
   * Store basket yields in database
   */
  private async storeBasketYields(basketYields: BasketYield[]): Promise<void> {
    try {
      const client = await db.beginTransaction();

      try {
        for (const basketYield of basketYields) {
          await client.query(
            `INSERT INTO basket_history (basket_id, basket_name, average_yield_basis_points, weighted_yield_basis_points, asset_yields, timestamp)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              basketYield.basketId,
              basketYield.basketName,
              basketYield.averageYield,
              basketYield.weightedYield,
              JSON.stringify(basketYield.assetYields),
              basketYield.timestamp,
            ]
          );
        }

        await db.commitTransaction(client);
        logger.debug(`Stored ${basketYields.length} basket yields in database`);
      } catch (error) {
        await db.rollbackTransaction(client);
        throw error;
      }
    } catch (error) {
      logger.error('Failed to store basket yields', error);
      throw error;
    }
  }

  /**
   * Generate AI recommendations for all baskets
   */
  private async generateAIRecommendations(
    basketYields: BasketYield[]
  ): Promise<AIRecommendation[]> {
    try {
      // Get historical yield data for AI analysis
      const historicalYields = await this.getHistoricalYields(7); // Last 7 days

      // Convert basket yields to asset yields for AI analysis
      const currentAssetYields =
        this.convertBasketYieldsToAssetYields(basketYields);
      const historicalAssetYields = historicalYields.map((day) =>
        this.convertBasketYieldsToAssetYields(day)
      );

      // Generate AI recommendation
      const recommendation = await aiAgent.recommendBasket(
        currentAssetYields,
        historicalAssetYields
      );

      // Log AI decision to Hedera
      await hederaService.logAIDecision(
        'system', // System-level recommendation
        recommendation.recommendedBasket,
        recommendation.confidence,
        recommendation.reasoning
      );

      return [recommendation];
    } catch (error) {
      logger.error('Failed to generate AI recommendations', error);
      return [];
    }
  }

  /**
   * Convert basket yields to asset yields format
   */
  private convertBasketYieldsToAssetYields(
    basketYields: BasketYield[]
  ): YieldData[] {
    const assetYieldMap = new Map<string, YieldData>();

    basketYields.forEach((basketYield) => {
      basketYield.assetYields.forEach((assetYield) => {
        const existing = assetYieldMap.get(assetYield.asset);
        if (!existing || assetYield.apr > existing.apr) {
          assetYieldMap.set(assetYield.asset, assetYield);
        }
      });
    });

    return Array.from(assetYieldMap.values());
  }

  /**
   * Get historical yield data from database
   */
  private async getHistoricalYields(days: number): Promise<BasketYield[][]> {
    try {
      const result = await db.query(
        `SELECT basket_id, basket_name, average_yield_basis_points, weighted_yield_basis_points, 
                asset_yields, timestamp
         FROM basket_history 
         WHERE timestamp >= NOW() - INTERVAL '${days} days'
         ORDER BY timestamp DESC, basket_id`
      );

      // Group by date
      const dailyYields = new Map<string, BasketYield[]>();

      result.rows.forEach((row: any) => {
        const date = new Date(row.timestamp).toDateString();
        if (!dailyYields.has(date)) {
          dailyYields.set(date, []);
        }

        dailyYields.get(date)!.push({
          basketId: row.basket_id,
          basketName: row.basket_name,
          averageYield: row.average_yield_basis_points,
          weightedYield: row.weighted_yield_basis_points,
          assetYields: row.asset_yields,
          timestamp: row.timestamp,
        });
      });

      return Array.from(dailyYields.values());
    } catch (error) {
      logger.error('Failed to get historical yields', error);
      return [];
    }
  }

  /**
   * Log yield updates to Hedera Consensus Service
   */
  private async logYieldUpdates(basketYields: BasketYield[]): Promise<void> {
    try {
      for (const basketYield of basketYields) {
        await hederaService.logYieldUpdate(
          basketYield.basketId,
          basketYield.assetYields,
          basketYield.weightedYield
        );
      }
    } catch (error) {
      logger.error('Failed to log yield updates to Hedera', error);
      // Don't throw - this shouldn't break the main flow
    }
  }

  /**
   * Get latest basket yields
   */
  public async getLatestBasketYields(): Promise<BasketYield[]> {
    try {
      // Try cache first
      const cachedYields: BasketYield[] = [];
      let allCached = true;

      for (let i = 0; i < 3; i++) {
        const cached = await db.getCachedBasketYield(i);
        if (cached) {
          cachedYields.push(cached);
        } else {
          allCached = false;
          break;
        }
      }

      if (allCached && cachedYields.length === 3) {
        return cachedYields;
      }

      // Fallback to database
      const result = await db.query(
        `SELECT DISTINCT ON (basket_id) 
         basket_id, basket_name, average_yield_basis_points, weighted_yield_basis_points, 
         asset_yields, timestamp
         FROM basket_history 
         ORDER BY basket_id, timestamp DESC`
      );

      return result.rows.map((row: any) => ({
        basketId: row.basket_id,
        basketName: row.basket_name,
        averageYield: row.average_yield_basis_points,
        weightedYield: row.weighted_yield_basis_points,
        assetYields: row.asset_yields,
        timestamp: row.timestamp,
      }));
    } catch (error) {
      logger.error('Failed to get latest basket yields', error);
      return [];
    }
  }

  /**
   * Get AI recommendation for a specific user
   */
  public async getUserRecommendation(
    userAddress: string
  ): Promise<AIRecommendation | null> {
    try {
      // Get user's current basket
      const userResult = await db.query(
        'SELECT selected_basket FROM users WHERE wallet_address = $1',
        [userAddress]
      );

      if (userResult.rows.length === 0) {
        return null;
      }

      const userBasket = userResult.rows[0].selected_basket;

      // Get latest yields and generate recommendation
      const currentYields = await pythService.getLatestYields();
      const historicalYields = await this.getHistoricalYields(7);
      const historicalAssetYields = historicalYields.map((day) =>
        this.convertBasketYieldsToAssetYields(day)
      );

      const recommendation = await aiAgent.recommendBasket(
        currentYields,
        historicalAssetYields,
        userBasket as RiskProfile
      );

      return recommendation;
    } catch (error) {
      logger.error(
        `Failed to get recommendation for user ${userAddress}`,
        error
      );
      return null;
    }
  }

  /**
   * Execute rebalancing for a user based on AI recommendation
   */
  public async executeUserRebalancing(
    userAddress: string,
    userPrivateKey: string
  ): Promise<void> {
    try {
      // Get user's current basket
      const userResult = await db.query(
        'SELECT selected_basket FROM users WHERE wallet_address = $1',
        [userAddress]
      );

      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const currentBasket = userResult.rows[0].selected_basket;

      // Get AI recommendation
      const recommendation = await this.getUserRecommendation(userAddress);
      if (!recommendation) {
        throw new Error('No AI recommendation available');
      }

      // Check if rebalancing is needed
      if (recommendation.recommendedBasket === currentBasket) {
        logger.info(`No rebalancing needed for user ${userAddress}`);
        return;
      }

      // Check confidence threshold
      if (recommendation.confidence < 70) {
        logger.info(
          `AI confidence too low for user ${userAddress}: ${recommendation.confidence}%`
        );
        return;
      }

      // Execute rebalancing
      await oneInchService.executeRebalancing(
        userAddress,
        currentBasket,
        recommendation.recommendedBasket,
        userPrivateKey
      );

      // Update user's basket in database
      await db.query(
        'UPDATE users SET selected_basket = $1, updated_at = NOW() WHERE wallet_address = $2',
        [recommendation.recommendedBasket, userAddress]
      );

      logger.info(
        `Rebalancing executed for user ${userAddress}: ${currentBasket} -> ${recommendation.recommendedBasket}`
      );
    } catch (error) {
      logger.error(
        `Failed to execute rebalancing for user ${userAddress}`,
        error
      );
      throw error;
    }
  }

  /**
   * Get processing status
   */
  public getProcessingStatus(): {
    isProcessing: boolean;
    lastProcessTime: Date | null;
  } {
    return {
      isProcessing: this.isProcessing,
      lastProcessTime: this.lastProcessTime,
    };
  }
}

export const yieldService = new YieldService();
