# Handoff — Frontend VANT (Etapa 2 → en adelante)

> Documento de orientación para una IA que continúa el desarrollo desde el estado actual del repo.
> Última actualización: 2026-06-11

## 🎯 Propósito

Este documento sirve como puente entre la **Etapa 1 (Previstos)** y las **Etapas 4-6** del proyecto VANT.
La **Etapa 2 (Vuelos)** del backend está completa. La **Etapa 1 del frontend** (Login + Dashboard + Drones CRUD) está completa.
Quedan pendientes: **Pilotos, Baterías, Vuelos, Mantenimientos, Previstos, Modelos** en frontend, más polish y bugs.

---

## 1. Contexto del proyecto

### Stack
- **Backend**: Node.js + Express 5 + MySQL (Railway), ES Modules (`"type": "module"`)
- **Frontend**: HTML5 + CSS3 (variables) + JS ES Modules nativos, **sin build step**
- **Auth**: JWT firmado con `JWT_SECRET`, 1h expiry, dos roles: `Admin` y `Usuario`
- **DB driver**: `mysql2/promise` con Pool
- **CORS**: habilitado globalmente (`app.use(cors())` en `src/app.js`)
- **Serving**: Express sirve el frontend estático desde `frontend/` (HTML, CSS, JS, assets) si la carpeta existe; archivos en `uploads/` para imágenes de drones

### Estructura de directorios relevante
```
proyecto-vant/
├── src/                        # Backend
│   ├── app.js                  # Entry point + static serving frontend
│   ├── config/database.js      # Pool MySQL
│   ├── controllers/            # 1 por entidad (auth, dron, piloto, etc.)
│   ├── models/                 # DAL con queries parametrizadas
│   ├── routes/                 # 1 por entidad
│   ├── middlewares/            # auth.middleware, multer.middleware
│   ├── helpers/                # dateHelper (formatFecha)
│   └── scripts/                # utilidades CLI (test-db, seed, migrate)
├── frontend/                   # Frontend
│   ├── index.html              # shell + entry point
│   ├── styles/
│   │   ├── tokens.css          # Design tokens (colores, spacing, tipografia)
│   │   ├── reset.css
│   │   ├── base.css            # layout, shell, utilidades
│   │   └── components.css      # Button, Card, Chip, SegBar, Dropzone...
│   ├── scripts/
│   │   ├── main.js             # bootstrap del router + rutas
│   │   ├── router.js           # hash router con params (:id)
│   │   ├── api.js              # fetch wrapper con JWT automático
│   │   ├── auth.js             # login/logout, storage
│   │   ├── ui.js               # renderShell, NAV, iconos
│   │   ├── ui-helpers.js       # chips, formatters, ESTADOS_DRON
│   │   └── views/
│   │       ├── login.js
│   │       ├── dashboard.js
│   │       ├── drones-list.js
│   │       ├── dron-detail.js
│   │       └── drones-form.js
│   └── assets/                 # vacio por ahora
├── uploads/                    # imagenes de drones (servido en /uploads/)
├── Plan/
│   ├── plan-modulo-vuelos.md   # plan vivo de la Etapa 2 (backend)
│   ├── bugs-analisis.md        # lista de bugs conocidos
│   └── handoff-frontend.md     # ← ESTE ARCHIVO
├── AGENTS.md                   # convenciones del repo
├── Spec.md                     # especificación del sistema
└── opencode.json               # MCPs (no commiteable, está en .gitignore)
```

### Convenciones clave (de `AGENTS.md`)
- **Estilo**: TACTICAL UAV — dark por defecto, JetBrains Mono, sharp corners, borders 1px como costuras
- **Sin comentarios en código** (excepto docs)
- **Mensajes de error en español** al cliente
- **Fechas**: helper `formatFecha` para ISO ↔ MySQL `datetime`
- **Soft delete**: `UPDATE ... SET deleted_at = NOW()` (no DELETE físico)
- **Pivotes de vuelos**: columnas `dron_id`, `bateria_id`, `piloto_id` (no `id_*`)
- **Auth middleware chain**: `verificarToken` → `verificarAdmin` (PUT/DELETE)
- **Mobile-first**: breakpoints en 768px y 1280px
- **Comandos**: `npm run dev` (con nodemon), `node src/scripts/<file>.js` para scripts

