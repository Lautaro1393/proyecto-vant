import { pool } from "../config/database.js";
import bcrypt from "bcrypt";

const USER_EMAIL = "piloto@vant.com";
const NEW_PASSWORD = "piloto123";

const hash = await bcrypt.hash(NEW_PASSWORD, 10);
console.log("Nuevo hash:", hash);

// Verificar si ya existe
const [existing] = await pool.query(
  "SELECT id_pilotos FROM piloto WHERE email = ?",
  [USER_EMAIL]
);

if (existing.length > 0) {
  console.log(`Piloto '${USER_EMAIL}' ya existe (ID ${existing[0].id_pilotos}), actualizando password...`);
  await pool.query(
    "UPDATE piloto SET password = ?, rol = 'Usuario' WHERE email = ?",
    [hash, USER_EMAIL]
  );
  console.log("Password actualizado a:", NEW_PASSWORD);
} else {
  console.log(`Creando piloto '${USER_EMAIL}'...`);
  const [result] = await pool.query(
    `INSERT INTO piloto
      (nombre, apellido, dni, certificacion, vencimiento_cma, email, password, contacto, rol)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      "Piloto",
      "Prueba",
      "40123456",
      "Clase A",
      "2027-12-31",
      USER_EMAIL,
      hash,
      "1145678901",
      "Usuario",
    ]
  );
  console.log("Piloto creado con ID:", result.insertId);
}

const [rows] = await pool.query(
  "SELECT id_pilotos, nombre, apellido, email, rol, password FROM piloto WHERE email = ?",
  [USER_EMAIL]
);
console.log("Verificacion:", {
  id: rows[0].id_pilotos,
  email: rows[0].email,
  rol: rows[0].rol,
  hashLength: rows[0].password.length,
});

const ok = await bcrypt.compare(NEW_PASSWORD, rows[0].password);
console.log("Compare post-create:", ok);

await pool.end();
