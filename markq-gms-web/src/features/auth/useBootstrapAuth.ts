import { useEffect } from "react";
import { getMe } from "./api";
import { useAuthStore } from "./authStore";

export function useBootstrapAuth() {
  const { accessToken, setUser, setStatus, logout } = useAuthStore();

  useEffect(() => {
    if (!accessToken) { setStatus("anonymous"); return; }

    setStatus("loading");
    let cancelled = false;

    getMe()
      .then((user) => { if (!cancelled) { setUser(user); setStatus("authenticated"); } })
      .catch(() => { if (!cancelled) logout(); });

    return () => { cancelled = true; };
  }, [accessToken, setUser, setStatus, logout]);
}
