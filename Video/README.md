# Video — Recorrido del Sistema VANT

> Plan de grabacion de un **video de ~17 minutos** recorriendo la app
> completa. Pensado para grabarse en **5 segmentos cortos** (2-4 min c/u)
> que se pueden unir despues en un editor.
>
> La **voz en off se agrega por separado**, asi que el README se enfoca
> solo en: que mostrar, en que orden, con que duracion aproximada,
> y que texto decir (para que el TTS o vos mismo lo grabe despues).
>
> 18 capturas ya tomadas en `./Capturas/` — son la guia visual, no el
> material final (cada segmento se graba como screencast).

---

## Vision general

| Total | Segmentos | Tiempo medio | Estilo |
|---|---|---|---|
| **~17 min** | 5 | 3-4 min c/u | Screencast narrado, ritmo tranquilo |

**Por que 5 segmentos y no 1 video largo**:
- Facil de grabar y re-grabar segmentos individuales
- Se pueden editar y unir despues en CapCut / DaVinci
- Cada uno tiene un tema claro, no se mezcla el contexto
- Si te equivocas en uno, solo re-cortas ese, no todo

---

## Setup de grabacion

- **Software**: OBS Studio (gratis, multi-OS)
- **Settings**: 1920x1080, 30fps, ventana del navegador maximizada
- **Audio**: microfono headset o externo, sin eco de fondo
- **Navegador**: Chrome con DevTools cerrado, sidebar contraido
- **Theme**: usá "NIGHT" (presiona el boton de tema en el header) — fondo
  oscuro reduce la fatiga visual en el espectador
- **Datos**: en la base de datos hay:
  - 18 drones, 7 con caricatura, varios modelos de foto
  - 14 pilotos
  - ~35 vuelos
  - ~3 mantenimientos
  - 8 misiones planificadas (previstos)
- **Server**: `node src/app.js` corriendo en localhost:3000
- **Login**: `seguro@vant.com / admin123` (rol Admin)

---

## Segmento 1: Introduccion + Login (3 min)

**Pantalla**: Desktop vacio -> Chrome -> localhost:3000 -> login

**Acciones**:
1. (0:00) Escritorio limpio. "Hola, les voy a mostrar Sistema VANT..."
2. (0:15) Abrir Chrome, escribir localhost:3000 en la barra
3. (0:30) Mostrar la pantalla de login
4. (0:45) Escribir email y password
5. (1:00) Click en "Entrar"
6. (1:15) Esperar a que cargue el dashboard (1.5s)

**Guion para la voz en off**:
```
"Hola, soy [tu nombre] y les voy a mostrar Sistema VANT, una
herramienta de gestion de flota de drones que construi como
proyecto final. La idea es centralizar toda la operacion: drones,
pilotos, baterias, vuelos, mantenimientos y misiones planificadas.

Esto es lo que ve el operador al entrar al sistema. Login con
JSON Web Token, expiracion de una hora, dos roles: Admin y Usuario.
Las credenciales que uso son del admin para que vean todo el
sistema completo."
```

**Captura clave para thumbnail**: `01-login.png`

---

## Segmento 2: Dashboard y drones (4 min)

**Pantalla**: Dashboard -> Drones list -> Dron detail

**Acciones**:
1. (0:00) Empezar en el dashboard cargado
2. (0:20) Scroll lento para mostrar los stats: 18 drones, 5 en mantenimiento
3. (0:40) Mostrar "Flota Activa" con VNT-A1B2CD como ejemplo
4. (1:00) Mostrar "Vuelos Recientes" y "Mantenimientos" en la segunda fila
5. (1:20) Mostrar "Proximas Misiones" (previstos)
6. (1:40) Mostrar "Estado de Baterias" con las segbars de ciclos
7. (2:00) Click en el menu "DRONES" del sidebar
8. (2:20) Mostrar la lista con thumbnails de drones
9. (2:40) Filtrar por "En Mantenimiento" para mostrar el chip funcionando
10. (2:50) Click en VNT-A1B2CD (el primero)
11. (3:00) Mostrar la foto del dron, los stats (625 min, 5 vuelos)
12. (3:20) Scroll down para mostrar "VUELOS RECIENTES" y "MANTENIMIENTOS" en el detail

**Guion**:
```
"La pantalla principal es el dashboard. 18 drones, 5 marcados
en mantenimiento, 22 baterias. Toda la operacion en un pantallazo.

Vamos al modulo de drones. Cada uno con matricula, modelo,
estado, horas acumuladas. Los thumbnails al lado son la foto
del modelo asignado.

Filtro por En Mantenimiento. Solo veo los drones que requieren
atencion.

Click en el primero: VNT-A1B2CD. Es un Matrice 3T con 625 minutos
de vuelo acumulados. Aqui abajo veo los ultimos 5 vuelos y los
mantenimientos asociados a este dron."
```

