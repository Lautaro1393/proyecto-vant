# Roadmap Futuro — Implementación pendiente

> Documento de referencia para retomar el trabajo. Cada item incluye contexto, archivos a tocar, snippets de código cuando aplica, y criterio de aceptación.
>
> **Última actualización**: 2026-07-28 (post-commit `cf1d993` con D2 skeletons)
> **Estado actual del repo**: D1, D2, B3, B5, Round 1 (P1-P6, P8), upload de fotos en piloto y drone, poblado de DB con caricaturas completas.

---

## 📊 Estado del repo

### Commits recientes (del más nuevo al más viejo)

| SHA | Descripción |
|---|---|
| `cf1d993` | feat(ux): D2 loading skeletons con shimmer animation |
| `ce1b4d4` | fix(seed): aceptar nueva foto Mavic 3 Enterprise + reparar placeholders |
| `e13a9a3` | feat(media): upload de foto en alta/edicion de pilotos |
| `4fbfecb` | feat(media): poblacion inicial de fotos en drones y pilotos |
| `1202dd1` | feat(ux): P8 mapa Leaflet para coordenadas de vuelo |
| `a2eebf5` | fix(ux+bugs): correcciones round 1 desde anotaciones manuales |
| `5ec553f` | feat(theme): D1 theme switcher con 3 temas + persistencia |
| `3b9663a` | chore: B3 gitignore + B5 SSH key doc |

### Lo que YA está hecho (D-tier polish)
- ✅ **D1** Theme switcher (3 temas + persistencia en `localStorage`)
- ✅ **D2** Loading skeletons (shimmer en listas, details, dashboard, form)
- ✅ **D3** Error boundary global en router (commit `e3b4215`)
- ✅ **A1** Búsqueda global Cmd+K + `/` (commit `e40766d`)
- ✅ **B3** gitignore cleanup (`uploads/imagen-*`, `/.opencode/`, `/uploads/dron_modelos/`)
- ✅ **B5** SSH key doc en `AGENTS.md`
- ✅ **B1** Pool keepAlive + **B2** TZ UTC (commit `9a836ca`)
- ✅ **TZ fix frontend** (commit `4f0a72d`): datetimes en TZ local del navegador
- ✅ Manual E2E test pasó

### Lo que YA está hecho (features)
- ✅ Etapas 1, 2, 3, 4.1, 4.2, 4.3 completas (CRUD + wizard para todas las entidades)
- ✅ Round 1 correcciones (P1-P6 + bug dron-detail, piloto-detail)
- ✅ P8 Leaflet mapa coords (drag pin + geolocation)
- ✅ P9 Thumbnails en dron y bateria pickers del wizard
- ✅ Poblado de fotos: 6 modelos de drone con fotos + 7 pilotos con caricaturas
- ✅ Upload de fotos: drone (ya estaba) + piloto (recién agregado, multer + dropzone)
- ✅ Búsqueda, filtros, sorting en todas las listas
- ✅ Acciones de dron detail dependen del estado actual
- ✅ Soft delete con `deleted_at` en todas las entidades
- ✅ Smoke tests 6/6 (re-ejecutar antes de cada cambio)

---

## 🎯 Items pendientes del roadmap (D3, A1, A2, A3, C)

### **D3** — Error boundary global en router (~20 min)

**Por qué**: si una vista tira una excepción durante render, la app puede quedar en estado roto (pantalla en blanco o sin navegación). Un try/catch en `dispatch()` del router garantiza que el usuario siempre vea algo útil y pueda seguir navegando.

**Archivos a tocar**:
- `frontend/scripts/router.js` (único)

**Snippet de referencia**:
```js
// En router.js, envolver el handler dentro de dispatch()
const dispatch = async () => {
  // ... existing code (match de ruta, busqueda de handler) ...
  try {
    const result = await r.handler({ params, path, root });
    currentTeardown = typeof result === "function" ? result : null;
  } catch (e) {
    console.error("[router] Error en vista:", e);
    // Mostrar error-banner global con opcion de volver al dashboard
    const root = document.getElementById("root");
    if (root) {
      const main = root.querySelector(".app__main") || root;
      main.innerHTML = `
        <div class="card mt-3">
          <div class="card__body" style="text-align:center;padding:var(--space-6)">
            <div class="error-banner mb-3">Error inesperado: ${e.message || "vista fallo"}</div>
            <a class="btn btn--primary" href="#/dashboard">VOLVER AL DASHBOARD</a>
          </div>
        </div>`;
    }
    currentTeardown = null;
  }
};
```

