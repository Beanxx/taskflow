import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema";

const sqlite = new Database(process.env.DATABASE_URL || "sqlite.db");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });

// Apply generated migrations on startup so `:memory:` test DBs get their tables.
migrate(db, { migrationsFolder: "./drizzle" });