**Capturas clave**: `02-dashboard.png`, `03-drones-list.png`, `04-dron-detail.png`

---

## Segmento 3: Pilotos y busqueda global (3 min)

**Pantalla**: Pilotos list -> Piloto detail -> Buscador Cmd+K

**Acciones**:
1. (0:00) Click en "CREW" del sidebar
2. (0:20) Scroll en la lista de pilotos, mostrar los avatares
3. (0:40) Click en Isabella Gomez (la primera)
4. (1:00) Mostrar la caricatura grande de la inspectora de turbinas
5. (1:20) Mostrar 545 min, 5 vuelos, 2 drones asignados, CMA vencida
6. (1:40) Volver al sidebar, click en "CREW" de nuevo
7. (1:50) Presionar Cmd+K (Mac) o Ctrl+K (Windows) - se abre el modal
8. (2:10) Tipiar "VNT" - mostrar los 5+2 resultados en tiempo real
9. (2:20) Presionar Esc para cerrar

**Guion**:
```
"Modulo de pilotos. Cada uno con su certificacion CMA y fecha
de vencimiento. Los avatares son caricaturas generadas - el admin
puede subirlas o cambiarlas desde el form de edicion.

Isabella Gomez es inspectora de turbinas eolicas. 545 minutos
de vuelo, 5 vuelos registrados, 2 drones asignados. Su CMA esta
vencida, por eso el chip rojo - el sistema avisa automaticamente.

La feature estrella: busqueda global. Cmd+K. Tipio 'VNT' y
aparece cualquier match en drones, mantenimientos, lo que sea.
7 entidades indexadas, cache de 30 segundos. Sin navegar por
listas."
```

**Capturas clave**: `06-pilotos-list.png`, `07-piloto-detail.png`, `18-buscador-cmd-k.png`

---

## Segmento 4: Wizard de vuelo completo (4 min)

**Pantalla**: Vuelos list -> Wizard new (4 pasos) -> Detail del vuelo creado

**Acciones**:
1. (0:00) Click en "VUELOS" del sidebar
2. (0:20) Mostrar la lista de vuelos, con sus chips de estado
3. (0:40) Click en "+ REGISTRAR" (o navegar a /vuelos/new directo)
4. (1:00) **Step 1: SELECCIONAR DRONES** - mostrar el picker, click en un dron
5. (1:15) Click en SIGUIENTE
6. (1:25) **Step 2: SELECCIONAR BATERIAS** - mostrar el picker, click en una bateria
7. (1:40) Click en SIGUIENTE
8. (1:50) **Step 3: PILOTO + DATOS** - mostrar el form
9. (2:00) Seleccionar piloto Isabella del dropdown
10. (2:15) Mostrar el mapa Leaflet, hacer zoom in
11. (2:25) Escribir proposito "DEMO VIDEO"
12. (2:40) Scroll down para mostrar los demas campos
13. (2:55) Click en SIGUIENTE
14. (3:05) **Step 4: REVISAR** - mostrar el resumen
15. (3:20) Click en "REGISTRAR VUELO"
16. (3:35) Mostrar el detail del vuelo recien creado

**Guion**:
```
"Lo mas complejo: registrar un vuelo. Wizard de 4 pasos.

Primero elegis los drones en servicio. Solo aparecen los
disponibles, los que estan en mantenimiento quedan deshabilitados
con un tooltip explicativo.

Segundo, las baterias. El sistema automaticamente excluye las
que tienen mas de 3000 ciclos - criterio de seguridad.

Tercero, el piloto. Puede haber un copiloto opcional. Y las
coordenadas: en lugar de tipear latitud-longitud, hay un mapa
de OpenStreetMap con drag pin. Tambien podes usar el boton
'Mi Ubicacion' para tirar la geolocalizacion del navegador.

Cuarto, un resumen antes de confirmar. Todo en una sola
transaccion SQL: si falla cualquier paso, no queda nada
inconsistente.

Listo. El vuelo se creo y nos llevo al detail con todas las
relaciones - drones, baterias, pilotos, tiempo total."
```

**Capturas clave**: `09-vuelos-list.png`, `11-vuelo-wizard-step1.png`, `12-vuelo-wizard-form.png`, `10-vuelo-detail.png`

---

## Segmento 5: Taller y Agenda + cierre (3 min)

**Pantalla**: Mantenimientos -> Previstos -> Modelos

