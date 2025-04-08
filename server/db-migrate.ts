import { db } from './db';
import { sql } from 'drizzle-orm';

/**
 * Run database migrations to add new columns and tables
 */
export async function runDatabaseMigrations() {
  console.log('Starting database migrations...');
  
  // Check if saved_citations table exists, create if it doesn't
  const savedCitationsExists = await checkTableExists('saved_citations');
  if (!savedCitationsExists) {
    console.log('Creating saved_citations table...');
    await db.execute(sql`
      CREATE TABLE "saved_citations" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER REFERENCES "users"("id") ON DELETE CASCADE,
        "name" TEXT NOT NULL,
        "citation" TEXT NOT NULL,
        "source_name" TEXT,
        "source_url" TEXT,
        "notes" TEXT,
        "created_at" TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('saved_citations table created successfully');
  } else {
    console.log('saved_citations table already exists');
  }

  // Check if research_visualizations table exists, create if it doesn't
  const researchVisualizationsExists = await checkTableExists('research_visualizations');
  if (!researchVisualizationsExists) {
    console.log('Creating research_visualizations table...');
    await db.execute(sql`
      CREATE TABLE "research_visualizations" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER REFERENCES "users"("id") ON DELETE CASCADE,
        "query_id" INTEGER REFERENCES "research_queries"("id") ON DELETE CASCADE,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "visualization_type" TEXT NOT NULL,
        "visualization_data" JSONB NOT NULL,
        "is_public" BOOLEAN DEFAULT FALSE,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP
      )
    `);
    console.log('research_visualizations table created successfully');
  } else {
    console.log('research_visualizations table already exists');
  }

  // Check if legal_domains table exists, create if it doesn't
  const legalDomainsExists = await checkTableExists('legal_domains');
  if (!legalDomainsExists) {
    console.log('Creating legal_domains table...');
    await db.execute(sql`
      CREATE TABLE "legal_domains" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL UNIQUE,
        "description" TEXT NOT NULL,
        "parent_id" INTEGER,
        "resources" JSONB,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP
      )
    `);
    console.log('legal_domains table created successfully');
  } else {
    console.log('legal_domains table already exists');
  }

  // Check if domain_knowledge table exists, create if it doesn't
  const domainKnowledgeExists = await checkTableExists('domain_knowledge');
  if (!domainKnowledgeExists) {
    console.log('Creating domain_knowledge table...');
    await db.execute(sql`
      CREATE TABLE "domain_knowledge" (
        "id" SERIAL PRIMARY KEY,
        "domain_id" INTEGER REFERENCES "legal_domains"("id") ON DELETE CASCADE,
        "question" TEXT NOT NULL,
        "answer" TEXT NOT NULL,
        "language" TEXT DEFAULT 'en',
        "jurisdiction" TEXT DEFAULT 'canada',
        "tags" JSONB,
        "relevance_score" INTEGER DEFAULT 0,
        "sources" JSONB,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP
      )
    `);
    console.log('domain_knowledge table created successfully');
  } else {
    console.log('domain_knowledge table already exists');
  }

  // Check if procedural_guides table exists, create if it doesn't
  const proceduralGuidesExists = await checkTableExists('procedural_guides');
  if (!proceduralGuidesExists) {
    console.log('Creating procedural_guides table...');
    await db.execute(sql`
      CREATE TABLE "procedural_guides" (
        "id" SERIAL PRIMARY KEY,
        "domain_id" INTEGER REFERENCES "legal_domains"("id") ON DELETE CASCADE,
        "title" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "steps" JSONB NOT NULL,
        "jurisdiction" TEXT DEFAULT 'canada',
        "language" TEXT DEFAULT 'en',
        "estimated_time" TEXT,
        "prerequisites" JSONB,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP
      )
    `);
    console.log('procedural_guides table created successfully');
  } else {
    console.log('procedural_guides table already exists');
  }

  console.log('Database migrations completed successfully');
}

/**
 * Check if a table exists in the database
 */
async function checkTableExists(tableName: string): Promise<boolean> {
  const result = await db.execute<{ exists: boolean }>(sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name = ${tableName}
    );
  `);
  
  return result[0]?.exists || false;
}

/**
 * Check if a column exists in a table
 */
async function checkColumnExists(tableName: string, columnName: string): Promise<boolean> {
  const result = await db.execute<{ exists: boolean }>(sql`
    SELECT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public'
      AND table_name = ${tableName}
      AND column_name = ${columnName}
    );
  `);
  
  return result[0]?.exists || false;
}

// Run the migrations
runDatabaseMigrations()
  .then(() => {
    console.log('All migrations completed successfully');
  })
  .catch((error) => {
    console.error('Error running migrations:', error);
  });