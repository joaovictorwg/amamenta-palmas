/**
 * Run this script once to register already-applied migrations in the
 * __drizzle_migrations table so `db:migrate` works correctly going forward.
 *
 * Usage: pnpm tsx src/shared/database/utils/fixMigrationsJournal.ts
 */
import { createHash } from "crypto";
import { readFileSync } from "fs";
import { join } from "path";
import { Pool } from "pg";
import { env } from "@/shared/config/env";

const pool = new Pool({ connectionString: env.DATABASE_URL });

const migrationsDir = join(process.cwd(), "drizzle");

// All migration files that are already applied in the DB but not in __drizzle_migrations
const migrations = [
    { idx: 0, file: "0000_tidy_silverclaw.sql", when: 1773099217116 },
    { idx: 1, file: "0001_amusing_vampiro.sql", when: 1773234697315 },
    { idx: 2, file: "0002_violet_roxanne_simpson.sql", when: 1773493125384 },
    { idx: 3, file: "0003_silly_galactus.sql", when: 1773585349181 },
    { idx: 4, file: "0004_minor_princess_powerful.sql", when: 1776032783294 },
    { idx: 5, file: "0005_light_fantastic_four.sql", when: 1776367338380 },
    { idx: 6, file: "0006_sturdy_triathlon.sql", when: 1776432853857 },
];

function hashSql(sql: string): string {
    return createHash("sha256").update(sql).digest("hex");
}

async function run() {
    const client = await pool.connect();
    try {
        // Ensure the table exists (drizzle creates it on first migrate)
        await client.query(`
      CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      )
    `);

        for (const m of migrations) {
            const sql = readFileSync(join(migrationsDir, m.file), "utf-8");
            const hash = hashSql(sql);

            const exists = await client.query(
                `SELECT 1 FROM "__drizzle_migrations" WHERE hash = $1`,
                [hash]
            );

            if (exists.rowCount === 0) {
                await client.query(
                    `INSERT INTO "__drizzle_migrations" (hash, created_at) VALUES ($1, $2)`,
                    [hash, m.when]
                );
                console.log(`✓ Registered: ${m.file}`);
            } else {
                console.log(`- Already registered: ${m.file}`);
            }
        }

        console.log("\nDone. You can now run `pnpm db:migrate` normally.");
    } finally {
        client.release();
        await pool.end();
    }
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
