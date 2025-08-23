import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import { Container, Grid, Card, CardContent, Typography, IconButton, Menu, MenuItem, Box, Tooltip, Button } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

export default function Trips({ onNavigate, user }) {
  const [trips, setTrips] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);

  useEffect(() => {
    async function fetchTrips() {
      const tripsRef = collection(db, 'trips');
      const q = query(tripsRef);
      const snapshot = await getDocs(q);
      const data = [];
      snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
      setTrips(data);
    }
    fetchTrips();
  }, []);

  const handleMenuOpen = (event, trip) => {
    setAnchorEl(event.currentTarget);
    setSelectedTrip(trip);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTrip(null);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    if (date.seconds) return new Date(date.seconds * 1000).toLocaleDateString();
    if (typeof date === 'string' || date instanceof Date) return new Date(date).toLocaleDateString();
    return 'Invalid Date';
  };

  const formatTime = (date) => {
    if (!date) return 'N/A';
    if (date.seconds) return new Date(date.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (typeof date === 'string' || date instanceof Date) return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return 'Invalid Time';
  };

  return (
    <Container sx={{ mt: 4, maxWidth: 'lg' }}>
      <Typography variant="h4" gutterBottom color="primary" fontWeight="bold">
        Available Trips
      </Typography>
      <Grid container spacing={4}>
        {trips.map((trip) => (
          <Grid item xs={12} sm={6} md={4} key={trip.id}>
            <Card sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 4,
              borderRadius: 3,
              cursor: 'default',
              position: 'relative',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': { transform: 'scale(1.03)', boxShadow: 8 },
            }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold" color="primary">From: {trip.startLocation || 'Unknown'}</Typography>
                <Typography variant="subtitle1" fontWeight="bold" color="primary">To: {trip.endLocation || 'Unknown'}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Date: {formatDate(trip.date)}</Typography>
                <Typography variant="body2" color="text.secondary">Time: {formatTime(trip.date)}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Vehicle: {trip.vehicleType || 'Unknown'}</Typography>
              </CardContent>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, pb: 2 }}>
                <Tooltip title={trip.uploaderName ? `Uploaded by ${trip.uploaderName}` : 'Uploader Unknown'}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => {
                      if (user) onNavigate(`/book-trip/${trip.id}`);
                      else alert('Please log in to book this trip.');
                    }}
                    sx={{ borderRadius: '20px', textTransform: 'none' }}
                  >
                    Book
                  </Button>
                </Tooltip>
                <IconButton size="small" onClick={(e) => handleMenuOpen(e, trip)}><MoreVertIcon /></IconButton>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { maxWidth: 300 } }}>
        {selectedTrip && (
          <>
            <MenuItem disabled><Typography fontWeight="bold">Complete Trip Details</Typography></MenuItem>
            <MenuItem>From: {selectedTrip.startLocation || 'Unknown'}</MenuItem>
            <MenuItem>To: {selectedTrip.endLocation || 'Unknown'}</MenuItem>
            <MenuItem>Date: {formatDate(selectedTrip.date)}</MenuItem>
            <MenuItem>Time: {formatTime(selectedTrip.date)}</MenuItem>
            <MenuItem>Vehicle: {selectedTrip.vehicleType || 'Unknown'}</MenuItem>
            <MenuItem>Seats Available: {selectedTrip.seatsAvailable ?? 'N/A'}</MenuItem>
            <MenuItem>Description: {selectedTrip.description || 'No description'}</MenuItem>
            <MenuItem>Vehicle Number: {selectedTrip.vehicleNumber || 'N/A'}</MenuItem>
            <MenuItem>License Number: {selectedTrip.licenseNumber || 'N/A'}</MenuItem>
            <MenuItem>Uploaded by: {selectedTrip.uploaderName || 'Unknown'}</MenuItem>
          </>
        )}
      </Menu>
    </Container>
  );
}
