// lib/db.ts
import { Pool } from "pg";

declare global { var __pgPool: Pool | undefined; }

function makePool() {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
}

export const pool = global.__pgPool ?? makePool();
if (!global.__pgPool) global.__pgPool = pool;

export async function db<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const client = await pool.connect();
  try {
    const res = await client.query(sql, params); // no generic here
    return res.rows as T[];
  } finally {
    client.release();
  }
}
