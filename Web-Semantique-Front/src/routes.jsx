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
  CalendarDaysIcon,
  MapIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";

import { 
  Home, 
  Profile, 
  Users, 
  Transport,
  Notifications, 
  Destinations,
  Hebergements,
  Reservations,
  ActivitiesAdmin, 
  ZonesAdmin
} from "@/pages/dashboard";

import { Restaurants } from "@/pages/dashboard/restaurants";
import { Produits } from "@/pages/dashboard/produits";
import { AIBSilaPage } from "@/pages/AIBSilaPage";

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
        element: <Restaurants />,
      },
      {
        icon: <ShoppingBagIcon {...icon} />,
        name: "Produits Locaux",
        path: "/produits",
        element: <Produits />,
      },
      {
        icon: <MicrophoneIcon {...icon} />,
        name: "AI BSila",
        path: "/ai-bsila",
        element: <AIBSilaPage />,
      },
      {
        icon: <CalendarDaysIcon {...icon} />,
        name: "Réservations",
        path: "/reservations",
        element: <Reservations />,
      },
    
      {
        icon: <SparklesIcon {...icon} />,
        name: "Activités",
        path: "/activities",
        element: <ActivitiesAdmin />,
      },
      {
        icon: <MapIcon {...icon} />,
        name: "Zones Naturelles",
        path: "/zones",
        element: <ZonesAdmin />,
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