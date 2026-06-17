import { pool } from "../config/database.js";

const start = Date.now();
let conn;
try {
  conn = await pool.getConnection();
  const ping = await conn.query("SELECT 1 + 1 AS r, NOW() AS server_time, @@version AS version, @@hostname AS host");
  const [info] = ping;
  const [schemas] = await conn.query("SHOW DATABASES");
  const [tables] = await conn.query("SHOW TABLES");
  const [counts] = await conn.query(`
    SELECT
      (SELECT COUNT(*) FROM piloto      WHERE deleted_at IS NULL) AS piloto,
      (SELECT COUNT(*) FROM dron        WHERE deleted_at IS NULL) AS dron,
      (SELECT COUNT(*) FROM bateria     WHERE deleted_at IS NULL) AS bateria,
      (SELECT COUNT(*) FROM vuelo       WHERE deleted_at IS NULL) AS vuelo,
      (SELECT COUNT(*) FROM previsto    WHERE deleted_at IS NULL) AS previsto
  `);
  const ms = Date.now() - start;
  console.log("OK - Railway MySQL");
  console.log("  ping     :", info[0].r, "=", info[0].r === 2 ? "OK" : "FAIL");
  console.log("  server   :", info[0].server_time);
  console.log("  version  :", info[0].version);
  console.log("  host     :", info[0].host);
  console.log("  latency  :", ms, "ms");
  console.log("  schemas  :", schemas.map(s => s.Database).join(", "));
  console.log("  tables   :", tables.length);
  console.log("  counts   :", JSON.stringify(counts[0]));
  await conn.release();
  await pool.end();
  process.exit(0);
} catch (e) {
  const ms = Date.now() - start;
  console.error("FAIL - Railway MySQL");
  console.error("  ms      :", ms);
  console.error("  code    :", e.code);
  console.error("  errno   :", e.errno);
  console.error("  sqlState:", e.sqlState);
  console.error("  message :", e.message);
  if (conn) { try { await conn.release(); } catch {} }
  try { await pool.end(); } catch {}
  process.exit(1);
}
