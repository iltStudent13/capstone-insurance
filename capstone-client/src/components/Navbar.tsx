import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? "active" : "";
  };

  return (
    <div className="navbar">
      <div className="navbar-brand">Policy Claims Tracker</div>

      <nav className="nav-links" aria-label="Main navigation">
        <Link to="/dashboard" className={isActive("/dashboard")}>
          Dashboard
        </Link>
        <Link to="/claims" className={isActive("/claims")}>
          Claims
        </Link>
        <Link to="/policies" className={isActive("/policies")}>
          Policies
        </Link>
      </nav>

      {user && (
        <div className="navbar-user">
          <span className="username">{user.username}</span>
          <span className={`role-badge ${user.role}`}>{user.role}</span>
          <button onClick={logout}>Logout</button>
        </div>
      )}
    </div>
  );
}
