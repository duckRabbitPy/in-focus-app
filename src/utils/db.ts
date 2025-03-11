import { Pool } from 'pg';

// Database configuration
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'in_focus',
});

// Helper function to get a client from the pool
export async function getClient() {
  const client = await pool.connect();
  return client;
}

// Helper function to execute a query and return the results
export async function query<T>(text: string, params?: any[]): Promise<T[]> {
  const client = await getClient();
  try {
    const result = await client.query(text, params);
    return result.rows as T[];
  } finally {
    client.release();
  }
}

// Helper function to execute a single-row query
export async function queryOne<T>(text: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] || null;
}

// Helper function to execute a transaction
export async function transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

// Types for database entities
export interface DBUser {
  id: string; // UUID
  username: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface DBRoll {
  id: number; // SERIAL
  user_id: string; // UUID from users table
  name: string;
  film_type: string | null;
  iso: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface DBPhoto {
  id: number; // SERIAL
  roll_id: number; // SERIAL from rolls table
  subject: string | null;
  photo_url: string | null;
  f_stop: number | null;
  focal_distance: string | null;
  shutter_speed: string | null;
  exposure_value: number | null;
  phone_light_meter: string | null;
  stabilisation: string | null;
  timer: boolean;
  flash: boolean;
  exposure_memory: boolean;
  sequence_number: number;
  created_at: Date;
  updated_at: Date;
} 