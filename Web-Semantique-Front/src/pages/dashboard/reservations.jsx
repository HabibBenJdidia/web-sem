import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  IconButton,
  Tooltip,
} from "@material-tailwind/react";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CalendarIcon,
  UserIcon,
  BuildingStorefrontIcon,
  PhoneIcon,
  EnvelopeIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";
import api from "@/services/api";

export function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // all, en_attente, confirmee, annulee

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reservationsData, restaurantsData] = await Promise.all([
        api.getReservations(),
        api.getRestaurants(),
      ]);

      const parsedReservations = parseReservations(reservationsData);
      const parsedRestaurants = parseRestaurants(restaurantsData);

      setReservations(parsedReservations);
      setRestaurants(parsedRestaurants);
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Failed to load reservations");
    } finally {
      setLoading(false);
    }
  };

  const parseReservations = (data) => {
    if (!Array.isArray(data)) return [];
    
    const reservationsMap = {};
    data.forEach((item) => {
      const uri = item.s?.value || "";
      const predicate = item.p?.value || "";
      const object = item.o?.value || "";

      if (!reservationsMap[uri]) {
        reservationsMap[uri] = { uri };
      }

      if (predicate.includes("#reservePar")) {
        reservationsMap[uri].touriste = object;
      } else if (predicate.includes("#reservePour")) {
        reservationsMap[uri].restaurant = object;
      } else if (predicate.includes("#dateReservation")) {
        reservationsMap[uri].date_reservation = object;
      } else if (predicate.includes("#heureReservation")) {
        reservationsMap[uri].heure = object;
      } else if (predicate.includes("#nombrePersonnes")) {
        reservationsMap[uri].nombre_personnes = parseInt(object);
      } else if (predicate.includes("#statut")) {
        reservationsMap[uri].statut = object;
      } else if (predicate.includes("#telephone")) {
        reservationsMap[uri].telephone = object;
      } else if (predicate.includes("#email")) {
        reservationsMap[uri].email = object;
      } else if (predicate.includes("#notesSpeciales")) {
        reservationsMap[uri].notes_speciales = object;
      } else if (predicate.includes("#dateCreation")) {
        reservationsMap[uri].date_creation = object;
      }
    });

    return Object.values(reservationsMap).filter(r => r.statut);
  };

  const parseRestaurants = (data) => {
    if (!Array.isArray(data)) return [];
    
    const restaurantsMap = {};
    data.forEach((item) => {
      const uri = item.s?.value || "";
      const predicate = item.p?.value || "";
      const object = item.o?.value || "";

      if (!restaurantsMap[uri]) {
        restaurantsMap[uri] = { uri };
      }

      if (predicate.includes("#nom")) {
        restaurantsMap[uri].nom = object;
      }
    });

    return Object.values(restaurantsMap).filter(r => r.nom);
  };

  const getRestaurantName = (uri) => {
    const restaurant = restaurants.find(r => r.uri === uri);
    return restaurant?.nom || uri.split('#')[1] || uri;
  };

  const handleStatusChange = async (reservationUri, newStatus) => {
    try {
      setActionLoading(true);
      await api.updateReservationStatus(reservationUri, newStatus);
      
      // Update local state
      setReservations(reservations.map(r => 
        r.uri === reservationUri ? { ...r, statut: newStatus } : r
      ));
      
      if (selectedReservation?.uri === reservationUri) {
        setSelectedReservation({ ...selectedReservation, statut: newStatus });
      }
      
      alert(`Reservation ${newStatus === 'confirmee' ? 'confirmed' : 'cancelled'} successfully!`);
    } catch (error) {
      console.error("Error updating reservation status:", error);
      alert("Failed to update reservation status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = (reservation) => {
    setSelectedReservation(reservation);
    setDetailsDialog(true);
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case "confirmee":
        return "green";
      case "en_attente":
        return "amber";
      case "annulee":
        return "red";
      default:
        return "gray";
    }
  };

  const getStatusLabel = (statut) => {
    switch (statut) {
      case "confirmee":
        return "Confirmed";
      case "en_attente":
        return "Pending";
      case "annulee":
        return "Cancelled";
      default:
        return statut;
    }
  };

  const filteredReservations = reservations.filter(r => {
    if (filter === "all") return true;
    return r.statut === filter;
  });

  const stats = {
    total: reservations.length,
    pending: reservations.filter(r => r.statut === "en_attente").length,
    confirmed: reservations.filter(r => r.statut === "confirmee").length,
    cancelled: reservations.filter(r => r.statut === "annulee").length,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="purple" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Gestion des Réservations
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-6 mb-6">
            <Card className="border border-blue-gray-100">
              <CardBody className="p-4 text-center">
                <Typography variant="h4" color="blue-gray">
                  {stats.total}
                </Typography>
                <Typography variant="small" className="font-normal text-blue-gray-600">
                  Total Reservations
                </Typography>
              </CardBody>
            </Card>
            <Card className="border border-amber-100">
              <CardBody className="p-4 text-center">
                <Typography variant="h4" color="amber">
                  {stats.pending}
                </Typography>
                <Typography variant="small" className="font-normal text-blue-gray-600">
                  Pending
                </Typography>
              </CardBody>
            </Card>
            <Card className="border border-green-100">
              <CardBody className="p-4 text-center">
                <Typography variant="h4" color="green">
                  {stats.confirmed}
                </Typography>
                <Typography variant="small" className="font-normal text-blue-gray-600">
                  Confirmed
                </Typography>
              </CardBody>
            </Card>
            <Card className="border border-red-100">
              <CardBody className="p-4 text-center">
                <Typography variant="h4" color="red">
                  {stats.cancelled}
                </Typography>
                <Typography variant="small" className="font-normal text-blue-gray-600">
                  Cancelled
                </Typography>
              </CardBody>
            </Card>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 px-6 mb-4">
            <Button
              size="sm"
              color={filter === "all" ? "purple" : "blue-gray"}
              variant={filter === "all" ? "filled" : "outlined"}
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              size="sm"
              color={filter === "en_attente" ? "amber" : "blue-gray"}
              variant={filter === "en_attente" ? "filled" : "outlined"}
              onClick={() => setFilter("en_attente")}
            >
              Pending
            </Button>
            <Button
              size="sm"
              color={filter === "confirmee" ? "green" : "blue-gray"}
              variant={filter === "confirmee" ? "filled" : "outlined"}
              onClick={() => setFilter("confirmee")}
            >
              Confirmed
            </Button>
            <Button
              size="sm"
              color={filter === "annulee" ? "red" : "blue-gray"}
              variant={filter === "annulee" ? "filled" : "outlined"}
              onClick={() => setFilter("annulee")}
            >
              Cancelled
            </Button>
          </div>

          {/* Reservations Table */}
          {filteredReservations.length === 0 ? (
            <div className="text-center py-8">
              <Typography color="gray" className="font-normal">
                No reservations found
              </Typography>
            </div>
          ) : (
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {["Restaurant", "Date", "Time", "Guests", "Status", "Actions"].map((el) => (
                    <th
                      key={el}
                      className="border-b border-blue-gray-50 py-3 px-5 text-left"
                    >
                      <Typography
                        variant="small"
                        className="text-[11px] font-bold uppercase text-blue-gray-400"
                      >
                        {el}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map((reservation) => {
                  const className = "py-3 px-5 border-b border-blue-gray-50";

                  return (
                    <tr key={reservation.uri}>
                      <td className={className}>
                        <div className="flex items-center gap-3">
                          <BuildingStorefrontIcon className="h-5 w-5 text-blue-gray-400" />
                          <Typography variant="small" color="blue-gray" className="font-semibold">
                            {getRestaurantName(reservation.restaurant)}
                          </Typography>
                        </div>
                      </td>
                      <td className={className}>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-blue-gray-400" />
                          <Typography variant="small" className="font-normal text-blue-gray-600">
                            {reservation.date_reservation}
                          </Typography>
                        </div>
                      </td>
                      <td className={className}>
                        <div className="flex items-center gap-2">
                          <ClockIcon className="h-4 w-4 text-blue-gray-400" />
                          <Typography variant="small" className="font-normal text-blue-gray-600">
                            {reservation.heure}
                          </Typography>
                        </div>
                      </td>
                      <td className={className}>
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4 text-blue-gray-400" />
                          <Typography variant="small" className="font-semibold text-blue-gray-600">
                            {reservation.nombre_personnes}
                          </Typography>
                        </div>
                      </td>
                      <td className={className}>
                        <Chip
                          variant="gradient"
                          color={getStatusColor(reservation.statut)}
                          value={getStatusLabel(reservation.statut)}
                          className="py-0.5 px-2 text-[11px] font-medium"
                        />
                      </td>
                      <td className={className}>
                        <div className="flex gap-2">
                          <Tooltip content="View Details">
                            <IconButton
                              variant="text"
                              size="sm"
                              onClick={() => handleViewDetails(reservation)}
                            >
                              <InformationCircleIcon className="h-5 w-5" />
                            </IconButton>
                          </Tooltip>
                          {reservation.statut === "en_attente" && (
                            <>
                              <Tooltip content="Confirm">
                                <IconButton
                                  variant="text"
                                  color="green"
                                  size="sm"
                                  onClick={() => handleStatusChange(reservation.uri, "confirmee")}
                                  disabled={actionLoading}
                                >
                                  <CheckCircleIcon className="h-5 w-5" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip content="Cancel">
                                <IconButton
                                  variant="text"
                                  color="red"
                                  size="sm"
                                  onClick={() => handleStatusChange(reservation.uri, "annulee")}
                                  disabled={actionLoading}
                                >
                                  <XCircleIcon className="h-5 w-5" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsDialog} handler={() => setDetailsDialog(false)} size="md">
        <DialogHeader>Reservation Details</DialogHeader>
        <DialogBody divider className="space-y-4">
          {selectedReservation && (
            <>
              <div>
                <Typography variant="small" color="blue-gray" className="font-bold mb-1">
                  Restaurant
                </Typography>
                <Typography variant="small" color="gray">
                  {getRestaurantName(selectedReservation.restaurant)}
                </Typography>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Typography variant="small" color="blue-gray" className="font-bold mb-1">
                    Date
                  </Typography>
                  <Typography variant="small" color="gray">
                    {selectedReservation.date_reservation}
                  </Typography>
                </div>
                <div>
                  <Typography variant="small" color="blue-gray" className="font-bold mb-1">
                    Time
                  </Typography>
                  <Typography variant="small" color="gray">
                    {selectedReservation.heure}
                  </Typography>
                </div>
              </div>

              <div>
                <Typography variant="small" color="blue-gray" className="font-bold mb-1">
                  Number of Guests
                </Typography>
                <Typography variant="small" color="gray">
                  {selectedReservation.nombre_personnes} persons
                </Typography>
              </div>

              {selectedReservation.telephone && (
                <div>
                  <Typography variant="small" color="blue-gray" className="font-bold mb-1">
                    Phone
                  </Typography>
                  <Typography variant="small" color="gray">
                    {selectedReservation.telephone}
                  </Typography>
                </div>
              )}

              {selectedReservation.email && (
                <div>
                  <Typography variant="small" color="blue-gray" className="font-bold mb-1">
                    Email
                  </Typography>
                  <Typography variant="small" color="gray">
                    {selectedReservation.email}
                  </Typography>
                </div>
              )}

              {selectedReservation.notes_speciales && (
                <div>
                  <Typography variant="small" color="blue-gray" className="font-bold mb-1">
                    Special Requests
                  </Typography>
                  <Typography variant="small" color="gray">
                    {selectedReservation.notes_speciales}
                  </Typography>
                </div>
              )}

              <div>
                <Typography variant="small" color="blue-gray" className="font-bold mb-1">
                  Status
                </Typography>
                <Chip
                  variant="gradient"
                  color={getStatusColor(selectedReservation.statut)}
                  value={getStatusLabel(selectedReservation.statut)}
                  className="w-fit"
                />
              </div>
            </>
          )}
        </DialogBody>
        <DialogFooter className="space-x-2">
          <Button variant="text" onClick={() => setDetailsDialog(false)}>
            Close
          </Button>
          {selectedReservation?.statut === "en_attente" && (
            <>
              <Button
                color="green"
                onClick={() => {
                  handleStatusChange(selectedReservation.uri, "confirmee");
                  setDetailsDialog(false);
                }}
                disabled={actionLoading}
              >
                Confirm
              </Button>
              <Button
                color="red"
                onClick={() => {
                  handleStatusChange(selectedReservation.uri, "annulee");
                  setDetailsDialog(false);
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
            </>
          )}
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default Reservations;

