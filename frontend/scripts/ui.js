// Layout helpers — shell, header, sidebar, nav

const NAV = [
  { hash: "/dashboard",     label: "OPS",     icon: "grid" },
  { hash: "/drones",        label: "DRONES",  icon: "drone" },
  { hash: "/vuelos",        label: "VUELOS",  icon: "arrow" },
  { hash: "/pilotos",       label: "CREW",    icon: "user" },
  { hash: "/mantenimientos", label: "TALLER",  icon: "wrench" },
  { hash: "/previstos",      label: "AGENDA",  icon: "calendar" },
  { hash: "/modelos",       label: "MODELOS", icon: "tag" },
];

const ICONS = {
  grid:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',
  drone:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="5" cy="5" r="3"/><circle cx="19" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/><line x1="7" y1="7" x2="17" y2="17"/><line x1="17" y1="7" x2="7" y2="17"/><circle cx="12" cy="12" r="2"/></svg>',
  arrow:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/></svg>',
  user:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>',
  wrench:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  tag:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
  logout:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
  menu:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
};

export const icon = (name) => ICONS[name] || "";

const currentNav = () => NAV.find(n => window.location.hash.startsWith(`#${n.hash}`))?.hash || "";

export const renderShell = ({ titlePrefix, title, id, user, onLogout, headerActions = "", fab = "" }) => `
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
        ${headerActions}
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
    ${fab}
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
