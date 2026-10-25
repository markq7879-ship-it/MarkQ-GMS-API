import { create } from "zustand";
import type { UserInfo } from "./types";

const TOKEN_KEY = "markq.accessToken";

interface AuthState {
  accessToken: string | null;
  user: UserInfo | null;
  status: "idle" | "loading" | "authenticated" | "anonymous";
  setAuth: (token: string, user: UserInfo) => void;
  setUser: (user: UserInfo) => void;
  logout: () => void;
  setStatus: (s: AuthState["status"]) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: localStorage.getItem(TOKEN_KEY),
  user: null,
  status: "idle",
  setAuth: (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    set({ accessToken: token, user, status: "authenticated" });
  },
  setUser: (user) => set({ user }),
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ accessToken: null, user: null, status: "anonymous" });
  },
  setStatus: (status) => set({ status }),
}));
