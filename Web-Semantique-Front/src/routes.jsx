import {
  HomeIcon,
  UserCircleIcon,
  UsersIcon,
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
        name: "dashboard",
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
        name: "users",
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
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        icon: null,
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
      },
      {
        icon: null,
        name: "sign up",
        path: "/sign-up",
        element: <SignUp />,
      },
      {
        icon: null,
        name: "forgot password",
        path: "/forgot-password",
        element: <ForgotPassword />,
      },
      {
        icon: null,
        name: "reset password",
        path: "/reset-password",
        element: <ResetPassword />,
      },
      {
        icon: null,
        name: "verify email",
        path: "/verify-email",
        element: <VerifyEmail />,
      },
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
