# Análisis de Correcciones

**Origen**: `Plan/Correcciones.md` (anotaciones del usuario tras prueba manual)
**Fecha**: 2026-07-27
**Estado**: Diagnóstico completo, listo para priorización

---

## Resumen ejecutivo

| # | Severidad | Tipo | Esfuerzo | Impacto |
|---|-----------|------|----------|---------|
| BUG-P1 Pilotos: horas + count | 🟠 Alta | Bug | 1h | Datos visibles rotos |
| BUG-P2 Vuelos: solo 1 piloto | 🟠 Alta | Funcional | 30min | Feature faltante |
| BUG-P3 Vuelos: estado es input libre | 🟡 Media | Bug | 10min | Errores de tipeo |
| FIX-P4 Modelos: tarjetas raras | 🟡 Media | UX | 45min | Consistencia visual |
| FIX-P5 Previstos: chips confusos | 🟡 Media | UX | 15min | Lectura del estado |
| FIX-P6 Dron detail: foto muy grande | 🟢 Baja | UX | 15min | Confort visual |
| FIX-P7 Fotos: placeholders | 🟢 Baja | Datos | 5min | Manual (no código) |
| FEAT-P8 Vuelos: mapa para coords | 🔵 Nice-to-have | Feature | 2-3h | UX (pesado) |
| FEAT-P9 Vuelos: thumbnails dron picker | 🔵 Nice-to-have | UX | 30min | Información visual |

---

## 🟠 BUG-P1 — Pilotos: horas y count de vuelos

### Síntomas reportados
1. "Revisar las horas de vuelo porque figuran mal"
2. "Revisar cantidad de vuelos porque al registrar un vuelo nuevo con ese piloto sigue quedando en cero"

### Diagnóstico técnico

**Bug 1.1: horas en unidad incorrecta**

`src/models/vuelo.model.js:11`:
```js
return Math.round((h * 3600 + m * 60 + s) / 60 * 100) / 100;  // minutos
```

`src/models/vuelo.model.js:130-135`:
```js
export const sumarHorasPiloto = async (id_piloto, minutos, conn) => {
    const runner = conn || pool;
    await runner.query(
        'UPDATE piloto SET horas_vuelo_acum = horas_vuelo_acum + ? WHERE id_pilotos = ?',
        [minutos, id_piloto]
    );
};
```

`frontend/scripts/views/pilotos-list.js:107`:
```js
<span class="telemetry__value">${p.horas_vuelo_acum || 0}<span class="telemetry__unit"> h</span></span>
```

**Causa**: `tiempoAMinutos` devuelve **minutos** (ej. `25` para un vuelo de 25 min). El modelo lo guarda tal cual. La vista lo muestra con sufijo ` h` → un vuelo de 25 min aparece como **"25h"**. La unidad está mal en la UI o en el guardado (hay que decidir).

**Decisión recomendada**: Guardar y mostrar en **horas** (decimal). Es el standard en aviación (flight hours).
- Conversión: `minutos / 60 = horas` (con 2 decimales)
- Cambio en `sumarHorasPiloto`: pasar horas decimales
- Cambio en el nombre de la columna / vista: ya dice "h" ✓

**Bug 1.2: no hay count de vuelos por piloto**

`src/models/pilotos.model.js` no expone un conteo de vuelos. La vista `pilotos-list.js` no muestra count, solo horas. Pero la lista de drones sí muestra count (`dron-detail.js:92` muestra `${vuelosDelDron.length}`). **Inconsistencia**.

**Solución**: Agregar `vuelos_count` al SELECT del modelo (subquery o JOIN), mostrarlo en la lista y en el detalle de piloto.

### Fix propuesto
- `src/models/vuelo.model.js:130-135`: cambiar `sumarHorasPiloto` a guardar horas decimales (`minutos / 60`)
- `src/models/pilotos.model.js`: agregar `vuelos_count` como subquery al `PILOTO_SAFE_COLUMNS`
- `frontend/scripts/views/pilotos-list.js:106-109`: mostrar "X.XX h · N vuelos"
- `frontend/scripts/views/piloto-detail.js`: agregar card con total de vuelos

**Esfuerzo**: 1h (incluye probar que la UI del listado y el resumen del wizard sumen bien)

---

## 🟠 BUG-P2 — Vuelos: wizard solo permite 1 piloto