**Criterio de aceptación**:
- Forzar un error en una vista (e.g. agregar `throw new Error("test")` en `renderDashboard`)
- La UI debe mostrar un `error-banner` con el mensaje y un botón "Volver al dashboard"
- Al cambiar de ruta (navegar a /drones), la app sigue funcionando normal

**Cómo probarlo**:
1. Editar `frontend/scripts/views/dashboard.js` y agregar `throw new Error("TEST D3")` al inicio de `renderDashboard`
2. Recargar `/dashboard` → debe verse el error banner
3. Click en "VOLVER AL DASHBOARD" o navegar a otra ruta
4. Quitar el `throw` antes de commitear

---

### **A1** — Búsqueda global con Cmd+K (~45 min)

**Por qué**: con 7 entidades (drones, pilotos, baterías, vuelos, mantenimientos, previstos, modelos), encontrar algo requiere navegar a la lista y filtrar. Un Cmd+K global permite saltar directo al detail.

**Archivos a tocar**:
- `frontend/scripts/ui.js` (agregar `bindGlobalSearch()` y `renderSearchModal()`)
- `frontend/scripts/main.js` (llamar `bindGlobalSearch()` después de `start()`)
- `frontend/styles/components.css` (estilos del modal/dropdown)

**Plan**:
- Input modal flotante centrado (o dropdown desde el header) con atajo `Cmd+K` o `/`
- Enfoque en input al abrir
- Buscar contra 5 endpoints en paralelo con `Promise.all`:
  ```js
  const [drones, pilotos, baterias, vuelos, mantenimientos, previstos] = await Promise.all([
    api.get("/api/drones"),
    api.get("/api/pilotos"),
    api.get("/api/baterias"),
    api.get("/api/vuelos"),
    api.get("/api/mantenimientos"),
    api.get("/api/previstos"),
  ]);
  ```
- Filtrar client-side por término en:
  - drones: matricula, numero_de_serie
  - pilotos: nombre, apellido, dni, email
  - baterias: numero_de_serie
  - vuelos: proposito
  - mantenimientos: tipo, descripcion
  - previstos: nombre_clave, solicitante
- Resultados agrupados por tipo, máximo 5 por grupo
- Cada resultado es un link a su detail (ej. `#/drones/${id}`)
- Keyboard: `↑/↓` para navegar, `Enter` para seleccionar, `Esc` para cerrar

**Estructura del modal** (sugerida):
```html
<div class="search-modal" id="search-modal" hidden>
  <input id="search-q" type="search" placeholder="Buscar drones, pilotos, vuelos..." />
  <div class="search-results">
    <div class="search-group">
      <h4>DRONES</h4>
      <a class="search-item" href="#/drones/1">VNT-A1B2CD · Matrice 3T</a>
      ...
    </div>
    ...
  </div>
</div>
```

**Criterio de aceptación**:
- `Cmd+K` (o `/`) abre el modal con focus en el input
- Escribir "ABC" filtra en <300ms (5 endpoints en paralelo)
- Resultados agrupados por entidad
- Click o Enter navega al detail
- Esc cierra el modal

---

### **A2** — Reporte de vuelos por piloto (~1.5h)

**Por qué**: el usuario quiere poder hacer un "reporte rapido de todos los vuelos que participo un piloto en un mes y el total de minutos de vuelo que hizo". Es un reporte agregado (no un dump de la lista), con filtro por piloto + rango de fechas, descargable como CSV.

**Diferencia con A2 original** (que era un boton "EXPORTAR CSV" plano en cada lista, ahora movido al backlog): este item es mas especifico y util, porque responde a un caso de uso real (liquidacion de horas / auditoria mensual por piloto).

