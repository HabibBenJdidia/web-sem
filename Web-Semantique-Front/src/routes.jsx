// src/config/routes.jsx
import {
  HomeIcon,
  UserCircleIcon,
  UsersIcon,
  TruckIcon,
  InformationCircleIcon,
  BuildingOfficeIcon,
  MapPinIcon,
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