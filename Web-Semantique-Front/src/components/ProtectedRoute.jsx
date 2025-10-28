// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  // === 1. Chargement en cours ===
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600"></div>
      </div>
    );
  }

  // === 2. Pas connecté → redirige vers login ===
  if (!user) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  // === 3. Rôle non autorisé → page accès refusé ===
  if (allowedRoles && !allowedRoles.includes(user.type)) {
    return <Navigate to="/access-denied" replace />;
  }

  // === 4. Tout OK → affiche la page ===
  return children ? children : <Outlet />;
}

// Export par défaut (si tu l'utilises ailleurs avec `import ProtectedRoute`)
export default ProtectedRoute;