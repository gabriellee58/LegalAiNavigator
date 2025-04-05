import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

// Database client connection with postgres.js
const connectionString = process.env.DATABASE_URL;

// For query purposes (Drizzle)
const queryClient = postgres(connectionString!);
export const db = drizzle(queryClient, { schema });