### Síntoma reportado
"Que se pueda agregar otro piloto mas en un vuelo nuevo"

### Diagnóstico técnico

`frontend/scripts/vuelos-wizard.js:191`:
```js
<select class="select" id="wiz-piloto" data-draft-key="pilotos" data-draft-mode="single">
  <option value="">-- SELECCIONAR --</option>
  ${pilotos.map((p) => {...})}
</select>
```

`frontend/scripts/vuelos-wizard.js:415-417`:
```js
if (mode === "single") {
  val = el.value ? [Number(el.value)] : [];
}
```

**Causa**: El input es un `<select>` simple con `data-draft-mode="single"` que siempre setea 0 o 1 piloto. La tabla pivote `vuelo_pilotos` ya acepta N pilotos (`asociarPilotos(ids, conn)` itera), pero el UI no lo permite.

**Decisión de diseño**: Hay 2 enfoques:
- **A) Multi-select de pilotos** (como drones/baterías): cambiar el step 3 a tener un picker de pilotos
- **B) Mantener un piloto principal + select extra "Agregar copiloto"**: mantener simple, agregar +1 si hace falta

**Recomendación**: **A)** porque ya está el patrón (`renderStepDrones`, `bindStepPicker`). Es consistente con el resto del wizard y no requiere UI nueva.

### Fix propuesto
- Mover "seleccionar piloto" al **step propio** (renombrar step 3 a "PILOTOS" con picker multi)
- El step 4 actual "PILOTO + DATOS" pasa a ser solo "DATOS" (sin el select de piloto)
- La validación exige `pilotos.length >= 1`
- Resumen muestra todos los pilotos

**Esfuerzo**: 30min

---

## 🟡 BUG-P3 — Vuelos: estado es input libre

### Síntoma reportado
"El estado de vuelo que sea un selector tipo desplegable para evitar errores"

### Diagnóstico técnico

`frontend/scripts/vuelos-wizard.js:264-272`:
```js
<div class="field">
  <label class="field__label" for="wiz-estado">Estado</label>
  <div class="input-wrap">
    <input class="input" id="wiz-estado" data-draft-key="estado" type="text" value="${escape(draft.estado)}" placeholder="Realizado" />
```

**Causa**: El campo "estado" es un input libre. Acepta cualquier string ("realiado", "REALIZADO", "en curso", etc.) → inconsistencias en la DB → los chips en `previstos-list.js` se rompen porque hacen match por substring.

`src/models/vuelo.model.js` no valida el estado del vuelo (a diferencia de los drones, que sí usa `ESTADOS_DRON_OPTIONS`).

### Fix propuesto
- Crear `ESTADOS_VUELO = ['Realizado', 'Cancelado', 'Suspendido']` en `ui-helpers.js`
- Cambiar el `<input>` a `<select>` con esas opciones
- Validar en backend (controller de vuelo) que el estado esté en la lista

**Esfuerzo**: 10min

---

## 🟡 FIX-P4 — Modelos: tarjetas se ven raras

### Síntoma reportado
"se ven raras las tarjetas"
"agregar thumbnails por modelo"

### Diagnóstico técnico

`frontend/scripts/views/modelos-list.js:70-80`:
```js
listSlot.innerHTML = filtered.map((m, idx) => `
  <div class="card card--info" style="display:flex;align-items:center;gap:var(--space-3)">
    <div style="flex:1;min-width:0">
      <div class="list__primary" style="...">${m.modelo || "—"}</div>
      <div class="list__secondary">${m.fabricante || "—"}</div>
    </div>
    ${isAdmin ? `<a class="btn btn--secondary btn--sm" ...>EDITAR</a>` : ""}
  </div>
`).join("");
```

**Causa**: Las tarjetas no tienen `card__header` (sin el prefijo numérico `01`, `02`... que es el patrón del resto). Son "huérfanas" visualmente.

**Thumbnails**: La tabla `modelo_dron` **no tiene columna `imagen`**. Hay que agregarla:
- Migración idempotente
- Subida en form (multer)
- Mostrar miniatura en lista

### Fix propuesto (dividido en 2)

**P4a — Mejorar la estructura visual** (sin imagen):
- Agregar `card__header` con prefijo + nombre del modelo
- Agregar footer con metadata (cantidad de drones con este modelo)
- Mantener el botón EDITAR como acción

