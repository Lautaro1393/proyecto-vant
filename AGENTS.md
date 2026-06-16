# AGENTS.md

Convenciones, comandos y contexto para Agentes de IA que trabajen en este repo.

## Quick Commands
- `npm run dev` - Inicia el server con nodemon (puerto 3000, hot reload)
- `npm start` - Inicia el server en modo produccion (`node src/app.js`)
- `node src/scripts/<archivo>.js` - Corre un utilitario de la carpeta `src/scripts/` (ver seccion Scripts)

## Architecture
- **Stack**: Node.js + Express 5, MySQL (mysql2/promise), ES modules (`"type": "module"`)
- **Entry point**: `src/app.js`
- **Patron de capas**: Routes -> Controllers -> Models (DAL con queries parametrizadas)
- **Auth**: JWT firmado con `JWT_SECRET` (1h expiry), dos roles: `Admin` y `Usuario`
- **AI Integration**: Configuracion MCP en `opencode.json` (Railway), skills locales en `.agents/skills/`

## Key Conventions
- Todas las rutas bajo `/api` excepto auth (`/auth`)
- Middleware chain para endpoints protegidos: `verificarToken` -> `verificarAdmin` (solo en PUT/DELETE)
- Passwords hasheados con bcrypt (factor de costo: 10)
- File uploads via multer (5MB, solo imagenes) a `uploads/`
- **Sin comentarios en el codigo** (excepto este archivo y docs)
- Mensajes de error al cliente en espanol, `console.error` en Railway logs
- Fechas: `formatFecha` del helper para ISO -> MySQL `datetime`
- Soft delete con `UPDATE ... SET deleted_at = NOW()` (no DELETE fisico)

## Database
- MySQL hosteado en Railway (proyecto `charismatic-compassion`, servicio `MySQL - Proyecto VANT`)
- Pool en `src/config/database.js` (lee del `.env`)
- Migraciones ad-hoc en `src/scripts/migrate-*.js` (todas idempotentes, se pueden re-correr)
- Nombres de columnas no estandar en tablas pivote: `dron_id`, `bateria_id`, `piloto_id` (no `id_*`)

## Environment
- `.env` requerido (no commiteable, ver `.env.example`)
- Variables: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`, `JWT_SECRET`, `PORT` (opcional, default 3000)
- PowerShell local bloquea `npm` por Execution Policy -> usar `npm.cmd` en vez de `npm`

## Setup en una PC nueva (orden exacto)
1. Clonar el repo
2. Copiar `.env` desde la PC original (o armar uno nuevo con `.env.example` como guia)
3. `npm.cmd install` (o `pnpm install` si hay `pnpm-lock.yaml`)
4. `node src/scripts/migrate-vuelo.js` (idempotente, aplica solo lo que falte)
5. `npm run dev`
6. Smoke test: `node src/scripts/test-db.js` (debe listar 10 tablas)

## Remote / Auth
- **Remote URL**: SSH (`git@github.com:Lautaro1393/proyecto-vant.git`) — el push/pull NO requiere PAT
- **SSH key del usuario**: `~/.ssh/Dell-LinuxMint` (ED25519, ya agregada a GitHub)
- **PAT anterior**: regenerado y revocado en https://github.com/settings/tokens (no exponer nunca uno nuevo en URLs de `git push` ni en el chat)
- **Regla para IAs**: usar `git push origin main` a secas, NUNCA `https://x-access-token:PAT@...`

## Modules Status
- **Etapa 1 (Previstos)**: Completa
- **Etapa 2 (Vuelos)**: Completa - `src/models/vuelo.model.js`, `src/controllers/vuelo.controller.js`, `src/routes/vuelo.routes.js`
- **Etapa 3 (Drones)**: Completa (frontend + backend con imagen via multer)
- **Etapa 4.1 (Pilotos)**: Pendiente - backend listo (B1/B6/B10 de 5.1 aplicados), falta frontend (3 vistas + 4 rutas)
- **Etapa 5.1 (Backend bugs)**: Completa - commit `4fda7c2` con 12 fixes (B1, B2, B3, B4, B5, B6, B7, B8, B10, B11, B12, B17)
- Ver plan detallado y estado en `Plan/plan-modulo-vuelos.md`
- Ver analisis de bugs en `Plan/bugs-analisis.md`
- Ver handoff para IAs en `Plan/handoff-frontend.md`

## Endpoints Map (resumen)
### Auth
- `POST /auth/login` -> publico

### Modulos protegidos (token)
- `/api/pilotos` (CRUD completo, GET publicos al token, mutaciones requieren Admin)
- `/api/drones` (idem, soporta imagen con multer)
- `/api/modelos` (GET y POST)
- `/api/baterias` (GET y POST)
- `/api/mantenimientos` (GET y POST)
- `/api/previstos` (CRUD, soft delete)
- `/api/vuelos` (CRUD, soft delete; POST/PUT dentro de transaccion; POST/PUT suman horas y ciclos; DELETE no resta)

## Scripts (utilitarios en `src/scripts/`)
- `test-db.js` - Overview general: conexion + listado de tablas + `SELECT * LIMIT 5` por tabla + conteos
- `inspect-vuelo-schema.js` - Diagnostico fino de las 4 tablas del modulo Vuelos + verifica columnas `horas_vuelo_acum`
- `migrate-vuelo.js` - Aplica ALTERs del modulo Vuelos. Idempotente (chequea antes de aplicar)
- `seed-vuelos.js` - Crea 5 vuelos de prueba via API (necesita server corriendo en :3000)
- `pick-test-data.js` - Devuelve IDs utiles para testing (admins, drones, baterias, pilotos, previstos)
- `gen-tokens.js` - Genera JWTs validos (admin + user) para smoke tests con Postman/curl

## Files That Travel With The Repo
- `AGENTS.md` (este archivo) - convenciones y setup
- `Spec.md` - especificacion completa del sistema
- `Plan/plan-modulo-vuelos.md` - plan vivo de la Etapa 2 (marcado el progreso)
- `Plan/handoff-frontend.md` - handoff con estado del frontend y etapas pendientes
- `Plan/bugs-analisis.md` - lista de bugs B1-B20 con fixes aplicados y pendientes
- `.agents/skills/` - skills de opencode (backend patterns, best practices, express)
- `.agents/skills-lock.json` - lockfile de las skills
- `opencode.json` - configuracion de MCPs (Railway)
- `.env.example` - plantilla de variables de entorno

## Files That Do NOT Travel
- `.env` (credenciales, en `.gitignore`)
- `node_modules/` (en `.gitignore`)
- `uploads/` (imagenes subidas, recomendado gitignorear si crece)
