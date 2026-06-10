import { api, setToken, setUser, clearToken, getToken } from "./api.js";

export const isLoggedIn = () => !!getToken();

export const login = async (email, password) => {
  const res = await api.post("/auth/login", { email, password });
  if (!res || !res.token) throw new Error("Respuesta de login invalida");
  setToken(res.token);
  if (res.user) setUser(res.user);
  else if (res.piloto) setUser(res.piloto);
  return res;
};

export const logout = () => {
  clearToken();
  window.location.hash = "#/login";
};
