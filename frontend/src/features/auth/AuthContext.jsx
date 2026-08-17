import { useEffect, useMemo, useState } from "react";
import { AuthContext } from "./authContext.js";
import {
  clearAuth,
  getStoredAuth,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  storeAuth,
} from "./authService.js";
import { canAccessRole, normalizeRole } from "./roles.js";

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    access: null,
    refresh: null,
    user: null,
    status: "loading",
  });

  useEffect(() => {
    let active = true;
    const stored = getStoredAuth();

    if (!stored.refresh || !stored.user) {
      setAuth({ access: null, refresh: null, user: null, status: "unauthenticated" });
      return;
    }

    refreshAccessToken(stored.refresh)
      .then(({ access }) => {
        if (!active) return;
        const nextAuth = { ...stored, access };
        storeAuth(nextAuth);
        setAuth({ ...nextAuth, status: "authenticated" });
      })
      .catch(() => {
        if (!active) return;
        clearAuth();
        setAuth({ access: null, refresh: null, user: null, status: "unauthenticated" });
      });

    return () => {
      active = false;
    };
  }, []);

  async function login(values) {
    const nextAuth = await loginUser(values);
    storeAuth(nextAuth);
    setAuth({ ...nextAuth, status: "authenticated" });
    return nextAuth;
  }

  async function register(values) {
    return registerUser(values);
  }

  async function logout() {
    const current = getStoredAuth();
    clearAuth();
    setAuth({ access: null, refresh: null, user: null, status: "unauthenticated" });

    if (current.access && current.refresh) {
      await logoutUser(current).catch(() => null);
    }
  }

  const value = useMemo(
    () => ({
      ...auth,
      isAuthenticated: auth.status === "authenticated",
      role: normalizeRole(auth.user?.role),
      canAccess: (allowedRoles) => canAccessRole(auth.user?.role, allowedRoles),
      login,
      logout,
      register,
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