**P4b — Soporte de thumbnails** (opcional, requiere migración):
- Script `migrate-modelo-imagen.js` (ALTER + multer en form)
- Mostrar thumbnail 64x64 en la lista
- 1h extra de trabajo

**Esfuerzo P4a**: 30min
**Esfuerzo P4b**: 1h (con migración + form + display)

---

## 🟡 FIX-P5 — Previstos: chips de estado confusos

### Síntoma reportado
"cambiar a colores mas descriptivos los chips de estado ejemplo: 'Cancelado', 'En curso' , etc"

### Diagnóstico técnico

`frontend/scripts/views/previstos-list.js:14-21`:
```js
const estadoChip = (e) => {
  const v = (e || "").toLowerCase();
  if (v.includes("curso"))     return "chip--info";       // EN CURSO → azul
  if (v.includes("finalizado")) return "chip--safe";     // FINALIZADO → verde
  if (v.includes("pospuesto")) return "chip--caution";   // POSPUESTO → amarillo
  if (v.includes("cancelado")) return "chip--alert";     // CANCELADO → rojo
  return "chip--dim";
};
```

**Observación**: Ya hay colores para 4 estados, pero "Planificado" no tiene match → cae en `chip--dim` (gris), y se confunde con "Sin estado".

**Recomendación cromática** (semáforo de misión):
- **Planificado** → `chip--info` (azul: pendiente, futuro)
- **En Curso** → `chip--alert` o `chip--olive` (naranja/olive: activo, requiere atención)
- **Finalizado** → `chip--safe` (verde: completado OK) ← ya está
- **Pospuesto** → `chip--caution` (amarillo: requiere decisión)
- **Cancelado** → `chip--alert` (rojo: cerrado sin éxito) ← ya está
- Mover "En Curso" de info→olive (o alert) lo hace más notorio

### Fix propuesto
- Cambiar el orden de los `if` y la asignación de "Planificado" a `chip--info`
- Mover "En Curso" a un color más vivo (alert u olive)
- Testear contraste en los 3 themes (OLIVE/NIGHT/DESERT)

**Esfuerzo**: 15min

---

## 🟢 FIX-P6 — Dron detail: foto muy grande

### Síntoma reportado
"en el detalle del dron que se vea mas pequeña la foto del mismo"

### Diagnóstico técnico

`frontend/styles/components.css:341-348`:
```css
.drone-hero {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;        /* 56% de la altura del viewport en mobile */
  background: var(--surface-lowest);
  border-bottom: var(--border-1);
  overflow: hidden;
}
```

**Causa**: `width: 100%` + aspect 16:9 → en mobile portrait ocupa media pantalla. Demasiado protagonismo.

### Fix propuesto
Cambiar a `aspect-ratio: 4 / 3` con `max-width: 320px` + `margin: 0 auto` para centrarla. O pasar a `max-height: 180px; max-width: 280px` con `object-fit: cover`.

**Esfuerzo**: 15min (solo CSS)

---

## 🟢 FIX-P7 — Fotos: placeholders

### Síntoma reportado
"sacar todas las fotos de los drones y poblar con fotos reales"

### Diagnóstico técnico
No hay archivos placeholder. Las imágenes son:
- `uploads/imagen-<timestamp>-<random>.<ext>` (cuando el admin sube)
- Si no hay, se renderiza el SVG de placeholder (`drone-hero__placeholder` con 4 hélices)

**Acción requerida**: Esto es **trabajo de datos**, no de código:
1. Conseguir fotos reales de los drones
2. Subir via form de dron (ya soporta multer)
3. No requiere cambio de código (excepto si se quiere mejorar el placeholder visual)

**Esfuerzo**: N/A (manual del usuario)

---

## 🔵 FEAT-P8 — Vuelos: mapa para coordenadas

### Síntoma reportado
"Analizar de cambiar la forma de ingresar coordenadas por google maps o similar"

### Análisis de factibilidad

**Opción A: Google Maps JS API** (la que sugiere el usuario)
- Requiere API key + billing account (cuota gratis generosa)
- Componente: `<input>` con autocomplete + mapa con pin arrastrable
- **Costo**: bajo si uso bajo
- **Privacidad**: Google ve las coordenadas

**Opción B: Leaflet + OpenStreetMap** (recomendada)
- Sin API key, sin billing
- Tiles de OSM (gratuitos, hay que dar crédito)
- Mismo UX: pin arrastrable + reverse geocoding con Nominatim
- **Costo**: 0
- **Privacidad**: 100% local