---

## 2. Etapa 2 Backend completa: Módulo de Vuelos

### 2.1 Esquema de la BD (post-migración)

```sql
-- Tabla principal
vuelo:
  id_vuelo        int AUTO_INCREMENT PK
  fecha           date NOT NULL
  coordenadas     varchar(100) NOT NULL
  tiempo_de_vuelo time NOT NULL               -- HH:MM:SS
  proposito       varchar(45) NOT NULL
  clima           enum(...) NOT NULL
  observaciones   text NULL
  previsto_id     int NULL                    -- FK a previstos
  estado          varchar(30) NOT NULL DEFAULT 'Realizado'
  created_at      timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  deleted_at      timestamp(6) NULL            -- soft delete

-- Pivotes
vuelo_drones    (vuelo_id int, dron_id int)
vuelo_baterias  (vuelo_id int, bateria_id int)
vuelo_pilotos   (piloto_id int, vuelo_id int)  -- orden invertido, no afecta

-- Acumuladores (agregados en migración)
ALTER TABLE dron    ADD COLUMN horas_vuelo_acum DECIMAL(8,2) NOT NULL DEFAULT 0;
ALTER TABLE piloto  ADD COLUMN horas_vuelo_acum DECIMAL(8,2) NOT NULL DEFAULT 0;
-- bateria.ciclos_de_carga ya existía
```

### 2.2 Endpoints de Vuelos (todos bajo `/api`)

| Método | Ruta | Auth | Body | Respuesta |
|---|---|---|---|---|
| GET | `/vuelos` | `verificarToken` | — | Array de vuelos con `drones_ids`, `baterias_ids`, `pilotos_ids` (GROUP_CONCAT) |
| GET | `/vuelos/:id` | `verificarToken` | — | Vuelo + arrays expandidos `drones`, `baterias`, `pilotos` con info |
| POST | `/vuelos` | `verificarToken` + `verificarAdmin` | `{fecha, coordenadas, tiempo_de_vuelo, proposito, clima, observaciones?, previsto_id?, drones[], baterias[], pilotos[]}` | `201 {id_vuelo, ...data, minutos_acumulados}` |
| PUT | `/vuelos/:id` | `verificarToken` + `verificarAdmin` | mismo que POST | `200 {message, vuelo}` |
| DELETE | `/vuelos/:id` | `verificarToken` + `verificarAdmin` | — | `200 {message}` (soft delete, **NO** resta acumuladores) |

### 2.3 Lógica transaccional crítica

**POST `/api/vuelos`** — flujo dentro de una transacción SQL:
```
1. Validar: fecha, coordenadas, tiempo_de_vuelo (regex HH:MM:SS), proposito, clima (ENUM), drones[], baterias[], pilotos[] (mín 1 c/u)
2. Convertir tiempo_de_vuelo (HH:MM:SS) → minutos decimales con helper tiempoAMinutos()
3. pool.getConnection() → conn
4. conn.beginTransaction()
5. INSERT vuelo
6. INSERT bulk en vuelo_drones, vuelo_baterias, vuelo_pilotos
7. Por cada bateria: UPDATE bateria SET ciclos_de_carga = ciclos_de_carga + 1
8. Por cada dron:    UPDATE dron    SET horas_vuelo_acum = horas_vuelo_acum + minutos
9. Por cada piloto:  UPDATE piloto  SET horas_vuelo_acum = horas_vuelo_acum + minutos
10. conn.commit() → 201
11. catch → conn.rollback() → 500
12. finally → conn.release()
```

**PUT** no toca acumuladores (decisión de diseño, ver `Plan/plan-modulo-vuelos.md` §6)
**DELETE** no resta acumuladores (preserva histórico para auditoría)

