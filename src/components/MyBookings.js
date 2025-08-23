import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Box,
  Button,
} from '@mui/material';

export default function MyBookings({ user }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingBooking, setCancellingBooking] = useState(null);

  useEffect(() => {
    if (!user) {
      setError('Please login to view your bookings.');
      setLoading(false);
      return;
    }
    async function fetchBookings() {
      setLoading(true);
      setError('');
      try {
        const bookingsRef = collection(db, 'bookings');
        const q = query(bookingsRef, where('userId', '==', user.uid));
        const snapshot = await getDocs(q);

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
      } catch (err) {
        console.error(err);
        setError('Failed to load bookings.');
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, [user]);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  // Optional: Cancel booking function
  const cancelBooking = async (bookingId, trip) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancellingBooking(bookingId);
    try {
      await deleteDoc(doc(db, 'bookings', bookingId));
      // Update seatsAvailable in trip document
      const tripRef = doc(db, 'trips', trip.id);
      await getDoc(tripRef).then((tripSnap) => {
        if (tripSnap.exists()) {
          tripSnap.ref.update({
            seatsAvailable: (tripSnap.data().seatsAvailable || 0) + 1, // or bookedSeats count if stored
          });
        }
      });
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    } catch (err) {
      alert('Failed to cancel booking. Please try again.');
      console.error(err);
    } finally {
      setCancellingBooking(null);
    }
  };

  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 8 }}>
        <CircularProgress />
        <Typography mt={2}>Loading your bookings...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ textAlign: 'center', mt: 8 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  if (bookings.length === 0) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h6">You have no bookings yet.</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, maxWidth: 'lg' }}>
      <Typography variant="h4" gutterBottom>
        My Bookings
      </Typography>
      <Grid container spacing={4}>
        {bookings.map(({ id, bookingSeats, bookedAt, trip }) => (
          <Grid item xs={12} sm={6} md={4} key={id}>
            <Card sx={{ boxShadow: 3, position: 'relative' }}>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  {trip.vehicleType || 'Unknown Vehicle'}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  From {trip.startLocation || 'Unknown'} to {trip.endLocation || 'Unknown'}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Date: {formatDate(trip.date)}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Booked Seats: {bookingSeats}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Booked On: {bookedAt ? bookedAt.toLocaleDateString() : 'N/A'}
                </Typography>
              </CardContent>
              <Box sx={{ p: 2, pt: 0 }}>
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  onClick={() => cancelBooking(id, trip)}
                  disabled={cancellingBooking === id}
                >
                  {cancellingBooking === id ? 'Cancelling...' : 'Cancel Booking'}
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