**Opción C: "Usar mi ubicación" + helper text** (mínimo)
- Botón que llama `navigator.geolocation`
- Mantiene el input de texto, pero con un botón helper
- Sin mapa, sin tile loading
- **Esfuerzo**: 30min
- **Costo**: 0

**Recomendación**: Empezar por **C** (rápido, útil), y si el usuario quiere mapa, hacer **B** (Leaflet, sin costo).

### Fix propuesto (Fase 1 = C)
- Botón "📍 USAR MI UBICACION" al lado del input de coordenadas
- Helper text con formato: "lat,lng (ej: -34.6037,-58.3816)"
- Validación existente se mantiene

**Esfuerzo Fase 1 (C)**: 30min
**Esfuerzo Fase 2 (B con Leaflet)**: 2-3h
**Esfuerzo Fase 2 (A con Google)**: 3-4h + setup billing

---

## 🔵 FEAT-P9 — Vuelos: thumbnails de drones en el picker

### Síntoma reportado
"Al ingresar un vuelo, al seleccionar los drones que muestre pequeñas thumbnails de los modelos"

### Diagnóstico técnico

`frontend/scripts/views/drones-list.js` ya muestra foto si existe (`<img class="drone-thumb" src="...">`). Pero el wizard `renderStepDrones` solo muestra texto:

`frontend/scripts/vuelos-wizard.js:108-114`:
```js
return renderPickerItem({
  id: d.id_dron,
  primary: d.matricula || `Dron #${d.id_dron}`,
  secondary: `${d.nombre_modelo || "—"} · SN ${d.numero_de_serie || "—"} · ${d.horas_vuelo_acum != null ? d.horas_vuelo_acum + "h" : "?"} acum`,
  ...
});
```

El backend `getAllDrones` debe estar devolviendo la columna `imagen`. Verificar en `drones.model.js`.

### Fix propuesto
- Si `d.imagen` existe, agregar `<img class="picker__thumb" src="/uploads/${d.imagen}">` al item
- Si no, mostrar el SVG de dron chiquito
- Tamaño: 40x40px en la izquierda del texto

**Esfuerzo**: 30min (CSS + ajuste en `renderPickerItem`)

---

## Plan de ejecución recomendado

### Sprint 1 (3-4 horas): bugs críticos + UX rápida
1. **BUG-P1** Pilotos: horas + count (1h)
2. **BUG-P2** Vuelos: multi-piloto (30min)
3. **BUG-P3** Vuelos: estado como select (10min)
4. **FIX-P5** Previstos: chips reasignados (15min)
5. **FIX-P6** Dron detail: foto más chica (15min)
6. **FEAT-P9** Thumbnails en dron picker (30min)
7. **FIX-P4a** Modelos: estructura de tarjeta (30min)

→ Total: ~3.5h, **6 fixes visibles**, sin cambios de schema.

### Sprint 2 (1.5h): nice-to-have
8. **FEAT-P8 Fase 1** Botón "Usar mi ubicación" (30min)
9. **FIX-P4b** Modelos: thumbnails (1h)

### Sprint 3 (futuro): cosas grandes
10. **FEAT-P8 Fase 2** Mapa con Leaflet (2-3h)
11. **FIX-P7** Subir fotos reales (manual)

### Backlog
- Búsqueda global (Cmd+K) — A1 del roadmap original
- Export CSV — A2
- Service worker (offline) — A3

---

## Riesgos

- **P1**: Cambiar la unidad de horas es breaking change para datos existentes. Hay que migrar `horas_vuelo_acum` de minutos a horas (dividir por 60). Hacer script idempotente.
- **P2**: Multi-piloto puede romper `dron-detail.js` si en algún lado se asume 1 piloto.
- **P8**: Geolocation API requiere HTTPS (o localhost) → en dev OK, en Railway prod necesita HTTPS (ya lo tiene).

## Decisiones a tomar con el usuario

1. **P1**: ¿Horas decimales (1.5h) o volver a mostrar minutos ("90 min")?
2. **P8**: ¿Leaflet (gratis) o Google Maps (con API key)?
3. **P4b**: ¿Agregar columna `imagen` a `modelo_dron`? Implica migración + form.
4. **P2**: ¿Multi-piloto o solo "piloto + copiloto opcional" (1+1)?
