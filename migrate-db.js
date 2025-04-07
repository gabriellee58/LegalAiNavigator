import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

// Create Postgres client
const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString);

// Create Drizzle instance
const db = drizzle(client);

// Run migrations
async function main() {
  console.log('Starting database migrations...');
  
  // Create saved_citations table if it doesn't exist
  try {
    await client`
      CREATE TABLE IF NOT EXISTS "saved_citations" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER REFERENCES "users"("id") ON DELETE CASCADE,
        "name" TEXT NOT NULL,
        "citation" TEXT NOT NULL,
        "source_name" TEXT,
        "source_url" TEXT,
        "notes" TEXT,
        "created_at" TIMESTAMP DEFAULT NOW()
      );
    `;
    console.log('saved_citations table created or verified.');
  } catch (error) {
    console.error('Error creating saved_citations table:', error);
  }

  // Create research_visualizations table if it doesn't exist
  try {
    await client`
      CREATE TABLE IF NOT EXISTS "research_visualizations" (
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
      );
    `;
    console.log('research_visualizations table created or verified.');
  } catch (error) {
    console.error('Error creating research_visualizations table:', error);
  }
  
  console.log('Database migrations completed.');
  
  // Close connection
  await client.end();
}

main().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});