import { Routes, Route } from "react-router-dom";
import Registration from "./pages/Registration";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ClaimsList from "./pages/ClaimsList";
import ClaimsDetail from "./pages/ClaimsDetail";
import Policies from "./pages/Policies";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <>
      <header className="site-header">
        <Navbar />
      </header>

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />

        <Route element={<ProtectedRoute />}>
          <Route index element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="policies" element={<Policies />} />
          <Route path="claims" element={<ClaimsList />} />
          <Route path="claims/:id" element={<ClaimsDetail />} />
        </Route>
      </Routes>
    </>
  );
}
