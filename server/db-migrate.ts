import { sql } from 'drizzle-orm';
import { db } from './db';
import { logInfo, logError, logWarn } from './utils/logger';

/**
 * Run database migrations to add new columns and tables
 */
export async function runDatabaseMigrations() {
  logInfo('Starting database migrations check');
  
  try {
    // Check and create user_feedback table if it doesn't exist
    const userFeedbackExists = await checkTableExists('user_feedback');
    if (!userFeedbackExists) {
      logInfo('Creating user_feedback table');
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS user_feedback (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          feedback_type VARCHAR(50) NOT NULL,
          content TEXT NOT NULL,
          status VARCHAR(20) DEFAULT 'pending',
          admin_response TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }
    
    // Check and create legal_domains table if it doesn't exist
    const legalDomainsExists = await checkTableExists('legal_domains');
    if (!legalDomainsExists) {
      logInfo('Creating legal_domains table');
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS legal_domains (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL UNIQUE,
          slug VARCHAR(100) NOT NULL UNIQUE,
          description TEXT,
          icon VARCHAR(50),
          priority INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }
    
    // Check and create domain_knowledge table if it doesn't exist
    const domainKnowledgeExists = await checkTableExists('domain_knowledge');
    if (!domainKnowledgeExists) {
      logInfo('Creating domain_knowledge table');
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS domain_knowledge (
          id SERIAL PRIMARY KEY,
          domain_id INTEGER NOT NULL REFERENCES legal_domains(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          content_type VARCHAR(50) DEFAULT 'general',
          references TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }
    
    // Check and create procedural_guides table if it doesn't exist
    const proceduralGuidesExists = await checkTableExists('procedural_guides');
    if (!proceduralGuidesExists) {
      logInfo('Creating procedural_guides table');
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS procedural_guides (
          id SERIAL PRIMARY KEY,
          domain_id INTEGER NOT NULL REFERENCES legal_domains(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          steps JSONB NOT NULL,
          description TEXT,
          jurisdiction VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }
    
    // Check and create provincial_information table if it doesn't exist
    const provincialInfoExists = await checkTableExists('provincial_information');
    if (!provincialInfoExists) {
      logInfo('Creating provincial_information table');
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS provincial_information (
          id SERIAL PRIMARY KEY,
          province VARCHAR(50) NOT NULL,
          domain_id INTEGER NOT NULL REFERENCES legal_domains(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          links JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(province, domain_id, title)
        )
      `);
    }
    
    // Check users table for language preference column
    const languagePrefExists = await checkColumnExists('users', 'preferred_language');
    if (!languagePrefExists) {
      logInfo('Adding preferred_language column to users table');
      await db.execute(sql`
        ALTER TABLE users ADD COLUMN preferred_language VARCHAR(10) DEFAULT 'en'
      `);
    }
    
    // Check for document_templates foreign key to legal_domains
    const domainFkExists = await checkColumnExists('document_templates', 'domain_id');
    if (!domainFkExists && await checkTableExists('document_templates')) {
      logInfo('Adding domain_id column to document_templates table');
      await db.execute(sql`
        ALTER TABLE document_templates ADD COLUMN domain_id INTEGER REFERENCES legal_domains(id) ON DELETE SET NULL
      `);
    }

    // Check and create subscription_plans table if it doesn't exist
    const subscriptionPlansExists = await checkTableExists('subscription_plans');
    if (!subscriptionPlansExists) {
      logInfo('Creating subscription_plans table');
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS subscription_plans (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT NOT NULL,
          price NUMERIC NOT NULL,
          stripe_price_id TEXT NOT NULL,
          interval TEXT DEFAULT 'month',
          features JSONB NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          tier TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP
        )
      `);
      
      // Populate with default subscription plans
      logInfo('Adding default subscription plans');
      await db.execute(sql`
        INSERT INTO subscription_plans 
          (name, description, price, stripe_price_id, interval, features, tier)
        VALUES 
          ('Basic Plan', 'Essential legal tools for individuals and small businesses', 14.99, 'price_basic_monthly', 'month', 
           '{"documentLimit":10,"researchLimit":20,"contractLimit":5,"chatLimit":50}', 'basic'),
          ('Professional Plan', 'Comprehensive legal solutions for businesses', 29.99, 'price_professional_monthly', 'month', 
           '{"documentLimit":50,"researchLimit":100,"contractLimit":20,"chatLimit":200}', 'professional'),
          ('Enterprise Plan', 'Full legal platform for large organizations', 79.99, 'price_enterprise_monthly', 'month', 
           '{"documentLimit":-1,"researchLimit":-1,"contractLimit":-1,"chatLimit":-1}', 'enterprise')
      `);
    }
    
    // Check and create user_subscriptions table if it doesn't exist
    const userSubscriptionsExists = await checkTableExists('user_subscriptions');
    if (!userSubscriptionsExists) {
      logInfo('Creating user_subscriptions table');
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS user_subscriptions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
          plan_id TEXT NOT NULL,
          stripe_customer_id TEXT,
          stripe_subscription_id TEXT,
          status TEXT NOT NULL DEFAULT 'trial',
          current_period_start TIMESTAMP,
          current_period_end TIMESTAMP,
          trial_start TIMESTAMP,
          trial_end TIMESTAMP,
          canceled_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP
        )
      `);
    }
    
    // Check and create user_usage table if it doesn't exist
    const userUsageExists = await checkTableExists('user_usage');
    if (!userUsageExists) {
      logInfo('Creating user_usage table');
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS user_usage (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
          period_start TIMESTAMP NOT NULL,
          period_end TIMESTAMP NOT NULL,
          document_gen_count INTEGER DEFAULT 0,
          research_query_count INTEGER DEFAULT 0,
          contract_analysis_count INTEGER DEFAULT 0,
          ai_chat_message_count INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP
        )
      `);
    }
    
    logInfo('Database migrations completed successfully');
  } catch (error) {
    logError(`Database migration failed: ${(error as Error).message}`);
    throw error;
  }
}

/**
 * Check if a table exists in the database
 */
async function checkTableExists(tableName: string): Promise<boolean> {
  const result = await db.execute(sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name = ${tableName}
    ) AS exists
  `);
  return result[0]?.exists === true;
}

/**
 * Check if a column exists in a table
 */
async function checkColumnExists(tableName: string, columnName: string): Promise<boolean> {
  if (!(await checkTableExists(tableName))) {
    return false;
  }
  
  const result = await db.execute(sql`
    SELECT EXISTS (
      SELECT FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = ${tableName}
      AND column_name = ${columnName}
    ) AS exists
  `);
  return result[0]?.exists === true;
}