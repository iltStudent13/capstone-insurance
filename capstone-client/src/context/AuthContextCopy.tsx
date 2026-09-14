import { createContext, useContext, useEffect, useState, type ReactNode, } from "react"; 
import api from "../services/api"; 
import type { User } from "../types";

type AuthContextType = { user: User | null; token: string | null; loading: boolean; // loading initial restore 
  actionLoading: boolean; // loading for login/register actions
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = "token";

// helper to set token on api and localStorage 
function setTokenAndHeader(t: string | null) 
{ if (t) { localStorage.setItem(TOKEN_KEY, t); 
    api.defaults.headers.common["Authorization"] = `Bearer ${t}`; } 
    else { localStorage.removeItem(TOKEN_KEY); 
        delete api.defaults.headers.common["Authorization"]; } 
    }

export function AuthProvider({ children }: { children: ReactNode }) { const [user, setUser] = useState<User | null>(null); const [token, setToken] = useState<string | null>(localStorage.getItem(TOKEN_KEY)); const [loading, setLoading] = useState(true); const [actionLoading, setActionLoading] = useState(false);

// ensure api has token header if present on init 
useEffect(() => { if (token) { api.defaults.headers.common["Authorization"] = `Bearer ${token}`; } }, []); // run once

// restore user from /auth/me if token exists 
useEffect(() => { const t = localStorage.getItem(TOKEN_KEY); if (!t) { setLoading(false); return; }

// set header while validating
api.defaults.headers.common["Authorization"] = `Bearer ${t}`;

api
  .get<User>("/auth/me")
  .then((r) => {
    setUser(r.data);
    setToken(t);
  })
  .catch(() => {
    // token invalid — clear it
    setTokenAndHeader(null);
    setUser(null);
  })
  .finally(() => setLoading(false));
}, []);

async function login(email: string, password: string) { setActionLoading(true); try { const r = await api.post<{ token: string; user: User }>("/auth/login", { email, password }); const recievedToken = r.data.token; setToken(recievedToken); setUser(r.data.user); setTokenAndHeader(recievedToken); } catch (err) { // rethrow so callers can handle. Optionally parse and return structured errors. throw err; } finally { setActionLoading(false); } }

async function register(payload: { name: string; email: string; password: string }) { setActionLoading(true); try { // backend should return token + user on successful registration (adjust if different) 
const r = await api.post<{ token: string; user: User }>("/auth/register", payload); 
const recievedToken = r.data.token; 
setToken(recievedToken); 
setUser(r.data.user); 
setTokenAndHeader(recievedToken); 
} catch (err) { throw err; } finally { setActionLoading(false); } }

function logout() { setToken(null); setUser(null); setTokenAndHeader(null); }

return ( <AuthContext.Provider value={{ user, token, loading, actionLoading, login, register, logout, }} > {children} </AuthContext.Provider> ); }

export const useAuth = () => { const ctx = useContext(AuthContext); if (!ctx) throw new Error("useAuth must be used inside AuthProvider"); return ctx; };