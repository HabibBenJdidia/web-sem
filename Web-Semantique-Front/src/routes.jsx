// src/config/routes.jsx
import {
  HomeIcon,
  UserCircleIcon,
  UsersIcon,
  TruckIcon,
  InformationCircleIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  BuildingStorefrontIcon,
  ShoppingBagIcon,
  MicrophoneIcon,
} from "@heroicons/react/24/solid";

import { 
  Home, 
  Profile, 
  Users, 
  Transport,
  Notifications, 
  Destinations,
  Hebergements
} from "@/pages/dashboard";

import { 
  SignIn, 
  SignUp, 
  ForgotPassword, 
  ResetPassword, 
  VerifyEmail 
} from "@/pages/auth";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "Dashboard",
        path: "/home",
        element: <Home />,
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "Profil",
        path: "/profile",
        element: <Profile />,
      },
      {
        icon: <UsersIcon {...icon} />,
        name: "Utilisateurs",
        path: "/tables",
        element: <Users />,
      },
      {
        icon: <TruckIcon {...icon} />,
        name: "Transport",
        path: "/transport",
        element: <Transport />,
      },
      {
        icon: <MapPinIcon className="h-5 w-5 text-inherit" />,
        name: "Destinations",
        path: "/destinations",
        element: <Destinations />,
      },
      {
        icon: <BuildingOfficeIcon className="h-5 w-5 text-inherit" />,
        name: "Hébergements",
        path: "/hebergements",
        element: <Hebergements />,
      },
      {
        icon: <BuildingStorefrontIcon {...icon} />,
        name: "Restaurants",
        path: "/restaurants",
        element: <div>Restaurants Dashboard (Coming Soon)</div>,
      },
      {
        icon: <ShoppingBagIcon {...icon} />,
        name: "Produits Locaux",
        path: "/produits",
        element: <div>Produits Locaux Dashboard (Coming Soon)</div>,
      },
      {
        icon: <MicrophoneIcon {...icon} />,
        name: "AI BSila",
        path: "/ai-bsila",
        element: <div>AI BSila Assistant (Coming Soon)</div>,
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "Gestion Admin",
        path: "/notifications",
        element: <Notifications />,
      },
    ],
  },
  {
    title: "Pages d'authentification",
    layout: "auth",
    pages: [
      { name: "Connexion", path: "/sign-in", element: <SignIn /> },
      { name: "Inscription", path: "/sign-up", element: <SignUp /> },
      { name: "Mot de passe oublié", path: "/forgot-password", element: <ForgotPassword /> },
      { name: "Réinitialiser mot de passe", path: "/reset-password", element: <ResetPassword /> },
      { name: "Vérifier email", path: "/verify-email", element: <VerifyEmail /> },
    ],
  },
];

export default routes;