**Endpoint backend nuevo** (`GET /api/vuelos/reporte/pilotos`):
- Query params: `piloto_id` (opcional, si no se manda devuelve todos los pilotos), `desde` (YYYY-MM-DD), `hasta` (YYYY-MM-DD)
- Auth: requiere token (verificarAdmin o cualquier autenticado)
- Logica SQL: hace JOIN vuelo_pilotos -> vuelo, filtra por rango, agrupa por piloto y devuelve:
  ```json
  {
    "pilotos": [
      {
        "piloto_id": 2,
        "nombre": "Isabella",
        "apellido": "Gomez",
        "dni": "64877029",
        "vuelos": [
          { "id_vuelo": 30, "fecha": "2026-07-01T08:00:00Z", "proposito": "QA-...", "tiempo_de_vuelo": "00:25:00", "minutos": 25 },
          ...
        ],
        "total_vuelos": 5,
        "total_minutos": 125,
        "horas_decimales": 2.08
      },
      ...
    ]
  }
  ```
- Conversion `tiempo_de_vuelo` (HH:MM:SS) -> minutos: parsear con regex `/(\d+):(\d+):(\d+)/` y calcular `(h*3600 + m*60 + s) / 60`.

**Vista frontend nueva** (`/reportes/vuelos-piloto`):
- Header con titulo "REPORTE DE VUELOS POR PILOTO"
- Filtros arriba: dropdown de piloto (con "Todos"), input "desde" (date), input "hasta" (date), boton "APLICAR", boton "EXPORTAR CSV"
- Tabla: por cada piloto:
  - Header: nombre, dni, total vuelos, total minutos, horas decimales
  - Fil展开: lista de vuelos (fecha, proposito, tiempo, minutos)
- Skeleton mientras carga (reusar `skeletonCard` o `skeletonListRow`)
- Boton CSV descarga el mismo reporte en formato flat (1 linea por vuelo + totales al final)

**Botón de export CSV**:
- Helper `exportToCSV` (mismo que estaba planeado en A2 original, ahora cobra sentido):
  ```js
  export const exportToCSV = (rows, filename, columns) => {
    const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const header = columns.map(c => escape(c.label)).join(",");
    const body = rows.map(r => columns.map(c => escape(r[c.key])).join(",")).join("\n");
    const csv = `${header}\n${body}`;
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };
  ```
- Columnas del CSV: piloto_id, piloto, dni, vuelo_id, fecha, proposito, tiempo_de_vuelo, minutos
- Filename: `reporte-vuelos-pilotos-2026-07.csv`
- Al final del CSV: 2 lineas de resumen (total vuelos, total minutos) para Excel

**Archivos a tocar**:
- `src/scripts/reporte-pilotos.sql.js` o `src/controllers/reporte.controller.js` (NUEVO) + ruta
- `src/routes/index.js` o el router que monta `/api/reportes`
- `frontend/scripts/views/reportes-vuelos-piloto.js` (NUEVO)
- `frontend/scripts/main.js` registrar la ruta
- `frontend/scripts/ui-helpers.js` agregar `exportToCSV`
- `frontend/scripts/skeletons.js` opcional: helpers para la tabla

**Criterio de aceptacion**:
- Admin entra a `/reportes/vuelos-piloto`, ve la tabla con todos los pilotos y sus vuelos del mes
- Filtra por piloto especifico -> solo aparece ese piloto
- Filtra por rango de fechas -> solo aparecen vuelos en ese rango
- Click en EXPORTAR CSV -> descarga `reporte-vuelos-pilotos-<mes>.csv` con 1 linea por vuelo + 2 lineas de totales
- Total minutos = suma de `minutos` (h*3600+m*60+s)/60
- Horas decimales = total_minutos / 60, redondeado a 2 decimales

**Variantes futuras** (no en este sprint):
- Reporte por dron (mismo patron, agrupado por dron_id)
- Reporte por previsto (mision -> vuelos reales)
- Filtro por modelo, estado del vuelo, etc.

**Helper** (snippet listo, agregar a `ui-helpers.js`):
```js
export const exportToCSV = (rows, filename, columns) => {
  // columns: [{ key: 'matricula', label: 'Matricula' }, ...]
  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const header = columns.map(c => escape(c.label)).join(",");
  const body = rows.map(r => columns.map(c => escape(r[c.key])).join(",")).join("\n");
  const csv = `${header}\n${body}`;
  // BOM para que Excel detecte UTF-8
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
```

