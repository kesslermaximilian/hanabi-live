import { parseIntSafe } from "@hanabi/utils";
import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { chatLogTable } from "./databaseSchema";
import { logger } from "./logger";

// eslint-disable-next-line import/no-mutable-exports
export let db: PostgresJsDatabase;

export async function databaseInit(): Promise<void> {
  const config = getDatabaseConfig();
  const client = postgres(config);
  db = drizzle(client);

  await testDB();
}

/**
 * Read the database configuration from environment variables. (They should already be loaded from
 * the ".env" file at this point.)
 */
function getDatabaseConfig() {
  let host = process.env["DB_HOST"];
  if (host === undefined || host === "") {
    host = "localhost";
    logger.info(`DB_HOST not specified; using a default value of: ${host}`);
  }

  const portString = process.env["DB_PORT"];
  let port: number;
  if (portString === undefined || portString === "") {
    port = 5432; // The default port for PostgreSQL.
    logger.info(`DB_PORT not specified; using a default value of: ${port}`);
  } else {
    port = parseIntSafe(portString);
    if (Number.isNaN(port)) {
      throw new TypeError(
        `Failed to parse the "DB_PORT" environment variable: ${portString}`,
      );
    }
  }

  let user = process.env["DB_USER"];
  if (user === undefined || user === "") {
    user = "hanabiuser";
    logger.info(`DB_USER not specified; using a default value of: ${user}`);
  }

  let password = process.env["DB_PASSWORD"];
  if (password === undefined || password === "") {
    password = "1234567890";
    logger.info(
      `DB_PASSWORD not specified; using a default value of: ${password}`,
    );
  }

  let database = process.env["DB_NAME"];
  if (database === undefined || database === "") {
    database = "hanabi";
    logger.info(`DB_NAME not specified; using a default value of: ${database}`);
  }

  return {
    host,
    port,
    user,
    password,
    database,
  };
}

async function testDB() {
  const chatLogs = await db
    .select({
      message: chatLogTable.message,
    })
    .from(chatLogTable)
    .where(eq(chatLogTable.id, 1));
  const chatLog = chatLogs[0];

  if (chatLog === undefined || chatLog.message === "") {
    throw new Error(
      'Failed to retrieve the first chat log message from the database when testing to see if the database is operational. Did you already run the "install_database_schema.sh" script to set up the database?',
    );
  }
}
