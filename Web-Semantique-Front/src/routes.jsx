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
} from "@heroicons/react/24/solid";
import { Home, Profile, Users, Notifications, Certifications, Evenements, Overview, AISalhiDashboard } from "@/pages/dashboard";
import { VideoAnalyzer } from "@/pages/dashboard/video-analyzer";
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