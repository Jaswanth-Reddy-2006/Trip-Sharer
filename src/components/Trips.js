import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

export default function Trips({ onNavigate }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'trips'), orderBy('dateTime', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const tripsArray = [];
        querySnapshot.forEach((doc) => {
          tripsArray.push({ id: doc.id, ...doc.data() });
        });
        setTrips(tripsArray);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError('Failed to fetch trips: ' + err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading)
    return (
      <Box sx={{ textAlign: 'center', marginTop: 10 }}>
        <CircularProgress />
        <Typography>Loading trips...</Typography>
      </Box>
    );
  if (error)
    return (
      <Container sx={{ marginTop: 8 }}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={() => onNavigate('home')} variant="outlined" sx={{ mt: 2 }}>
          Back to Home
        </Button>
      </Container>
    );

  if (trips.length === 0)
    return (
      <Container sx={{ marginTop: 8, textAlign: 'center' }}>
        <Typography variant="h5" color="green" gutterBottom>
          No trips found
        </Typography>
        <Button onClick={() => onNavigate('create')} variant="contained" color="success" sx={{ mr: 2 }}>
          Post a Trip
        </Button>
        <Button onClick={() => onNavigate('home')} variant="outlined">
          Back to Home
        </Button>
      </Container>
    );

  return (
    <Container sx={{ marginTop: 8 }}>
      <Typography variant="h4" gutterBottom color="green">
        Available Trips
      </Typography>
      <Grid container spacing={3}>
        {trips.map((trip) => {
          const tripDate = trip.dateTime?.toDate();
          const formattedDate = tripDate ? tripDate.toLocaleDateString() : 'N/A';
          const formattedTime = tripDate ? tripDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';

          return (
            <Grid item key={trip.id} xs={12} sm={6} md={4}>
              <Card
                variant="outlined"
                sx={{
                  minHeight: 180,
                  boxShadow: 2,
                  transition: 'transform 0.3s',
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'scale(1.03)',
                  },
                }}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight="bold">
                    {trip.from} → {trip.to}
                  </Typography>
                  <Typography>Date: {formattedDate}</Typography>
                  <Typography>Time: {formattedTime}</Typography>
                  <Typography>Vehicle: {trip.vehicleType}</Typography>
                  {trip.vehicleType === 'Car' && <Typography>Seats Available: {trip.seats}</Typography>}
                </CardContent>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => alert(`Request to join trip coming soon!`)}
                    sx={{ fontWeight: 'bold' }}
                  >
                    Request to Join
                  </Button>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button onClick={() => onNavigate('home')} variant="outlined" sx={{ fontWeight: 'bold' }}>
          Back to Home
        </Button>
      </Box>
    </Container>
  );
}
