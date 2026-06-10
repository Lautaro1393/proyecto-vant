import { route, start, navigate } from "./router.js";
import { isLoggedIn } from "./auth.js";
import { renderLogin } from "./views/login.js";
import { renderDashboard } from "./views/dashboard.js";
import { renderDronesList } from "./views/drones-list.js";
import { renderDronDetail } from "./views/dron-detail.js";
import { renderDronesForm } from "./views/drones-form.js";

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

start(isLoggedIn() ? "/dashboard" : "/login");
