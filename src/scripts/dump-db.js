// Genera db/schema.sql y db/dump.sql consultando la BD via mysql2.
// Alternativa a mysqldump para no depender del CLI ni exponer password.
//
//   node src/scripts/dump-db.js
//   node src/scripts/dump-db.js --schema-only   (solo CREATE TABLEs)
//   node src/scripts/dump-db.js --data-only     (solo INSERTs, sin CREATE)
//
// Lee DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE del .env.

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createPool } from "mysql2/promise";
import "dotenv/config";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");
const DB_DIR = join(ROOT, "db");

const args = new Set(process.argv.slice(2));
const SCHEMA_ONLY = args.has("--schema-only");
const DATA_ONLY = args.has("--data-only");

const main = async () => {
  const pool = createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });

  const [tables] = await pool.query(
    "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME",
    [process.env.DB_DATABASE]
  );
  const tableNames = tables.map((t) => t.TABLE_NAME);

  let out = `-- VANT database dump\n-- Source: ${process.env.DB_HOST}/${process.env.DB_DATABASE}\n-- Generated: ${new Date().toISOString()}\n-- Tables: ${tableNames.length}\n\n`;
  out += "SET FOREIGN_KEY_CHECKS = 0;\n\n";

  if (!DATA_ONLY) {
    out += "-- =====================================================\n";
    out += "-- SCHEMA (CREATE TABLE)\n";
    out += "-- =====================================================\n\n";

    for (const table of tableNames) {
      const [createRows] = await pool.query(
        `SHOW CREATE TABLE \`${table}\``
      );
      const createSQL = createRows[0]["Create Table"];
      out += `DROP TABLE IF EXISTS \`${table}\`;\n${createSQL};\n\n`;
    }
  }

  if (!SCHEMA_ONLY) {
    out += "-- =====================================================\n";
    out += "-- DATA (INSERT)\n";
    out += "-- =====================================================\n\n";

    for (const table of tableNames) {
      const [rows] = await pool.query(`SELECT * FROM \`${table}\``);
      if (rows.length === 0) {
        out += `-- (table \`${table}\` is empty)\n\n`;
        continue;
      }
      const cols = Object.keys(rows[0]);
      const colList = cols.map((c) => `\`${c}\``).join(", ");
      out += `INSERT INTO \`${table}\` (${colList}) VALUES\n`;
      const values = rows.map((row) => {
        const vals = cols.map((col) => {
          const v = row[col];
          if (v === null) return "NULL";
          if (v instanceof Date) return `'${v.toISOString().slice(0, 19).replace("T", " ")}'`;
          if (typeof v === "number") return String(v);
          const s = String(v).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
          return `'${s}'`;
        });
        return `  (${vals.join(", ")})`;
      });
      out += values.join(",\n") + ";\n\n";
    }
  }

  out += "SET FOREIGN_KEY_CHECKS = 1;\n";

  mkdirSync(DB_DIR, { recursive: true });
  const filename = DATA_ONLY ? "data.sql" : (SCHEMA_ONLY ? "schema.sql" : "dump.sql");
  const filepath = join(DB_DIR, filename);
  writeFileSync(filepath, out);
  await pool.end();

  console.log(`[dump] OK (${tableNames.length} tables, ${out.length} bytes): ${filepath}`);
  process.exit(0);
};

main().catch((e) => {
  console.error("[dump] FAIL:", e.message);
  process.exit(1);
});
