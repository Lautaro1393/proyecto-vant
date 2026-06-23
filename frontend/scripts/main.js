import { route, start, navigate } from "./router.js";
import { isLoggedIn } from "./auth.js";
import { renderLogin } from "./views/login.js";
import { renderDashboard } from "./views/dashboard.js";
import { renderDronesList } from "./views/drones-list.js";
import { renderDronDetail } from "./views/dron-detail.js";
import { renderDronesForm } from "./views/drones-form.js";
import { renderPilotosList } from "./views/pilotos-list.js";
import { renderPilotoDetail } from "./views/piloto-detail.js";
import { renderPilotosForm } from "./views/pilotos-form.js";
import { renderVuelosList } from "./views/vuelos-list.js";
import { renderVueloDetail } from "./views/vuelo-detail.js";
import { renderVuelosForm } from "./views/vuelos-form.js";
import { renderMantenimientosList } from "./views/mantenimientos-list.js";
import { renderMantenimientoDetail } from "./views/mantenimiento-detail.js";
import { renderMantenimientosForm } from "./views/mantenimientos-form.js";
import { renderPrevistosList } from "./views/previstos-list.js";
import { renderPrevistoDetail } from "./views/previsto-detail.js";
import { renderPrevistosForm } from "./views/previstos-form.js";

const requireAuth = async (handler) => {
  if (!isLoggedIn()) {
    navigate("/login");
    return () => {};
  }
  return handler();
};

route("/login",     () => renderLogin(document.getElementById("root")));
route("/",          () => { navigate("/dashboard"); return () => {}; });
route("/dashboard", () => requireAuth(() => renderDashboard(document.getElementById("root"))));

route("/drones",          () => requireAuth(() => renderDronesList(document.getElementById("root"))));
route("/drones/new",      () => requireAuth(() => renderDronesForm(document.getElementById("root"), { id: null })));
route("/drones/:id",      ({ params }) => requireAuth(() => renderDronDetail(document.getElementById("root"), params.id)));
route("/drones/:id/edit", ({ params }) => requireAuth(() => renderDronesForm(document.getElementById("root"), { id: params.id })));

route("/pilotos",          () => requireAuth(() => renderPilotosList(document.getElementById("root"))));
route("/pilotos/new",      () => requireAuth(() => renderPilotosForm(document.getElementById("root"), { id: null })));
route("/pilotos/:id",      ({ params }) => requireAuth(() => renderPilotoDetail(document.getElementById("root"), params.id)));
route("/pilotos/:id/edit", ({ params }) => requireAuth(() => renderPilotosForm(document.getElementById("root"), { id: params.id })));

route("/vuelos",          () => requireAuth(() => renderVuelosList(document.getElementById("root"))));
route("/vuelos/new",      () => requireAuth(() => renderVuelosForm(document.getElementById("root"), { id: null })));
route("/vuelos/:id",      ({ params }) => requireAuth(() => renderVueloDetail(document.getElementById("root"), params.id)));
route("/vuelos/:id/edit", ({ params }) => requireAuth(() => renderVuelosForm(document.getElementById("root"), { id: params.id })));

route("/mantenimientos",          () => requireAuth(() => renderMantenimientosList(document.getElementById("root"))));
route("/mantenimientos/new",      () => requireAuth(() => renderMantenimientosForm(document.getElementById("root"), { id: null })));
route("/mantenimientos/:id",      ({ params }) => requireAuth(() => renderMantenimientoDetail(document.getElementById("root"), params.id)));
route("/mantenimientos/:id/edit", ({ params }) => requireAuth(() => renderMantenimientosForm(document.getElementById("root"), { id: params.id })));

route("/previstos",          () => requireAuth(() => renderPrevistosList(document.getElementById("root"))));
route("/previstos/new",      () => requireAuth(() => renderPrevistosForm(document.getElementById("root"), { id: null })));
route("/previstos/:id",      ({ params }) => requireAuth(() => renderPrevistoDetail(document.getElementById("root"), params.id)));
route("/previstos/:id/edit", ({ params }) => requireAuth(() => renderPrevistosForm(document.getElementById("root"), { id: params.id })));

start(isLoggedIn() ? "/dashboard" : "/login");
