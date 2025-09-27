import {
  Client,
  PrivateKey,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  Hbar,
} from '@hashgraph/sdk';
import { appConfig } from '@/config';
import { HederaConsensusEvent } from '@/types';
import { db } from '@/database/connection';
import { logger } from '@/utils/logger';

export class HederaService {
  private client: Client;
  private operatorId: string;
  private operatorKey: PrivateKey;
  private consensusTopicId: string | null = null;

  constructor() {
    this.operatorId = appConfig.hedera.accountId;
    // Ensure private key is a string and remove quotes if present
    const privateKeyString = appConfig.hedera.privateKey.replace(/"/g, '');
    this.operatorKey = PrivateKey.fromStringECDSA(privateKeyString);

    // Initialize client based on network
    if (appConfig.hedera.network === 'mainnet') {
      this.client = Client.forMainnet();
    } else {
      this.client = Client.forTestnet();
    }

    this.client.setOperator(this.operatorId, this.operatorKey);
  }

  /**
   * Initialize Hedera service and create consensus topic if needed
   */
  public async initialize(): Promise<void> {
    try {
      // Check if we already have a consensus topic ID in config
      const existingTopicId = process.env.HEDERA_CONSENSUS_TOPIC_ID;

      if (existingTopicId) {
        this.consensusTopicId = existingTopicId;
        logger.info(`Using existing consensus topic: ${this.consensusTopicId}`);
      } else {
        // Create new consensus topic
        this.consensusTopicId = await this.createConsensusTopic();
        logger.info(`Created new consensus topic: ${this.consensusTopicId}`);
      }
    } catch (error) {
      logger.error('Failed to initialize Hedera service', error);
      throw error;
    }
  }

  /**
   * Create a new consensus topic for logging events
   */
  private async createConsensusTopic(): Promise<string> {
    try {
      const topicCreateTransaction = new TopicCreateTransaction()
        .setTopicMemo('Hedera AI Basket System - Event Logging')
        .setMaxTransactionFee(new Hbar(2));

      const topicResponse = await topicCreateTransaction.execute(this.client);
      const topicReceipt = await topicResponse.getReceipt(this.client);

      const topicId = topicReceipt.topicId?.toString();
      if (!topicId) {
        throw new Error('Failed to create consensus topic');
      }

      return topicId;
    } catch (error) {
      logger.error('Failed to create consensus topic', error);
      throw error;
    }
  }

  /**
   * Submit a message to the consensus topic
   */
  public async submitConsensusMessage(message: string): Promise<string> {
    try {
      if (!this.consensusTopicId) {
        throw new Error('Consensus topic not initialized');
      }

      const topicMessageTransaction = new TopicMessageSubmitTransaction()
        .setTopicId(this.consensusTopicId)
        .setMessage(message)
        .setMaxTransactionFee(new Hbar(1));

      const response = await topicMessageTransaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      const transactionId = response.transactionId?.toString();
      logger.info(`Submitted consensus message: ${transactionId}`);

      return transactionId || '';
    } catch (error) {
      logger.error('Failed to submit consensus message', error);
      throw error;
    }
  }

  /**
   * Log AI decision to Hedera Consensus Service
   */
  public async logAIDecision(
    userAddress: string,
    recommendedBasket: number,
    confidence: number,
    reasoning: string
  ): Promise<void> {
    try {
      const eventData = {
        eventType: 'AI_DECISION',
        userAddress,
        recommendedBasket,
        confidence,
        reasoning,
        timestamp: new Date().toISOString(),
      };

      const message = JSON.stringify(eventData);
      const transactionId = await this.submitConsensusMessage(message);

      // Also store in database for quick access
      await this.storeConsensusEvent({
        eventType: 'AI_DECISION',
        user: userAddress,
        basketId: recommendedBasket,
        timestamp: new Date(),
        dataHash: transactionId,
        message: `AI Decision: Recommended basket ${recommendedBasket} with confidence ${confidence}%`,
      });

      logger.info(`Logged AI decision for user ${userAddress}`);
    } catch (error) {
      logger.error('Failed to log AI decision', error);
      // Don't throw - this shouldn't break the main flow
    }
  }

  /**
   * Log rebalancing start event
   */
  public async logRebalancingStart(
    userAddress: string,
    fromBasket: number,
    toBasket: number,
    swapData: any
  ): Promise<void> {
    try {
      const eventData = {
        eventType: 'REBALANCING_START',
        userAddress,
        fromBasket,
        toBasket,
        swapData,
        timestamp: new Date().toISOString(),
      };

      const message = JSON.stringify(eventData);
      const transactionId = await this.submitConsensusMessage(message);

      await this.storeConsensusEvent({
        eventType: 'REBALANCING_START',
        user: userAddress,
        basketId: toBasket,
        timestamp: new Date(),
        dataHash: transactionId,
        message: `Rebalancing started: Basket ${fromBasket} -> ${toBasket}`,
      });

      logger.info(`Logged rebalancing start for user ${userAddress}`);
    } catch (error) {
      logger.error('Failed to log rebalancing start', error);
    }
  }

  /**
   * Log successful rebalancing completion
   */
  public async logRebalancingSuccess(
    userAddress: string,
    toBasket: number,
    transactionHash: string,
    gasUsed: number
  ): Promise<void> {
    try {
      const eventData = {
        eventType: 'REBALANCING_SUCCESS',
        userAddress,
        toBasket,
        transactionHash,
        gasUsed,
        timestamp: new Date().toISOString(),
      };

      const message = JSON.stringify(eventData);
      const consensusTxId = await this.submitConsensusMessage(message);

      await this.storeConsensusEvent({
        eventType: 'REBALANCING_SUCCESS',
        user: userAddress,
        basketId: toBasket,
        timestamp: new Date(),
        dataHash: consensusTxId,
        message: `Rebalancing successful: Moved to basket ${toBasket} | Gas: ${gasUsed}`,
      });

      logger.info(`Logged rebalancing success for user ${userAddress}`);
    } catch (error) {
      logger.error('Failed to log rebalancing success', error);
    }
  }

  /**
   * Log failed rebalancing
   */
  public async logRebalancingFailed(
    userAddress: string,
    toBasket: number,
    errorCode: number,
    errorMessage: string
  ): Promise<void> {
    try {
      const eventData = {
        eventType: 'REBALANCING_FAILED',
        userAddress,
        toBasket,
        errorCode,
        errorMessage,
        timestamp: new Date().toISOString(),
      };

      const message = JSON.stringify(eventData);
      const consensusTxId = await this.submitConsensusMessage(message);

      await this.storeConsensusEvent({
        eventType: 'REBALANCING_FAILED',
        user: userAddress,
        basketId: toBasket,
        timestamp: new Date(),
        dataHash: consensusTxId,
        message: `Rebalancing failed: Target basket ${toBasket} | Error ${errorCode}: ${errorMessage}`,
      });

      logger.info(`Logged rebalancing failure for user ${userAddress}`);
    } catch (error) {
      logger.error('Failed to log rebalancing failure', error);
    }
  }

  /**
   * Log yield data update
   */
  public async logYieldUpdate(
    basketId: number,
    yieldData: any,
    averageYield: number
  ): Promise<void> {
    try {
      const eventData = {
        eventType: 'YIELD_UPDATE',
        basketId,
        yieldData,
        averageYield,
        timestamp: new Date().toISOString(),
      };

      const message = JSON.stringify(eventData);
      const consensusTxId = await this.submitConsensusMessage(message);

      await this.storeConsensusEvent({
        eventType: 'YIELD_UPDATE',
        basketId,
        timestamp: new Date(),
        dataHash: consensusTxId,
        message: `Yield updated: Basket ${basketId} average yield ${averageYield} bps`,
      });

      logger.info(`Logged yield update for basket ${basketId}`);
    } catch (error) {
      logger.error('Failed to log yield update', error);
    }
  }

  /**
   * Log user registration
   */
  public async logUserRegistration(
    userAddress: string,
    basketId: number,
    riskProfile: string
  ): Promise<void> {
    try {
      const eventData = {
        eventType: 'USER_REGISTRATION',
        userAddress,
        basketId,
        riskProfile,
        timestamp: new Date().toISOString(),
      };

      const message = JSON.stringify(eventData);
      const consensusTxId = await this.submitConsensusMessage(message);

      await this.storeConsensusEvent({
        eventType: 'USER_REGISTRATION',
        user: userAddress,
        basketId,
        timestamp: new Date(),
        dataHash: consensusTxId,
        message: `User registered: ${riskProfile} risk profile, basket ${basketId}`,
      });

      logger.info(`Logged user registration for ${userAddress}`);
    } catch (error) {
      logger.error('Failed to log user registration', error);
    }
  }

  /**
   * Store consensus event in database
   */
  private async storeConsensusEvent(
    event: HederaConsensusEvent
  ): Promise<void> {
    try {
      // Get user ID if user address provided
      let userId = null;
      if (event.user) {
        const userResult = await db.query(
          'SELECT id FROM users WHERE wallet_address = $1',
          [event.user]
        );
        userId = userResult.rows.length > 0 ? userResult.rows[0].id : null;
      }

      await db.query(
        `INSERT INTO consensus_events (event_type, user_id, basket_id, data_hash, message, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          event.eventType,
          userId,
          event.basketId,
          event.dataHash,
          event.message,
          event.timestamp,
        ]
      );
    } catch (error) {
      logger.error('Failed to store consensus event', error);
      // Don't throw - this is for logging purposes
    }
  }

  /**
   * Get consensus events from database
   */
  public async getConsensusEvents(
    eventType?: string,
    userAddress?: string,
    limit: number = 50
  ): Promise<HederaConsensusEvent[]> {
    try {
      let query = `
        SELECT ce.event_type, u.wallet_address, ce.basket_id, ce.data_hash, ce.message, ce.timestamp
        FROM consensus_events ce
        LEFT JOIN users u ON ce.user_id = u.id
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramCount = 0;

      if (eventType) {
        paramCount++;
        query += ` AND ce.event_type = $${paramCount}`;
        params.push(eventType);
      }

      if (userAddress) {
        paramCount++;
        query += ` AND u.wallet_address = $${paramCount}`;
        params.push(userAddress);
      }

      query += ` ORDER BY ce.timestamp DESC LIMIT $${++paramCount}`;
      params.push(limit);

      const result = await db.query(query, params);

      return result.rows.map((row: any) => ({
        eventType: row.event_type,
        user: row.wallet_address,
        basketId: row.basket_id,
        timestamp: row.timestamp,
        dataHash: row.data_hash,
        message: row.message,
      }));
    } catch (error) {
      logger.error('Failed to get consensus events', error);
      return [];
    }
  }

  /**
   * Get consensus topic ID
   */
  public getConsensusTopicId(): string | null {
    return this.consensusTopicId;
  }

  /**
   * Close Hedera client connection
   */
  public async close(): Promise<void> {
    try {
      this.client.close();
      logger.info('Hedera client connection closed');
    } catch (error) {
      logger.error('Error closing Hedera client', error);
    }
  }
}

export const hederaService = new HederaService();