**Plan por lista**:
1. En cada `*-list.js`, agregar un botón "EXPORTAR CSV" en el `headerActions` (solo admin):
   ```js
   headerActions: isAdmin ? `<button class="btn btn--secondary btn--sm" id="btn-export">EXPORTAR CSV</button> ...` : "",
   ```
2. Después del render, hookear el click:
   ```js
   main.querySelector("#btn-export")?.addEventListener("click", () => {
     const columns = [
       { key: "matricula", label: "Matricula" },
       { key: "estado", label: "Estado" },
       { key: "horas_vuelo_acum", label: "Minutos" },
       { key: "fecha_adquisicion", label: "Adquirido" },
     ];
     exportToCSV(filtered, `drones-${new Date().toISOString().slice(0, 10)}.csv`, columns);
   });
   ```
3. Usar el array `filtered` (después de aplicar el search + filter chips), NO el array completo

**Criterio de aceptación**:
- Click en EXPORTAR CSV descarga un archivo con todas las columnas visibles
- Excel/LibreOffice abre el archivo sin encoding issues (BOM UTF-8)
- Caracteres especiales (comas, comillas, saltos de línea) se escapan correctamente
- El CSV respeta los filtros activos (solo exporta lo que el usuario ve)

---

### **A3** — Service worker (modo offline básico) (~1h)

**Por qué**: la app no funciona sin conexión. Un service worker cachea los assets estáticos y la última versión del shell, permitiendo ver el dashboard (al menos el layout) aunque la API falle.

**Archivos a tocar**:
- `frontend/sw.js` (NUEVO)
- `frontend/scripts/main.js` (registrar el SW)
- `frontend/index.html` (opcional: meta para PWA)

**Plan**:
1. Crear `frontend/sw.js` con:
   ```js
   const CACHE = "vant-v1";
   const ASSETS = [
     "/",
     "/index.html",
     "/styles/tokens.css",
     "/styles/reset.css",
     "/styles/base.css",
     "/styles/components.css",
     "/scripts/main.js",
   ];
   self.addEventListener("install", e => {
     e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
   });
   self.addEventListener("activate", e => {
     // Limpiar caches viejos
   });
   self.addEventListener("fetch", e => {
     const url = new URL(e.request.url);
     // API: network-first (falla -> mensaje)
     if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/")) {
       e.respondWith(fetch(e.request).catch(() => new Response(
         JSON.stringify({ offline: true, error: "Sin conexion" }),
         { headers: { "Content-Type": "application/json" }, status: 503 }
       )));
       return;
     }
     // Assets: cache-first
     e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
   });
   ```
2. En `main.js`, después de `start()`:
   ```js
   if ("serviceWorker" in navigator) {
     navigator.serviceWorker.register("/sw.js").catch(console.error);
   }
   ```
3. En la UI, mostrar un toast "OFFLINE — datos en cache" si la API responde 503 con `offline: true`

**Criterio de aceptación**:
- Con DevTools en modo Offline, recargar la app muestra el shell (sin estilos rotos ni errores fatales)
- Click en navegación funciona (cache del shell)
- La API devuelve 503 con flag `offline: true` y la UI muestra un mensaje claro

**Limitaciones conocidas**:
- El SW solo cachea el shell, no los datos. La API real va a fallar offline.
- No es PWA completa (no hay manifest.json con iconos para instalar)

---

### **C** — Deploy a Railway (~2-3h)

**Por qué**: el server corre solo en local. Un deploy público permite demo externa y compartir con stakeholders.

**Pre-requisitos**:
- Repo conectado a GitHub (ya está)
- Cuenta Railway con workspace
- Este proyecto ya tiene MCP `railway` configurado en `opencode.json` (segun `AGENTS.md`)

**Plan**:
1. **C1: Crear servicio backend en Railway** (10 min)
   - Usar el MCP `railway`: `railway_create-deployment` o desde el dashboard
   - Conectar el repo `Lautaro1393/proyecto-vant` a un nuevo servicio
   - Branch: `main`, root directory: `/` (raiz del repo)

