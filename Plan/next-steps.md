# Plan de continuación — Sesión 2026-06-24

> Estado actual: **Etapas 1, 2, 3, 4.1, 4.2, 4.3 completas**. Manual test E2E pasó. B1 (pool keepAlive) y B2 (TZ UTC) fixeados y pusheados. Nav completa con 7 items, sin 404s.
>
> Última sesión: 9a836ca — B1+B2+nav

---

## ✅ Lo que se hizo desde el plan anterior

| Item | Estado | Commit |
|---|---|---|
| B1: pool keepAlive | ✅ Done (verificado: 6/6 OK tras 65s idle) | `9a836ca` |
| B2: TZ UTC | ✅ Done (verificado: fechas sin off-by-one) | `9a836ca` |
| B4: bugs-analisis.md | ✅ Already committed en sesión 4.3 | (anterior) |
| BUG-1: PWR link roto | ✅ Fixed (removido del nav) | `9a836ca` |
| BUG-2: Nav incompleta | ✅ Fixed (3 items agregados: TALLER, AGENDA, MODELOS) | `9a836ca` |
| Manual test E2E | ✅ Done — todas las entidades verificadas | (sin commit, fue test) |

---

## ⏳ Pendientes del plan original (lo que falta)

### **B3** — `.gitignore` cleanup (~10 min)
- **Issue**: hay 20 imágenes `uploads/imagen-*.{png,jpeg,gif}` y `.opencode/` sin trackear
- **Causa**: el `.gitignore` actual solo tiene `opencode.json` (con punto no, sin punto), no tiene `uploads/` ni `.opencode/`
- **Fix**:
  - Agregar al `.gitignore`:
    - `uploads/imagen-*` (los archivos de prueba de drones)
    - `/.opencode/` (config local de opencode con MCPs/credenciales)
  - Considerar: ¿borrar los archivos existentes con `git clean` o dejarlos?
  - Mantener el archivo `uploads/` tracked (no tiene nada útil, pero el server lo sirve estáticamente)
- **Criterio de aceptación**: `git status` limpio, solo muestra los archivos intencionalmente untracked

### **B5** — Doc SSH key en `AGENTS.md` (~5 min)
- **Issue**: el SSH agent no carga la key `~/.ssh/Dell-LinuxMint` por defecto
- **Causa**: cada push necesita `GIT_SSH_COMMAND="ssh -i ~/.ssh/Dell-LinuxMint"`, sino el agent rechaza la firma
- **Fix**: agregar a `AGENTS.md` seccion "Remote / Auth" una nota explicando que la key debe estar cargada con `ssh-add ~/.ssh/Dell-LinuxMint`, o usar el flag `GIT_SSH_COMMAND` como workaround
- **Criterio de aceptación**: la nota está en AGENTS.md

---

## 🎯 Polish + features (lo más jugoso)

### **D1** — Theme switcher en header (~30 min)
- **Estado**: `tokens.css` ya define `--data-theme="night"` y `--data-theme="desert"`. Solo falta el toggle en UI.
- **Plan**:
  - Agregar botón en el header (entre actions y logout) con icono
  - Ciclar entre 3 temas: default (Tactical Olive) → night (verde-azulado oscuro) → desert (arena)
  - Persistir en `localStorage.setItem("vant.theme", theme)`
  - Aplicar en `app.js` (o `main.js`) al inicio: leer localStorage y setear `document.documentElement.dataset.theme`
- **Criterio de aceptación**: el botón cicla entre 3 temas, el estado persiste al recargar, los CSS variables se aplican (background, cards, text cambian)

### **D2** — Loading skeletons (~30 min)
- **Estado**: las vistas usan `<span class="spinner"></span>` mientras cargan. Funciona pero es básico.
- **Plan**:
  - Agregar `.skeleton` CSS con animación shimmer (background-position transition)
  - Usar en dashboards y list views mientras cargan catálogos (reemplazar el spinner por skeletons que se vean como cards vacías con shimmer)
- **Criterio de aceptación**: skeleton aparece brevemente, luego se reemplaza con contenido real. Sin "flash" de contenido vacío.

