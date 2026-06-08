# Plan de Implementación — Módulo de Vuelos (Etapa 2)

> Documento vivo. Se actualiza a medida que se confirmen los puntos abiertos.
> Última actualización: 2026-06-03

## Contexto

El proyecto **Sistema VANT** (Node.js + Express 5 + MySQL) tiene finalizada la **Etapa 1** (módulo `previstos`) y entra en la **Etapa 2: El Núcleo Operativo**. El objetivo es construir el módulo de **Vuelos Reales** y las **tablas intermedias** (`vuelo_drones`, `vuelo_baterias`, `vuelo_pilotos`), consolidando horas operativas y automatizando la sumatoria de ciclos de carga en las baterías.

---

## 0. Esquema de la BD — ✅ CONFIRMADO contra Railway (2026-06-08)

El MCP de Railway está conectado y la BD fue inspeccionada con `src/scripts/inspect-vuelo-schema.js`. Migración aplicada con `src/scripts/migrate-vuelo.js` (7 statements, idempotente).

**Esquema real de `vuelo` (post-migración)**:
```sql
id_vuelo        int AUTO_INCREMENT PK
fecha           date NOT NULL
coordenadas     varchar(100) NOT NULL
tiempo_de_vuelo time NOT NULL               -- HH:MM:SS (reemplaza a duracion_min del plan original)
proposito       varchar(45) NOT NULL
clima           enum(Despejado, Parcialmente Nublado, Nublado, Lluvia Ligera, Lluvia Fuerte, Viento Fuerte, Niebla) NOT NULL
observaciones   text NULL                   -- AGREGADO en migración
previsto_id     int NULL                    -- AGREGADO en migración
  KEY fk_vuelo_previsto (previsto_id)
  FOREIGN KEY (previsto_id) REFERENCES previstos(id_previstos)
    ON DELETE SET NULL ON UPDATE CASCADE
estado          varchar(30) NOT NULL DEFAULT 'Realizado'  -- AGREGADO
created_at      timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP  -- AGREGADO
deleted_at      timestamp(6) NULL            -- soft delete
```

**Tablas pivote (ya existían, vacías)**:
```sql
vuelo_drones    (vuelo_id int, dron_id int)
vuelo_baterias  (vuelo_id int, bateria_id int)
vuelo_pilotos   (piloto_id int, vuelo_id int)  -- orden de columnas invertido, no afecta
```

**Columnas de acumuladores (AGREGADAS en migración)**:
```sql
ALTER TABLE dron    ADD COLUMN horas_vuelo_acum DECIMAL(8,2) NOT NULL DEFAULT 0;
ALTER TABLE piloto  ADD COLUMN horas_vuelo_acum DECIMAL(8,2) NOT NULL DEFAULT 0;
-- bateria.ciclos_de_carga ya existía
```

> **Decisión de diseño**: el `tiempo_de_vuelo` es de tipo `time` (HH:MM:SS), no `int` en minutos. La conversión a minutos para acumular en `horas_vuelo_acum` se hace en el controller con `formatTiempoMinutos()` antes del `UPDATE`.

---

## 1. Estructura de archivos

Siguiendo el patrón de `previstos`, se crearán 3 archivos nuevos y se modificará 1:

```
src/
├── models/
│   └── vuelo.model.js          ← NUEVO
├── controllers/
│   └── vuelo.controller.js     ← NUEVO
├── routes/
│   └── vuelo.routes.js         ← NUEVO
└── app.js                      ← MODIFICADO (1 import + 1 app.use)
```

---

## 2. `src/models/vuelo.model.js` — Data Access Layer

Funciones a exportar (espejo de `previstos.model.js`):