2. **C2: Setear env vars** (5 min)
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE` (credenciales de MySQL)
   - `JWT_SECRET` (generar uno nuevo y aleatorio)
   - `PORT` (Railway lo inyecta automaticamente, no setear manualmente)
   - **Importante**: NO copiar el `.env` local. Usar valores reales de Railway.

3. **C3: Conectar MySQL** (10 min)
   - Opcion A: Crear MySQL plugin en Railway (proyecto `charismatic-compassion`)
   - Opcion B: Usar la MySQL hosteada existente (sirve si Railway la puede alcanzar via TCP)
   - Verificar que el connection pool funcione con `keepAlive` (ya esta fixeado en B1)

4. **C4: Verificar deploy** (10 min)
   - Esperar a que el deploy termine (`railway_list-deployments`)
   - Probar con `curl https://<railway>.up.railway.app/auth/login` que responda
   - Probar `curl https://<railway>.up.railway.app/api/drones` con un JWT
   - Correr `run-smoke-tests.js` apuntando al URL de Railway (modificar la URL base)

5. **C5: Documentar** (15 min)
   - Actualizar `README.md` con seccion "Deploy a Railway" (pasos, env vars, URL publica)
   - Capturar screenshots del dashboard funcionando en produccion

**Criterio de aceptación**:
- URL publica accesible desde el navegador
- Login funciona contra la DB de Railway
- Las 6 smoke tests pasan contra el deploy (pueden requerir modificacion de la URL base)
- El servidor no se cae con conexiones idle (verificar B1 keepAlive)

**Consideraciones de costo**:
- Railway cobra por uso de CPU/memoria. Para una demo pequena, el plan gratuito deberia alcanzar.
- MySQL plugin tiene costo mensual aparte.

---

## 🐛 Observaciones pendientes (no críticas)

### 1. **TZ datetime para previstos** (UX)

**Sintoma**: con `process.env.TZ = 'UTC'` (B2), los datetimes de previstos se muestran en UTC. Si el usuario escribio "2026-07-01T08:00" en hora local Argentina, ahora se interpreta como UTC y la UI muestra "08:00" cuando en realidad eran las 05:00 UTC.

**Opciones**:
- **A)**: Mantener UTC en backend, mostrar en local TZ en frontend (con `toLocaleString()`)
- **B)**: Enviar datetimes desde el frontend como UTC (asumir que el input date+time es local)
- **C)**: Mostrar la TZ en la UI al lado de cada datetime ("2026-07-01 08:00 UTC" o "ART" si se detecta local)

**Recomendacion**: **C** con `toLocaleString()`. Es el cambio mas chico y el usuario entiende el contexto.

**Archivos**:
- `frontend/scripts/ui-helpers.js` (nuevo helper `formatDateTimeLocal(iso)`)
- `frontend/scripts/views/vuelo-detail.js` (usar en el campo fecha)
- `frontend/scripts/views/previsto-detail.js` (usar en el campo fecha_inicio/fin)
- `frontend/scripts/views/vuelos-form.js` (default value del input)

**Esfuerzo**: 20-30 min

---

### 2. **Falta módulo Baterias en frontend**

**Sintoma**: el endpoint `/api/baterias` existe y funciona (lo usa el dashboard en "ESTADO DE BATERIAS"). Pero no hay vistas dedicadas. El nav no linkea a `/baterias` (BUG-1 lo removio porque no existia).

**Si querés agregarlo** (similar a Modelos):
- `frontend/scripts/views/baterias-list.js` (list con filtro por ciclos)
- `frontend/scripts/views/bateria-detail.js` (detail con historico de ciclos y vuelos)
- `frontend/scripts/views/baterias-form.js` (alta/edicion con modelo, ciclos, voltage, capacidad)
- Registrar las 3 rutas en `main.js` y en `ui.js` (NAV)

**Esfuerzo**: 2-3h (es un modulo nuevo completo)

**Prioridad**: baja. El card del dashboard es suficiente por ahora.

---

### 3. **P9 — Thumbnails en dron picker del wizard**

**Sintoma**: cuando se selecciona un dron en el wizard de vuelos, no se ve la foto del dron, solo texto.

**Archivos**:
- `frontend/scripts/vuelos-wizard.js` (modificar `renderStepDrones` para mostrar `<img>` 40x40 al lado de cada `picker__item`)

**Esfuerzo**: 30 min

**Snippet**:
```js
const imgHtml = d.imagen
  ? `<img src="/uploads/${d.imagen}" style="width:40px;height:40px;object-fit:cover;margin-right:var(--space-2);flex-shrink:0" />`
  : `<div style="width:40px;height:40px;flex-shrink:0;background:var(--surface-low);margin-right:var(--space-2)"></div>`;
// Insertar imgHtml antes del picker__body
```