### 2.4 Helpers de `vuelo.model.js` (exportados)

| Función | Responsabilidad |
|---|---|
| `TIEMPO_REGEX` | `/^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/` |
| `tiempoAMinutos(tiempo)` | HH:MM:SS → minutos decimales (redondeo a 2 dec) |
| `CLIMAS VALIDOS` | array con 7 valores del ENUM |
| `getAllVuelos()` | SELECT con GROUP_CONCAT de IDs asociados |
| `getVueloById(id)` | SELECT vuelo + 3 JOINs a las pivotes |
| `crearVuelo(data, conn?)` | INSERT en `vuelo` (acepta conn transaccional) |
| `asociarDrones/Baterias/Pilotos(id, ids[], conn?)` | Bulk INSERT en pivotes |
| `incrementarCiclosBateria(id, conn?)` | UPDATE bateria SET ciclos_de_carga + 1 |
| `sumarHorasDron(id, minutos, conn?)` | UPDATE dron SET horas_vuelo_acum + ? |
| `sumarHorasPiloto(id, minutos, conn?)` | UPDATE piloto SET horas_vuelo_acum + ? |
| `modificarVuelo(id, data, conn?)` | UPDATE vuelo |
| `reemplazarPivotes(id, drones, baterias, pilotos, conn?)` | DELETE + reinsert en las 3 pivotes |
| `deleteVuelo(id)` | soft delete |

### 2.5 Scripts utilitarios de Vuelos

- `src/scripts/inspect-vuelo-schema.js` — Diagnóstico de las 4 tablas + verifica columna `horas_vuelo_acum`
- `src/scripts/migrate-vuelo.js` — 7 statements ALTER, idempotente
- `src/scripts/seed-vuelos.js` — Crea 5 vuelos via API (necesita server en :3000)
- `src/scripts/reset-admin-password.js` — Resetea password del admin (post-fix bcrypt)
- `src/scripts/seed-piloto-usuario.js` — Crea `piloto@vant.com` / `piloto123` con rol Usuario

---

## 3. Frontend Etapa 1 completa (referencia arquitectónica)

### 3.1 Arquitectura del frontend

**Patrón**: hash router + ES modules nativos, sin build.

**Capa de routing** (`router.js`):
```js
route("/drones/:id", ({ params }) => handler(params.id))
```
Sintaxis: `route(pattern, handler)` con `:param` y captura via `params`. Las rutas se registran en `main.js` con `route("/path", handler)`.

**Capa de datos** (`api.js`):
```js
api.get("/api/drones")         // JWT inyectado automático
api.post("/path", data)       // JSON
api.upload("/path", file)     // FormData con fieldname 'imagen'
```
El token se lee de `localStorage.getItem("vant.jwt")` y se agrega como `Authorization: Bearer <token>`.

**Capa de shell** (`ui.js`):
```js
renderShell({ titlePrefix, title, id, user, headerActions, fab })
```
Devuelve HTML con:
- Header sticky con branding, título "01 OPS OVERVIEW", acciones, chip de rol, logout
- Sidebar desktop (oculto en mobile <768px) con links de nav
- Bottom nav mobile (oculto en desktop ≥768px)
- Slot `<main id="main-slot">` para que cada vista inyecte su contenido
- Slot `fab` opcional para botón flotante

**Capa de helpers** (`ui-helpers.js`):
- `ESTADOS_DRON`, `ESTADOS_DRON_OPTIONS` — constantes de los filtros y opciones del select
- `chipForEstado(estado)` — devuelve HTML del chip con color según estado (alert/safe/caution/dim)
- `matchEstado(estado, filter)` — exact match (lowercase)
- `formatDate(iso)` / `formatDateInput(iso)` — formateo de fechas
- `segBar(pct, total=10)` — barra segmentada tipo LCD

### 3.2 Vistas implementadas (referencia para las siguientes)

