# Presentacion — Sistema VANT

> Guia para armar una presentacion de **8-10 minutos** del Sistema VANT
> (Tactical UAV Fleet Manager). Capturas ya tomadas en `./Capturas/`.
>
> **Stack narrado**: Node.js + Express 5 + MySQL + frontend vanilla JS (sin
> framework). Patron Router -> Controller -> Model. Auth JWT. Soft delete.
> 7 entidades de dominio + wizard de 4 pasos para vuelo + mapa Leaflet.

---

## Estructura sugerida: 12 diapositivas (~9 minutos)

| # | Tiempo | Titulo | Captura | Que decir |
|---|---|---|---|---|
| 1 | 0:30 | **Portada** | (ninguna) | "Sistema VANT - Gestion de flota de drones" + tu nombre + fecha |
| 2 | 1:00 | **El problema** | (ninguna) | Pain points: planillas Excel, fotos por mail, sin trazabilidad. Stats: una empresa de drones tiene N drones, M pilotos, ~K vuelos/mes. |
| 3 | 1:00 | **Login y stack** | `01-login.png` | "Esto es lo que ve el operador al entrar". Stack: backend Node, DB MySQL hosteada en Railway, frontend mobile-first. |
| 4 | 1:00 | **Vista general (dashboard)** | `02-dashboard.png` | KPIs principales: 18 drones, 5 en mantenimiento, 22 baterias, 34 vuelos. Vista de un pantallazo. |
| 5 | 1:30 | **Modulo Drones** | `03-drones-list.png` + `04-dron-detail.png` | Listado con thumbnails y filtros por estado. Click en un dron: foto, stats, vuelos recientes, mantenimientos. |
| 6 | 1:00 | **Modulo Pilotos** | `06-pilotos-list.png` + `07-piloto-detail.png` | Listado con avatares (caricaturas). Detail: foto del piloto, CMA, drones asignados, ultimos vuelos. |
| 7 | 1:30 | **Modulo Vuelos (wizard)** | `09-vuelos-list.png` + `11-vuelo-wizard-step1.png` + `12-vuelo-wizard-form.png` + `10-vuelo-detail.png` | "Lo mas complejo: registrar un vuelo en 4 pasos". Step 1: drones en servicio. Step 2: baterias con ciclos < 3000. Step 3: piloto + copiloto + mapa Leaflet. Step 4: resumen transaccional. |
| 8 | 0:45 | **Modulo Mantenimientos** | `13-mantenimientos-list.png` + `14-mantenimiento-detail.png` | Log de intervenciones por dron con costo, horas y tipo. El taller (TALLER en el nav). |
| 9 | 0:45 | **Modulo Previstos (Agenda)** | `15-previstos-list.png` + `16-previsto-detail.png` | Misiones planificadas. Estados: Planificado / En Curso / Finalizado / Pospuesto / Cancelado. |
| 10 | 0:45 | **Feature estrella: busqueda global** | `18-buscador-cmd-k.png` | "Cmd+K abre esto". 7 entidades indexadas, resultados agrupados, cache 30s, keyboard nav. |
| 11 | 0:30 | **Robustez** | (ninguna, se puede mostrar live) | D2 skeletons (carga sin flash), D3 error boundary (try/catch en router), B1 pool keepAlive, B2 TZ UTC. |
| 12 | 0:30 | **Cierre** | (ninguna) | URL publica: <agregar despues del deploy>. Stack final. Preguntas. |

**Total**: ~9:30 + 0:30 de preguntas = **10 min exactos**.

---

## Tips de diseno

- **Plantilla**: dark theme, monospace (JetBrains Mono), acentos en verde olivo `#8a8a5c` — la UI ya esta armada asi, reutilizar.
- **Tipografia minima**: titulo 48px, subtitulo 24px, body 18px (para proyector).
- **Una idea por diapo**: no apilar KPIs, una frase por bullet.
- **Captura full-screen**: cada screenshot cubre todo el viewport, ideal para llenar la diapo.
- **Animaciones**: fade-in de 200ms entre diapos (nada mas, el contenido ya es denso).
- **Pizarra en vivo** (opcional, sustituye diapo 11): forzar un error abriendo la consola del browser, mostrar el error boundary, luego navegar normal. Es muy impactante.

---

## Capturas disponibles (18)

Todas en `./Capturas/`:

| Archivo | Para diapo |
|---|---|
| `01-login.png` | 3 (Login y stack) |
| `02-dashboard.png` | 4 (Vista general) |
| `03-drones-list.png` | 5 (Drones) |
| `04-dron-detail.png` | 5 (Drones) |
| `05-dron-form.png` | (opcional, mostrar como bonus) |
| `06-pilotos-list.png` | 6 (Pilotos) |
| `07-piloto-detail.png` | 6 (Pilotos) |
| `08-piloto-form.png` | (opcional, mostrar el dropzone) |
| `09-vuelos-list.png` | 7 (Vuelos wizard) |
| `10-vuelo-detail.png` | 7 (Vuelos wizard) |
| `11-vuelo-wizard-step1.png` | 7 (Vuelos wizard) |
| `12-vuelo-wizard-form.png` | 7 (Vuelos wizard) |
| `13-mantenimientos-list.png` | 8 (Mantenimientos) |
| `14-mantenimiento-detail.png` | 8 (Mantenimientos) |
| `15-previstos-list.png` | 9 (Previstos) |
| `16-previsto-detail.png` | 9 (Previstos) |
| `17-modelos-list.png` | (opcional, mencionar como catalogo liviano) |
| `18-buscador-cmd-k.png` | 10 (Feature estrella) |

