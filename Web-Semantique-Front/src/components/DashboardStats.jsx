import React from 'react';
import {
  Card,
  CardBody,
  Typography,
  Chip,
} from "@material-tailwind/react";
import {
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/solid";

/**
 * Statistiques pour les Certifications et Événements
 */
export function DashboardStats({ certifications = [], evenements = [] }) {
  const stats = [
    {
      title: "Total Certifications",
      value: certifications.length,
      icon: CheckBadgeIcon,
      color: "green",
      description: "Certifications actives",
    },
    {
      title: "Total Événements",
      value: evenements.length,
      icon: CalendarIcon,
      color: "blue",
      description: "Événements planifiés",
    },
    {
      title: "Événements à venir",
      value: evenements.filter(e => new Date(e.event_date) > new Date()).length,
      icon: MapPinIcon,
      color: "orange",
      description: "Dans les prochains mois",
    },
    {
      title: "Récentes (2024+)",
      value: certifications.filter(c => parseInt(c.annee_obtention) >= 2024).length,
      icon: UserGroupIcon,
      color: "purple",
      description: "Certifications récentes",
    },
  ];

  return (
    <div className="mb-6 grid gap-y-6 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index} className="border border-blue-gray-100 shadow-sm">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <Typography
                  variant="small"
                  className="font-normal text-blue-gray-600"
                >
                  {stat.title}
                </Typography>
                <Typography variant="h4" color="blue-gray">
                  {stat.value}
                </Typography>
              </div>
              <div className={`rounded-full p-3 bg-${stat.color}-500/10`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-500`} />
              </div>
            </div>
            <Typography
              variant="small"
              className="mt-2 flex items-center gap-1 font-normal text-blue-gray-600"
            >
              {stat.description}
            </Typography>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

export default DashboardStats;
