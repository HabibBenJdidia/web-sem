import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
  Chip,
  Spinner,
} from "@material-tailwind/react";
import {
  CheckBadgeIcon,
  CalendarDaysIcon,
  ChartBarIcon,
} from "@heroicons/react/24/solid";
import api from "@/services/api";
import { DashboardStats } from "@/components/DashboardStats";

export function Overview() {
  const [certifications, setCertifications] = useState([]);
  const [evenements, setEvenements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [certsData, eventsData] = await Promise.all([
        api.getCertifications(),
        api.getEvenements(),
      ]);
      setCertifications(Array.isArray(certsData) ? certsData : []);
      setEvenements(Array.isArray(eventsData) ? eventsData : []);
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const upcomingEvents = evenements
    .filter(e => new Date(e.event_date) > new Date())
    .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
    .slice(0, 5);

  const recentCertifications = certifications
    .sort((a, b) => parseInt(b.annee_obtention) - parseInt(a.annee_obtention))
    .slice(0, 5);

  return (
    <div className="mt-12">
      <div className="mb-6">
        <Typography variant="h4" color="blue-gray" className="mb-2">
          Vue d'ensemble - Écologie
        </Typography>
        <Typography color="gray" className="font-normal">
          Statistiques des certifications et événements écologiques
        </Typography>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner className="h-12 w-12" color="blue" />
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          <DashboardStats 
            certifications={certifications} 
            evenements={evenements} 
          />

          {/* Tabs Section */}
          <Card className="mt-6">
            <CardBody>
              <Tabs value="events">
                <TabsHeader>
                  <Tab value="events">
                    <div className="flex items-center gap-2">
                      <CalendarDaysIcon className="h-5 w-5" />
                      Événements à venir
                    </div>
                  </Tab>
                  <Tab value="certs">
                    <div className="flex items-center gap-2">
                      <CheckBadgeIcon className="h-5 w-5" />
                      Certifications récentes
                    </div>
                  </Tab>
                  <Tab value="analytics">
                    <div className="flex items-center gap-2">
                      <ChartBarIcon className="h-5 w-5" />
                      Analyses
                    </div>
                  </Tab>
                </TabsHeader>
                <TabsBody>
                  {/* Upcoming Events Tab */}
                  <TabPanel value="events">
                    <div className="space-y-4">
                      {upcomingEvents.length === 0 ? (
                        <Typography color="gray" className="text-center py-8">
                          Aucun événement à venir
                        </Typography>
                      ) : (
                        upcomingEvents.map((event) => (
                          <div
                            key={event.id}
                            className="flex items-center justify-between border-b border-blue-gray-50 pb-4"
                          >
                            <div className="flex items-center gap-4">
                              <div className="rounded-lg bg-blue-500/10 p-3">
                                <CalendarDaysIcon className="h-6 w-6 text-blue-500" />
                              </div>
                              <div>
                                <Typography variant="h6" color="blue-gray">
                                  {event.nom}
                                </Typography>
                                <Typography variant="small" color="gray">
                                  {formatDate(event.event_date)} • {event.event_duree_heures}h
                                </Typography>
                              </div>
                            </div>
                            <Chip
                              value={`${event.event_prix}€`}
                              color="blue"
                              size="sm"
                            />
                          </div>
                        ))
                      )}
                    </div>
                  </TabPanel>

                  {/* Recent Certifications Tab */}
                  <TabPanel value="certs">
                    <div className="space-y-4">
                      {recentCertifications.length === 0 ? (
                        <Typography color="gray" className="text-center py-8">
                          Aucune certification disponible
                        </Typography>
                      ) : (
                        recentCertifications.map((cert) => (
                          <div
                            key={cert.id}
                            className="flex items-center justify-between border-b border-blue-gray-50 pb-4"
                          >
                            <div className="flex items-center gap-4">
                              <div className="rounded-lg bg-green-500/10 p-3">
                                <CheckBadgeIcon className="h-6 w-6 text-green-500" />
                              </div>
                              <div>
                                <Typography variant="h6" color="blue-gray">
                                  {cert.label_nom}
                                </Typography>
                                <Typography variant="small" color="gray">
                                  {cert.organisme}
                                </Typography>
                              </div>
                            </div>
                            <Chip
                              value={cert.annee_obtention}
                              color="green"
                              size="sm"
                            />
                          </div>
                        ))
                      )}
                    </div>
                  </TabPanel>

                  {/* Analytics Tab */}
                  <TabPanel value="analytics">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Certifications par organisme */}
                      <Card className="border border-blue-gray-100">
                        <CardBody>
                          <Typography variant="h6" color="blue-gray" className="mb-4">
                            Top Organismes
                          </Typography>
                          {(() => {
                            const organismeCounts = certifications.reduce((acc, cert) => {
                              acc[cert.organisme] = (acc[cert.organisme] || 0) + 1;
                              return acc;
                            }, {});
                            const topOrganismes = Object.entries(organismeCounts)
                              .sort((a, b) => b[1] - a[1])
                              .slice(0, 5);

                            return topOrganismes.length === 0 ? (
                              <Typography color="gray" className="text-center py-4">
                                Aucune donnée
                              </Typography>
                            ) : (
                              <div className="space-y-3">
                                {topOrganismes.map(([organisme, count], index) => (
                                  <div key={index} className="flex items-center justify-between">
                                    <Typography variant="small" color="blue-gray">
                                      {organisme}
                                    </Typography>
                                    <Chip value={count} size="sm" color="blue-gray" />
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </CardBody>
                      </Card>

                      {/* Événements par prix */}
                      <Card className="border border-blue-gray-100">
                        <CardBody>
                          <Typography variant="h6" color="blue-gray" className="mb-4">
                            Statistiques Prix
                          </Typography>
                          {(() => {
                            const prices = evenements.map(e => parseFloat(e.event_prix) || 0);
                            const avgPrice = prices.length > 0
                              ? (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2)
                              : 0;
                            const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
                            const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

                            return (
                              <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                  <Typography variant="small" color="gray">
                                    Prix Moyen
                                  </Typography>
                                  <Typography variant="h6" color="blue-gray">
                                    {avgPrice}€
                                  </Typography>
                                </div>
                                <div className="flex justify-between items-center">
                                  <Typography variant="small" color="gray">
                                    Prix Min
                                  </Typography>
                                  <Typography variant="h6" color="green">
                                    {minPrice}€
                                  </Typography>
                                </div>
                                <div className="flex justify-between items-center">
                                  <Typography variant="small" color="gray">
                                    Prix Max
                                  </Typography>
                                  <Typography variant="h6" color="orange">
                                    {maxPrice}€
                                  </Typography>
                                </div>
                              </div>
                            );
                          })()}
                        </CardBody>
                      </Card>
                    </div>
                  </TabPanel>
                </TabsBody>
              </Tabs>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}

export default Overview;
