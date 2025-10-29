// src/components/Notifications.jsx
import React from "react";
import {
  Alert,
  Typography,
} from "@material-tailwind/react";
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon 
} from "@heroicons/react/24/outline";

const iconMap = {
  green: <CheckCircleIcon className="h-6 w-6" />,
  red: <XCircleIcon className="h-6 w-6" />,
  orange: <ExclamationTriangleIcon className="h-6 w-6" />,
  blue: <InformationCircleIcon className="h-6 w-6" />,
};

export function Notifications({ alerts = [], onDismiss }) {
  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3 max-w-sm">
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          open={alert.open}
          color={alert.color}
          onClose={() => onDismiss(alert.id)}
          icon={iconMap[alert.color] || iconMap.blue}
          className="shadow-xl animate-slide-in-right"
          animate={{
            mount: { y: 0, opacity: 1 },
            unmount: { y: -100, opacity: 0 },
          }}
        >
          <Typography variant="small" className="font-medium">
            {alert.message}
          </Typography>
        </Alert>
      ))}
    </div>
  );
}

export default Notifications;