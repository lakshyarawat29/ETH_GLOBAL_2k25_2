import axios from 'axios';
import { appConfig, PYTH_PRICE_FEEDS } from '@/config';
import { YieldData, PythPriceData } from '@/types';
import { db } from '@/database/connection';
import { logger } from '@/utils/logger';

export class PythService {
  private readonly priceFeedIds: string[];

  constructor() {
    this.priceFeedIds = Object.values(PYTH_PRICE_FEEDS);
  }

  /**
   * Initialize Pyth price service connection
   */
  public async initialize(): Promise<void> {
    try {
      logger.info('Pyth price service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Pyth price service', error);
      throw error;
    }
  }

  /**
   * Fetch current price data for all supported assets
   */
  public async fetchCurrentPrices(): Promise<Map<string, PythPriceData>> {
    try {
      // For demo purposes, return mock price data
      // In production, you would use the actual Pyth SDK
      const priceMap = new Map<string, PythPriceData>();

      const symbols = Object.keys(PYTH_PRICE_FEEDS);
      for (const symbol of symbols) {
        const feedId =
          PYTH_PRICE_FEEDS[symbol as keyof typeof PYTH_PRICE_FEEDS];
        priceMap.set(symbol, {
          id: feedId,
          price: {
            price: (Math.random() * 100000).toString(),
            conf: '100',
            expo: -8,
            publish_time: Date.now(),
          },
        });
      }

      logger.info(`Fetched mock prices for ${priceMap.size} assets`);
      return priceMap;
    } catch (error) {
      logger.error('Failed to fetch current prices from Pyth', error);
      throw error;
    }
  }

  /**
   * Fetch historical price data for yield calculation
   */
  public async fetchHistoricalPrices(
    symbols: string[],
    startTime: Date,
    endTime: Date
  ): Promise<Map<string, PythPriceData[]>> {
    try {
      const historicalData = new Map<string, PythPriceData[]>();

      for (const symbol of symbols) {
        const feedId =
          PYTH_PRICE_FEEDS[symbol as keyof typeof PYTH_PRICE_FEEDS];
        if (!feedId) continue;

        // Mock historical data for demo
        const symbolData: PythPriceData[] = [];
        for (let i = 0; i < 24; i++) {
          symbolData.push({
            id: feedId,
            price: {
              price: (Math.random() * 100000).toString(),
              conf: '100',
              expo: -8,
              publish_time: Date.now() - i * 3600000, // 1 hour intervals
            },
          });
        }

        historicalData.set(symbol, symbolData);
      }

      logger.info(`Fetched mock historical data for ${symbols.length} assets`);
      return historicalData;
    } catch (error) {
      logger.error('Failed to fetch historical prices from Pyth', error);
      throw error;
    }
  }

  /**
   * Calculate APR based on price volatility and historical data
   * This is a simplified calculation - in production, you'd use more sophisticated models
   */
  public async calculateAPR(
    symbol: string,
    historicalData: PythPriceData[]
  ): Promise<number> {
    try {
      if (historicalData.length < 2) {
        return 0;
      }

      // Calculate price changes over time
      const priceChanges: number[] = [];
      for (let i = 1; i < historicalData.length; i++) {
        const prevPrice = parseFloat(historicalData[i - 1].price.price);
        const currPrice = parseFloat(historicalData[i].price.price);
        const change = (currPrice - prevPrice) / prevPrice;
        priceChanges.push(change);
      }

      // Calculate volatility (standard deviation of returns)
      const mean =
        priceChanges.reduce((sum, change) => sum + change, 0) /
        priceChanges.length;
      const variance =
        priceChanges.reduce(
          (sum, change) => sum + Math.pow(change - mean, 2),
          0
        ) / priceChanges.length;
      const volatility = Math.sqrt(variance);

      // Simple APR calculation based on volatility and risk-free rate
      // This is a placeholder - real yield calculation would be more complex
      const riskFreeRate = 0.05; // 5% risk-free rate
      const riskPremium = volatility * 100; // Convert to percentage
      const apr = (riskFreeRate + riskPremium) * 100; // Convert to basis points

      // Cap APR at reasonable levels
      return Math.min(Math.max(apr, 0), 5000); // Between 0% and 50%
    } catch (error) {
      logger.error(`Failed to calculate APR for ${symbol}`, error);
      return 0;
    }
  }

