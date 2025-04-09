// Non-interactive db push script
import { execSync } from 'child_process';
import * as fs from 'fs';

// Create temporary config to force all operations to "create"
const tempConfigContent = `
import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

export default defineConfig({
  schema: "./shared/schema.ts",
  out: "./drizzle",
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
  // Force all operations to be "creates" with no prompts
  verbose: true,
  strict: true,
  introspect: {
    casing: 'preserve',
  },
  forcePush: true,
});
`;

const TEMP_CONFIG_PATH = './temp-drizzle.config.ts';

try {
  // Create temporary config
  fs.writeFileSync(TEMP_CONFIG_PATH, tempConfigContent);
  console.log('Created temporary drizzle config with forcePush option');
  
  // Run drizzle-kit push with the temporary config
  console.log('Running drizzle-kit push...');
  execSync(`npx drizzle-kit push --config=${TEMP_CONFIG_PATH}`, { stdio: 'inherit' });
  
  console.log('Database schema updated successfully!');
} catch (error) {
  console.error('Error pushing schema changes:', error);
  process.exit(1);
} finally {
  // Clean up temporary config
  if (fs.existsSync(TEMP_CONFIG_PATH)) {
    fs.unlinkSync(TEMP_CONFIG_PATH);
    console.log('Cleaned up temporary config file');
  }
}