-- =============================================
-- Users Table
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    nickname VARCHAR(255),
    avatar_url VARCHAR(255),
    locale VARCHAR(50) DEFAULT 'en',
    signin_type VARCHAR(50),
    signin_ip VARCHAR(255),
    signin_provider VARCHAR(50),
    signin_openid VARCHAR(255),
    invite_code VARCHAR(255) NOT NULL DEFAULT '',
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    invited_by VARCHAR(255) NOT NULL DEFAULT '',
    is_affiliate BOOLEAN NOT NULL DEFAULT false,
    UNIQUE (email, signin_provider)
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_uuid ON users(uuid);
CREATE INDEX IF NOT EXISTS idx_users_signin_provider ON users(signin_provider);

-- =============================================
-- Credits Table
-- =============================================
CREATE TABLE IF NOT EXISTS credits (
    id SERIAL PRIMARY KEY,
    user_uuid VARCHAR(255) NOT NULL,
    balance INTEGER NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_uuid)
);

CREATE INDEX IF NOT EXISTS idx_credits_user_uuid ON credits(user_uuid);

-- =============================================
-- Credit History Table
-- =============================================
CREATE TABLE IF NOT EXISTS credit_history (
    id SERIAL PRIMARY KEY,
    user_uuid VARCHAR(255) NOT NULL,
    amount INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_credit_history_user_uuid ON credit_history(user_uuid);
CREATE INDEX IF NOT EXISTS idx_credit_history_created_at ON credit_history(created_at);

-- =============================================
-- Orders Table
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_no VARCHAR(255) UNIQUE NOT NULL,
    user_uuid VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    interval VARCHAR(50),
    expired_at timestamptz,
    status VARCHAR(50) NOT NULL DEFAULT 'created',
    stripe_session_id VARCHAR(255),
    credits INTEGER NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'usd',
    sub_id VARCHAR(255),
    sub_interval_count INTEGER,
    sub_cycle_anchor BIGINT,
    sub_period_end BIGINT,
    sub_period_start BIGINT,
    sub_times INTEGER DEFAULT 0,
    product_id VARCHAR(255),
    product_name VARCHAR(255),
    valid_months INTEGER,
    order_detail TEXT,
    paid_at timestamptz,
    paid_email VARCHAR(255),
    paid_detail TEXT,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_order_no ON orders(order_no);
CREATE INDEX IF NOT EXISTS idx_orders_user_uuid ON orders(user_uuid);
CREATE INDEX IF NOT EXISTS idx_orders_user_email ON orders(user_email);
CREATE INDEX IF NOT EXISTS idx_orders_paid_email ON orders(paid_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