**`views/drones-list.js`** (`#/drones`):
- Búsqueda en vivo (input search)
- Filtro chips (TODOS / EN SERVICIO / EN MANTENIMIENTO / FUERA DE SERVICIO)
- Stack de ModuleCard por dron
- FAB "+ ALTA DRON" (solo admin, mobile)
- Botón "+ ALTA" en header (admin, desktop)
- Filtra `d.deleted_at` (no-op porque la tabla no tiene la columna, ver B18)

**`views/dron-detail.js`** (`#/drones/:id`):
- Hero card con imagen (o placeholder con pattern táctico)
- 4 telemetrias (HORAS ACUM, VUELOS, ULT MANT, ADQUIRIDO)
- Módulos 07 VUELOS RECIENTES, 08 MANTENIMIENTOS, 09 OBSERVACIONES, 10 ACCIONES admin
- Botones: EDITAR / PASAR A MANTENIMIENTO / DAR DE BAJA (con confirm)

**`views/drones-form.js`** (`#/drones/new` y `#/drones/:id/edit`):
- Validación: matricula, numero_de_serie, id_modelo_dron
- En edición: preview de imagen actual; en alta: placeholder dropzone
- Drag & drop + click + keyboard en dropzone
- Validación cliente: max 5MB, jpeg/png/gif
- Submit unificado FormData (POST/PUT), **excluye la key 'imagen' del forEach de data** y solo agrega el file real si size > 0 (evita "Unexpected field")

### 3.3 CSS ya disponible (no requiere cambios para nuevas vistas)

- `.btn`, `.btn--primary`, `.btn--secondary`, `.btn--info`, `.btn--danger` (hazard stripes), `.btn--chamfer`, `.btn--ghost`
- `.card`, `.card__header`, `.card__body`, `.card--info`, `.card--alert`
- `.chip`, `.chip--safe/--alert/--caution/--info/--sand/--olive/--dim`
- `.telemetry` con `__value`, `__unit`, `__label`
- `.segbar` con `__seg--on/--caution/--alert`
- `.list`, `.list__row` con grid responsive (1 col mobile, 4 cols desktop)
- `.field`, `.field__label`, `.field__hint`, `.field__error`
- `.input`, `.textarea`, `.select` con `.input-wrap` + corner brackets de focus
- `.dropzone` con drag & drop y preview
- `.filter-chips` con scroll horizontal
- `.fab` con chamfer (esquina cortada)
- `.section-head` con prefijo numérico "01 OVERVIEW"
- `.stats` con grid de 4 celdas
- `.error-banner` con borde lateral de 4px

---

## 4. Etapas pendientes (orden de ejecución recomendado)

### Etapa 4.1 — Pilotos CRUD (~30 min, baja complejidad)

**Backend ya existe**: `src/controllers/piloto.controllers.js`, `src/models/pilotos.model.js`, `src/routes/piloto.router.js`

**Endpoints**:
- `GET /api/pilotos` (todos requieren `verificarToken`)
- `GET /api/pilotos/search?nombre=X` (búsqueda parcial)
- `GET /api/pilotos/:id_pilotos`
- `POST /api/pilotos` (Admin) — recibe password plano, hashea en backend
- `PUT /api/pilotos/:id` (Admin) — no cambia password (ver B6)
- `DELETE /api/pilotos/:id` (Admin) — hard delete (ver B10, debería ser soft)

**Vistas a crear** (mismo patrón que Drones):
1. `frontend/scripts/views/pilotos-list.js` — listado con búsqueda (input search + use `?nombre=X`)
2. `frontend/scripts/views/piloto-detail.js` — ficha del piloto + sus vuelos + mantenimientos + drones asignados
3. `frontend/scripts/views/pilotos-form.js` — alta/edición con campos: nombre, apellido, dni, certificacion, vencimiento_cma (date), email, contacto, rol (select), password (solo alta, no editar)

**Rutas en `main.js`**:
```js
route("/pilotos",          () => requireAuth(() => renderPilotosList(root)));
route("/pilotos/new",      () => requireAuth(() => renderPilotosForm(root, { id: null })));
route("/pilotos/:id",      ({ params }) => requireAuth(() => renderPilotoDetail(root, params.id)));
route("/pilotos/:id/edit", ({ params }) => requireAuth(() => renderPilotosForm(root, { id: params.id })));
```