| Función | Responsabilidad |
|---|---|
| `getAllVuelos()` | `SELECT * FROM vuelo WHERE deleted_at IS NULL` + agregados con `GROUP_CONCAT` para mostrar IDs asociados |
| `getVueloById(id)` | `SELECT * FROM vuelo WHERE id_vuelo = ? AND deleted_at IS NULL` + 3 `SELECT` separados para los pivotes |
| `crearVuelo(data, connection)` | `INSERT INTO vuelo (...)` — recibe la conexión transaccional del controller |
| `asociarDrones(id_vuelo, ids[])` | Bulk insert en `vuelo_drones` |
| `asociarBaterias(id_vuelo, ids[])` | Bulk insert en `vuelo_baterias` |
| `asociarPilotos(id_vuelo, ids[])` | Bulk insert en `vuelo_pilotos` |
| `incrementarCiclosBateria(id_bateria, conn)` | `UPDATE bateria SET ciclos_de_carga = ciclos_de_carga + 1` |
| `sumarHorasDron(id_dron, minutos, conn)` | `UPDATE dron SET horas_vuelo_acum = horas_vuelo_acum + ?` |
| `sumarHorasPiloto(id_piloto, minutos, conn)` | `UPDATE piloto SET horas_vuelo_acum = horas_vuelo_acum + ?` |
| `modificarVuelo(id, data, conn)` | `UPDATE vuelo SET ...` |
| `reemplazarPivotes(id_vuelo, drones, baterias, pilotos, conn)` | `DELETE FROM vuelo_* WHERE id_vuelo = ?` + reinsert (PUT limpio) |
| `deleteVuelo(id)` | Soft delete: `UPDATE vuelo SET deleted_at = NOW() WHERE id_vuelo = ? AND deleted_at IS NULL` |

> El modelo **NO** abre transacciones. Las funciones que mutan reciben `connection` como parámetro (lo gestiona el controller), respetando la separación de capas.

---

## 3. `src/controllers/vuelo.controller.js` — Lógica de Negocio

**6 funciones** (siguiendo el orden de `previstos.controller.js`):

### `listarVuelos` (GET)
Llama a `model.getAllVuelos()`. Devuelve JSON. Try/catch → 500.

### `getVueloById` (GET /:id)
404 si no existe. Devuelve el vuelo + arrays `drones`, `baterias`, `pilotos` con info básica (matrícula, nro_serie, etc.) vía JOIN.

### `crearVuelo` (POST) — **el más importante**

Payload esperado:
```json
{
  "fecha": "2026-06-15",                        // YYYY-MM-DD (date, no datetime)
  "coordenadas": "-34.6,-58.4",                 // varchar(100)
  "tiempo_de_vuelo": "00:25:00",                // HH:MM:SS (time)
  "proposito": "Inspección",                    // varchar(45)
  "clima": "Despejado",                         // enum validado en servidor
  "observaciones": "Vuelo de inspección",       // text, opcional
  "previsto_id": 3,                             // int, opcional (FK a previstos)
  "estado": "Realizado",                        // varchar(30), default 'Realizado'
  "drones":    [1, 2],                          // mín 1
  "baterias":  [5, 6],                          // mín 1
  "pilotos":   [3]                              // mín 1
}
```

Flujo con **transacción** (siguiendo el patrón de `src/controllers/mantenimiento.controller.js:30`):

```
1. Validar: fecha, tiempo_de_vuelo, clima (contra el enum), drones[], baterias[], pilotos[] (mín. 1 de c/u)
2. Convertir tiempo_de_vuelo (HH:MM:SS) → minutos decimales con helper formatTiempoMinutos()
3. pool.getConnection() → conn
4. conn.beginTransaction()
5. INSERT vuelo → obtener id_vuelo
6. INSERT bulk en vuelo_drones, vuelo_baterias, vuelo_pilotos
7. Por cada bateria: UPDATE bateria SET ciclos_de_carga = ciclos_de_carga + 1
8. Por cada dron:    UPDATE dron    SET horas_vuelo_acum = horas_vuelo_acum + ?
9. Por cada piloto:  UPDATE piloto  SET horas_vuelo_acum = horas_vuelo_acum + ?
10. conn.commit() → 201 con { id_vuelo, ...data }
11. catch → conn.rollback() → 500
12. conn.release() siempre (finally)
```

### `actualizarVuelo` (PUT) — Admin
Misma transacción: update vuelo → borrar pivotes → reinsertar pivotes → **NO** re-sumar horas/ciclos.

