import { useState } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Input,
  Textarea,
  Typography,
  Alert,
} from "@material-tailwind/react";
import { CalendarIcon, ClockIcon, UserGroupIcon, PhoneIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";

export function ReservationDialog({ open, onClose, restaurant }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const [formData, setFormData] = useState({
    date_reservation: "",
    heure: "",
    nombre_personnes: 2,
    notes_speciales: "",
    telephone: "",
    email: user?.email || "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.date_reservation) {
      setError("Please select a date");
      return false;
    }
    if (!formData.heure) {
      setError("Please select a time");
      return false;
    }
    if (!formData.nombre_personnes || formData.nombre_personnes < 1) {
      setError("Please enter number of guests");
      return false;
    }
    if (!formData.telephone) {
      setError("Please enter your phone number");
      return false;
    }
    return true;
  };

  const checkAvailability = async () => {
    if (!formData.date_reservation || !formData.heure) {
      return;
    }

    setCheckingAvailability(true);
    try {
      const result = await api.checkAvailability(
        restaurant.uri,
        formData.date_reservation,
        formData.heure,
        user?.uri,
        formData.nombre_personnes
      );
      
      if (!result.available) {
        setError(result.message || "This time slot is not available. Please choose another time.");
      } else {
        setError(null);
      }
    } catch (err) {
      console.error("Error checking availability:", err);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!user) {
      setError("You must be logged in to make a reservation");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const reservationData = {
        touriste: user.uri,
        touriste_nom: user.nom,
        restaurant: restaurant.uri,
        date_reservation: formData.date_reservation,
        heure: formData.heure,
        nombre_personnes: parseInt(formData.nombre_personnes),
        notes_speciales: formData.notes_speciales,
        telephone: formData.telephone,
        email: formData.email,
      };

      await api.createReservation(reservationData);
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        // Reset form
        setFormData({
          date_reservation: "",
          heure: "",
          nombre_personnes: 2,
          notes_speciales: "",
          telephone: "",
          email: user?.email || "",
        });
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to create reservation. The time slot may already be booked.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setSuccess(false);
    onClose();
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={open} handler={handleClose} size="md">
      <DialogHeader className="flex items-center gap-2">
        <CalendarIcon className="h-6 w-6 text-green-600" />
        Book a Table at {restaurant?.nom}
      </DialogHeader>
      
      <form onSubmit={handleSubmit}>
        <DialogBody divider className="max-h-[70vh] overflow-y-auto">
          {error && (
            <Alert color="red" className="mb-4">
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert color="green" className="mb-4">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Reservation created successfully!
              </div>
            </Alert>
          )}

          <div className="flex flex-col gap-4">
            {/* Date */}
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Reservation Date *
              </Typography>
              <Input
                type="date"
                name="date_reservation"
                value={formData.date_reservation}
                onChange={handleInputChange}
                onBlur={checkAvailability}
                min={today}
                required
                size="lg"
              />
            </div>

            {/* Time */}
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium flex items-center gap-2">
                <ClockIcon className="h-4 w-4" />
                Time *
              </Typography>
              <select
                name="heure"
                value={formData.heure}
                onChange={handleInputChange}
                onBlur={checkAvailability}
                required
                className="w-full px-3 py-2.5 border border-blue-gray-200 rounded-lg focus:border-green-500 focus:outline-none text-sm"
              >
                <option value="">Select time</option>
                <option value="11:30">11:30 AM</option>
                <option value="12:00">12:00 PM</option>
                <option value="12:30">12:30 PM</option>
                <option value="13:00">1:00 PM</option>
                <option value="13:30">1:30 PM</option>
                <option value="14:00">2:00 PM</option>
                <option value="18:30">6:30 PM</option>
                <option value="19:00">7:00 PM</option>
                <option value="19:30">7:30 PM</option>
                <option value="20:00">8:00 PM</option>
                <option value="20:30">8:30 PM</option>
                <option value="21:00">9:00 PM</option>
              </select>
              {checkingAvailability && (
                <Typography variant="small" className="mt-1 text-blue-500">
                  Checking availability...
                </Typography>
              )}
            </div>

            {/* Number of guests */}
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium flex items-center gap-2">
                <UserGroupIcon className="h-4 w-4" />
                Number of Guests *
              </Typography>
              <Input
                type="number"
                name="nombre_personnes"
                value={formData.nombre_personnes}
                onChange={handleInputChange}
                min="1"
                max="20"
                required
                size="lg"
              />
            </div>

            {/* Phone */}
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium flex items-center gap-2">
                <PhoneIcon className="h-4 w-4" />
                Phone Number *
              </Typography>
              <Input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleInputChange}
                placeholder="+1 234 567 8900"
                required
                size="lg"
              />
            </div>

            {/* Email */}
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium flex items-center gap-2">
                <EnvelopeIcon className="h-4 w-4" />
                Email
              </Typography>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                size="lg"
              />
            </div>

            {/* Special Notes */}
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Special Requests (Optional)
              </Typography>
              <Textarea
                name="notes_speciales"
                value={formData.notes_speciales}
                onChange={handleInputChange}
                placeholder="Allergies, dietary restrictions, special occasions, etc."
                rows={3}
              />
            </div>

            <Typography variant="small" className="text-gray-600 italic">
              * Required fields
            </Typography>
          </div>
        </DialogBody>

        <DialogFooter className="gap-2">
          <Button
            variant="text"
            color="red"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="gradient"
            color="green"
            disabled={loading || checkingAvailability}
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              <>
                <CalendarIcon className="h-4 w-4" />
                Confirm Reservation
              </>
            )}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

ReservationDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  restaurant: PropTypes.shape({
    uri: PropTypes.string.isRequired,
    nom: PropTypes.string.isRequired,
  }),
};

export default ReservationDialog;

