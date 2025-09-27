import express from 'express';
import { db } from '@/database/connection';
import { hederaService } from '@/services/hederaService';
import { walletService } from '@/services/walletService';
import { logger } from '@/utils/logger';
import { BASKET_CONFIGS } from '@/config';

// Helper function to validate wallet address
const isValidAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

const router = express.Router();

/**
 * POST /api/users/register
 * Register a new user with a risk profile basket
 */
router.post('/register', async (req, res) => {
  try {
    const { walletAddress, selectedBasket } = req.body;

    if (!walletAddress || selectedBasket === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Wallet address and selected basket are required',
      });
    }

    if (selectedBasket < 0 || selectedBasket > 2) {
      return res.status(400).json({
        success: false,
        error: 'Selected basket must be 0 (Low), 1 (Medium), or 2 (High)',
      });
    }

    // Check if user already exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE wallet_address = $1',
      [walletAddress.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'User already registered',
      });
    }

    // Register user
    const result = await db.query(
      `INSERT INTO users (wallet_address, selected_basket, registration_timestamp, is_registered)
       VALUES ($1, $2, $3, $4)
       RETURNING id, wallet_address, selected_basket, registration_timestamp`,
      [walletAddress.toLowerCase(), selectedBasket, new Date(), true]
    );

    const user = result.rows[0];

    // Log user registration to Hedera
    const riskProfiles = ['Low', 'Medium', 'High'];
    await hederaService.logUserRegistration(
      walletAddress,
      selectedBasket,
      riskProfiles[selectedBasket]
    );

    logger.info(
      `User registered: ${walletAddress} with basket ${selectedBasket}`
    );

    return res.status(201).json({
      success: true,
      data: {
        id: user.id,
        walletAddress: user.wallet_address,
        selectedBasket: user.selected_basket,
        registrationTimestamp: user.registration_timestamp,
      },
      message: 'User registered successfully',
    });
  } catch (error) {
    logger.error('User registration failed', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to register user',
    });
  }
});

/**
 * GET /api/users/:walletAddress
 * Get user information
 */
router.get('/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;

    const result = await db.query(
      `SELECT id, wallet_address, selected_basket, registration_timestamp, is_registered, created_at, updated_at
       FROM users 
       WHERE wallet_address = $1`,
      [walletAddress]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const user = result.rows[0];

    return res.json({
      success: true,
      data: {
        id: user.id,
        walletAddress: user.wallet_address,
        selectedBasket: user.selected_basket,
        registrationTimestamp: user.registration_timestamp,
        isRegistered: user.is_registered,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    });
  } catch (error) {
    logger.error('Failed to get user', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get user information',
    });
  }
});

/**
 * PUT /api/users/:walletAddress/basket
 * Update user's selected basket
 */
router.put('/:walletAddress/basket', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { selectedBasket } = req.body;

    if (selectedBasket === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Selected basket is required',
      });
    }

    if (selectedBasket < 0 || selectedBasket > 2) {
      return res.status(400).json({
        success: false,
        error: 'Selected basket must be 0 (Low), 1 (Medium), or 2 (High)',
      });
    }

    // Check if user exists
    const existingUser = await db.query(
      'SELECT id, selected_basket FROM users WHERE wallet_address = $1',
      [walletAddress]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const oldBasket = existingUser.rows[0].selected_basket;

    // Update user's basket
    const result = await db.query(
      'UPDATE users SET selected_basket = $1, updated_at = NOW() WHERE wallet_address = $2 RETURNING *',
      [selectedBasket, walletAddress]
    );

    const user = result.rows[0];

    logger.info(
      `User basket updated: ${walletAddress} ${oldBasket} -> ${selectedBasket}`
    );

    return res.json({
      success: true,
      data: {
        walletAddress: user.wallet_address,
        selectedBasket: user.selected_basket,
        updatedAt: user.updated_at,
      },
      message: 'User basket updated successfully',
    });
  } catch (error) {
    logger.error('Failed to update user basket', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update user basket',
    });
  }
});

