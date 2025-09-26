// lib/db.ts
import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

function makePool() {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Neon requires SSL
    // You can also add connectionTimeoutMillis: 10_000
  });
}

export const pool = global.__pgPool ?? makePool();
if (!global.__pgPool) global.__pgPool = pool;

export async function db<T = unknown>(sql: string, params: any[] = []): Promise<T[]> {
  const client = await pool.connect();
  try {
    const res = await client.query<T>(sql, params);
    return res.rows;
  } finally {
    client.release();
  }
}
