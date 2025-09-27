import axios from 'axios';
import { ethers } from 'ethers';
import { appConfig, HEDERA_TOKEN_ADDRESSES } from '@/config';
import {
  OneInchSwapData,
  OneInchQuoteResponse,
  RebalancingTransaction,
} from '@/types';
import { db } from '@/database/connection';
import { logger } from '@/utils/logger';

export class OneInchService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly chainId: number;

  constructor() {
    this.apiKey = appConfig.oneInch.apiKey;
    this.baseUrl = appConfig.oneInch.baseUrl;
    this.chainId = 296; // Hedera testnet chain ID
  }

  /**
   * Get quote for token swap
   */
  public async getQuote(
    swapData: OneInchSwapData
  ): Promise<OneInchQuoteResponse> {
    try {
      const params = {
        fromTokenAddress: swapData.fromTokenAddress,
        toTokenAddress: swapData.toTokenAddress,
        amount: swapData.amount,
        fromAddress: swapData.fromAddress,
        slippage: swapData.slippage,
        protocols: swapData.protocols?.join(','),
        destReceiver: swapData.destReceiver,
      };

      const response = await axios.get(
        `${this.baseUrl}/${this.chainId}/quote`,
        {
          params,
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Failed to get 1inch quote', { swapData, error });
      throw error;
    }
  }

  /**
   * Get swap transaction data
   */
  public async getSwapTransaction(swapData: OneInchSwapData): Promise<any> {
    try {
      const params = {
        fromTokenAddress: swapData.fromTokenAddress,
        toTokenAddress: swapData.toTokenAddress,
        amount: swapData.amount,
        fromAddress: swapData.fromAddress,
        slippage: swapData.slippage,
        protocols: swapData.protocols?.join(','),
        destReceiver: swapData.destReceiver,
      };

      const response = await axios.get(`${this.baseUrl}/${this.chainId}/swap`, {
        params,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to get 1inch swap transaction', { swapData, error });
      throw error;
    }
  }

  /**
   * Execute rebalancing for a user based on AI recommendation
   */
  public async executeRebalancing(
    userAddress: string,
    fromBasket: number,
    toBasket: number,
    userPrivateKey: string
  ): Promise<RebalancingTransaction> {
    const transaction: RebalancingTransaction = {
      userAddress,
      fromBasket,
      toBasket,
      swapData: null,
      status: 'pending',
      timestamp: new Date(),
    };

    try {
      // Log rebalancing start
      await this.logRebalancingStart(userAddress, fromBasket, toBasket);

      // Get basket configurations
      const fromBasketConfig = this.getBasketConfig(fromBasket);
      const toBasketConfig = this.getBasketConfig(toBasket);

      if (!fromBasketConfig || !toBasketConfig) {
        throw new Error('Invalid basket configuration');
      }

      // Calculate required swaps
      const swaps = this.calculateRequiredSwaps(
        fromBasketConfig,
        toBasketConfig
      );

      // Execute swaps sequentially
      const swapResults = [];
      for (const swap of swaps) {
        const result = await this.executeSwap(
          swap,
          userAddress,
          userPrivateKey
        );
        swapResults.push(result);
      }

      // Update transaction status
      transaction.status = 'completed';
      transaction.swapData = swapResults;
      transaction.gasUsed = swapResults.reduce(
        (total, result) => total + (result.gasUsed || 0),
        0
      );

      // Store transaction in database
      await this.storeRebalancingTransaction(transaction);

      // Log successful rebalancing
      await this.logRebalancingSuccess(userAddress, toBasket, transaction);

      logger.info(
        `Rebalancing completed for user ${userAddress}: ${fromBasket} -> ${toBasket}`
      );

      return transaction;
    } catch (error) {
      logger.error(`Rebalancing failed for user ${userAddress}`, error);

      transaction.status = 'failed';
      transaction.errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      // Store failed transaction
      await this.storeRebalancingTransaction(transaction);

      // Log failed rebalancing
      await this.logRebalancingFailed(userAddress, toBasket, error);

      return transaction;
    }
  }

  /**
   * Calculate required swaps between baskets
   */
  private calculateRequiredSwaps(fromBasket: any, toBasket: any): any[] {
    const swaps = [];

    // For simplicity, we'll assume we're swapping from current holdings to target allocations
    // In reality, you'd need to consider current user balances

    // Get unique tokens from both baskets
    const allTokens = new Set([
      ...fromBasket.assets.map((a: any) => a.symbol),
      ...toBasket.assets.map((a: any) => a.symbol),
    ]);

    // Calculate net positions (simplified)
    for (const token of allTokens) {
      const fromAllocation =
        fromBasket.assets.find((a: any) => a.symbol === token)?.allocation || 0;
      const toAllocation =
        toBasket.assets.find((a: any) => a.symbol === token)?.allocation || 0;

      const difference = toAllocation - fromAllocation;

      if (Math.abs(difference) > 100) {
        // Only swap if difference > 1%
        // This is a simplified calculation - in reality you'd need to consider actual balances
        swaps.push({
          token,
          difference,
          direction: difference > 0 ? 'buy' : 'sell',
        });
      }
    }

    return swaps;
  }

  /**
   * Execute individual swap
   */
  private async executeSwap(
    swap: any,
    userAddress: string,
    userPrivateKey: string
  ): Promise<any> {
    try {
      // For demo purposes, we'll simulate the swap
      // In production, you'd use actual token addresses and amounts

      const fromTokenAddress = this.getTokenAddress(swap.token);
      const toTokenAddress = this.getTokenAddress('USDC'); // Simplified - swap to USDC first

      // Get quote
      const quoteData: OneInchSwapData = {
        fromTokenAddress,
        toTokenAddress,
        amount: '1000000000000000000', // 1 token (simplified)
        fromAddress: userAddress,
        slippage: 1, // 1%
      };

      const quote = await this.getQuote(quoteData);

      // Get swap transaction
      const swapTx = await this.getSwapTransaction(quoteData);

      // In production, you would:
      // 1. Sign and send the transaction using user's private key
      // 2. Wait for confirmation
      // 3. Return actual transaction hash and gas used

      // For demo, return simulated data
      return {
        fromToken: swap.token,
        toToken: 'USDC',
        amount: quote.fromTokenAmount,
        expectedAmount: quote.toTokenAmount,
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        gasUsed: 150000,
        success: true,
      };
    } catch (error) {
      logger.error(`Failed to execute swap for ${swap.token}`, error);
      throw error;
    }
  }

  /**
   * Get token address by symbol
   */
  private getTokenAddress(symbol: string): string {
    const address =
      HEDERA_TOKEN_ADDRESSES[symbol as keyof typeof HEDERA_TOKEN_ADDRESSES];
    if (!address) {
      throw new Error(`Token address not found for ${symbol}`);
    }
    return address;
  }

  /**
   * Get basket configuration
   */
  private getBasketConfig(basketId: number): any {
    const configs = {
      0: {
        name: 'Conservative',
        assets: [
          { symbol: 'USDC', allocation: 6000 },
          { symbol: 'ETH', allocation: 2000 },
          { symbol: 'BTC', allocation: 2000 },
        ],
      },
      1: {
        name: 'Balanced',
        assets: [
          { symbol: 'ETH', allocation: 4000 },
          { symbol: 'BTC', allocation: 3000 },
          { symbol: 'SOL', allocation: 2000 },
          { symbol: 'LINK', allocation: 1000 },
        ],
      },
      2: {
        name: 'Aggressive',
        assets: [
          { symbol: 'SOL', allocation: 4000 },
          { symbol: 'AVAX', allocation: 3000 },
          { symbol: 'LINK', allocation: 2000 },
          { symbol: 'MATIC', allocation: 1000 },
        ],
      },
    };

    return configs[basketId as keyof typeof configs];
  }

  /**
   * Store rebalancing transaction in database
   */
  private async storeRebalancingTransaction(
    transaction: RebalancingTransaction
  ): Promise<void> {
    try {
      // Get user ID from database
      const userResult = await db.query(
        'SELECT id FROM users WHERE wallet_address = $1',
        [transaction.userAddress]
      );

      if (userResult.rows.length === 0) {
        throw new Error('User not found in database');
      }

      const userId = userResult.rows[0].id;

      await db.query(
        `INSERT INTO rebalancing_transactions 
         (user_id, from_basket, to_basket, swap_data, transaction_hash, status, gas_used, error_message, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          userId,
          transaction.fromBasket,
          transaction.toBasket,
          JSON.stringify(transaction.swapData),
          transaction.transactionHash,
          transaction.status,
          transaction.gasUsed,
          transaction.errorMessage,
          transaction.timestamp,
        ]
      );

      logger.debug(
        `Stored rebalancing transaction for user ${transaction.userAddress}`
      );
    } catch (error) {
      logger.error('Failed to store rebalancing transaction', error);
      throw error;
    }
  }

  /**
   * Log rebalancing start to Hedera Consensus Service
   */
  private async logRebalancingStart(
    userAddress: string,
    fromBasket: number,
    toBasket: number
  ): Promise<void> {
    try {
      // This would integrate with Hedera Consensus Service
      // For now, we'll log to database
      await db.query(
        `INSERT INTO consensus_events (event_type, user_id, basket_id, data_hash, message)
         SELECT 'REBALANCING_START', u.id, $3, $4, $5
         FROM users u WHERE u.wallet_address = $1`,
        [
          userAddress,
          fromBasket,
          toBasket,
          `0x${Math.random().toString(16).substr(2, 64)}`,
          `Rebalancing started: Basket ${fromBasket} -> ${toBasket}`,
        ]
      );
    } catch (error) {
      logger.error('Failed to log rebalancing start', error);
    }
  }

  /**
   * Log successful rebalancing
   */
  private async logRebalancingSuccess(
    userAddress: string,
    toBasket: number,
    transaction: RebalancingTransaction
  ): Promise<void> {
    try {
      await db.query(
        `INSERT INTO consensus_events (event_type, user_id, basket_id, data_hash, message)
         SELECT 'REBALANCING_SUCCESS', u.id, $2, $3, $4
         FROM users u WHERE u.wallet_address = $1`,
        [
          userAddress,
          toBasket,
          transaction.transactionHash ||
            `0x${Math.random().toString(16).substr(2, 64)}`,
          `Rebalancing successful: Moved to basket ${toBasket} | Gas: ${transaction.gasUsed}`,
        ]
      );
    } catch (error) {
      logger.error('Failed to log rebalancing success', error);
    }
  }

  /**
   * Log failed rebalancing
   */
  private async logRebalancingFailed(
    userAddress: string,
    toBasket: number,
    error: any
  ): Promise<void> {
    try {
      await db.query(
        `INSERT INTO consensus_events (event_type, user_id, basket_id, data_hash, message)
         SELECT 'REBALANCING_FAILED', u.id, $2, $3, $4
         FROM users u WHERE u.wallet_address = $1`,
        [
          userAddress,
          toBasket,
          `0x${Math.random().toString(16).substr(2, 64)}`,
          `Rebalancing failed: Target basket ${toBasket} | Error: ${error.message}`,
        ]
      );
    } catch (error) {
      logger.error('Failed to log rebalancing failure', error);
    }
  }

  /**
   * Get user's rebalancing history
   */
  public async getUserRebalancingHistory(
    userAddress: string,
    limit: number = 10
  ): Promise<RebalancingTransaction[]> {
    try {
      const result = await db.query(
        `SELECT rt.from_basket, rt.to_basket, rt.swap_data, rt.transaction_hash, 
                rt.status, rt.gas_used, rt.error_message, rt.timestamp
         FROM rebalancing_transactions rt
         JOIN users u ON rt.user_id = u.id
         WHERE u.wallet_address = $1
         ORDER BY rt.timestamp DESC
         LIMIT $2`,
        [userAddress, limit]
      );

      return result.rows.map((row: any) => ({
        userAddress,
        fromBasket: row.from_basket,
        toBasket: row.to_basket,
        swapData: row.swap_data,
        transactionHash: row.transaction_hash,
        status: row.status,
        gasUsed: row.gas_used,
        errorMessage: row.error_message,
        timestamp: row.timestamp,
      }));
    } catch (error) {
      logger.error('Failed to get user rebalancing history', error);
      return [];
    }
  }

  /**
   * Get supported tokens for 1inch on Hedera
   */
  public async getSupportedTokens(): Promise<any[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/${this.chainId}/tokens`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      return response.data.tokens;
    } catch (error) {
      logger.error('Failed to get supported tokens from 1inch', error);
      return [];
    }
  }
}

export const oneInchService = new OneInchService();
