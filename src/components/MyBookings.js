import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection, query, where, getDocs, doc, getDoc, deleteDoc,
} from 'firebase/firestore';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Box,
  Button,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';

function formatDateTime(timestamp) {
  if (!timestamp) return 'N/A';
  const dateObj = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  return dateObj.toLocaleString();
}

export default function MyBookings({ user }) {
  const [tab, setTab] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [postedTrips, setPostedTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    if (!user) {
      setError('Please login to view your bookings.');
      setLoading(false);
      return;
    }

    async function fetchAll() {
      setLoading(true);
      setError('');
      try {
        // bookings made by user
        const bookingsRef = collection(db, 'bookings');
        const q1 = query(bookingsRef, where('userId', '==', user.uid));
        const snapshot = await getDocs(q1);
        const userBookings = [];
        for (const docSnap of snapshot.docs) {
          const bookingData = docSnap.data();
          const tripRef = doc(db, 'trips', bookingData.tripId);
          const tripSnap = await getDoc(tripRef);
          if (tripSnap.exists()) {
            userBookings.push({
              id: docSnap.id,
              bookedAt: bookingData.bookedAt?.toDate ? bookingData.bookedAt.toDate() : bookingData.bookedAt,
              bookingSeats: bookingData.bookingSeats,
              trip: { id: tripSnap.id, ...tripSnap.data() },
            });
          }
        }
        setBookings(userBookings);

        // trips posted by user
        const tripsRef = collection(db, 'trips');
        const q2 = query(tripsRef, where('uploaderId', '==', user.uid));
        const tripSnaps = await getDocs(q2);
        const myTrips = tripSnaps.docs.map(d => ({ id: d.id, ...d.data() }));
        setPostedTrips(myTrips);
      } catch (err) {
        setError('Failed to load bookings.');
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, [user]);

  const getTripStatus = (trip) => {
    if (!trip.date) return "N/A";
    const dateObj = trip.date?.toDate ? trip.date.toDate() : new Date(trip.date);
    return (dateObj > new Date()) ? "Active" : "Expired";
  };

  const cancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancelling(bookingId);
    try {
      await deleteDoc(doc(db, 'bookings', bookingId));
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    } catch (err) {
      alert('Failed to cancel booking. Please try again.');
    } finally {
      setCancelling(null);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        My Bookings & My Posted Trips
      </Typography>

      <Tabs value={tab} onChange={(_, val) => setTab(val)} sx={{ mb: 2 }} aria-label="booking trip tabs">
        <Tab label="My Bookings" />
        <Tab label="My Posted Trips" />
      </Tabs>

      {loading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={24} /> <Typography>Loading...</Typography>
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : tab === 0 ? (
        bookings.length === 0 ? (
          <Typography color="text.secondary">No bookings yet.</Typography>
        ) : (
          <Grid container spacing={2}>
            {bookings.map(({ id, bookingSeats, bookedAt, trip }) => (
              <Grid item xs={12} key={id}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6">{trip.vehicleType || "Unknown Vehicle"}</Typography>
                    <Typography color="text.secondary">
                      From: {trip.startLocation} → To: {trip.endLocation}
                    </Typography>
                    <Typography>Date: {formatDateTime(trip.date)}</Typography>
                    <Typography>Booked Seats: {bookingSeats}</Typography>
                    <Typography>Booked On: {formatDateTime(bookedAt)}</Typography>
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => cancelBooking(id)}
                        disabled={cancelling === id}
                      >
                        {cancelling === id ? 'Cancelling...' : 'Cancel Booking'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )
      ) : postedTrips.length === 0 ? (
        <Typography color="text.secondary">You have not posted any trips yet.</Typography>
      ) : (
        <Grid container spacing={2}>
          {postedTrips.map((trip) => (
            <Grid item xs={12} key={trip.id}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6">{trip.vehicleType || "Unknown Vehicle"}</Typography>
                  <Typography color="text.secondary">
                    From: {trip.startLocation} → To: {trip.endLocation}
                  </Typography>
                  <Typography>Date: {formatDateTime(trip.date)}</Typography>
                  <Typography>Vehicle No: {trip.vehicleNumber}</Typography>
                  <Typography>License No: {trip.licenseNumber}</Typography>
                  <Typography>Seats Available: {trip.seatsAvailable}</Typography>
                  <Typography>Description: {trip.description}</Typography>
                  <Typography>Status: {getTripStatus(trip)}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
