-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Public Schema: Tenants
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  plan VARCHAR(50) NOT NULL DEFAULT 'starter',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  region VARCHAR(100) DEFAULT 'us-east-1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Public Schema: Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plan VARCHAR(50) NOT NULL,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  worker_limit INTEGER NOT NULL DEFAULT 50,
  project_limit INTEGER NOT NULL DEFAULT 3,
  current_period_end TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Public Schema: Billing Events
CREATE TABLE IF NOT EXISTS billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Public Schema: Migration Log
CREATE TABLE IF NOT EXISTS migration_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  version VARCHAR(50) NOT NULL,
  ran_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT
);
