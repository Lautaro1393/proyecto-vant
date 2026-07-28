# Remotion — Videos cortos del Sistema VANT

> Videos generados con [Remotion](https://www.remotion.dev/) usando las
> capturas de `./../Capturas/` como backgrounds y textos explicativos
> animados. Pensados para usarse como contenido para Instagram Reels,
> TikTok, YouTube Shorts, o material de marketing en la web.

---

## Paquete: 9 videos, ~70 segundos totales

| # | Video | Duracion | Que muestra | Transicion |
|---|---|---|---|---|
| 1 | `Intro.mp4` | 5s | Logo VANT + tagline + marco de esquinas | Zoom-in + cuadricula |
| 2 | `DashboardTour.mp4` | 6s | Dashboard con KPIs (18 drones, 22 baterias, 34 vuelos) | zoomIn |
| 3 | `DronesTour.mp4` | 8s | Listado de drones → crossfade → detail con foto | zoomIn → zoomOut |
| 4 | `PilotosTour.mp4` | 8s | Listado de pilotos → crossfade → detail con caricatura | blurIn → panRight |
| 5 | `VuelosWizardTour.mp4` | 12s | 3 capturas del wizard: step 1, step 3, detail | zoomIn → kenburns → panLeft |
| 6 | `TallerTour.mp4` | 6s | Listado mantenimientos → detail | blurIn → zoomIn |
| 7 | `AgendaTour.mp4` | 6s | Listado previstos → detail | panLeft → panRight |
| 8 | `BuscadorFeature.mp4` | 6s | Modal de busqueda Cmd+K abierto, 4 bullets explicativos | kenburns |
| 9 | `Outro.mp4` | 4s | Logo + stack final + URL del repo | Fade-in + cuadricula |

**Total**: ~63 segundos de video unico. Si los uni con ffmpeg o un editor,
dan un video de ~1 minuto que recorre la app entera.

---

## Codigo fuente

El proyecto Remotion esta en `/tmp/opencode/vant-demo/vant-demo/`
(NO commiteado al repo de VANT por peso; es local).

Archivos clave:
- `src/VantVideos.tsx` — componente `VideoShell` reutilizable + 9 composiciones
- `src/Root.tsx` — registra las 9 composiciones en Remotion
- `src/index.css` — paleta de colores identica a la app (VANT dark olive)
- `public/*.png` — las 18 capturas de la app

### Componente VideoShell

Cada shot usa `VideoShell` con estas props:
```ts
<VideoShell
  image="04-dron-detail.png"     // screenshot de fondo
  title="DETALLE DEL DRON"      // titulo principal
  subtitle="Foto + stats..."    // subtitulo opcional
  body={["bullet 1", "..."]}    // 1-4 bullets abajo
  chip="MOD-05"                 // chip de seccion
  accent="olive"                // color del chip
  variant="zoomIn"              // animacion del fondo
  index={0}                     // para stagger entre multiples shots
/>
```

### Variantes de fondo disponibles

| variant | efecto |
|---|---|
| `zoomIn` | Empieza zoom 1.15, cierra a 1.0 (efecto Ken Burns reverso) |
| `zoomOut` | Empieza 1.0, sale a 1.15 (Ken Burns) |
| `panLeft` | Slide horizontal izquierda → derecha |
| `panRight` | Slide horizontal derecha → izquierda |
| `blurIn` | Empieza con blur 12px, se enfoca a 0 |
| `kenburns` | Combina zoomIn + panLeft sutil (dramatico) |

### Animaciones de texto

- **Titulo**: slide-up de 30px + fade-in, 18 frames
- **Chip**: slide-in desde la izquierda, 15 frames
- **Bullets**: aparecen secuencialmente cada 14 frames, slide-in
  desde la derecha con fade
- **Exit**: fade-out al final del clip, 15 frames

### Composiciones multi-shot

`DronesTour`, `VuelosWizardTour`, etc. apilan 2-3 `VideoShell` con
opacidades que se interpolan para hacer crossfades suaves entre
capturas dentro del mismo clip.

---

## Como re-renderizar

```bash
cd /tmp/opencode/vant-demo/vant-demo

# Renderizar un video especifico
npx remotion render DashboardTour out/DashboardTour.mp4

# Renderizar todos
for comp in Intro DashboardTour DronesTour PilotosTour \
            VuelosWizardTour TallerTour AgendaTour \
            BuscadorFeature Outro; do
  npx remotion render $comp out/$comp.mp4
done

# Opcional: concatenar todos en un video unico de 1 min
echo "ffmpeg -f concat -safe 0 -i <(for f in out/*.mp4; do echo file $f; done) -c copy final.mp4"
```

**Settings de render** (1080x1080, 30fps, H.264):
- 1080x1080 = cuadrado, ideal para Instagram Reels, TikTok, YouTube Shorts
- Cambiar a 1920x1080 (16:9) editando `src/Root.tsx` si queres formato YouTube horizontal

---

## Como combinar con voz en off

1. Importa todos los .mp4 en CapCut / DaVinci
2. Ponerlos en el timeline en orden numerico
3. Grabar voz en off por separado (recomendado 150 wpm)
4. Sincronizar con los cortes
5. Exportar a 1080x1080 30fps con audio AAC

**Guion sugerido** (basado en el Video/README.md, ~150 palabras por clip):
```
[Intro]   "Sistema VANT: gestion de flota de drones."
[Dash]    "Vista general: 18 drones, 5 en mantenimiento."
[Drones]  "Listado con thumbnails. Click para detail."
[Pilotos] "Caricaturas + certificaciones + CMA."
[Vuelos]  "Wizard de 4 pasos con mapa Leaflet."
[Taller]  "Mantenimientos preventivos y correctivos."
[Agenda]  "Misiones planificadas con 5 estados."
[Cmd+K]   "Busqueda global con cache de 30 segundos."
[Outro]   "Stack: Node, Express, MySQL, vanilla JS. Gracias."
```

---

## Posibles variantes futuras

- **Vertical 9:16** (1080x1920) para TikTok puro
- **Horizontal 16:9** (1920x1080) para YouTube / LinkedIn
- **Cuadrado 1:1** (1080x1080) - version actual
- Agregar subtitulos quemados (captioned) para social
- Loop perfecto (el final coincide con el inicio)

---

## Como capturar mas screenshots para nuevos videos

1. Login como admin
2. Navegar a la vista que queres capturar
3. DevTools console: `document.querySelector('header.app__header')?.style.cssText += 'opacity: 0'` (oculta el header para captura limpia)
4. Screenshot
5. Guardar en `/Video/Capturas/` con naming `NN-descripcion.png`
6. Agregar la composicion a `VantVideos.tsx` y registrar en `Root.tsx`
7. `npx remotion render <NuevaComp> out/<NuevaComp>.mp4`
