import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Card,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Box,
} from "@mui/material";
import { collection, query, getDocs, where, doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

function formatDateTime(timestamp) {
  if (!timestamp) return "N/A";
  const dt = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return dt.toLocaleString();
}

export default function MyBookings({ user, onNavigate }) {
  const [tab, setTab] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [postedTrips, setPostedTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    if (!user) {
      setError("Please log in to view bookings.");
      setLoading(false);
      return;
    }

    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        // User bookings
        const bookingsRef = collection(db, "bookings");
        const q1 = query(bookingsRef, where("userId", "==", user.uid));
        const bookingSnap = await getDocs(q1);
        const nowBookings = [];
        for (const bDoc of bookingSnap.docs) {
          const bData = bDoc.data();
          const tripRef = doc(db, "trips", bData.tripId);
          const tripDoc = await getDoc(tripRef);
          if (tripDoc.exists()) {
            nowBookings.push({
              id: bDoc.id,
              booking: bData,
              trip: { id: tripDoc.id, ...tripDoc.data() },
            });
          }
        }
        setBookings(nowBookings);

        // User posted trips
        const tripsRef = collection(db, "trips");
        const q2 = query(tripsRef, where("uploaderId", "==", user.uid));
        const tripSnap = await getDocs(q2);
        setPostedTrips(tripSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        setError("Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  const getStatus = (trip) => {
    if (!trip.date) return "N/A";
    const dt = trip.date.toDate ? trip.date.toDate() : new Date(trip.date);
    return dt > new Date() ? "Active" : "Expired";
  };

  const cancelBooking = async (bookingId) => {
    if (!window.confirm("Cancel this booking?")) return;
    setCancelling(bookingId);
    try {
      await deleteDoc(doc(db, "bookings", bookingId));
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    } catch {
      alert("Failed to cancel booking.");
    } finally {
      setCancelling(null);
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        My Bookings & Posted Trips
      </Typography>

      <Tabs value={tab} onChange={(e, val) => setTab(val)} sx={{ mb: 2 }}>
        <Tab label="Bookings" />
        <Tab label="My Trips" />
      </Tabs>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : tab === 0 ? (
        bookings.length === 0 ? (
          <Typography>No bookings found.</Typography>
        ) : (
          bookings.map(({ id, booking, trip }) => (
            <Card key={id} sx={{ mb: 2, p: 2 }}>
              <Typography variant="h6">{trip.vehicleType}</Typography>
              <Typography>
                From: {trip.startLocation} → To: {trip.endLocation}
              </Typography>
              <Typography>Date: {formatDateTime(trip.date)}</Typography>
              <Typography>Seats Booked: {booking.bookingSeats}</Typography>
              <Typography>Booked On: {formatDateTime(booking.bookedAt)}</Typography>

              <Button
                variant="outlined"
                sx={{ mt: 1, mr: 1 }}
                onClick={() =>
                  onNavigate(`/chat/${trip.uploaderId}`, {
                    state: { user: { uid: trip.uploaderId, name: trip.uploaderName } },
                  })
                }
              >
                Chat with {trip.uploaderName || "Uploader"}
              </Button>

              <Button
                variant="contained"
                color="error"
                sx={{ mt: 1 }}
                onClick={() => cancelBooking(id)}
                disabled={cancelling === id}
              >
                {cancelling === id ? "Cancelling..." : "Cancel Booking"}
              </Button>
            </Card>
          ))
        )
      ) : postedTrips.length === 0 ? (
        <Typography>You have not posted any trips.</Typography>
      ) : (
        postedTrips.map((trip) => (
          <Card key={trip.id} sx={{ mb: 2, p: 2 }}>
            <Typography variant="h6">{trip.vehicleType}</Typography>
            <Typography>
              From: {trip.startLocation} → To: {trip.endLocation}
            </Typography>
            <Typography>Date: {formatDateTime(trip.date)}</Typography>
            <Typography>Seats: {trip.seatsAvailable}</Typography>
            <Typography>Status: {getStatus(trip)}</Typography>
          </Card>
        ))
      )}
    </Container>
  );
}