**Prioridad**: baja. Funcional ya esta; es solo visual.

---

### 4. **Plan/next-steps.md queda obsoleto**

**Sintoma**: este archivo (`Plan/next-steps.md`) del 2026-06-24 quedo desactualizado. El usuario ahora usa este `roadmap-futuro.md` (o deberia).

**Accion sugerida**:
- Renombrar `Plan/next-steps.md` a `Plan/next-steps-2026-06-24.md` (para historial)
- O borrarlo y dejar solo `roadmap-futuro.md`

**Esfuerzo**: 1 min

---

### 5. **Migrar a PWA completa (futuro lejano)**

**Que falta para ser PWA**:
- `manifest.json` con iconos, nombre, colores
- HTTPS (Railway ya lo provee)
- Service worker (A3 cubre la parte basica)

**Esfuerzo**: 4-6h si se hace completo

**Prioridad**: muy baja. Nice-to-have para que sea "instalable" en el celular.

---

## 🧪 Testing strategy (recomendada para retomar)

Antes de cada cambio:
1. `node --check <files>` para syntax
2. `node src/scripts/run-smoke-tests.js` para API (6/6 esperado)
3. Browser test: 1 happy path de la vista modificada
4. Screenshot si es cambio de UI

Despues de cada cambio:
- `git status` debe estar limpio (o solo cambios intencionales)
- Visual check de que no se rompio nada existente
- Commit + push con `GIT_SSH_COMMAND="ssh -i ~/.ssh/Dell-LinuxMint"` (o `ssh-add ~/.ssh/Dell-LinuxMint`)

---

## 📁 Indice de archivos utiles

| Path | Que hay |
|---|---|
| `src/app.js` | Entry point, middlewares, `process.env.TZ = 'UTC'` |
| `src/config/database.js` | Pool MySQL con `enableKeepAlive: true` |
| `src/scripts/run-smoke-tests.js` | 6 TC, baseline antes de cualquier cambio |
| `src/scripts/seed-fotos.js` | Poblado de fotos en drones y pilotos (idempotente) |
| `src/scripts/migrate-piloto-imagen.js` | ALTER para `piloto.imagen` (idempotente) |
| `frontend/scripts/skeletons.js` | Skeleton loaders (D2) |
| `frontend/scripts/coords-picker.js` | Mapa Leaflet (P8) |
| `frontend/scripts/vuelos-wizard.js` | Wizard de 4 pasos |
| `frontend/scripts/views/*-list.js` | Las 6 listas |
| `frontend/styles/tokens.css` | CSS vars + 3 temas |
| `frontend/styles/components.css` | .skeleton, .drone-hero, .dropzone, .chip--* |
| `uploads/dron_modelos/` | Fuente local para seed de imagenes (gitignored) |
| `uploads/imagen-*` | Archivos subidos via multer (gitignored) |
| `AGENTS.md` | Convenciones + SSH key doc |
| `Plan/Correcciones.md` | Anotaciones originales del usuario |
| `Plan/correcciones-analisis.md` | Analisis de las correcciones (8 items) |
| `Plan/handoff-frontend.md` | Handoff del frontend (algo desactualizado) |

---

## 🎯 Orden de implementacion sugerido

```
Sesion 1 (~1.5h):  [COMPLETADO]
  D3 Error boundary              20 min
  A1 Busqueda global (Cmd+K)     45 min
  P9 Thumbnails dron picker      30 min

Sesion 2 (~1.5h):  [EN CURSO]
  TZ fix en fechas                30 min   [DONE]
  A2 Reporte vuelos por piloto    1.5h     [PENDIENTE]

Sesion 3 (~1h):
  A3 Service worker basico        1h

Sesion 4 (~3h, opcional):
  C Deploy a Railway              3h

Backlog (baja prioridad):
  A2 list-export original (CSV plano de cada lista)    1h
  Modulo Baterias (frontend)                           2-3h
  PWA completa (manifest+iconos)                     4-6h
  Borrar/renombrar next-steps.md                       1 min
```

**Total minimo (sesiones 1+2+3):** ~4h
**Total con deploy (sesiones 1+2+3+4):** ~7h
