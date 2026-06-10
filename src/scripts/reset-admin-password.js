import { pool } from "../config/database.js";
import bcrypt from "bcrypt";

const ADMIN_EMAIL = "seguro@vant.com";
const NEW_PASSWORD = "admin123";

const hash = await bcrypt.hash(NEW_PASSWORD, 10);
console.log("Nuevo hash:", hash);

const [result] = await pool.query(
  "UPDATE piloto SET password = ? WHERE email = ?",
  [hash, ADMIN_EMAIL]
);
console.log("Filas afectadas:", result.affectedRows);

const [rows] = await pool.query(
  "SELECT id_pilotos, email, password FROM piloto WHERE email = ?",
  [ADMIN_EMAIL]
);
console.log("Verificacion en BD:", rows[0]?.email, "hash length:", rows[0]?.password?.length);

const ok = await bcrypt.compare(NEW_PASSWORD, rows[0].password);
console.log("Compare post-update:", ok);

await pool.end();
