import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";
import { LandingPage } from "@/pages/landing";
import { ChangePassword } from "@/pages/ChangePassword";
import { Profile } from "@/pages/Profile";
import { AccessDenied } from "@/pages/AccessDenied";
import { TransportPublic } from "@/pages/TransportPublic";
import { RestaurantsBrowse } from "@/pages/RestaurantsBrowse";
import { ProduitsBrowse } from "@/pages/ProduitsBrowse";
import { MyReservations } from "@/pages/MyReservations";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { GuestRoute } from "@/components/GuestRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/transport" element={<TransportPublic />} />
      <Route path="/restaurants" element={<RestaurantsBrowse />} />
      <Route path="/produits" element={<ProduitsBrowse />} />
      <Route 
        path="/my-reservations" 
        element={
          <ProtectedRoute allowedRoles={["Touriste"]}>
            <MyReservations />
          </ProtectedRoute>
        } 
      />
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
      <Route 
        path="/auth/*" 
        element={
          <GuestRoute>
            <Auth />
          </GuestRoute>
        } 
      />
      <Route path="/access-denied" element={<AccessDenied />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