### **D3** — Error boundary global en router (~20 min)
- **Estado**: si una vista tira excepción durante render, la app puede quedar en estado roto.
- **Plan**:
  - Envolver el `dispatch()` en `router.js` con try/catch
  - En catch, renderizar un error-banner global y log a console
  - El handler de error debe ser el mismo que ya tenemos para 404 (navigate a una vista de error)
- **Criterio de aceptación**: forzar un error en una vista (e.g., retornar `null` accidentalmente) → usuario ve mensaje claro, app sigue funcionando al cambiar de ruta

---

### **A1** — Búsqueda global en dashboard (~45 min)
- **Estado**: la nav tiene 7 items, pero no hay búsqueda global
- **Plan**:
  - Input en el header con shortcut "/" (o `Cmd+K`)
  - Busca contra drones (matricula, serie), pilotos (nombre, dni, email), baterias (serie), vuelos (proposito), mantenimientos (descripcion), previstos (nombre_clave)
  - Resultados en dropdown debajo del input, agrupados por tipo
  - Click en un resultado navega al detail
- **Criterio de aceptación**: typing "ABC" filtra items relevantes en <200ms (5 endpoints en paralelo), resultados agrupados por tipo

### **A2** — Export CSV desde listados (~1h)
- **Estado**: no hay export, los usuarios tienen que copiar a mano
- **Plan**:
  - En `vuelos-list.js`, `drones-list.js`, `pilotos-list.js`, `mantenimientos-list.js`, `previstos-list.js`: agregar botón "EXPORTAR CSV" en el headerActions (admin only)
  - Helper genérico `exportToCSV(rows, filename)` que genera CSV client-side desde el array actual y dispara download
  - CSV con headers en primera línea, escape de comas/comillas
- **Criterio de aceptación**: el CSV se descarga, abre correctamente en Excel/LibreOffice con todas las columnas, caracteres especiales escapados

### **A3** — Service worker (modo offline básico) (~1h)
- **Estado**: no hay service worker, la app no funciona offline
- **Plan**:
  - Registrar `sw.js` en `main.js` (después de `start()`)
  - `sw.js` cachea `index.html`, `styles/*.css`, `scripts/main.js`, `scripts/router.js`
  - Network-first para la API (que probablemente falla offline)
  - Cache-first para assets estáticos
  - Mensaje "OFFLINE" si la API falla y no hay cache
- **Criterio de aceptación**: con network caído, el dashboard se sigue mostrando (al menos la versión cacheada del último load)

---

### **C** — Deploy a Railway (opcional, ~2-3h)
- **Plan**:
  - C1: Crear servicio backend en Railway, conectar MySQL plugin o usar la hosteada
  - C2: Setear env vars (`DB_*`, `JWT_SECRET`, `PORT`), configurar start command `node src/app.js`
  - C3: Verificar con `curl https://<railway>.up.railway.app/` y smoke tests
  - C4: Actualizar README con sección "Deploy"

---

## 📌 Orden recomendado para mañana

```
Sesión 1 (~1h):
  B3 gitignore cleanup                    10 min
  B5 SSH key doc en AGENTS.md              5 min
  D1 Theme switcher (quick win visual)    30 min
  --- break ---

Sesión 2 (~2h):
  D2 Loading skeletons                    30 min
  D3 Error boundary                       20 min
  A1 Búsqueda global                      45 min
  A2 Export CSV (1/2 listas)               25 min
  --- break ---

Sesión 3 (~2h):
  A2 Export CSV (resto de listas)          35 min
  A3 Service worker                        1h
  --- opcional ---
  C Deploy a Railway                       2-3h
```

**Total mínimo (sesiones 1+2):** ~3h
**Total completo (sesiones 1+2+3):** ~5h

---

## 🔧 Snippets listos para usar

### B3 — `.gitignore` (agregar 2 líneas al final):
```
uploads/imagen-*
/.opencode/
```

