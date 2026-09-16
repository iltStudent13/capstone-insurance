import { useEffect, useState, type ReactNode } from "react";
import api from "../services/api";
import type { User } from "../types";
import { AuthContext } from "./AuthContextValue";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );
  const initialToken =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const [loading, setLoading] = useState<boolean>(() =>
    initialToken ? true : false,
  );

  useEffect(() => {
    if (!initialToken) return;

    let mounted = true;
    api
      .get("/auth/me")
      .then((r) => {
        if (mounted) {
          setUser(r.data.user ?? r.data);
          localStorage.setItem("user", JSON.stringify(r.data.user ?? r.data));
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [initialToken]);

  async function login(email: string, password: string) {
    const r = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", r.data.token);
    localStorage.setItem("user", JSON.stringify(r.data.user));
    setToken(r.data.token);
    setUser(r.data.user);
  }

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
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