  /**
   * Store yield data in database and cache
   */
  public async storeYieldData(yieldData: YieldData): Promise<void> {
    try {
      const client = await db.beginTransaction();

      try {
        // Insert into database
        await client.query(
          `INSERT INTO yields (asset_symbol, asset_address, apr_basis_points, source, timestamp)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            yieldData.asset,
            yieldData.symbol,
            yieldData.apr,
            yieldData.source,
            yieldData.timestamp,
          ]
        );

        // Cache in Redis
        await db.cacheYieldData(yieldData.asset, yieldData, 300); // 5 minutes cache

        await db.commitTransaction(client);
        logger.debug(`Stored yield data for ${yieldData.asset}`);
      } catch (error) {
        await db.rollbackTransaction(client);
        throw error;
      }
    } catch (error) {
      logger.error(`Failed to store yield data for ${yieldData.asset}`, error);
      throw error;
    }
  }

  /**
   * Get cached yield data for an asset
   */
  public async getCachedYieldData(
    assetSymbol: string
  ): Promise<YieldData | null> {
    try {
      return await db.getCachedYieldData(assetSymbol);
    } catch (error) {
      logger.error(`Failed to get cached yield data for ${assetSymbol}`, error);
      return null;
    }
  }

  /**
   * Fetch and process yield data for all supported assets
   */
  public async processAllYields(): Promise<YieldData[]> {
    try {
      const symbols = Object.keys(PYTH_PRICE_FEEDS);
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours

      // Fetch current and historical prices
      const [currentPrices, historicalData] = await Promise.all([
        this.fetchCurrentPrices(),
        this.fetchHistoricalPrices(symbols, startTime, endTime),
      ]);

      const yieldData: YieldData[] = [];

      for (const symbol of symbols) {
        try {
          // Check cache first
          const cached = await this.getCachedYieldData(symbol);
          if (cached && this.isRecentData(cached.timestamp)) {
            yieldData.push(cached);
            continue;
          }

          // Calculate APR from historical data
          const historical = historicalData.get(symbol) || [];
          const apr = await this.calculateAPR(symbol, historical);

          // Get current price for additional context
          const currentPrice = currentPrices.get(symbol);

          const newYieldData: YieldData = {
            asset: symbol,
            symbol,
            apr: Math.round(apr),
            timestamp: new Date(),
            source: 'pyth',
          };

          // Store in database and cache
          await this.storeYieldData(newYieldData);
          yieldData.push(newYieldData);

          logger.info(`Processed yield for ${symbol}: ${apr.toFixed(2)}% APR`);
        } catch (error) {
          logger.error(`Failed to process yield for ${symbol}`, error);
        }
      }

      return yieldData;
    } catch (error) {
      logger.error('Failed to process all yields', error);
      throw error;
    }
  }

  /**
   * Get symbol from Pyth feed ID
   */
  private getSymbolFromFeedId(feedId: string): string | null {
    for (const [symbol, id] of Object.entries(PYTH_PRICE_FEEDS)) {
      if (id === feedId) {
        return symbol;
      }
    }
    return null;
  }

  /**
   * Check if data is recent (within 5 minutes)
   */
  private isRecentData(timestamp: Date): boolean {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return timestamp > fiveMinutesAgo;
  }

  /**
   * Get latest yield data from database
   */
  public async getLatestYields(): Promise<YieldData[]> {
    try {
      const result = await db.query(
        `SELECT DISTINCT ON (asset_symbol) 
         asset_symbol, asset_address, apr_basis_points, source, timestamp
         FROM yields 
         ORDER BY asset_symbol, timestamp DESC`
      );

      return result.rows.map((row: any) => ({
        asset: row.asset_symbol,
        symbol: row.asset_symbol,
        apr: row.apr_basis_points,
        timestamp: row.timestamp,
        source: row.source,
      }));
    } catch (error) {
      logger.error('Failed to get latest yields from database', error);
      throw error;
    }
  }

  /**
   * Close Pyth connection
   */
  public async close(): Promise<void> {
    try {
      logger.info('Pyth service connection closed');
    } catch (error) {
      logger.error('Error closing Pyth service connection', error);
    }
  }
}

export const pythService = new PythService();