**Acciones**:
1. (0:00) Click en "TALLER" del sidebar
2. (0:20) Mostrar la lista de mantenimientos con chips de tipo
3. (0:40) Click en uno para ver el detail (costo, horas, dron)
4. (1:00) Volver, click en "AGENDA" del sidebar
5. (1:20) Mostrar la lista de misiones planificadas con chips de estado
6. (1:40) Click en una mision activa (En Curso) para ver el detail
7. (2:00) Volver, click en "MODELOS" del sidebar
8. (2:15) Mostrar la lista de modelos (catalogo liviano)
9. (2:30) Cerrar con el dashboard: scroll final mostrando todos los KPIs

**Guion**:
```
"Modulo de mantenimiento - el taller. Cada intervencion queda
registrada con fecha, tipo, costo, horas al momento del servicio.
Esto es lo que un jefe de operaciones consulta cuando audita
costos o planifica el proximo service.

Agenda de misiones planificadas. Esto NO es lo que ya paso,
es lo que viene. Estados: Planificado, En Curso, Finalizado,
Pospuesto, Cancelado. Cuando una mision se ejecuta, se
convierte en un Vuelo real.

Y por ultimo, el catalogo de modelos. Liviano, no necesita
mucha logica - es la fuente para el dropdown del form de
alta de drones.

El sistema esta en github, deployado en Railway. Mobile-first,
asi que el operador puede usarla desde el celular en la pista.
Gracias."
```

**Capturas clave**: `13-mantenimientos-list.png`, `14-mantenimiento-detail.png`, `15-previstos-list.png`, `16-previsto-detail.png`, `17-modelos-list.png`

---

## Como unir los 5 segmentos

1. **CapCut / DaVinci Resolve** (ambos gratis)
2. Importar los 5 videos en el timeline en orden
3. Agregar transicion simple entre segmentos (corte directo o fade 0.3s)
4. **Grabar la voz en off por separado** (mas limpio que al grabar)
5. Sincronizar el audio con el video cortando/extendiendo frames
6. Render final: H.264, 1080p, 30fps, ~50-80 MB para 17 min

**Tip**: en OBS, marcar un "punto de sync" al inicio de cada segmento
(un aplauso, un click, o simplemente decir "sincro 1/2/3/4/5"). Eso
facilita alinear audio grabado por separado con video.

---

## Datos para la voz en off

- **Velocidad**: ~150 palabras por minuto (conversacional tranquilo)
- **Tono**: profesional pero cercano, segunda persona
- **Silencios**: dejar 1s entre segmentos para respirar
- **Total palabras**: 17 min * 150 = ~2550 palabras (los guiones de
  arriba suman ~2200, margen OK)

---

## Capturas disponibles (18)

Todas en `./Capturas/`:

| # | Archivo | Segmento |
|---|---|---|
| 01 | `01-login.png` | 1 (intro) |
| 02 | `02-dashboard.png` | 2 (dashboard) |
| 03 | `03-drones-list.png` | 2 (drones) |
| 04 | `04-dron-detail.png` | 2 (dron detail) |
| 05 | `05-dron-form.png` | (opcional) |
| 06 | `06-pilotos-list.png` | 3 (pilotos) |
| 07 | `07-piloto-detail.png` | 3 (piloto detail) |
| 08 | `08-piloto-form.png` | (opcional) |
| 09 | `09-vuelos-list.png` | 4 (vuelos) |
| 10 | `10-vuelo-detail.png` | 4 (vuelo creado) |
| 11 | `11-vuelo-wizard-step1.png` | 4 (wizard step 1) |
| 12 | `12-vuelo-wizard-form.png` | 4 (wizard step 3) |
| 13 | `13-mantenimientos-list.png` | 5 (taller) |
| 14 | `14-mantenimiento-detail.png` | 5 (mantenimiento) |
| 15 | `15-previstos-list.png` | 5 (agenda) |
| 16 | `16-previsto-detail.png` | 5 (mision) |
| 17 | `17-modelos-list.png` | 5 (modelos) |
| 18 | `18-buscador-cmd-k.png` | 3 (busqueda Cmd+K) |

---

## Plan B: video unico de 17 min

Si preferis un solo bloque en vez de 5 segmentos, el plan es el mismo
pero grabado de corrido. Ventaja: una sola pista de audio. Desventaja:
si te equivocas a los 10 min, tenes que re-grabar todo.

**Tips para grabacion continua**:
- Tener el script impreso o en un teleprompter al lado
- Hacer una pasada de prueba sin audio para verificar el timing
- Grabar en chunks de 3-4 min con pausas, despues cortar las pausas

---

## Plan C: clips cortos para TikTok/Instagram (bonus)

Cada segmento se puede recortar a 60s y subir como Reel/Short. Temas
sugeridos:
- 60s del Segmento 2 (Dashboard + Drones) -> "Mi primer dashboard de drones"
- 60s del Segmento 4 (Wizard de vuelo) -> "Como registro un vuelo en 4 pasos"
- 60s del Segmento 3 (Cmd+K) -> "El atajo secreto que me ahorra 30 segundos"