---

## Outline narrativo por minuto

```
[0:00 - 0:30] PORTADA
  "Hoy les presento Sistema VANT, una herramienta que construi
   para gestionar la flota de drones de una empresa. Mide, registra,
   audita. Veamos."

[0:30 - 1:30] PROBLEMA + LOGIN
  "El problema que resuelve: una empresa de 20 drones y 15 pilotos
   registra ~300 vuelos por mes. Hacerlo en planillas es caos.
   El sistema centraliza todo, con trazabilidad, fotos y mapas.
   Esto es el login - JWT, roles, 1h de sesion."

[1:30 - 2:30] DASHBOARD
  "Vista general: 18 drones en flota, 5 marcados en mantenimiento
   que requieren atencion, 22 baterias con 19 ciclos altos, 34
   vuelos registrados este mes. Toda la operacion en una pantalla."

[2:30 - 4:00] DRONES
  "Modulo de drones: cada uno con matricula, modelo, estado,
   horas acumuladas. Click en un dron y vemos foto, ultimos
   vuelos, mantenimientos. Los filtros por estado son
   instantaneos - el backend lo resuelve en MySQL con un index."

[4:00 - 5:00] PILOTOS
  "Pilotos con certificacion CMA, vencimiento, drones asignados.
   El avatar es una caricatura seedeada, pero el admin la puede
   reemplazar desde el form de edicion."

[5:00 - 6:30] VUELOS (la pieza central)
  "Lo mas complejo: registrar un vuelo. Es un wizard de 4 pasos.
   Primero elegis los drones en servicio. Segundo, las baterias
   con menos de 3000 ciclos. Tercero, el piloto - y si queres,
   un copiloto - mas las coordenadas en un mapa de OpenStreetMap
   con drag pin y geolocation nativa. Cuarto, un resumen antes de
   confirmar. Todo en una sola transaccion SQL: si falla cualquier
   paso, no queda nada inconsistente."

[6:30 - 7:15] MANTENIMIENTOS
  "Taller: cada intervencion queda registrada con fecha, tipo
   (preventivo, correctivo, calibracion), costo, horas al
   momento. El dron queda en 'En Mantenimiento' hasta que se
   resuelve."

[7:15 - 8:00] PREVISTOS
  "Agenda de misiones planificadas. Esto es lo que viene, no
   lo que ya paso. Tiene 5 estados. Cuando una mision se hace
   realidad, se convierte en un Vuelo real."

[8:00 - 8:45] BUSQUEDA GLOBAL
  "Feature estrella: el shortcut Cmd+K (o /) abre esto. Una
   busqueda unificada contra 7 entidades en paralelo, con cache
   de 30 segundos. Tipes 'VNT' y aparece cualquier dron que
   matchee, ademas de los mantenimientos que lo mencionan.
   Tipes 'Mateo' y va al piloto directo. Sin navegar por
   listas."

[8:45 - 9:15] ROBUSTEZ
  "Tres cosas que son invisibles pero importantes: la UI muestra
   skeletons mientras carga, asi no hay 'flash' de contenido
   vacio. Si una vista rompe, un error boundary global captura
   la excepcion y muestra un banner con volver al dashboard.
   Y el pool de MySQL usa keepAlive para no perder conexiones
   en operaciones largas."

[9:15 - 9:45] CIERRE
  "El repo esta en github. El deploy es Railway. La app es
   mobile-first, asi que el operador puede usarla desde el
   celular en la pista. Preguntas?"
```

---

## Como armar la presentacion

### Opcion A: Google Slides / PowerPoint
1. Crear presentacion en blanco, dark theme
2. Importar las 18 capturas como imagenes (insertar > imagen > desde archivo)
3. Copiar el outline narrativo arriba en las notas del orador
4. Practicar 2 veces midiendo el tiempo (objetivo: 8-10 min)

### Opcion B: Remotion (mas impactante)
1. Usar el proyecto Remotion que ya esta creado en `/tmp/opencode/vant-demo/`
2. Reusar el approach de "slide + chip inferior + fade-in" que ya hicimos
3. Exportar a MP4 y proyectar el video

### Opcion C: OBS + zoom
1. Grabar la pantalla navegando la app con OBS
2. Cortar los segmentos en CapCut / DaVinci
3. Agregar la voz en off despues
4. Es MUCHO mas impactante que slides estaticas pero lleva +1h de edicion

**Recomendacion**: Opcion A si tenes poco tiempo, Opcion C si queres impresionar.

---

## Capturas no usadas (reutilizables)

- `08-piloto-form.png` muestra el **dropzone** con preview de la caricatura,
  util para hablar del upload de fotos en el form.
- `05-dron-form.png` muestra el form de alta, util para hablar del
  flujo de creacion.
- `17-modelos-list.png` el modulo mas liviano, util como bonus al final.

Si te sobran 30 segundos en la presentacion, podes meterlos al final
como "bonus tracks" visuales.
