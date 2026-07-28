import { api, getUser } from "../api.js";
import { renderShell, bindShell } from "../ui.js";
import { skeletonCardList } from "../skeletons.js";

const safe = async (fn, fb = []) => { try { return await fn(); } catch (e) { console.error(e); return fb; } };

export const renderModelosList = async (root) => {
  const user = getUser();
  const isAdmin = user?.rol?.toLowerCase() === "admin";

  root.innerHTML = renderShell({
    titlePrefix: "28",
    title: "MODELOS",
    id: "MOD-28",
    user,
    headerActions: isAdmin
      ? `<a class="btn btn--primary btn--sm" href="#/modelos/new" style="min-height:36px;padding:0 var(--space-3)">+ NUEVO</a>`
      : "",
    fab: isAdmin
      ? `<a class="fab" href="#/modelos/new" title="NUEVO MODELO" aria-label="Nuevo modelo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="22" height="22"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </a>`
      : "",
  });
  const main = bindShell(root, user);

  main.innerHTML = `
    <header class="section-head">
      <div class="section-head__title">
        <span class="section-head__title-prefix">28</span> CATALOGO
        <span class="section-head__id">MOD-28</span>
      </div>
      <span class="dim" id="count"></span>
    </header>

    <div class="field">
      <div class="input-wrap">
        <input class="input" id="q" type="search" placeholder="BUSCAR MODELO / FABRICANTE..." autocomplete="off" />
        <div class="input-wrap__brackets">
          <span class="br-tl"></span><span class="br-tr"></span>
          <span class="br-bl"></span><span class="br-br"></span>
        </div>
      </div>
    </div>

    <section id="list-slot" class="stack-2">
      ${skeletonCardList(4)}
    </section>
  `;

  const modelos = await safe(() => api.get("/api/modelos"), []);

  const q = main.querySelector("#q");
  const listSlot = main.querySelector("#list-slot");
  const countEl = main.querySelector("#count");

  const apply = () => {
    const term = (q.value || "").trim().toLowerCase();
    const filtered = modelos.filter((m) => {
      if (!term) return true;
      return `${m.modelo || ""} ${m.fabricante || ""}`.toLowerCase().includes(term);
    });

    countEl.textContent = `${filtered.length}/${modelos.length} MODELOS`;

    if (!filtered.length) {
      listSlot.innerHTML = `<div class="card"><div class="card__body dim" style="text-align:center;padding:var(--space-6)">SIN RESULTADOS</div></div>`;
      return;
    }

    listSlot.innerHTML = filtered.map((m, idx) => `
      <div class="card card--info">
        <header class="card__header">
          <span><span class="card__header-prefix">${String(idx + 1).padStart(2, "0")}</span> ${escape(m.modelo) || "—"}</span>
          <span class="card__header-id">MOD-${m.id_modelo_dron}</span>
        </header>
        <div class="card__body">
          <div class="list__primary" style="margin-bottom:var(--space-1)">${escape(m.fabricante) || "—"}</div>
          <div class="list__secondary dim">MODELO: ${escape(m.modelo) || "—"}</div>
        </div>
        ${isAdmin ? `
          <div style="padding:var(--space-2) var(--space-3);border-top:1px solid var(--outline-variant);display:flex;justify-content:flex-end">
            <a class="btn btn--secondary btn--sm" href="#/modelos/${m.id_modelo_dron}/edit" style="min-height:32px;padding:0 var(--space-3);font-size:10px">EDITAR</a>
          </div>
        ` : ""}
      </div>
    `).join("");
  };

  q.addEventListener("input", apply);
  apply();
};

const escape = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