### `borrarVuelo` (DELETE) — Admin
Soft delete. **NO** resta horas ni ciclos (decisión de diseño — ver §6).

---

## 4. `src/routes/vuelo.routes.js`

```js
import { Router } from 'express';
import { listarVuelos, crearVuelo, getVueloById, borrarVuelo, actualizarVuelo } from '../controllers/vuelo.controller.js';
import { verificarToken, verificarAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

router.get   ('/vuelos',      verificarToken,                  listarVuelos);
router.get   ('/vuelos/:id',  verificarToken,                  getVueloById);
router.post  ('/vuelos',      verificarToken, verificarAdmin,  crearVuelo);
router.put   ('/vuelos/:id',  verificarToken, verificarAdmin,  actualizarVuelo);
router.delete('/vuelos/:id',  verificarToken, verificarAdmin,  borrarVuelo);

export default router;
```

---

## 5. `src/app.js` — Montaje

Agregar 2 líneas:

```js
import vuelosRouter from '../src/routes/vuelo.routes.js';
app.use("/api", vuelosRouter);
```

---

## 6. Decisiones de diseño (pendientes de confirmación)

| # | Decisión | Propuesta | Impacto |
|---|---|---|---|
| 1 | **PUT**: ¿revierte y vuelve a sumar horas/ciclos, o solo corrige metadata? | No tocar acumuladores. Si hay error de tiempo, se borra y se crea de nuevo. | Evita duplicación de horas |
| 2 | **DELETE**: ¿querés que reste los acumuladores al soft-delear? | NO, mantener histórico | Preserva auditoría |
| 3 | **GET listado**: ¿devuelvo solo IDs de asociados, o info desnormalizada? | IDs en list, info completa (matrícula, nombre) en `getById` | Performance vs. usabilidad |

---

## 7. Verificación (smoke test con curl)

```bash
# 1. Listar (con token)
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/vuelos

# 2. Crear vuelo completo
curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
  -d '{"fecha":"2026-06-15T10:30:00Z","duracion_min":25,"drones":[1],"baterias":[5],"pilotos":[3]}' \
  http://localhost:3000/api/vuelos

# 3. Verificar que la batería 5 ahora tiene ciclos_de_carga +1
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/baterias

# 4. Verificar que el dron 1 y el piloto 3 tienen +25 min en horas_vuelo_acum
```

---

## 8. Orden de ejecución

| Paso | Acción | Bloqueante previo | Estado |
|---|---|---|---|
| 1 | Confirmar esquema y migrar BD | — | ✅ **Hecho** (2026-06-08) |
| 2 | Crear `vuelo.model.js` | Paso 1 | ⏳ Pendiente |
| 3 | Crear `vuelo.controller.js` con transacción | Paso 2 | ⏳ Pendiente |
| 4 | Crear `vuelo.routes.js` | Paso 3 | ⏳ Pendiente |
| 5 | Montar en `app.js` | Paso 4 | ⏳ Pendiente |
| 6 | Smoke test con curl | Paso 5 | ⏳ Pendiente |

> **Nota**: el script de migración `src/scripts/migrate-vuelo.js` queda en el repo para futuras corridas (es idempotente). `src/scripts/inspect-vuelo-schema.js` queda como utilidad de diagnóstico.

---

## 9. Convenciones respetadas (del código existente)

- **Stack**: ES modules (`"type": "module"`)
- **Capas**: Router → Controller → Model
- **Auth**: `verificarToken` para GET/POST, `verificarToken` + `verificarAdmin` para PUT/DELETE
- **Fechas**: `formatFecha` del helper para compatibilidad ISO ↔ MySQL `datetime`
- **Errores**: try/catch centralizado, `console.error` para Railway logs, mensajes en español
- **Soft delete**: misma estrategia que `previstos` con `UPDATE ... SET deleted_at = NOW()`
- **Pool**: importado desde `src/config/database.js`
- **Sin comentarios en código** (convención de `AGENTS.md`)
