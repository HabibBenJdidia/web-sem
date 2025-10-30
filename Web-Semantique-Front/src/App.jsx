import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";
import { LandingPage, CertificationsPublic, EvenementsPublic } from "@/pages/landing";
import { ChangePassword } from "@/pages/ChangePassword";
import { Profile } from "@/pages/Profile";
import { Energies } from "@/pages/dashboard";
import { AccessDenied } from "@/pages/AccessDenied";
import { TransportPublic } from "@/pages/TransportPublic";
import { RestaurantsBrowse } from "@/pages/RestaurantsBrowse";
import { HebergementsBrowse } from "@/pages/HebergementsBrowse";
import { ProduitsBrowse } from "@/pages/ProduitsBrowse";
import { MyReservations } from "@/pages/MyReservations";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { GuestRoute } from "@/components/GuestRoute";
import { Activities, NaturalZones } from "@/pages/client";
import { GroupAIChatbot } from "@/components/GroupAIChatbot";

function App() {
  return (
    <>
      <GroupAIChatbot />
      <Routes>
      <Route path="/" element={<LandingPage />} />
      
      {/* Pages publiques (Front-office) */}
      <Route path="/public/certifications" element={<CertificationsPublic />} />
      <Route path="/public/evenements" element={<EvenementsPublic />} />
      
      {/* Pages de navigation publiques */}
      <Route path="/transport" element={<TransportPublic />} />
      <Route path="/restaurants" element={<RestaurantsBrowse />} />
      <Route path="/hebergements" element={<HebergementsBrowse />} />
      <Route path="/produits" element={<ProduitsBrowse />} />
      <Route path="/client/activities" element={<Activities />} />
      <Route path="/client/natural-zones" element={<NaturalZones />} />
      
      {/* Pages protégées pour touristes */}
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
    </>
  );
}

export default App;
