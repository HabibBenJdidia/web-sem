import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

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
