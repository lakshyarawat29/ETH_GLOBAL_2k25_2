import { Pool, PoolClient } from 'pg';
import { createClient, RedisClientType } from 'redis';
import { appConfig } from '@/config';
import { logger } from '@/utils/logger';

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private pgPool: Pool;
  private redisClient: RedisClientType;

  private constructor() {
    // PostgreSQL connection
    this.pgPool = new Pool({
      host: appConfig.database.host,
      port: appConfig.database.port,
      database: appConfig.database.database,
      user: appConfig.database.username,
      password: appConfig.database.password,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Redis connection
    this.redisClient = createClient({
      socket: {
        host: appConfig.redis.host,
        port: appConfig.redis.port,
      },
      password: appConfig.redis.password,
      database: appConfig.redis.db,
    });

    this.setupEventHandlers();
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  private setupEventHandlers(): void {
    // PostgreSQL event handlers
    this.pgPool.on('error', (err) => {
      logger.error('Unexpected error on idle PostgreSQL client', err);
    });

    this.pgPool.on('connect', (client) => {
      logger.info('New PostgreSQL client connected');
    });

    // Redis event handlers
    this.redisClient.on('error', (err) => {
      logger.error('Redis Client Error', err);
    });

    this.redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    this.redisClient.on('ready', () => {
      logger.info('Redis client ready');
    });

    this.redisClient.on('end', () => {
      logger.info('Redis client disconnected');
    });
  }

  public async connect(): Promise<void> {
    try {
      // Test PostgreSQL connection
      const client = await this.pgPool.connect();
      await client.query('SELECT NOW()');
      client.release();
      logger.info('PostgreSQL connected successfully');

      // Connect Redis
      await this.redisClient.connect();
      logger.info('Redis connected successfully');
    } catch (error) {
      logger.error('Database connection failed', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.pgPool.end();
      await this.redisClient.disconnect();
      logger.info('Database connections closed');
    } catch (error) {
      logger.error('Error closing database connections', error);
      throw error;
    }
  }

  public getPool(): Pool {
    return this.pgPool;
  }

  public getRedisClient(): RedisClientType {
    return this.redisClient;
  }

  public async query(text: string, params?: any[]): Promise<any> {
    const start = Date.now();
    try {
      const res = await this.pgPool.query(text, params);
      const duration = Date.now() - start;
      logger.debug('Executed query', { text, duration, rows: res.rowCount });
      return res;
    } catch (error) {
      logger.error('Database query error', { text, params, error });
      throw error;
    }
  }

  public async getClient(): Promise<PoolClient> {
    return await this.pgPool.connect();
  }

  public async beginTransaction(): Promise<PoolClient> {
    const client = await this.getClient();
    await client.query('BEGIN');
    return client;
  }

  public async commitTransaction(client: PoolClient): Promise<void> {
    try {
      await client.query('COMMIT');
    } finally {
      client.release();
    }
  }

  public async rollbackTransaction(client: PoolClient): Promise<void> {
    try {
      await client.query('ROLLBACK');
    } finally {
      client.release();
    }
  }

  // Redis helper methods
  public async redisGet(key: string): Promise<string | null> {
    try {
      return (await this.redisClient.get(key)) || null;
    } catch (error) {
      logger.error('Redis GET error', { key, error });
      throw error;
    }
  }

  public async redisSet(
    key: string,
    value: string,
    expireInSeconds?: number
  ): Promise<void> {
    try {
      if (expireInSeconds) {
        await this.redisClient.setEx(key, expireInSeconds, value);
      } else {
        await this.redisClient.set(key, value);
      }
    } catch (error) {
      logger.error('Redis SET error', { key, error });
      throw error;
    }
  }

  public async redisDel(key: string): Promise<void> {
    try {
      await this.redisClient.del(key);
    } catch (error) {
      logger.error('Redis DEL error', { key, error });
      throw error;
    }
  }

  public async redisHGet(key: string, field: string): Promise<string | null> {
    try {
      return (await this.redisClient.hGet(key, field)) || null;
    } catch (error) {
      logger.error('Redis HGET error', { key, field, error });
      throw error;
    }
  }

  public async redisHSet(
    key: string,
    field: string,
    value: string
  ): Promise<void> {
    try {
      await this.redisClient.hSet(key, field, value);
    } catch (error) {
      logger.error('Redis HSET error', { key, field, error });
      throw error;
    }
  }

  public async redisHGetAll(key: string): Promise<Record<string, string>> {
    try {
      return await this.redisClient.hGetAll(key);
    } catch (error) {
      logger.error('Redis HGETALL error', { key, error });
      throw error;
    }
  }

  // Cache helper methods for yield data
  public async cacheYieldData(
    assetSymbol: string,
    yieldData: any,
    ttlSeconds: number = 300
  ): Promise<void> {
    const key = `yield:${assetSymbol.toLowerCase()}`;
    await this.redisSet(key, JSON.stringify(yieldData), ttlSeconds);
  }

  public async getCachedYieldData(assetSymbol: string): Promise<any | null> {
    const key = `yield:${assetSymbol.toLowerCase()}`;
    const cached = await this.redisGet(key);
    return cached ? JSON.parse(cached) : null;
  }

  public async cacheBasketYield(
    basketId: number,
    basketYield: any,
    ttlSeconds: number = 300
  ): Promise<void> {
    const key = `basket_yield:${basketId}`;
    await this.redisSet(key, JSON.stringify(basketYield), ttlSeconds);
  }

  public async getCachedBasketYield(basketId: number): Promise<any | null> {
    const key = `basket_yield:${basketId}`;
    const cached = await this.redisGet(key);
    return cached ? JSON.parse(cached) : null;
  }

  // Health check
  public async healthCheck(): Promise<{ postgres: boolean; redis: boolean }> {
    const result = { postgres: false, redis: false };

    try {
      await this.query('SELECT 1');
      result.postgres = true;
    } catch (error) {
      logger.error('PostgreSQL health check failed', error);
    }

    try {
      await this.redisClient.ping();
      result.redis = true;
    } catch (error) {
      logger.error('Redis health check failed', error);
    }

    return result;
  }
}

export const db = DatabaseConnection.getInstance();
