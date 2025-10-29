import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import api from "@/services/api";
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
  Alert,
} from "@material-tailwind/react";
import {
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  PhoneIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/solid";

export function MyReservations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState(null);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth/sign-in");
      return;
    }
    fetchReservations();
  }, [user, navigate]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getTouristeReservations(user.uri);
      setReservations(data || []);
    } catch (err) {
      console.error("Error fetching reservations:", err);
      setError("Failed to load reservations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = (reservation) => {
    setReservationToCancel(reservation);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!reservationToCancel) return;

    try {
      setCanceling(true);
      await api.updateReservationStatus(reservationToCancel.uri, "annulee");
      
      // Update local state
      setReservations(reservations.map(r => 
        r.uri === reservationToCancel.uri 
          ? { ...r, statut: "annulee" } 
          : r
      ));
      
      setCancelDialogOpen(false);
      setReservationToCancel(null);
    } catch (err) {
      console.error("Error canceling reservation:", err);
      alert("Failed to cancel reservation. Please try again.");
    } finally {
      setCanceling(false);
    }
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

  const getStatusIcon = (statut) => {
    switch (statut) {
      case "confirmee":
        return <CheckCircleIcon className="h-4 w-4" />;
      case "en_attente":
        return <ExclamationCircleIcon className="h-4 w-4" />;
      case "annulee":
        return <XCircleIcon className="h-4 w-4" />;
      default:
        return null;
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isPastReservation = (date, time) => {
    if (!date || !time) return false;
    const reservationDateTime = new Date(`${date}T${time}`);
    return reservationDateTime < new Date();
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-28 pb-12">
        <div className="mb-8">
          <Typography variant="h2" color="blue-gray" className="mb-2">
            My Reservations
          </Typography>
          <Typography color="gray" className="font-normal">
            View and manage your restaurant reservations
          </Typography>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <Alert color="red" className="mb-6">
            {error}
          </Alert>
        ) : reservations.length === 0 ? (
          <Card className="text-center py-12">
            <CardBody>
              <CalendarIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <Typography variant="h5" color="blue-gray" className="mb-2">
                No Reservations Yet
              </Typography>
              <Typography color="gray" className="mb-6">
                You haven't made any restaurant reservations yet.
              </Typography>
              <Button
                onClick={() => navigate("/restaurants")}
                variant="gradient"
                color="purple"
              >
                Browse Restaurants
              </Button>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reservations.map((reservation) => (
              <Card key={reservation.uri} className="reservation-card">
                <CardHeader
                  floated={false}
                  className="h-48 bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center"
                >
                  <div className="text-center text-white">
                    <Typography variant="h4" color="white" className="mb-2">
                      {reservation.restaurant_nom || "Restaurant"}
                    </Typography>
                    <Chip
                      value={getStatusLabel(reservation.statut)}
                      color={getStatusColor(reservation.statut)}
                      icon={getStatusIcon(reservation.statut)}
                      className="mx-auto"
                    />
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-700">
                      <CalendarIcon className="h-5 w-5 text-purple-500" />
                      <Typography className="font-medium">
                        {formatDate(reservation.date_reservation)}
                      </Typography>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-700">
                      <ClockIcon className="h-5 w-5 text-purple-500" />
                      <Typography className="font-medium">
                        {reservation.heure || "N/A"}
                      </Typography>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-700">
                      <UserGroupIcon className="h-5 w-5 text-purple-500" />
                      <Typography className="font-medium">
                        {reservation.nombre_personnes} {reservation.nombre_personnes === 1 ? "Guest" : "Guests"}
                      </Typography>
                    </div>
                    
                    {reservation.telephone && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <PhoneIcon className="h-5 w-5 text-purple-500" />
                        <Typography className="font-medium">
                          {reservation.telephone}
                        </Typography>
                      </div>
                    )}
                    
                    {reservation.notes_speciales && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <Typography variant="small" className="text-gray-600 italic">
                          "{reservation.notes_speciales}"
                        </Typography>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 flex gap-2">
                    <Button
                      size="sm"
                      variant="outlined"
                      color="purple"
                      fullWidth
                      onClick={() => navigate(`/restaurants`)}
                    >
                      View Restaurant
                    </Button>
                    
                    {reservation.statut !== "annulee" && 
                     !isPastReservation(reservation.date_reservation, reservation.heure) && (
                      <Button
                        size="sm"
                        variant="gradient"
                        color="red"
                        fullWidth
                        onClick={() => handleCancelClick(reservation)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} handler={() => setCancelDialogOpen(false)}>
        <DialogHeader>Cancel Reservation?</DialogHeader>
        <DialogBody>
          <Typography>
            Are you sure you want to cancel your reservation at{" "}
            <strong>{reservationToCancel?.restaurant_nom}</strong> on{" "}
            <strong>{formatDate(reservationToCancel?.date_reservation)}</strong> at{" "}
            <strong>{reservationToCancel?.heure}</strong>?
          </Typography>
          <Typography className="mt-4 text-gray-600">
            This action cannot be undone.
          </Typography>
        </DialogBody>
        <DialogFooter className="gap-2">
          <Button
            variant="text"
            color="gray"
            onClick={() => setCancelDialogOpen(false)}
            disabled={canceling}
          >
            Keep Reservation
          </Button>
          <Button
            variant="gradient"
            color="red"
            onClick={handleConfirmCancel}
            disabled={canceling}
          >
            {canceling ? "Canceling..." : "Yes, Cancel"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}





