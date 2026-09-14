import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import api from "../services/api";
import type { User } from "../types";

type C = {
  user: User | null;
  token: string | null;
  loading: boolean;
};

const AuthContext = createContext<C | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((r) => {
        setUser(r.data.user ?? r.data);
        localStorage.setItem("user", JSON.stringify(r.data.user ?? r.data));
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function register(payload: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) {
    const r = await api.post("/auth/register", payload);
    localStorage.setItem("token", r.data.token);
    localStorage.setItem("user", JSON.stringify(r.data.user));
    setToken(r.data.token);
    setUser(r.data.user);
  }

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
