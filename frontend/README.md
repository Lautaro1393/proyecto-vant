# Tactical UAV Fleet Manager — Frontend

Interfaz tactica-mobile para gestion de flota VANT. Sirve desde el mismo backend Express (puerto 3000) sin build step: HTML + CSS + JS vanilla, modulos ES nativos.

## Estructura

```
frontend/
  index.html
  styles/
    tokens.css      variables de diseno (paleta, spacing, tipografia)
    reset.css
    base.css        layout, shell, utilidades
    components.css  button, card, chip, telemetry, segbar, input...
  scripts/
    main.js         bootstrap del router
    router.js       hash router minimal
    api.js          fetch wrapper con JWT
    auth.js         login/logout
    ui.js           shell + sidebar + nav
    views/
      login.js
      dashboard.js
```

## Como correr

Levanta el backend normalmente — sirve el frontend estatico si la carpeta `frontend/` existe.

```bash
node src/app.js
# abrí http://localhost:3000
```

Login con el admin de prueba: `seguro@vant.com` / `admin123`

## Diseno

- **Mobile-first**: base 390px, breakpoints en 768px y 1280px
- **Estilo**: Tactile & Brutalist (basado en el proyecto Stitch "Tactical UAV Fleet Manager")
- **Tipografia**: JetBrains Mono (todo el sistema, nunca otra)
- **Forma**: 0px border-radius, 1px borders como costuras, chamfers de 45deg en CTAs
- **Sombras**: ninguna — profundidad por inversion tonal (capas de surface)
- **Dark por defecto**, acentos olive (primary) + azul opaco (info) + arena (sand) + alert rust/safe green

## Tokens rapidos

| Token | Valor | Uso |
|---|---|---|
| `--surface-lowest` | `#0e0e0c` | fondo base |
| `--surface` | `#20201d` | cards |
| `--primary` | `#c5caa4` | olive tactico |
| `--info` | `#6a89a7` | azul opaco (links/info) |
| `--alert` | `#b25e4d` | danger / mantenimiento |
| `--safe` | `#6d8e6f` | ok / disponible |
| `--sand` | `#c2a878` | arena (acentos desert) |
| `--border-1` | `1px solid #47473e` | costuras entre modulos |

## Temas operativos (futuro)

`data-theme="night"` y `data-theme="desert"` ya estan definidos en `tokens.css` — solo falta el toggle en UI.

## API usada

- `POST /auth/login`
- `GET /api/drones`
- `GET /api/baterias`
- `GET /api/previstos`
- `GET /api/vuelos`
