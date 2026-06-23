# Análisis de bugs — Proyecto VANT

> Generado en sesión de plan mode. Severidad según impacto funcional y de seguridad.

## 🔴 Críticos (B1–B5)

### B1. `GET /api/pilotos` expone el hash del password
- **Archivo**: `src/models/pilotos.model.js:7,14,22`
- **Problema**: `SELECT * FROM piloto` devuelve el campo `password` (hash bcrypt). Cualquier usuario autenticado ve el hash de cualquier piloto y puede crackearlo offline.
- **Fix**: cambiar a `SELECT id_pilotos, nombre, apellido, dni, certificacion, vencimiento_cma, email, contacto, rol FROM piloto` (idem en `getAllPilotos`, `getPilotoByID`, `searchPiloto`).

### B2. PUT a dron inexistente devuelve 200 con `dron: undefined`
- **Archivo**: `src/controllers/dron.controller.js:96-99`
- **Problema**: `affectedRows === 0` se interpreta como "sin cambios"; se devuelve `getDronById(id)` (undefined) con 200.
- **Fix**: chequear `if (!dronActualizado) return res.status(404)…` después del re-fetch.

### B3. Dashboard referencia campos inexistentes
- **Archivo**: `frontend/scripts/views/dashboard.js:118`
- **Problema**: lee `d.modelo_nombre` y `d.numero_serie`. El backend devuelve `nombre_modelo` y `numero_de_serie`. El bloque FLOTA ACTIVA muestra texto vacío.
- **Fix**: cambiar a `d.nombre_modelo` y `d.numero_de_serie`.

### B4. `formatFecha` rompe con fechas inválidas → 500
- **Archivo**: `src/helpers/dateHelper.js:1-4`
- **Problema**: `new Date("basura").toISOString()` lanza `RangeError: Invalid time value`.
- **Fix**: agregar `if (isNaN(d.getTime())) return null;` o try/catch; devolver 400 desde el controller cuando llega null.

### B5. `crearVuelo` no valida FK → 500
- **Archivos**: `src/controllers/vuelo.controller.js:28-89`, `src/models/vuelo.model.js:64-82`
- **Problema**: si mandan `drones:[99999]` o `previsto_id:66666` inexistente, MySQL tira `ER_NO_REFERENCED_ROW_2` y devuelve 500.
- **Fix**: pre-validar con `SELECT 1 FROM dron WHERE id_dron IN (?)` (idem para `bateria`, `piloto`, `previstos`) y devolver 400 con los IDs faltantes. Alternativa: capturar `error.code === 'ER_NO_REFERENCED_ROW_2'` en el catch.

## 🟠 Medios (B6–B15)

### B6. Pilotos no pueden cambiar su password
- **Archivos**: `src/controllers/piloto.controllers.js:113-136`, `src/models/pilotos.model.js:48-67`
- **Problema**: destructuring de `modificarPiloto` omite `password`. Se ignora silenciosamente.
- **Fix**: si `req.body.password` viene no vacío → `bcrypt.hash` y agregar `password = ?` al UPDATE dinámico.

### B7. `GET /api/drones` es público
- **Archivo**: `src/routes/dron.router.js:12-13`
- **Problema**: no usa `verificarToken`, mientras el resto sí. Inconsistente y débil.
- **Fix**: agregar `verificarToken` a `GET /drones` y `GET /drones/:id`.

### B8. `actualizarVuelo` no valida `tiempo_de_vuelo`
- **Archivo**: `src/controllers/vuelo.controller.js:91-106`
- **Problema**: `crearVuelo` valida con `TIEMPO_REGEX`; PUT no.
- **Fix**: misma validación regex en el PUT.

