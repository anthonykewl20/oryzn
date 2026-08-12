import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from "pg";

const globalForPool = globalThis as typeof globalThis & {
  oryznPool?: Pool;
};

export const pool =
  globalForPool.oryznPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPool.oryznPool = pool;
}

export function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  values?: readonly unknown[],
): Promise<QueryResult<T>> {
  return pool.query<T>(text, values ? [...values] : undefined);
}

export async function withTransaction<T>(
  operation: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await operation(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
