// src/config/routes.jsx
import {
  HomeIcon,
  UserCircleIcon,
  UsersIcon,
  TruckIcon,
  InformationCircleIcon,
  CheckBadgeIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  SparklesIcon,
  VideoCameraIcon,
  BuildingStorefrontIcon,
  ShoppingBagIcon,
  MicrophoneIcon,
  MapIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/solid";
import { Home, Profile, Users, Notifications, Certifications, Evenements, Overview, AISalhiDashboard, Restaurants, Produits, Reservations, ActivitiesAdmin, ZonesAdmin } from "@/pages/dashboard";
import { VideoAnalyzer } from "@/pages/dashboard/video-analyzer";
import { Transport } from "@/pages/dashboard/transport";
import { Hebergements } from "@/pages/dashboard/hebergements";
import { Destinations } from "@/pages/dashboard/destinations";
import { SignIn, SignUp, ForgotPassword, ResetPassword, VerifyEmail } from "@/pages/auth";
import { CertificationsPublic, EvenementsPublic } from "@/pages/landing";

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
        icon: <ChartBarIcon {...icon} />,
        name: "vue d'ensemble",
        path: "/overview",
        element: <Overview />,
      },
      {
        icon: <SparklesIcon {...icon} />,
        name: "AISalhi",
        path: "/aisalhi",
        element: <AISalhiDashboard />,
      },
      {
        icon: <VideoCameraIcon {...icon} />,
        name: "Analyse Vidéo",
        path: "/video-analyzer",
        element: <VideoAnalyzer />,
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "profile",
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
        icon: <CheckBadgeIcon {...icon} />,
        name: "certifications",
        path: "/certifications",
        element: <Certifications />,
      },
      {
        icon: <CalendarDaysIcon {...icon} />,
        name: "événements",
        path: "/evenements",
        element: <Evenements />,
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "notifications",
        path: "/notifications",
        element: <Notifications />,
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
      {
        icon: <BuildingOfficeIcon {...icon} />,
        name: "Hébergements",
        path: "/hebergements",
        element: <Hebergements />,
      },
      {
        icon: <MapIcon {...icon} />,
        name: "Destinations",
        path: "/destinations",
        element: <Destinations />,
      },
      {
        icon: <TruckIcon {...icon} />,
        name: "Transport",
        path: "/transport",
        element: <Transport />,
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
  {
    title: "public pages",
    layout: "public",
    pages: [
      {
        icon: <CheckBadgeIcon {...icon} />,
        name: "certifications",
        path: "/certifications",
        element: <CertificationsPublic />,
      },
      {
        icon: <CalendarDaysIcon {...icon} />,
        name: "événements",
        path: "/evenements",
        element: <EvenementsPublic />,
      },
    ],
  },
];

export default routes;