### B9. PUT de vuelo no ajusta acumuladores (delta: restar viejo + sumar nuevo)
- **Archivos**: `src/controllers/vuelo.controller.js:91-131`, `src/models/vuelo.model.js:138-163`
- **Problema**: si el admin corrige `tiempo_de_vuelo` de 00:25 a 00:40, las `horas_vuelo_acum` del dron y piloto NO se ajustan.
- **Fix (semántica decidida)**: dentro de la transacción, obtener el `tiempo_de_vuelo` viejo, calcular delta, llamar `sumarHorasDron`/`sumarHorasPiloto` con la diferencia (puede ser positiva o negativa). Para `ciclos_de_carga` de baterías, no se mueve (depende de cargas, no de tiempo).

### B10. Hard delete en `borrarPiloto` rompe el patrón soft-delete
- **Archivos**: `src/models/pilotos.model.js:38-46`, `src/routes/piloto.router.js:38`
- **Inspección BD**: `piloto.deleted_at` YA EXISTE (`timestamp NULL`). No requiere migración.
- **Fix**: cambiar `DELETE FROM piloto WHERE id_pilotos = ?` por `UPDATE piloto SET deleted_at = NOW() WHERE id_pilotos = ? AND deleted_at IS NULL`. Filtrar GETs con `WHERE deleted_at IS NULL`.

### B11. FK errors devuelven 500 en Drones/Vuelos
- **Archivos**: `src/controllers/dron.controller.js:43-66,91-113`, `src/controllers/vuelo.controller.js:28-89,91-131`
- **Problema**: FK rota (modelo inexistente, piloto inexistente) devuelve 500.
- **Fix**: detectar `error.code === 'ER_NO_REFERENCED_ROW_2'` y devolver 400 con mensaje específico.

### B12. ENUM inválido en `estado` de dron devuelve 500
- **Archivos**: `src/controllers/dron.controller.js:62-65,108-111`
- **Problema**: `estado: "Volando"` (fuera del ENUM) tira `WARN_DATA_TRUNCATED` y devuelve 500.
- **Fix**: validar contra la lista de `ESTADOS_DRON` antes del INSERT/UPDATE, devolver 400.

### B13. Timing attack en `/auth/login`
- **Archivo**: `src/controllers/auth.controller.js:14-22`
- **Problema**: email inexistente → 401 en ~1ms. Email existente + pass mala → ~80ms (bcrypt). Un atacante enumera emails.
- **Fix**: hacer `bcrypt.compare(password, '$2b$10$invalidohashinvalidohashinvalido')` siempre; comparar después.

### B14. `renderShell` no escapa `titlePrefix`/`title` (XSS latente)
- **Archivo**: `frontend/scripts/ui.js:33-34`
- **Problema**: template literal dentro de `innerHTML`. Si llega `<script>` se ejecuta.
- **Fix**: usar `textContent` o un helper `escapeHtml()`.

### B15. Cleanup de comentario muerto
- **Archivo**: `src/controllers/auth.controller.js:47-48`
- **Problema**: residuo de copy-paste (`//////////// MODIFICAR PILOTO (PUT) /////////////`).
- **Fix**: borrar.

## 🟡 Bajos (B16–B20)

### B16. PUT de vuelo permite cambiar `previsto_id` sin reasociar
- **Detalle**: si estaba atado a un previsto, el viejo queda huérfano. Decisión de diseño → documentar o crear pivote `previsto_vuelo`.

### B17. Inconsistencia de params en `/api/pilotos`
- **Archivo**: `src/routes/piloto.router.js:23,33,38`
- **Detalle**: GET usa `:id_pilotos`, PUT/DELETE usan `:id`.
- **Fix**: unificar a `:id`.

### B18. `drones-list.js` filtra `d.deleted_at` que no existe
- **Archivo**: `frontend/scripts/views/drones-list.js:62`
- **Detalle**: la tabla `dron` no tiene `deleted_at`. Filtro no-op.
- **Fix**: quitar la línea.

### B19. Sin rate-limit en `/auth/login`
- **Detalle**: permite brute force.
- **Fix**: middleware `express-rate-limit` (5 req/min). Bajo prioridad.

