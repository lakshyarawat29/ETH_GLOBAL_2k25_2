const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'hedera_ai_basket',
  user: 'postgres',
  password: 'password',
});

async function insertTestData() {
  try {
    console.log('📊 Inserting test data...');

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
    const transactions = [
      {
        from_basket_id: 0,
        to_basket_id: 1,
        swap_details: {
          fromTokens: [{ symbol: 'USDC', amount: 6000 }],
          toTokens: [
            { symbol: 'ETH', amount: 2.5 },
            { symbol: 'BTC', amount: 0.15 },
          ],
          estimatedGas: 75000,
          slippage: 0.5,
        },
        status: 'completed',
        transaction_hash:
          '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        from_basket_id: 1,
        to_basket_id: 2,
        swap_details: {
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
        },
        status: 'completed',
        transaction_hash:
          '0x2345678901bcdef12345678901bcdef12345678901bcdef12345678901bcdef1',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      {
        from_basket_id: 2,
        to_basket_id: 1,
        swap_details: {
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
        },
        status: 'pending',
        transaction_hash:
          '0x3456789012cdef123456789012cdef123456789012cdef123456789012cdef12',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        from_basket_id: 1,
        to_basket_id: 0,
        swap_details: {
          fromTokens: [
            { symbol: 'ETH', amount: 0.5 },
            { symbol: 'BTC', amount: 0.03 },
          ],
          toTokens: [{ symbol: 'USDC', amount: 2000 }],
          estimatedGas: 55000,
          slippage: 0.2,
        },
        status: 'failed',
        transaction_hash:
          '0x4567890123def1234567890123def1234567890123def1234567890123def123',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      {
        from_basket_id: 0,
        to_basket_id: 2,
        swap_details: {
          fromTokens: [{ symbol: 'USDC', amount: 3000 }],
          toTokens: [
            { symbol: 'SOL', amount: 120 },
            { symbol: 'LINK', amount: 200 },
          ],
          estimatedGas: 70000,
          slippage: 0.6,
        },
        status: 'completed',
        transaction_hash:
          '0x5678901234ef12345678901234ef12345678901234ef12345678901234ef1234',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
    ];

    for (const tx of transactions) {
      await pool.query(
        `
        INSERT INTO rebalancing_transactions (
          user_id, 
          from_basket_id, 
          to_basket_id, 
          swap_details, 
          status, 
          transaction_hash, 
          timestamp,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
        [
          userId,
          tx.from_basket_id,
          tx.to_basket_id,
          JSON.stringify(tx.swap_details),
          tx.status,
          tx.transaction_hash,
          tx.timestamp,
          tx.timestamp,
        ]
      );
    }

    console.log('✅ Inserted 5 mock transactions');

    // Insert AI predictions
    const predictions = [
      {
        basket_id: 1,
        confidence_score: 0.85,
        reasoning:
          'Strong performance in ETH and BTC markets, moderate volatility expected',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        basket_id: 2,
        confidence_score: 0.72,
        reasoning:
          'High risk but potential for significant gains in SOL and AVAX',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        basket_id: 0,
        confidence_score: 0.95,
        reasoning:
          'Conservative approach recommended due to market uncertainty',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    ];

    for (const prediction of predictions) {
      await pool.query(
        `
        INSERT INTO decisions (
          basket_id,
          confidence,
          reasoning,
          timestamp,
          created_at
        ) VALUES ($1, $2, $3, $4, $5)
      `,
        [
          prediction.basket_id,
          prediction.confidence_score,
          prediction.reasoning,
          prediction.timestamp,
          prediction.timestamp,
        ]
      );
    }

    console.log('✅ Inserted 3 AI predictions');

    // Insert consensus events
    const events = [
      {
        event_type: 'ai_recommendation',
        data: {
          recommended_basket: 1,
          confidence: 0.85,
          reasoning: 'Medium risk basket shows optimal risk-return profile',
        },
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        event_type: 'rebalancing_success',
        data: {
          user_address: '0x4d02e03f112d0336f412f4590a35d79aa17c9047',
          from_basket: 0,
          to_basket: 1,
          transaction_hash:
            '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        },
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        event_type: 'yield_update',
        data: {
          basket_id: 1,
          new_yield: 5.2,
          previous_yield: 4.8,
          source: 'pyth_network',
        },
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    ];

    for (const event of events) {
      await pool.query(
        `
        INSERT INTO consensus_events (
          event_type,
          data,
          timestamp,
          created_at
        ) VALUES ($1, $2, $3, $4)
      `,
        [
          event.event_type,
          JSON.stringify(event.data),
          event.timestamp,
          event.timestamp,
        ]
      );
    }

    console.log('✅ Inserted 3 consensus events');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

insertTestData();
