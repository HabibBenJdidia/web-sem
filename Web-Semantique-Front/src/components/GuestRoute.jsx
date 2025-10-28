import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function GuestRoute({ children }) {
  const { user, loading } = useAuth();

  // Show loading state while authentication is being checked
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If already logged in, redirect to dashboard
  if (user) {
    // If user is a Guide, redirect to dashboard
    if (user.type === "Guide") {
      return <Navigate to="/dashboard/home" replace />;
    }
    // If user is a Tourist, redirect to home page
    return <Navigate to="/" replace />;
  }

  // If not logged in, show the auth page
  return children;
}