**Consideraciones**:
- ⚠️ **B1**: el modelo expone el password en GETs. Fix pendiente (B1 en §5).
- El form de edición no debe incluir campo password (cambiar password es feature aparte).
- El select de rol tiene 2 opciones: "Admin" y "Usuario".

---

### Etapa 4.2 — Vuelos CRUD con wizard ✅ COMPLETA

**Backend ya existía** (sección 2). Implementación en 6 sub-chunks (4.2A–4.2F), commits `5dfca8f` … `08c1978`.

**Vistas entregadas**:
1. `frontend/scripts/views/vuelos-list.js` — lista con search + dropdowns (dron/piloto) + rango fecha + cards con propósito/tiempo/coords/clima/asociados.
2. `frontend/scripts/views/vuelo-detail.js` — ficha con hero, stats (4), 5 módulos (17 DRONES, 18 BATERIAS con ciclos/segbar, 19 PILOTOS, 20 UBICACION, 21 ACCIONES admin). Botón DAR DE BAJA con error-banner en vez de alert.
3. `frontend/scripts/views/vuelos-form.js` — vista wrapper del wizard con carga de catálogos, auth-check admin, navegación a detail tras POST/PUT.
4. `frontend/scripts/vuelos-wizard.js` (nuevo) — `createWizard({ root, isEdit, initialData, catalogs, onSubmit, onCancel })` con state, navigation, validation, buildPayload.

**Infra nueva**:
- CSS: `.stepper` (4 nodos con conectores, estados active/done con barras que se llenan) + `.picker` (cards multi-select con checkbox visual).
- Helpers en `ui-helpers.js`: `CLIMAS_OPTIONS` (7 valores), `TIEMPO_REGEX` (HH:MM:SS), `COORDS_REGEX` (lat,lng), `parseVueloIds` (CSV → array).
- Backend: `vuelo.model.js:getVueloById` ahora incluye `ciclos_de_carga`, `capacidad`, `voltage` en baterías.

**MOD prefix**: 14 (list) / 15 (detail) / 16 (wizard form).

**Decisiones de implementación**:
- **POST abierto a cualquier autenticado** en backend (decisión previa); frontend muestra FAB/headerActions solo a admin para coherencia con el cambio de seguridad del bugfix de 4.2E.
- Filtros de picker: drones "En Servicio" + ya-seleccionados (para edición); baterías `ciclos < 3000` + ya-seleccionadas.
- Wizard tiene 4 steps reales (no 3 + resumen como se planeó originalmente — el resumen es el 4to paso navegable).
- `setDraft()` no re-renderiza (preserva focus en inputs); navegación y errores sí re-renderizan.
- Click en stepper node → jump al paso (con validación hacia adelante).

**Cambio de diseño en el backend** (no planeado, surgió del smoke test):
- `POST /api/vuelos` ahora requiere `verificarAdmin` (consistencia con PUT/DELETE; commit `5c7053f`). El frontend refleja esto ocultando el botón "+ ALTA" para no-admin.
- `verificarToken` ahora devuelve **401** (no 403) en ausencia de header, alineado con RFC 7235 (commit `5c7053f`).

**Suite QA**: `src/scripts/run-smoke-tests.js` con 5 TC (TC-VUL-01 a 05), 6/6 OK tras los fixes. Ejecutable con `node src/scripts/run-smoke-tests.js`.

**Dashboard**: slot "PROXIMOS VUELOS" reemplazado por "VUELOS RECIENTES" con los últimos 5 vuelos reales + link a `/vuelos`.

---

### Etapa 4.3 (futuro) — Mantenimientos, Previstos, Modelos CRUD

Mismo patrón. Mantenimientos tiene un trigger interesante: POST en mantenimiento debe cambiar el estado del dron a "En Mantenimiento" automáticamente (decisión de diseño previa). PUT puede re-vertir el estado.

---

