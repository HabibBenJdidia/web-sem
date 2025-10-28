import {
  HomeIcon,
  UserCircleIcon,
  UsersIcon,
  InformationCircleIcon,
  MapIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";
import { Home, Profile, Users, Notifications, ActivitiesAdmin, ZonesAdmin } from "@/pages/dashboard";
import { SignIn, SignUp, ForgotPassword, ResetPassword, VerifyEmail } from "@/pages/auth";

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
        icon: <InformationCircleIcon {...icon} />,
        name: "notifications",
        path: "/notifications",
        element: <Notifications />,
      },
      {
        icon: <SparklesIcon {...icon} />,
        name: "activities",
        path: "/activities",
        element: <ActivitiesAdmin />,
      },
      {
        icon: <MapIcon {...icon} />,
        name: "natural zones",
        path: "/zones",
        element: <ZonesAdmin />,
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
];

export default routes;
