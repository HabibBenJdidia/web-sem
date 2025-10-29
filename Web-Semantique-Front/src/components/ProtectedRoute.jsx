import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // If not logged in, redirect to sign in
  if (!user) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  // If user role is not in allowedRoles, redirect to access denied
  if (allowedRoles && allowedRoles.length > 0) {
    // Case-insensitive comparison for role checking
    const userType = user.type?.toLowerCase();
    const hasAccess = allowedRoles.some(role => role.toLowerCase() === userType);
    
    if (!hasAccess) {
      console.log('Access denied:', { 
        userType: user.type, 
        allowedRoles, 
        hasAccess 
      });
      return <Navigate to="/access-denied" replace />;
    }
  }

  return children;
}
