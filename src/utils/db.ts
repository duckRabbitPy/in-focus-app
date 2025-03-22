import { Pool, PoolClient } from "pg";

// Database configuration
const pool = new Pool(
  process.env.VERCEL_ENV === "production"
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: true,
        },
      }
    : {
        user: process.env.POSTGRES_USER || "postgres",
        password: process.env.POSTGRES_PASSWORD,
        host: process.env.POSTGRES_HOST || "localhost",
        port: parseInt(process.env.POSTGRES_PORT || "5432"),
        database: process.env.POSTGRES_DB || "in_focus",
      }
);

// Helper function to get a client from the pool
export async function getClient() {
  const client = await pool.connect();
  return client;
}

// Helper function to execute a query and return the results
export async function query<T>(text: string, params?: unknown[]): Promise<T[]> {
  const client = await getClient();
  try {
    const result = await client.query(text, params);
    return result.rows as T[];
  } finally {
    client.release();
  }
}

// Helper function to execute a single-row query
export async function queryOne<T>(
  text: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] || null;
}

// Helper function to execute a transaction
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getClient();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}