## 5. Bugs pendientes (de `Plan/bugs-analisis.md`)

### 5.1 Críticos de seguridad

| # | Bug | Severidad | Fix |
|---|---|---|---|
| **B1** | `GET /api/pilotos*` expone hash bcrypt del password | 🔴 Crítico | En `pilotos.model.js`, cambiar `SELECT *` por SELECT explícito sin `password` en `getAllPilotos`, `getPilotoByID`, `searchPiloto`. |
| **B2** | PUT a dron inexistente devuelve 200 con `dron: undefined` | 🟠 Alto | En `dron.controller.js:96-99`, después del re-fetch validar `if (!dronActualizado) return res.status(404)…` |
| **B3** | Dashboard lee `d.modelo_nombre` y `d.numero_serie` que no existen en el JOIN | 🟠 Alto | En `dashboard.js:118`, cambiar a `d.nombre_modelo` y `d.numero_de_serie` |
| **B4** | `formatFecha` rompe con fechas inválidas → 500 | 🟠 Alto | En `dateHelper.js`, agregar `if (isNaN(d.getTime())) return null;`. Controllers deben chequear null y devolver 400. |
| **B5** | `crearVuelo` no valida FK → 500 si drones/baterias/pilotos inexistentes | 🟠 Alto | Pre-validar con `SELECT 1 FROM dron WHERE id_dron IN (?)` o capturar `error.code === 'ER_NO_REFERENCED_ROW_2'` y devolver 400 con mensaje específico. |

### 5.2 Medios

| # | Bug | Fix |
|---|---|---|
| **B6** | Pilotos no pueden cambiar password | En `modificarPiloto`, si `req.body.password` viene no vacío, hashear y agregar `password = ?` al UPDATE. |
| **B7** | `GET /api/drones` y `GET /api/drones/:id` son públicos | Agregar `verificarToken` a esas dos rutas. |
| **B8** | `PUT /api/vuelos/:id` no valida `tiempo_de_vuelo` | Agregar misma regex validation que POST. |
| **B9** | PUT de vuelo no ajusta acumuladores (delta restar viejo + sumar nuevo) | Dentro de la transacción, obtener el `tiempo_de_vuelo` viejo, calcular delta, llamar `sumarHorasDron`/`sumarHorasPiloto` con la diferencia. |
| **B10** | Hard delete en `borrarPiloto` rompe patrón | Cambiar a soft delete: `UPDATE piloto SET deleted_at = NOW()`. Filtrar GETs. |
| **B11** | FK errors devuelven 500 en Drones/Vuelos | Detectar `ER_NO_REFERENCED_ROW_2` y devolver 400. |
| **B12** | ENUM inválido en `estado` de dron → 500 | Validar contra `ESTADOS_DRON_OPTIONS` antes del INSERT/UPDATE. |

### 5.3 Bajos

| # | Bug | Fix |
|---|---|---|
| **B13** | Timing attack en `/auth/login` | Hacer `bcrypt.compare(password, '$2b$10$invalidohash')` siempre; comparar después. |
| **B14** | `renderShell` no escapa `titlePrefix`/`title` (XSS latente) | Usar `textContent` o helper `escapeHtml()`. |
| **B15** | Comentario muerto en `auth.controller.js:47-48` | Borrar. |
| **B16** | PUT de vuelo permite cambiar `previsto_id` sin reasociar | Documentar o crear pivote `previsto_vuelo`. |
| **B17** | Inconsistencia de params en `/api/pilotos` | Unificar a `:id` en PUT/DELETE. |
| **B18** | `drones-list.js` filtra `d.deleted_at` que no existe | Quitar la línea. |
| **B19** | Sin rate-limit en `/auth/login` | Middleware `express-rate-limit` (5 req/min). |
| **B20** | Filtro de estado en `drones-list` no coincide con backend | Normalizar en guardado o unificar contrato (ya parcialmente resuelto con el fix reciente). |

---

## 6. Polish futuro (Etapa 6)

