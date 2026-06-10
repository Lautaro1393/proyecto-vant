import { login } from "../auth.js";
import { navigate } from "../router.js";

export const renderLogin = (root) => {
  root.innerHTML = `
    <main class="login">
      <section class="login__panel">
        <header class="login__head">
          <div class="login__brand">
            <span class="login__brand-dot"></span>
            VANT // FLEET-OPS
          </div>
          <h1 class="login__title">Tactical UAV Manager</h1>
          <p class="login__sub">Autenticacion de personal autorizado</p>
        </header>
        <form class="login__form" id="login-form" autocomplete="off">
          <div id="login-msg"></div>
          <div class="field">
            <label class="field__label" for="email">ID Operador</label>
            <div class="input-wrap">
              <input class="input" id="email" name="email" type="email" required autocomplete="username" placeholder="operador@org" />
              <div class="input-wrap__brackets">
                <span class="br-tl"></span><span class="br-tr"></span>
                <span class="br-bl"></span><span class="br-br"></span>
              </div>
            </div>
          </div>
          <div class="field">
            <label class="field__label" for="password">Clave</label>
            <div class="input-wrap">
              <input class="input" id="password" name="password" type="password" required autocomplete="current-password" placeholder="••••••••" />
              <div class="input-wrap__brackets">
                <span class="br-tl"></span><span class="br-tr"></span>
                <span class="br-bl"></span><span class="br-br"></span>
              </div>
            </div>
          </div>
          <button class="btn btn--primary btn--block" type="submit" id="btn-submit">INGRESAR</button>
          <p class="login__sub" style="text-align:center;margin-top:8px">
            Sistema protegido — accesos auditados
          </p>
        </form>
      </section>
    </main>
  `;

  const form = root.querySelector("#login-form");
  const msg = root.querySelector("#login-msg");
  const btn = root.querySelector("#btn-submit");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.innerHTML = "";
    btn.disabled = true;
    btn.textContent = "VERIFICANDO...";
    try {
      const email = root.querySelector("#email").value.trim();
      const password = root.querySelector("#password").value;
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      msg.innerHTML = `<div class="error-banner">${err.message || "Error de autenticacion"}</div>`;
      btn.disabled = false;
      btn.textContent = "INGRESAR";
    }
  });
};
