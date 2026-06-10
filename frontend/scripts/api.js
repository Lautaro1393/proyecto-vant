// API client — fetch wrapper con JWT automatico
const TOKEN_KEY = "vant.jwt";
const USER_KEY = "vant.user";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); };

export const getUser = () => {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};
export const setUser = (u) => localStorage.setItem(USER_KEY, JSON.stringify(u));

const baseHeaders = (extra = {}) => {
  const h = { "Content-Type": "application/json", ...extra };
  const token = getToken();
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
};

const handle = async (res) => {
  const ct = res.headers.get("content-type") || "";
  const body = ct.includes("application/json") ? await res.json() : await res.text();
  if (!res.ok) {
    const msg = (body && body.error) || (body && body.message) || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
};

export const api = {
  get:    (path)         => fetch(path, { method: "GET",    headers: baseHeaders() }).then(handle),
  post:   (path, data)   => fetch(path, { method: "POST",   headers: baseHeaders(), body: JSON.stringify(data) }).then(handle),
  put:    (path, data)   => fetch(path, { method: "PUT",    headers: baseHeaders(), body: JSON.stringify(data) }).then(handle),
  patch:  (path, data)   => fetch(path, { method: "PATCH",  headers: baseHeaders(), body: JSON.stringify(data) }).then(handle),
  del:    (path)         => fetch(path, { method: "DELETE", headers: baseHeaders() }).then(handle),
  upload: (path, file)   => {
    const fd = new FormData();
    fd.append("imagen", file);
    const h = {};
    const token = getToken();
    if (token) h["Authorization"] = `Bearer ${token}`;
    return fetch(path, { method: "POST", headers: h, body: fd }).then(handle);
  },
};
