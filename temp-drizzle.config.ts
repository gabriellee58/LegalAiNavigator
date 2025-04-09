import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

export default defineConfig({
  schema: "./shared/schema.ts",
  out: "./drizzle",
  dialect: 'postgresql',
  // Remove the driver option
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
  },
  // Force all operations to be "creates" with no prompts
  verbose: true,
  strict: true,
  introspect: {
    casing: 'preserve',
  },
});