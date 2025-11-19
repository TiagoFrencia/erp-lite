// =========================================
//   src/context/AuthContext.tsx
// =========================================

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import { login as apiLogin, me as apiMe, type UserProfile } from "../api/auth";

// Keys de storage
const TOKEN_KEY = "token";
const USER_KEY = "user";
const LOGIN_PATH = "/login";

// -------- Tipos --------
type User = UserProfile;

type AuthContextType = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

// Crear contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ---- Helpers de storage ----
function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function saveAuth(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// ============================================
// PROVIDER
// ============================================

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [loading, setLoading] = useState<boolean>(true);

  const isAuthenticated = Boolean(token && user);

  // Carga inicial al abrir/recargar la app
  useEffect(() => {
    const init = async () => {
      const storedToken = getStoredToken();

      // Si no hay token guardado, no intentamos pedir /me
      if (!storedToken) {
        setUser(null);
        setToken(null);
        setLoading(false);
        return;
      }

      try {
        const profile = await apiMe();
        setUser(profile);
        saveAuth(storedToken, profile);
        setToken(storedToken);
      } catch {
        // Si el token ya no sirve, limpiamos todo
        clearAuth();
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // ========== LOGIN ==========
  const login = async (username: string, password: string) => {
    // 1) Pedimos el token al backend
    const res = await apiLogin({ username, password });
    const accessToken = res.accessToken;

    if (!accessToken) {
      throw new Error("El servidor no devolvió accessToken.");
    }

    // 2) Guardamos el token inmediatamente para que el interceptor lo use
    localStorage.setItem(TOKEN_KEY, accessToken);
    setToken(accessToken);

    try {
      // 3) Ahora sí, pedimos el perfil con el Bearer correcto
      const profile = await apiMe();

      // 4) Persistimos todo de forma consistente
      saveAuth(accessToken, profile);

      // 5) Actualizamos el contexto
      setUser(profile);
    } catch (error) {
      // Si /me falla (ej. 401), limpiamos y re-lanzamos el error
      clearAuth();
      setToken(null);
      setUser(null);
      throw error;
    }
  };

  // ========== LOGOUT ==========
  const logout = () => {
    clearAuth();
    setToken(null);
    setUser(null);

    // Redirigir al login de forma prolija
    if (window.location.pathname !== LOGIN_PATH) {
      window.location.replace(LOGIN_PATH);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de un <AuthProvider>");
  }
  return ctx;
};
