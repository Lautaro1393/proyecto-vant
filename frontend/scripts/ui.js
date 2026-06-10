// Layout helpers — shell, header, sidebar, nav

const NAV = [
  { hash: "/dashboard",  label: "OPS",    icon: "grid" },
  { hash: "/drones",     label: "DRONES", icon: "drone" },
  { hash: "/vuelos",     label: "VUELOS", icon: "arrow" },
  { hash: "/pilotos",    label: "CREW",   icon: "user" },
  { hash: "/baterias",   label: "PWR",    icon: "battery" },
];

const ICONS = {
  grid:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',
  drone:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="5" cy="5" r="3"/><circle cx="19" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/><line x1="7" y1="7" x2="17" y2="17"/><line x1="17" y1="7" x2="7" y2="17"/><circle cx="12" cy="12" r="2"/></svg>',
  arrow:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/></svg>',
  user:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>',
  battery: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="18" height="10"/><line x1="22" y1="11" x2="22" y2="13"/><line x1="5" y1="10" x2="5" y2="14"/><line x1="9" y1="10" x2="9" y2="14"/><line x1="13" y1="10" x2="13" y2="14"/></svg>',
  logout:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
  menu:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
};

export const icon = (name) => ICONS[name] || "";

const currentNav = () => NAV.find(n => window.location.hash.startsWith(`#${n.hash}`))?.hash || "";

export const renderShell = ({ titlePrefix, title, id, user, onLogout }) => `
  <div class="app">
    <header class="app__header">
      <div class="app__brand">
        <span class="app__brand-dot"></span>
        <span>VANT</span>
        <span class="app__brand-id">FLEET-OPS</span>
      </div>
      <div class="app__title">
        <span class="app__title-prefix">${titlePrefix || "00"}</span> ${title}
      </div>
      <div class="app__actions">
        ${user?.rol ? `<span class="chip chip--olive" title="${user.rol}"><span class="chip__dot"></span>${user.rol.toUpperCase()}</span>` : ""}
        <button class="btn btn--ghost btn--icon" id="btn-logout" title="Logout">${icon("logout")}</button>
      </div>
    </header>
    <div class="app__body">
      <aside class="app__sidebar">
        ${NAV.map(n => `
          <a href="#${n.hash}" ${currentNav() === n.hash ? 'aria-current="page"' : ""}>
            ${icon(n.icon)}<span class="hide-mobile">${n.label}</span>
          </a>
        `).join("")}
      </aside>
      <main class="app__main" id="main-slot"></main>
    </div>
    <nav class="app__nav">
      ${NAV.map(n => `
        <a href="#${n.hash}" ${currentNav() === n.hash ? 'aria-current="page"' : ""}>
          ${icon(n.icon)}<span>${n.label}</span>
        </a>
      `).join("")}
    </nav>
  </div>
`;

export const bindShell = (root, user) => {
  const main = root.querySelector("#main-slot");
  const logoutBtn = root.querySelector("#btn-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      clearAuth();
      window.location.hash = "#/login";
    });
  }
  return main;
};

export const clearAuth = () => {
  localStorage.removeItem("vant.jwt");
  localStorage.removeItem("vant.user");
};
