import {
  HomeIcon,
  UserCircleIcon,
  UsersIcon,
  InformationCircleIcon,
  BuildingStorefrontIcon,
  ShoppingBagIcon,
  MicrophoneIcon,
} from "@heroicons/react/24/solid";
import { Home, Profile, Users, Notifications, Restaurants, Produits } from "@/pages/dashboard";
import { SignIn, SignUp, ForgotPassword, ResetPassword, VerifyEmail } from "@/pages/auth";
import { AIBSilaPage } from "@/pages/AIBSilaPage";

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
        icon: <BuildingStorefrontIcon {...icon} />,
        name: "restaurants",
        path: "/restaurants",
        element: <Restaurants />,
      },
      {
        icon: <ShoppingBagIcon {...icon} />,
        name: "local products",
        path: "/produits",
        element: <Produits />,
      },
      {
        icon: <MicrophoneIcon {...icon} />,
        name: "AI BSila Assistant",
        path: "/ai-bsila",
        element: <AIBSilaPage />,
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