- **Theme switcher**: Tactical Olive (default) / Night Vision / Desert. Las CSS variables ya están definidas para los 3 themes, falta el toggle en el header.
- **Loading skeletons** durante fetches
- **Error boundary** global en el router para vistas que fallan al renderizar
- **Búsqueda global** en el dashboard (buscar drones/pilotos/baterias por texto)
- **Exportar CSV** desde listados (vuelos, mantenimientos)
- **Modo offline** con service worker (cache del dashboard)

---

## 7. Convenciones de CSS/JS a respetar en nuevas vistas

### CSS
- Mobile-first: estilos base para mobile, `@media (min-width: 768px)` para desktop
- Usar `var(--*)` siempre, nunca valores hardcoded
- Border-radius: 0 (sharp) — solo `clip-path: polygon(...)` para chamfers
- Borders: 1px solid var(--outline-variant) para costuras
- Sin sombras — profundidad por inversión tonal (capas de surface)
- Touch targets mínimo 44px
- Estructura de ModuleCard: header (16px) + body + opcional footer

### JS
- ES modules: `import` / `export`, no `require`
- Cada vista exporta una función `render<Name>(root, opts)` que:
  1. Renderiza HTML via `main.innerHTML = ...` o creando un `main-slot` local
  2. Hace fetches necesarios
  3. Re-renderiza con datos
  4. Bindea event listeners
- Usar helpers de `ui-helpers.js` para chips, fechas, segBar
- Navegación con `navigate(path)` de `router.js` (no usar `location.href` directamente)
- Manejo de errores: try/catch con mensajes en español en `error-banner`
- Loading states con `<span class="spinner"></span>`

### Rutas
- `#/login` pública
- `#/dashboard` requiere auth
- `#/<entidad>` requiere auth (GET)
- `#/<entidad>/new` y `#/<entidad>/:id/edit` requieren auth + admin (validado en `requireAuth` o en la vista)

### API
- `GET` con `verificarToken` (no admin)
- `POST/PUT/DELETE` con `verificarToken` + `verificarAdmin`
- Soft delete en todas las entidades
- Fechas en ISO 8601 desde el cliente
- Errores del backend en español: `{error: "mensaje"}`

---

## 8. Test end-to-end

Cada vista nueva debe probarse con `chrome-devtools MCP`:
1. Login con `seguro@vant.com` / `admin123` (Admin) o `piloto@vant.com` / `piloto123` (Usuario)
2. Navegar a la vista
3. Verificar render con chrome screenshot
4. Probar formularios: alta, edición, baja (si admin)
5. Validar que el soft delete filtra correctamente en listados

**Smoke test con curl** (útil para tests rápidos):
```bash
LOGIN=$(curl -s -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d '{"email":"seguro@vant.com","password":"admin123"}')
TOKEN=$(echo "$LOGIN" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{console.log(JSON.parse(d).token||'')})")
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/drones | head -c 500
```

---

## 9. Recursos útiles

- `AGENTS.md` — convenciones del repo (siempre leer primero)
- `Plan/plan-modulo-vuelos.md` — decisiones de diseño del módulo Vuelos
- `Plan/bugs-analisis.md` — lista completa de bugs
- `Plan/spec-modulo-vuelos.md` (si existe) — especificación detallada
- `src/scripts/test-db.js` — script para inspeccionar la BD
- `src/scripts/pick-test-data.js` — devuelve IDs útiles para testing
- `src/scripts/seed-piloto-usuario.js` — crea usuario de prueba con permisos limitados

---

## 10. Próximos pasos inmediatos

1. **B1-B5** (~20 min): corregir bugs de seguridad y funcionales antes de añadir features
2. **Pilotos CRUD** (~30 min): sienta el patrón para Baterías y Mantenimientos
3. **Vuelos wizard** (~60 min): el más complejo, combina transaccionalidad con UX de pasos
4. **Mantenimientos CRUD** (~30 min): trigger automático de estado de dron
5. **Baterías + Previstos + Modelos** (~45 min): CRUDs simples
6. **Polish** (theme switcher, loading, error boundaries)
