-- Hedera AI Basket System Database Schema

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS hedera_basket_db;

-- Use the database
\c hedera_basket_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    selected_basket INTEGER NOT NULL CHECK (selected_basket >= 0 AND selected_basket <= 2),
    registration_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_registered BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Yield data table for individual assets
CREATE TABLE IF NOT EXISTS yields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_symbol VARCHAR(10) NOT NULL,
    asset_address VARCHAR(42) NOT NULL,
    apr_basis_points INTEGER NOT NULL, -- APR in basis points (10000 = 100%)
    source VARCHAR(20) DEFAULT 'pyth', -- 'pyth' or 'manual'
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Basket yield history
CREATE TABLE IF NOT EXISTS basket_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    basket_id INTEGER NOT NULL CHECK (basket_id >= 0 AND basket_id <= 2),
    basket_name VARCHAR(50) NOT NULL,
    average_yield_basis_points INTEGER NOT NULL,
    weighted_yield_basis_points INTEGER NOT NULL,
    asset_yields JSONB NOT NULL, -- Store individual asset yields as JSON
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI recommendations table
CREATE TABLE IF NOT EXISTS decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recommended_basket INTEGER NOT NULL CHECK (recommended_basket >= 0 AND recommended_basket <= 2),
    confidence_score INTEGER NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
    reasoning TEXT NOT NULL,
    expected_yield_basis_points INTEGER,
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rebalancing transactions table
CREATE TABLE IF NOT EXISTS rebalancing_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    from_basket INTEGER NOT NULL CHECK (from_basket >= 0 AND from_basket <= 2),
    to_basket INTEGER NOT NULL CHECK (to_basket >= 0 AND to_basket <= 2),
    swap_data JSONB,
    transaction_hash VARCHAR(66),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    gas_used BIGINT,
    error_message TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hedera consensus events log
CREATE TABLE IF NOT EXISTS consensus_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(30) NOT NULL CHECK (event_type IN (
        'AI_DECISION', 'REBALANCING_START', 'REBALANCING_SUCCESS', 
        'REBALANCING_FAILED', 'YIELD_UPDATE', 'USER_REGISTRATION'
    )),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    basket_id INTEGER,
    data_hash VARCHAR(66) NOT NULL,
    message TEXT NOT NULL,
    consensus_topic_id VARCHAR(66),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pyth price feeds cache
CREATE TABLE IF NOT EXISTS pyth_price_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    price_feed_id VARCHAR(66) NOT NULL,
    asset_symbol VARCHAR(10) NOT NULL,
    price BIGINT NOT NULL, -- Price with proper decimal scaling
    confidence_interval BIGINT NOT NULL,
    exponent INTEGER NOT NULL,
    publish_time BIGINT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System configuration table
CREATE TABLE IF NOT EXISTS system_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_selected_basket ON users(selected_basket);
CREATE INDEX IF NOT EXISTS idx_yields_asset_symbol ON yields(asset_symbol);
CREATE INDEX IF NOT EXISTS idx_yields_timestamp ON yields(timestamp);
CREATE INDEX IF NOT EXISTS idx_basket_history_basket_id ON basket_history(basket_id);
CREATE INDEX IF NOT EXISTS idx_basket_history_timestamp ON basket_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_decisions_user_id ON decisions(user_id);
CREATE INDEX IF NOT EXISTS idx_decisions_timestamp ON decisions(timestamp);
CREATE INDEX IF NOT EXISTS idx_rebalancing_user_id ON rebalancing_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_rebalancing_status ON rebalancing_transactions(status);
CREATE INDEX IF NOT EXISTS idx_consensus_events_user_id ON consensus_events(user_id);
CREATE INDEX IF NOT EXISTS idx_consensus_events_event_type ON consensus_events(event_type);
CREATE INDEX IF NOT EXISTS idx_pyth_cache_asset_symbol ON pyth_price_cache(asset_symbol);
CREATE INDEX IF NOT EXISTS idx_pyth_cache_timestamp ON pyth_price_cache(timestamp);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rebalancing_transactions_updated_at BEFORE UPDATE ON rebalancing_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default system configuration
INSERT INTO system_config (config_key, config_value, description) VALUES
('rebalance_interval_hours', '24', 'Hours between rebalancing cycles'),
('min_confidence_threshold', '70', 'Minimum AI confidence threshold for rebalancing'),
('pyth_update_interval_seconds', '60', 'Seconds between Pyth price updates'),
('basket_count', '3', 'Total number of available baskets'),
('last_yield_update', '', 'Timestamp of last yield data update'),
('ai_model_version', 'gemini-pro', 'Current AI model being used'),
('hedera_network', 'testnet', 'Hedera network being used')
ON CONFLICT (config_key) DO NOTHING;

-- Sample data for testing (optional)
INSERT INTO users (wallet_address, selected_basket) VALUES
('0x742d35Cc6634C0532925a3b8D0e7C6C9C2b5b5b5', 0),
('0x842d35Cc6634C0532925a3b8D0e7C6C9C2b5b5b6', 1),
('0x942d35Cc6634C0532925a3b8D0e7C6C9C2b5b5b7', 2)
ON CONFLICT (wallet_address) DO NOTHING;