### D1 — Theme switcher en `ui.js`:
```js
const THEMES = ['default', 'night', 'desert'];
export const getTheme = () => localStorage.getItem('vant.theme') || 'default';
export const setTheme = (t) => {
  localStorage.setItem('vant.theme', t);
  document.documentElement.dataset.theme = t;
};
// In renderShell headerActions, add:
// `<button class="btn btn--ghost btn--icon" id="btn-theme" title="Cambiar tema">T</button>`
// In main.js after start():
// setTheme(getTheme()); document.getElementById('btn-theme')?.addEventListener('click', () => { const i = THEMES.indexOf(getTheme()); setTheme(THEMES[(i+1) % THEMES.length]); location.reload(); });
```

### D2 — Skeleton CSS (en `components.css`):
```css
.skeleton {
  background: linear-gradient(90deg, var(--surface) 0%, var(--surface-high) 50%, var(--surface) 100%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite linear;
  border: 1px solid var(--outline-variant);
}
@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### D3 — Error boundary en `router.js`:
```js
const dispatch = async () => {
  // ... existing code ...
  try {
    const result = await r.handler({ params, path, root });
    currentTeardown = typeof result === "function" ? result : null;
  } catch (e) {
    console.error('[router] Error en vista:', e);
    root.innerHTML = `<div class="card mt-3"><div class="card__body error-banner">Error inesperado: ${e.message}</div></div>`;
  }
};
```

### A2 — Helper CSV en `ui-helpers.js`:
```js
export const exportToCSV = (rows, filename, columns) => {
  // columns: [{ key: 'matricula', label: 'Matricula' }, ...]
  const header = columns.map(c => `"${c.label}"`).join(',');
  const body = rows.map(r => columns.map(c => {
    const v = r[c.key] ?? '';
    return `"${String(v).replace(/"/g, '""')}"`;
  }).join(',')).join('\n');
  const csv = `${header}\n${body}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};
```

---

## 🧪 Testing strategy

Antes de cada cambio:
1. `node --check <files>` para syntax
2. `node src/scripts/run-smoke-tests.js` para API (6/6 esperado)
3. Browser test: 1 happy path de la vista modificada
4. Screenshot si es cambio de UI

Después de cada cambio:
- `git status` debe estar limpio (o solo cambios intencionales)
- Visual check de que no se rompió nada existente

---

## 🐛 Observaciones pendientes (no críticas)

1. **TZ datetime para previstos**: con TZ=UTC, el datetime se muestra en UTC. Si el usuario escribió "2026-07-01T08:00" local, ahora se muestra "08:00" pero interpretado como UTC. UX improvement: enviar el datetime en UTC desde el frontend, o mostrar la TZ en la UI.

2. **Falta módulo Baterias en frontend**: `/api/baterias` funciona pero no hay vistas. El nav ya no linkea a `/baterias` (BUG-1 fixed). El "Estado de Baterias" del dashboard es la única forma de verlas. Si querés un módulo completo, agregalo (similar a Modelos — list + detail opcional).

3. **17 archivos huérfanos en `uploads/`**: una vez que `.gitignore` tenga `uploads/imagen-*`, no se commitean más. Los actuales se pueden borrar con `rm uploads/imagen-*` o dejar (no molestan).

4. **Plan/next-steps.md queda obsoleto**: este archivo lo reemplaza. Considerar borrarlo o renombrarlo a `next-steps-2026-06-23.md` para historial.

---

## 📦 Estado del repo (para referencia)

**Commits recientes** (del más nuevo al más viejo):
```
9a836ca  fix(stability+nav):  B1 + B2 + nav completa
5d9ea7d  docs:                Plan/next-steps.md
6f0f6f6  feat(dashboard):     4.3D
dec541f  feat(modelos):       4.3C
3f2e62b  feat(previstos):      4.3B
52e745e  feat(mantenimientos): 4.3A
841e313  fix(security):        B6 + B13 + B15
2d1d477  feat(vuelos):         4.2F
08c1978  polish(vuelos):       4.2E
acf7a89  feat(vuelos):         4.2D
```

**Files untracked** (decidir en B3):
- `.opencode/`
- `uploads/imagen-*.{png,jpeg,gif}` (20 archivos)
