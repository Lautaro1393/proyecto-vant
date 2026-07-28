// Skeleton loaders: placeholders con animacion shimmer para estados de carga.
// Sustituyen a <span class="spinner"> en listas y detalles.
//
// Helpers disponibles:
//   skeletonCard()      -> 1 tarjeta placeholder (lista)
//   skeletonCardList(n) -> N tarjetas en stack-2
//   skeletonListRow()   -> 1 fila de lista con avatar+texto+chip
//   skeletonListRows(n) -> N filas en contenedor
//   skeletonStat()      -> 1 stat cell (dashboard)
//   skeletonStats(n)    -> N stat cells (dashboard)
//   skeletonHero()      -> 1 imagen hero 4:3 (drone / piloto detail)
//   skeletonDetail()    -> header + hero + stats (para /:id pages)
//   skeletonForm()      -> 1 card con form (placeholder de carga)

const card = (idx) => `
  <div class="skeleton-card" aria-hidden="true">
    <div class="skeleton-card__header">
      <span class="skeleton" style="width:30px;height:14px"></span>
      <span class="skeleton" style="width:60px;height:10px"></span>
    </div>
    <div class="skeleton-card__body">
      <span class="skeleton skeleton--avatar"></span>
      <div class="skeleton-card__body__text">
        <span class="skeleton skeleton--line skeleton--line--title" style="width:${50 + (idx % 3) * 10}%"></span>
        <span class="skeleton skeleton--line skeleton--line--thin" style="width:80%"></span>
      </div>
      <span class="skeleton skeleton--chip"></span>
    </div>
    <div style="border-top:1px solid var(--outline-variant);padding-top:var(--space-2);display:flex;justify-content:space-between">
      <span class="skeleton skeleton--line" style="width:90px"></span>
      <span class="skeleton skeleton--line" style="width:80px"></span>
    </div>
  </div>
`;

export const skeletonCard = () => card(0);

export const skeletonCardList = (n = 3) =>
  `<div class="stack-2" aria-busy="true" aria-label="Cargando">${Array.from({ length: n }, (_, i) => card(i)).join("")}</div>`;

const listRow = (i) => `
  <div class="skeleton-card" style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-2) var(--space-3)">
    <span class="skeleton skeleton--circle"></span>
    <div style="flex:1;min-width:0">
      <span class="skeleton skeleton--line" style="width:${40 + (i % 4) * 10}%"></span>
      <span class="skeleton skeleton--line skeleton--line--thin" style="width:60%"></span>
    </div>
    <span class="skeleton skeleton--chip"></span>
  </div>
`;

export const skeletonListRow = () => listRow(0);

export const skeletonListRows = (n = 4) =>
  `<div class="stack-2" aria-busy="true" aria-label="Cargando">${Array.from({ length: n }, (_, i) => listRow(i)).join("")}</div>`;

export const skeletonStat = () => `
  <div class="stats__cell" aria-hidden="true">
    <span class="skeleton skeleton--stat"></span>
    <span class="skeleton skeleton--line skeleton--line--thin" style="width:60%"></span>
  </div>
`;

export const skeletonStats = (n = 4) =>
  Array.from({ length: n }, () => skeletonStat()).join("");

export const skeletonHero = () => `
  <div class="skeleton-card" style="padding:0;overflow:hidden" aria-hidden="true">
    <span class="skeleton skeleton--hero"></span>
    <div style="padding:var(--space-3)">
      <span class="skeleton skeleton--line skeleton--line--title" style="width:50%"></span>
      <span class="skeleton skeleton--line skeleton--line--thin" style="width:70%"></span>
      <div style="display:flex;gap:var(--space-3);margin-top:var(--space-2)">
        <span class="skeleton skeleton--line" style="width:80px"></span>
        <span class="skeleton skeleton--line" style="width:120px"></span>
      </div>
    </div>
  </div>
`;

export const skeletonDetail = () => `
  <div class="stack" aria-busy="true" aria-label="Cargando">
    ${skeletonHero()}
    <div class="stats" style="margin-top:var(--space-3)">
      ${skeletonStats(4)}
    </div>
    <div class="skeleton-card" style="margin-top:var(--space-3)">
      <span class="skeleton skeleton--line skeleton--line--title" style="width:40%"></span>
      ${Array.from({ length: 3 }, () => '<span class="skeleton skeleton--line" style="width:90%"></span>').join("")}
    </div>
  </div>
`;

export const skeletonForm = () => `
  <div class="card" aria-busy="true" aria-label="Cargando formulario">
    <div class="card__body" style="display:flex;flex-direction:column;gap:var(--space-2)">
      <div class="grid-2">
        <span class="skeleton skeleton--line skeleton--line--title" style="width:60%"></span>
        <span class="skeleton skeleton--line skeleton--line--title" style="width:60%"></span>
      </div>
      <div class="grid-2">
        <span class="skeleton skeleton--line skeleton--line--title" style="width:60%"></span>
        <span class="skeleton skeleton--line skeleton--line--title" style="width:60%"></span>
      </div>
      <span class="skeleton skeleton--line skeleton--line--title" style="width:60%;margin-top:var(--space-2)"></span>
    </div>
  </div>
`;
