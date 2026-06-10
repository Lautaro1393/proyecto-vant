import { route, start, navigate } from "./router.js";
import { isLoggedIn } from "./auth.js";
import { renderLogin } from "./views/login.js";
import { renderDashboard } from "./views/dashboard.js";

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

start(isLoggedIn() ? "/dashboard" : "/login");
