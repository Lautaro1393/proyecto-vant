import { api, setToken, setUser, clearToken, getToken } from "./api.js";

export const isLoggedIn = () => !!getToken();

export const login = async (email, password) => {
  const res = await api.post("/auth/login", { email, password });
  if (!res || !res.token) throw new Error("Respuesta de login invalida");
  setToken(res.token);
  if (res.user) setUser(res.user);
  return res;
};

export const logout = () => {
  clearToken();
  window.location.hash = "#/login";
};
