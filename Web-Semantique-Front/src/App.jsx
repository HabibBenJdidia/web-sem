import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";
import { LandingPage } from "@/pages/landing";
import { ChangePassword } from "@/pages/ChangePassword";
import { Profile } from "@/pages/Profile";
import { AccessDenied } from "@/pages/AccessDenied";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Activities, NaturalZones } from "@/pages/client";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      
      {/* Client Pages - Public Access */}
      <Route path="/client/activities" element={<Activities />} />
      <Route path="/client/natural-zones" element={<NaturalZones />} />
      
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/change-password" 
        element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/*" 
        element={
          <ProtectedRoute allowedRoles={["Guide"]}>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route path="/auth/*" element={<Auth />} />
      <Route path="/access-denied" element={<AccessDenied />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
