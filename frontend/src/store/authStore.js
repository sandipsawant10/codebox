import { create } from "zustand";
import { authApi } from "../api/index.js";

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),
  isLoading: false,
}));

login: async (email, password) => {
  set({ isLoading: true });
  try {
    const res = await authApi.login({ email, password });
    (localStorage.setItem("token", res.data.token),
      set({
        user: res.data.user,
        token: res.data.token,
        isAuthenticated: true,
      }));
  } finally {
    set({ isLoading: false });
  }
};

register: async (name, email, password) => {
  set({ isLoading: true });
  try {
    const res = await authApi.register({ name, email, password });
    localStorage.setItem("token", res.data.token);
    set({ user: res.data.user, token: res.data.token, isAuthenticated: true });
  } finally {
    set({ isLoading: false });
  }
};

logout: () => {
  localStorage.removeItem("token");
  set({ user: null, token: null, isAuthenticated: false });
};

fetchMe: async () => {
  try {
    const res = await authApi.getMe();
    set({ user: res.data.user, isAuthenticated: true });
  } catch {
    localStorage.removeItem("token");
    set({ user: null, token: null, isAuthenticated: false });
  }
};
