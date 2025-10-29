import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";
import { LandingPage, CertificationsPublic, EvenementsPublic } from "@/pages/landing";
import { ChangePassword } from "@/pages/ChangePassword";
import { Profile } from "@/pages/Profile";
import { Energies } from "@/pages/dashboard";
import { AccessDenied } from "@/pages/AccessDenied";
import { TransportPublic } from "@/pages/TransportPublic";
import { RestaurantsBrowse } from "@/pages/RestaurantsBrowse";
import { ProduitsBrowse } from "@/pages/ProduitsBrowse";
import { MyReservations } from "@/pages/MyReservations";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { GuestRoute } from "@/components/GuestRoute";
import { Activities, NaturalZones } from "@/pages/client";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      
      {/* Pages publiques (Front-office) */}
      <Route path="/public/certifications" element={<CertificationsPublic />} />
        <Route path="/public/evenements" element={<EvenementsPublic />} />
        
        <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/energies" 
        element={
          <ProtectedRoute>
            <Energies />
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
