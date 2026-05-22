import api from "./axios.js";

export const authApi = {
  register: (p) => api.post("/auth/register", p).then((r) => r.data),
  login: (p) => api.post("/auth/login", p).then((r) => r.data),
  getMe: () => api.get("/auth/me").then((r) => r.data),
};

export const projectsApi = {
  getAll: () => api.get("/projects").then((r) => r.data),
  getById: (id) => api.get(`/project/${id}`).then((r) => r.data),
  create: (p) => api.post("/projects", p).then((r) => r.data),
  update: (id, p) => api.put(`/projects/${id}`, p).then((r) => r.data),
  delete: (id) => api.delete(`/projects/${id}`).then((r) => r.data),
};