### B20. Filtro de estado en `drones-list` no coincide con valores del backend
- **Archivos**: `frontend/scripts/ui-helpers.js:5-7` vs backend
- **Detalle**: filtro usa `"en servicio"` (minúsculas sin acentos); mantenimiento guarda `"En Mantenimiento"` con mayúscula.
- **Fix**: normalizar en guardado o unificar contrato.

## 🗺️ Orden de ejecución sugerido

1. **B4** (formatFecha) — base, evita 500s en cascada.
2. **B1** (password en SELECT) — seguridad inmediata.
3. **B2** (PUT dron 404) — bajo costo, alto impacto UX.
4. **B3** (dashboard typos) — fix de 1 línea.
5. **B5, B11, B12** (errores 400 vs 500) — mejorar mensajes cliente.
6. **B7** (token en GET drones) — 2 líneas, cierra hueco.
7. **B8, B9** (PUT vuelo: validación + delta) — relacionado.
8. **B6, B10** (password update + soft-delete piloto) — tocan modelo.
9. **B13, B14, B15** (seguridad/cleanup).
10. **B16–B20** (debt/UX) cuando haya tiempo.

## ✅ Decisiones tomadas
- **B9**: ajustar delta (restar viejo + sumar nuevo). **Decisión de producto: NO ajustar.** PUT no toca acumuladores (preserva histórico). Verificado en 4.2D.
- **B10**: la tabla YA tiene `deleted_at`, no requiere migración.

## ✅ Bugs cerrados (estado a 2026-06-23)
- **B1** `SELECT * FROM piloto` exponía bcrypt hash — YA FIXEADO en commit previo con `PILOTO_SAFE_COLUMNS` excluyendo `password`.
- **B3** Dashboard leía `modelo_nombre` y `numero_serie` — YA FIXEADO, usa `nombre_modelo` y `numero_de_serie` (correctos del JOIN).
- **B4** `formatFecha` reventaba con fechas inválidas — YA FIXEADO con `isNaN(d.getTime())` check, devuelve `null`.
- **B6** Pilotos no podían cambiar password en PUT — **FIXEADO en este commit**: controller destructura `password`, valida longitud >= 6, hashea con bcrypt antes de pasar al modelo. Verificado round-trip PUT→login funciona.
- **B7** `GET /api/drones` y `GET /api/drones/:id` públicos — YA FIXEADO, ambos tienen `verificarToken` en el router.
- **B12** ENUM inválido en `estado` de dron → 500 — YA FIXEADO, controller valida con `ESTADOS_VALIDOS.includes(estado)` y devuelve 400 antes del INSERT/UPDATE.
- **B13** Timing attack en `/auth/login` — **FIXEADO en este commit**: usa un hash bcrypt dummy constante y siempre corre `bcrypt.compare`, así email inválido y email válido + pass mala tardan lo mismo (~300-400ms). Verificado: ambos casos ~0.3-0.4s.
- **B15** Comentario muerto en `auth.controller.js:47-48` — **FIXEADO en este commit** (borrado al reescribir el controller para B13).

## 🟡 Bugs restantes (no críticos)
- **B2** PUT a dron inexistente devuelve 200 con `dron: undefined` (medio) — requiere refetch + 404 check.
- **B5** `crearVuelo` no valida FK → 500 — RESUELTO vía pre-validación en `validarFKsVuelo` (devuelve 400 con detalle). Confirmar si hay 500 residual.
- **B8** `PUT /api/vuelos/:id` no valida `tiempo_de_vuelo` — verificar.
- **B9** Ver arriba.
- **B10** Piloto: `borrarPiloto` ya hace soft-delete; chequear consistencia del resto.
- **B11** FK errors 500 — ya manejado en TC-VUL-04 con 400 + detalle.
- **B14** `renderShell` no escapa titlePrefix/title (XSS latente) — low.
- **B16-B20** Polish, no críticos.
