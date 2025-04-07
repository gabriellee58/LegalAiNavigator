import { db } from './db';
import { sql } from 'drizzle-orm';
import { log } from './vite';

/**
 * Run database migrations to add new columns
 */
export async function runDatabaseMigrations() {
  try {
    log('Running database migrations...', 'db');
    
    // Check if subcategory column exists in document_templates
    const subcategoryExists = await checkColumnExists('document_templates', 'subcategory');
    
    if (!subcategoryExists) {
      log('Adding subcategory column to document_templates table', 'db');
      await db.execute(sql`
        ALTER TABLE document_templates 
        ADD COLUMN subcategory TEXT
      `);
    }
    
    // Check if jurisdiction column exists in document_templates
    const jurisdictionExists = await checkColumnExists('document_templates', 'jurisdiction');
    
    if (!jurisdictionExists) {
      log('Adding jurisdiction column to document_templates table', 'db');
      await db.execute(sql`
        ALTER TABLE document_templates 
        ADD COLUMN jurisdiction TEXT DEFAULT 'Canada'
      `);
    }
    
    // Check if jurisdiction column exists in research_queries
    const researchJurisdictionExists = await checkColumnExists('research_queries', 'jurisdiction');
    
    if (!researchJurisdictionExists) {
      log('Adding jurisdiction and practice_area columns to research_queries table', 'db');
      await db.execute(sql`
        ALTER TABLE research_queries 
        ADD COLUMN jurisdiction TEXT DEFAULT 'canada',
        ADD COLUMN practice_area TEXT DEFAULT 'all'
      `);
    }
    
    log('Database migrations completed successfully', 'db');
  } catch (error) {
    log(`Database migration error: ${error}`, 'db');
    throw error;
  }
}

/**
 * Check if a column exists in a table
 */
async function checkColumnExists(tableName: string, columnName: string): Promise<boolean> {
  try {
    const result = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = ${tableName} 
      AND column_name = ${columnName}
    `);
    
    return result.length > 0;
  } catch (error) {
    log(`Error checking column existence: ${error}`, 'db');
    return false;
  }
}