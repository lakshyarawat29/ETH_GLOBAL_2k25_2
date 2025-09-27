import express from 'express';
import { db } from '@/database/connection';
import { hederaService } from '@/services/hederaService';
import { logger } from '@/utils/logger';

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
      [walletAddress]
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
      [walletAddress, selectedBasket, new Date(), true]
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

export default router;
