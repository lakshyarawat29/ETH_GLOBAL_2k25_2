const { Pool } = require('pg');

// Use the same database connection as the backend
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'hedera_basket_db', // This should match the backend config
  user: 'lakshyarawat', // Use the correct user
  password: '', // No password needed for local setup
});

async function insertTestData() {
  try {
    console.log('📊 Inserting test data...');

    // Test connection first
    const testResult = await pool.query('SELECT 1 as test');
    console.log('✅ Database connection successful');

    // Get user ID
    const userResult = await pool.query(
      "SELECT id FROM users WHERE wallet_address = '0x4d02e03f112d0336f412f4590a35d79aa17c9047'"
    );

    if (userResult.rows.length === 0) {
      console.log('❌ User not found');
      return;
    }

    const userId = userResult.rows[0].id;
    console.log('👤 User ID:', userId);

    // Insert mock transactions
    const insertTxQuery = `
      INSERT INTO rebalancing_transactions (
        user_id, 
        from_basket, 
        to_basket, 
        swap_data, 
        status, 
        transaction_hash, 
        timestamp,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;

    const transactions = [
      [
        userId,
        0,
        1,
        JSON.stringify({
          fromTokens: [{ symbol: 'USDC', amount: 6000 }],
          toTokens: [
            { symbol: 'ETH', amount: 2.5 },
            { symbol: 'BTC', amount: 0.15 },
          ],
          estimatedGas: 75000,
          slippage: 0.5,
        }),
        'completed',
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      ],

      [
        userId,
        1,
        2,
        JSON.stringify({
          fromTokens: [
            { symbol: 'ETH', amount: 1.2 },
            { symbol: 'BTC', amount: 0.08 },
          ],
          toTokens: [
            { symbol: 'SOL', amount: 45 },
            { symbol: 'AVAX', amount: 12 },
          ],
          estimatedGas: 85000,
          slippage: 0.8,
        }),
        'completed',
        '0x2345678901bcdef12345678901bcdef12345678901bcdef12345678901bcdef1',
        new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      ],

      [
        userId,
        2,
        1,
        JSON.stringify({
          fromTokens: [
            { symbol: 'SOL', amount: 25 },
            { symbol: 'AVAX', amount: 8 },
          ],
          toTokens: [
            { symbol: 'ETH', amount: 0.9 },
            { symbol: 'BTC', amount: 0.06 },
          ],
          estimatedGas: 65000,
          slippage: 0.3,
        }),
        'pending',
        '0x3456789012cdef123456789012cdef123456789012cdef123456789012cdef12',
        new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      ],

      [
        userId,
        1,
        0,
        JSON.stringify({
          fromTokens: [
            { symbol: 'ETH', amount: 0.5 },
            { symbol: 'BTC', amount: 0.03 },
          ],
          toTokens: [{ symbol: 'USDC', amount: 2000 }],
          estimatedGas: 55000,
          slippage: 0.2,
        }),
        'failed',
        '0x4567890123def1234567890123def1234567890123def1234567890123def123',
        new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      ],

      [
        userId,
        0,
        2,
        JSON.stringify({
          fromTokens: [{ symbol: 'USDC', amount: 3000 }],
          toTokens: [
            { symbol: 'SOL', amount: 120 },
            { symbol: 'LINK', amount: 200 },
          ],
          estimatedGas: 70000,
          slippage: 0.6,
        }),
        'completed',
        '0x5678901234ef12345678901234ef12345678901234ef12345678901234ef1234',
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      ],
    ];

    for (const tx of transactions) {
      await pool.query(insertTxQuery, tx);
    }

    console.log('✅ Inserted 5 mock transactions');

    // Insert AI predictions
    const insertPredQuery = `
      INSERT INTO decisions (
        user_id,
        recommended_basket,
        confidence_score,
        reasoning,
        expected_yield_basis_points,
        risk_score,
        timestamp,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;

    const predictions = [
      [
        userId,
        1,
        85,
        'Strong performance in ETH and BTC markets, moderate volatility expected',
        5200,
        65,
        new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      ],
      [
        userId,
        2,
        72,
        'High risk but potential for significant gains in SOL and AVAX',
        6800,
        85,
        new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      ],
      [
        userId,
        0,
        95,
        'Conservative approach recommended due to market uncertainty',
        3200,
        25,
        new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      ],
    ];

    for (const pred of predictions) {
      await pool.query(insertPredQuery, pred);
    }

    console.log('✅ Inserted 3 AI predictions');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

insertTestData();
