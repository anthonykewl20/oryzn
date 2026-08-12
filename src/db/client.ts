import { Pool, type QueryResult, type QueryResultRow } from "pg";

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
