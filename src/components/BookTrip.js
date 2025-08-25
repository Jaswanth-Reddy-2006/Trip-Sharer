import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, addDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

export default function BookTrip({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [seats, setSeats] = useState("1");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError("");
    getDoc(doc(db, "trips", id))
      .then((docSnap) => {
        if (docSnap.exists()) {
          setTrip({ id: docSnap.id, ...docSnap.data() });
          setSeats("1");
        } else {
          setError("Trip not found");
        }
      })
      .catch(() => setError("Failed to load trip"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleBooking() {
    if (!user) {
      alert("Please login to book the trip.");
      return;
    }
    if (!trip) return;

    const seatCount = parseInt(seats);
    if (!seatCount || seatCount < 1 || seatCount > trip.seatsAvailable) {
      setError(`Please select between 1 and ${trip.seatsAvailable} seats.`);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await addDoc(collection(db, "bookings"), {
        tripId: trip.id,
        userId: user.uid,
        bookingSeats: seatCount,
        bookedAt: serverTimestamp(),
      });

      // Decrement available seats (optional)
      const tripRef = doc(db, "trips", trip.id);
      await updateDoc(tripRef, {
        seatsAvailable: trip.seatsAvailable - seatCount,
      });

      setSuccess("Booking successful!");
      setTimeout(() => navigate("/my-bookings"), 1500);
    } catch (e) {
      setError("Booking failed, please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading)
    return (
      <Container sx={{ textAlign: "center", mt: 4 }}>
        <CircularProgress />
        <Typography>Loading trip details...</Typography>
      </Container>
    );

  if (!trip)
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error || "Trip not found."}</Alert>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate("/trips")}>
          Back to Trips
        </Button>
      </Container>
    );

  const tripDate = trip.date
    ? trip.date.seconds
      ? new Date(trip.date.seconds * 1000)
      : new Date(trip.date)
    : null;

  return (
    <Container sx={{ maxWidth: 600, mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Book Trip
      </Typography>

      <Typography variant="h6">{trip.vehicleType || "Vehicle"}</Typography>
      <Typography>From: {trip.startLocation}</Typography>
      <Typography>To: {trip.endLocation}</Typography>
      <Typography>Date: {tripDate ? tripDate.toLocaleDateString() : "N/A"}</Typography>
      <Typography>Time: {tripDate ? tripDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "N/A"}</Typography>
      <Typography>Seats Available: {trip.seatsAvailable}</Typography>
      <Typography sx={{ my: 2 }}>{trip.description || "No description"}</Typography>

      <TextField
        label="Number of Seats"
        type="number"
        inputProps={{ min: 1, max: trip.seatsAvailable }}
        value={seats}
        onChange={(e) => setSeats(e.target.value)}
        fullWidth
      />

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {success}
        </Alert>
      )}

      <Button
        variant="contained"
        sx={{ mt: 3 }}
        onClick={handleBooking}
        disabled={submitting}
        fullWidth
      >
        {submitting ? "Booking..." : "Confirm Booking"}
      </Button>

      {success && (
        <Button
          variant="outlined"
          sx={{ mt: 2 }}
          onClick={() =>
            navigate(`/chat/${trip.uploaderId}`, {
              state: { user: { uid: trip.uploaderId, name: trip.uploaderName } },
            })
          }
          fullWidth
        >
          Chat with {trip.uploaderName || "Uploader"}
        </Button>
      )}

      <Button sx={{ mt: 2 }} onClick={() => navigate("/trips")}>
        Back to Trips
      </Button>
    </Container>
  );
}
