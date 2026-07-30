# Database exports

Snapshots de la base de datos de VANT para referencia y para que el
profe pueda revisar la estructura y los datos sin necesidad de
levantar el server ni la BD.

## Archivos

| Archivo | Contenido | Tamano | Cuando regenerar |
|---|---|---|---|
| `schema.sql` | Solo estructura (`CREATE TABLE` + `DROP TABLE IF EXISTS`) | ~7 KB | Cuando cambia un ALTER / migracion |
| `dump.sql` | Schema + data completa (todos los `INSERT`) | ~30 KB | Cuando cambian datos de prueba / seed |

Ambos archivos estan commiteados al repo y se actualizan con
`node src/scripts/dump-db.js` (o variantes abajo).

## Tablas incluidas

Las 10 tablas del sistema (ver `AGENTS.md` para el detalle):

- `bateria` — pack de baterias con ciclos y estado
- `dron` — flota de drones
- `mantenimiento` — ordenes de taller
- `modelo_dron` — catalogo de modelos
- `piloto` — crew con certificacion CMA
- `previstos` — misiones planificadas (agenda)
- `vuelo` — vuelos reales (con soft delete)
- `vuelo_baterias` / `vuelo_drones` / `vuelo_pilotos` — pivotes

## Como regenerar

Desde la raiz del repo:

```bash
# Schema solo
node src/scripts/dump-db.js --schema-only

# Data solo (sin CREATE TABLE)
node src/scripts/dump-db.js --data-only

# Schema + data (default, regenera db/dump.sql)
node src/scripts/dump-db.js
```

El script lee `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`,
`DB_DATABASE` del `.env` y se conecta via `mysql2/promise`.
No necesita `mysqldump` instalado.

## Como importar (para reproducir la BD localmente)

```bash
# Crear BD y cargar todo
mysql -u root -p -e "CREATE DATABASE vant;"
mysql -u root -p vant < db/dump.sql
```

## Datos

El dump incluye todos los registros reales del sistema en este
momento: drones, pilotos, baterias, modelos, mantenimientos,
previstos y vuelos. Los emails y telefonos son **datos de prueba**
(mockup), no son datos personales reales.

## Notas

- Los `DROP TABLE IF EXISTS` al inicio permiten re-importar el dump
  sobre una BD existente sin errores.
- `SET FOREIGN_KEY_CHECKS = 0` antes y `= 1` despues evita errores
  de orden en las FKs durante el bulk insert.
- El script no incluye `mysqldump` para que funcione en cualquier
  entorno con Node (algunos sandboxes no tienen `mysqldump`).
