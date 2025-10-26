import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  // If not logged in, redirect to sign in
  if (!user) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  // If user role is not in allowedRoles, redirect to access denied
  if (allowedRoles && !allowedRoles.includes(user.type)) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
}