/**
 * GET /api/users
 * Get all users (with pagination)
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT id, wallet_address, selected_basket, registration_timestamp, is_registered, created_at, updated_at
       FROM users 
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await db.query('SELECT COUNT(*) FROM users');
    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    return res.json({
      success: true,
      data: result.rows.map((user: any) => ({
        id: user.id,
        walletAddress: user.wallet_address,
        selectedBasket: user.selected_basket,
        registrationTimestamp: user.registration_timestamp,
        isRegistered: user.is_registered,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    logger.error('Failed to get users', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get users',
    });
  }
});

/**
 * GET /api/users/:address
 * Get user by wallet address
 */
router.get('/:address', async (req, res) => {
  try {
    const { address } = req.params;

    if (!isValidAddress(address)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet address format',
      });
    }

    const user = await db.query(
      'SELECT * FROM users WHERE "wallet_address" = $1',
      [address.toLowerCase()]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const userData = user.rows[0];
    logger.info(`Retrieved user: ${address}`);

    return res.status(200).json({
      success: true,
      data: {
        id: userData.id,
        walletAddress: userData.wallet_address,
        selectedBasket: userData.selected_basket,
        registrationTimestamp: userData.registration_timestamp,
        isRegistered: userData.is_registered,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at,
      },
    });
  } catch (error) {
    logger.error('Error retrieving user:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/users/:address/dashboard
 * Get personalized dashboard data for user
 */
router.get('/:address/dashboard', async (req, res) => {
  try {
    const { address } = req.params;

    if (!isValidAddress(address)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet address format',
      });
    }

    // Get user data
    const userResult = await db.query(
      'SELECT * FROM users WHERE "wallet_address" = $1',
      [address.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please register first.',
      });
    }

    const user = userResult.rows[0];

    // Get user's basket yields
    const yieldsResult = await db.query(
      'SELECT * FROM basket_history WHERE basket_id = $1 ORDER BY timestamp DESC LIMIT 30',
      [user.selected_basket]
    );

    // Get user's AI predictions (all predictions for this user)
    const predictionsResult = await db.query(
      'SELECT * FROM decisions WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 10',
      [user.id]
    );

    // Get user's rebalancing history
    const transactionsResult = await db.query(
      'SELECT * FROM rebalancing_transactions WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 10',
      [user.id]
    );

    // Calculate user's portfolio value (mock calculation)
    const estimatedBalance = 10000; // $10k base
    const basketYields = yieldsResult.rows;
    const currentYield =
      basketYields.length > 0
        ? basketYields[0].weighted_yield_basis_points / 10000
        : 0; // Convert basis points to percentage
    const totalBalance = estimatedBalance * (1 + currentYield / 100);

    // Get basket configuration
    const basketConfig =
      BASKET_CONFIGS[user.selected_basket as keyof typeof BASKET_CONFIGS];

    logger.info(`Retrieved dashboard data for user: ${address}`);

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          walletAddress: user.wallet_address,
          selectedBasket: user.selected_basket,
          registrationTimestamp: user.registration_timestamp,
          isRegistered: user.is_registered,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
        dashboard: {
          totalBalance: Math.round(totalBalance),
          currentAPR: currentYield,
          activeStrategies: user.is_registered ? 1 : 0,
          aiPredictions: predictionsResult.rows.length,
          basketConfig,
          portfolio: {
            allocations: basketConfig.assets,
            totalValue: totalBalance,
            lastRebalance:
              transactionsResult.rows.length > 0
                ? transactionsResult.rows[0].timestamp
                : null,
          },
          performance: {
            yields: basketYields,
            predictions: predictionsResult.rows,
            transactions: transactionsResult.rows,
          },
        },
      },
    });
  } catch (error) {
    logger.error('Error retrieving dashboard data:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/users/:address/profile
 * Get user profile data
 */
router.get('/:address/profile', async (req, res) => {
  try {
    const { address } = req.params;

    if (!isValidAddress(address)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet address format',
      });
    }

    // Get user profile data
    const userResult = await db.query(
      'SELECT * FROM users WHERE "wallet_address" = $1',
      [address.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const user = userResult.rows[0];

    logger.info(`Retrieved profile data for user: ${address}`);

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        walletAddress: user.wallet_address,
        displayName: user.display_name,
        selectedBasket: user.selected_basket,
        riskPreference: user.risk_preference,
        initialDepositAmount: user.initial_deposit_amount,
        investmentPeriod: user.investment_period,
        totalDeposits: user.total_deposits,
        totalEarned: user.total_earned,
        activeSince: user.active_since,
        registrationTimestamp: user.registration_timestamp,
        isRegistered: user.is_registered,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    });
  } catch (error) {
    logger.error('Error retrieving profile data:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * PUT /api/users/:address/profile
 * Update user profile data
 */
router.put('/:address/profile', async (req, res) => {
  try {
    const { address } = req.params;
    const {
      displayName,
      riskPreference,
      initialDepositAmount,
      investmentPeriod,
    } = req.body;

    if (!isValidAddress(address)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet address format',
      });
    }

    // Validate risk preference
    if (
      riskPreference &&
      !['Conservative', 'Moderate', 'Aggressive'].includes(riskPreference)
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid risk preference. Must be Conservative, Moderate, or Aggressive',
      });
    }

    // Validate investment period
    if (
      investmentPeriod &&
      !['1 month', '3 months', '6 months', '1 year'].includes(investmentPeriod)
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid investment period. Must be 1 month, 3 months, 6 months, or 1 year',
      });
    }

    // Check if user exists
    const userResult = await db.query(
      'SELECT id FROM users WHERE "wallet_address" = $1',
      [address.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Map risk preference to basket
    let selectedBasket = null;
    if (riskPreference) {
      switch (riskPreference) {
        case 'Conservative':
          selectedBasket = 0;
          break;
        case 'Moderate':
          selectedBasket = 1;
          break;
        case 'Aggressive':
          selectedBasket = 2;
          break;
      }
    }

    // Build update query dynamically
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    if (displayName !== undefined) {
      updateFields.push(`display_name = $${paramIndex++}`);
      values.push(displayName);
    }
    if (riskPreference !== undefined) {
      updateFields.push(`risk_preference = $${paramIndex++}`);
      values.push(riskPreference);
    }
    if (initialDepositAmount !== undefined) {
      updateFields.push(`initial_deposit_amount = $${paramIndex++}`);
      values.push(initialDepositAmount);
    }
    if (investmentPeriod !== undefined) {
      updateFields.push(`investment_period = $${paramIndex++}`);
      values.push(investmentPeriod);
    }
    if (selectedBasket !== null) {
      updateFields.push(`selected_basket = $${paramIndex++}`);
      values.push(selectedBasket);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update',
      });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(address.toLowerCase());

    const updateQuery = `
      UPDATE users 
      SET ${updateFields.join(', ')} 
      WHERE wallet_address = $${paramIndex}
      RETURNING *
    `;

    const result = await db.query(updateQuery, values);
    const updatedUser = result.rows[0];

    logger.info(`Updated profile for user: ${address}`);

    return res.status(200).json({
      success: true,
      data: {
        id: updatedUser.id,
        walletAddress: updatedUser.wallet_address,
        displayName: updatedUser.display_name,
        selectedBasket: updatedUser.selected_basket,
        riskPreference: updatedUser.risk_preference,
        initialDepositAmount: updatedUser.initial_deposit_amount,
        investmentPeriod: updatedUser.investment_period,
        totalDeposits: updatedUser.total_deposits,
        totalEarned: updatedUser.total_earned,
        activeSince: updatedUser.active_since,
        registrationTimestamp: updatedUser.registration_timestamp,
        isRegistered: updatedUser.is_registered,
        createdAt: updatedUser.created_at,
        updatedAt: updatedUser.updated_at,
      },
    });
  } catch (error) {
    logger.error('Error updating profile data:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/users/:address/profile/complete
 * Complete user profile setup (register if not exists, update if exists)
 */
router.post('/:address/profile/complete', async (req, res) => {
  try {
    const { address } = req.params;
    const {
      displayName,
      riskPreference,
      initialDepositAmount,
      investmentPeriod,
    } = req.body;

    if (!isValidAddress(address)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet address format',
      });
    }

    if (
      !displayName ||
      !riskPreference ||
      !initialDepositAmount ||
      !investmentPeriod
    ) {
      return res.status(400).json({
        success: false,
        message:
          'All profile fields are required: displayName, riskPreference, initialDepositAmount, investmentPeriod',
      });
    }

    // Validate risk preference
    if (!['Conservative', 'Moderate', 'Aggressive'].includes(riskPreference)) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid risk preference. Must be Conservative, Moderate, or Aggressive',
      });
    }

    // Validate investment period
    if (
      !['1 month', '3 months', '6 months', '1 year'].includes(investmentPeriod)
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid investment period. Must be 1 month, 3 months, 6 months, or 1 year',
      });
    }

    // Map risk preference to basket
    let selectedBasket: number;
    switch (riskPreference) {
      case 'Conservative':
        selectedBasket = 0;
        break;
      case 'Moderate':
        selectedBasket = 1;
        break;
      case 'Aggressive':
        selectedBasket = 2;
        break;
      default:
        throw new Error('Invalid risk preference');
    }

    // Check if user already exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE "wallet_address" = $1',
      [address.toLowerCase()]
    );

    let user;

    if (existingUser.rows.length > 0) {
      // Update existing user
      const updateResult = await db.query(
        `UPDATE users 
         SET display_name = $1, risk_preference = $2, initial_deposit_amount = $3, 
             investment_period = $4, selected_basket = $5, updated_at = CURRENT_TIMESTAMP
         WHERE wallet_address = $6
         RETURNING *`,
        [
          displayName,
          riskPreference,
          initialDepositAmount,
          investmentPeriod,
          selectedBasket,
          address.toLowerCase(),
        ]
      );
      user = updateResult.rows[0];
      logger.info(`Updated existing user profile: ${address}`);
    } else {
      // Create new user
      const insertResult = await db.query(
        `INSERT INTO users (wallet_address, display_name, risk_preference, initial_deposit_amount, 
                           investment_period, selected_basket, total_deposits)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          address.toLowerCase(),
          displayName,
          riskPreference,
          initialDepositAmount,
          investmentPeriod,
          selectedBasket,
          initialDepositAmount,
        ]
      );
      user = insertResult.rows[0];

      // Log user registration to Hedera
      await hederaService.logUserRegistration(
        address,
        selectedBasket,
        riskPreference
      );
      logger.info(`Created new user profile: ${address}`);
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        walletAddress: user.wallet_address,
        displayName: user.display_name,
        selectedBasket: user.selected_basket,
        riskPreference: user.risk_preference,
        initialDepositAmount: user.initial_deposit_amount,
        investmentPeriod: user.investment_period,
        totalDeposits: user.total_deposits,
        totalEarned: user.total_earned,
        activeSince: user.active_since,
        registrationTimestamp: user.registration_timestamp,
        isRegistered: user.is_registered,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    });
  } catch (error) {
    logger.error('Error completing profile setup:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/users/:address/portfolio
 * Get user's portfolio details
 */
router.get('/:address/portfolio', async (req, res) => {
  try {
    const { address } = req.params;

    if (!isValidAddress(address)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet address format',
      });
    }

    // Get user data
    const userResult = await db.query(
      'SELECT * FROM users WHERE "wallet_address" = $1',
      [address.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const user = userResult.rows[0];
    const basketConfig =
      BASKET_CONFIGS[user.selected_basket as keyof typeof BASKET_CONFIGS];

    // Get current asset prices from Pyth (mock data for now)
    const assetPrices = {
      USDC: 1.0,
      ETH: 2500.0,
      BTC: 45000.0,
      SOL: 100.0,
      LINK: 15.0,
      AVAX: 25.0,
      MATIC: 0.8,
    };

    // Calculate portfolio breakdown
    const estimatedBalance = 10000;
    const portfolio = basketConfig.assets.map((asset: any) => ({
      symbol: asset.symbol,
      allocation: asset.allocation / 100, // Convert to percentage
      amount:
        (estimatedBalance * asset.allocation) /
        100 /
        (assetPrices[asset.symbol as keyof typeof assetPrices] || 1),
      usdValue: (estimatedBalance * asset.allocation) / 100,
      price: assetPrices[asset.symbol as keyof typeof assetPrices] || 1,
    }));

    logger.info(`Retrieved portfolio for user: ${address}`);

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          walletAddress: user.wallet_address,
          selectedBasket: user.selected_basket,
          registrationTimestamp: user.registration_timestamp,
          isRegistered: user.is_registered,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
        portfolio,
        totalValue: estimatedBalance,
        basketConfig,
      },
    });
  } catch (error) {
    logger.error('Error retrieving portfolio:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/users/:address/transactions
 * Get user's transaction history
 */
router.get('/:address/transactions', async (req, res) => {
  try {
    const { address } = req.params;

    if (!isValidAddress(address)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet address format',
      });
    }

    // First get the user to get their user_id
    const userResult = await db.query(
      'SELECT id FROM users WHERE "wallet_address" = $1',
      [address.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const userId = userResult.rows[0].id;

    const transactions = await db.query(
      'SELECT * FROM rebalancing_transactions WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 20',
      [userId]
    );

    logger.info(
      `Retrieved ${transactions.rows.length} transactions for user: ${address}`
    );

    return res.status(200).json({
      success: true,
      data: transactions.rows,
      count: transactions.rows.length,
    });
  } catch (error) {
    logger.error('Error retrieving transactions:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/users/:address/wallet/balance
 * Get wallet balance for a user
 */
router.get('/:address/wallet/balance', async (req, res) => {
  try {
    const { address } = req.params;

    if (!isValidAddress(address)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet address format',
      });
    }

    const balance = await walletService.getWalletBalance(address);

    logger.info(`Retrieved wallet balance for user: ${address}`);

    return res.status(200).json({
      success: true,
      data: balance,
    });
  } catch (error) {
    logger.error('Error retrieving wallet balance:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/users/:address/wallet/validate-deposit
 * Validate if user can deposit the specified amount
 */
router.post('/:address/wallet/validate-deposit', async (req, res) => {
  try {
    const { address } = req.params;
    const { amount, token = 'ETH' } = req.body;

    if (!isValidAddress(address)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet address format',
      });
    }

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid deposit amount is required',
      });
    }

    const isValid = await walletService.validateDepositAmount(
      address,
      amount,
      token
    );
    const balance = await walletService.getWalletBalance(address);

    logger.info(
      `Validated deposit for user: ${address}, amount: ${amount} ${token}`
    );

    return res.status(200).json({
      success: true,
      data: {
        isValid,
        requestedAmount: amount,
        token,
        availableBalance:
          token === 'ETH' ? balance.ethBalance : balance.usdcBalance,
        totalValueUSD: balance.totalValueUSD,
      },
    });
  } catch (error) {
    logger.error('Error validating deposit:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/users/:address/wallet/prepare-deposit
 * Prepare deposit transaction data
 */
router.post('/:address/wallet/prepare-deposit', async (req, res) => {
  try {
    const { address } = req.params;
    const { amount, token = 'ETH' } = req.body;

    if (!isValidAddress(address)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet address format',
      });
    }

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid deposit amount is required',
      });
    }

    // First validate the deposit amount
    const isValid = await walletService.validateDepositAmount(
      address,
      amount,
      token
    );
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance for deposit',
      });
    }

    const txData = await walletService.prepareDepositTransaction(
      address,
      amount,
      token
    );

    logger.info(`Prepared deposit transaction for user: ${address}`);

    return res.status(200).json({
      success: true,
      data: {
        transaction: txData,
        amount,
        token,
        from: address,
      },
    });
  } catch (error) {
    logger.error('Error preparing deposit transaction:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/users/:address/wallet/transaction/:txHash
 * Get transaction status
 */
router.get('/:address/wallet/transaction/:txHash', async (req, res) => {
  try {
    const { address, txHash } = req.params;

    if (!isValidAddress(address)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet address format',
      });
    }

    if (!txHash || !txHash.startsWith('0x')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction hash format',
      });
    }

    const transaction = await walletService.getTransactionStatus(txHash);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    logger.info(`Retrieved transaction status: ${txHash}`);

    return res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    logger.error('Error retrieving transaction status:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
