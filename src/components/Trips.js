import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Tooltip,
  Button,
  TextField,
  InputAdornment,
  Paper,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOn from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';

import { db } from '../firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import TripMap from './TripMap';

export default function Trips({ onNavigate, user }) {
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [distances, setDistances] = useState({});

  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);

  const [searchStart, setSearchStart] = useState('');
  const [searchEnd, setSearchEnd] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterTime, setFilterTime] = useState('');
  const [filterVehicleType, setFilterVehicleType] = useState('');
  const [sortBy, setSortBy] = useState('soonest');

  const vehicleTypes = ['Bike', 'Scooter', 'Car'];

  const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const isMenuOpen = Boolean(menuAnchorEl);

  // Fetch trips once on mount
  useEffect(() => {
    async function fetchTrips() {
      const tripsCollection = collection(db, 'trips');
      const q = query(tripsCollection);
      const snapshot = await getDocs(q);
      const data = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      setTrips(data);
    }
    fetchTrips();
  }, []);

  // Filter and sort trips on dependencies change
  useEffect(() => {
    let result = [...trips];

    if (searchStart.length > 1) {
      const lower = searchStart.toLowerCase().trim();
      result = result.filter(t => t.startLocation && t.startLocation.toLowerCase().includes(lower));
    }

    if (searchEnd.length > 1) {
      const lower = searchEnd.toLowerCase().trim();
      result = result.filter(t => t.endLocation && t.endLocation.toLowerCase().includes(lower));
    }

    if (filterDate) {
      result = result.filter(t => {
        if (!t.date) return false;
        const d = t.date.seconds ? new Date(t.date.seconds * 1000) : new Date(t.date);
        return d.toISOString().slice(0, 10) >= filterDate;
      });
    }

    if (filterTime && filterDate) {
      result = result.filter(t => {
        if (!t.date) return false;
        const d = t.date.seconds ? new Date(t.date.seconds * 1000) : new Date(t.date);
        return d.toTimeString().slice(0, 5) >= filterTime;
      });
    }

    if (filterVehicleType) {
      result = result.filter(t => t.vehicleType === filterVehicleType);
    }

    result.sort((a, b) => {
      if (sortBy === 'soonest') {
        const aTime = a.date ? (a.date.seconds ?? new Date(a.date).getTime()) : Number.MAX_SAFE_INTEGER;
        const bTime = b.date ? (b.date.seconds ?? new Date(b.date).getTime()) : Number.MAX_SAFE_INTEGER;
        return aTime - bTime;
      }
      if (sortBy === 'timeAsc') {
        return toMinutes(a.date) - toMinutes(b.date);
      }
      if (sortBy === 'seatsAsc') {
        return (a.seatsAvailable ?? Number.MAX_SAFE_INTEGER) - (b.seatsAvailable ?? Number.MAX_SAFE_INTEGER);
      }
      if (sortBy === 'seatsDesc') {
        return (b.seatsAvailable ?? 0) - (a.seatsAvailable ?? 0);
      }
      return 0;
    });

    setFilteredTrips(result);
  }, [trips, searchStart, searchEnd, filterDate, filterTime, filterVehicleType, sortBy]);

  // Convert date/time to minutes after midnight for sorting
  function toMinutes(date) {
    if (!date) return Number.MAX_SAFE_INTEGER;
    const d = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    return d.getHours() * 60 + d.getMinutes();
  }

  // Fetch distances using Google Distance Matrix API when filteredTrips change
  useEffect(() => {
    if (!googleMapsApiKey) return;
    if (filteredTrips.length === 0) {
      setDistances({});
      return;
    }
    if (!(window.google && window.google.maps)) return;

    const service = new window.google.maps.DistanceMatrixService();
    const origins = filteredTrips.map(t => t.startLocation);
    const destinations = filteredTrips.map(t => t.endLocation);

    service.getDistanceMatrix(
      {
        origins,
        destinations,
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.METRIC,
      },
      (response, status) => {
        if (status === 'OK') {
          const newDistances = {};
          response.rows.forEach((row, i) => {
            const element = row.elements[i];
            if (element.status === 'OK') {
              newDistances[filteredTrips[i].id] = element.distance.text;
            }
          });
          setDistances(newDistances);
        }
      }
    );
  }, [filteredTrips, googleMapsApiKey]);

  function formatDate(date) {
    if (!date) return 'N/A';
    if (date.seconds) return new Date(date.seconds * 1000).toLocaleDateString();
    if (typeof date === 'string' || date instanceof Date) return new Date(date).toLocaleDateString();
    return 'Invalid date';
  }

  function formatTime(date) {
    if (!date) return 'N/A';
    if (date.seconds) return new Date(date.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (typeof date === 'string' || date instanceof Date) return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return 'Invalid time';
  }

  function handleMenuOpen(event, trip) {
    setMenuAnchorEl(event.currentTarget);
    setSelectedTrip(trip);
  }

  function handleMenuClose() {
    setMenuAnchorEl(null);
    setSelectedTrip(null);
  }

  return (
    <Container sx={{ my: 4 }}>
      <Typography variant="h4" color="primary" fontWeight="bold" gutterBottom>
        Available Trips
      </Typography>

      <Paper sx={{ p: 2, mb: 4, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }} elevation={3}>
        <TextField
          size="small"
          label="Pickup Location"
          value={searchStart}
          onChange={e => setSearchStart(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><LocationOn /></InputAdornment> }}
          sx={{ minWidth: 180 }}
        />
        <TextField
          size="small"
          label="Drop Location"
          value={searchEnd}
          onChange={e => setSearchEnd(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><LocationOn sx={{ transform: 'rotate(180deg)' }} /></InputAdornment> }}
          sx={{ minWidth: 180 }}
        />
        <TextField
          size="small"
          label="Date"
          type="date"
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 150 }}
        />
        <TextField
          size="small"
          label="Time"
          type="time"
          value={filterTime}
          onChange={e => setFilterTime(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 120 }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Vehicle Type</InputLabel>
          <Select
            value={filterVehicleType}
            onChange={e => setFilterVehicleType(e.target.value)}
            displayEmpty
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            {vehicleTypes.map(type => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            label="Sort By"
          >
            <MenuItem value="soonest">Date: Soonest First</MenuItem>
            <MenuItem value="timeAsc">Time: Earliest First</MenuItem>
            <MenuItem value="seatsAsc">Seats: Low to High</MenuItem>
            <MenuItem value="seatsDesc">Seats: High to Low</MenuItem>
          </Select>
        </FormControl>
        <Button
          sx={{ minWidth: 120 }}
          onClick={() => {
            setSearchStart('');
            setSearchEnd('');
            setFilterDate('');
            setFilterTime('');
            setFilterVehicleType('');
            setSortBy('soonest');
            setDistances({});
          }}
        >
          Reset Filters
        </Button>
      </Paper>

      <Grid container spacing={4}>
        {filteredTrips.length === 0 ? (
          <Typography variant="subtitle1" color="textSecondary" sx={{ mx: 'auto' }}>
            No trips found matching filters.
          </Typography>
        ) : (
          filteredTrips.map(trip => (
            <Grid key={trip.id} item xs={12} sm={6} md={4}>
              <Card sx={{ borderRadius: 3, boxShadow: 6, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <DirectionsCarIcon color="primary" />
                    <Typography variant="subtitle1" fontWeight="bold">{trip.vehicleType || 'Vehicle'}</Typography>
                  </Box>
                  <Typography sx={{ mb: 1 }}>
                    <LocationOn color="secondary" sx={{ verticalAlign: 'middle' }} /> {trip.startLocation} &rarr;{' '}
                    <LocationOn color="primary" sx={{ verticalAlign: 'middle', transform: 'rotate(180deg)' }} /> {trip.endLocation}
                  </Typography>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <CalendarMonthIcon sx={{ mr: 0.5 }} /> {formatDate(trip.date)}
                  </Typography>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <AccessTimeIcon sx={{ mr: 0.5 }} /> {formatTime(trip.date)}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <b>Distance:</b> {distances[trip.id] ?? 'Loading...'}
                  </Typography>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                    <PeopleIcon sx={{ mr: 0.5 }} /> Seats: {trip.seatsAvailable ?? 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    {trip.description || 'No description'}
                  </Typography>
                </CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, pb: 2 }}>
                  <Tooltip title={trip.uploaderName ? `Uploaded by ${trip.uploaderName}` : 'Uploader unknown'}>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => {
                        if (user) onNavigate(`/book-trip/${trip.id}`);
                        else alert('Please login to book.');
                      }}
                      sx={{ borderRadius: 2, textTransform: 'none' }}
                    >
                      Book
                    </Button>
                  </Tooltip>
                  <IconButton size="small" onClick={e => handleMenuOpen(e, trip)}>
                    <MoreVertIcon />
                  </IconButton>
                </Box>

                <Menu
                  anchorEl={menuAnchorEl}
                  open={isMenuOpen && selectedTrip?.id === trip.id}
                  onClose={handleMenuClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  {selectedTrip && (
                    <>
                      <MenuItem disabled><Typography fontWeight="bold">Trip Details</Typography></MenuItem>
                      <MenuItem>From: {selectedTrip.startLocation}</MenuItem>
                      <MenuItem>To: {selectedTrip.endLocation}</MenuItem>
                      <MenuItem>Date: {selectedTrip.date ? formatDate(selectedTrip.date) : 'N/A'}</MenuItem>
                      <MenuItem>Time: {selectedTrip.date ? formatTime(selectedTrip.date) : 'N/A'}</MenuItem>
                      <MenuItem>Vehicle: {selectedTrip.vehicleType}</MenuItem>
                      <MenuItem>Seats: {selectedTrip.seatsAvailable}</MenuItem>
                      <MenuItem>Description: {selectedTrip.description || 'No description'}</MenuItem>
                      <MenuItem>Vehicle Number: {selectedTrip.vehicleNumber}</MenuItem>
                      <MenuItem>License#: {selectedTrip.license}</MenuItem>
                      <MenuItem>Uploaded by: {selectedTrip.uploaderName || 'Unknown'}</MenuItem>
                    </>
                  )}
                </Menu>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Show TripMap on selected trip */}
      {selectedTrip && googleMapsApiKey && (
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>Trip Route & Info</Typography>
          <TripMap trip={selectedTrip} apiKey={googleMapsApiKey} />
        </Box>
      )}
    </Container>
  );

  function handleMenuOpen(event, trip) {
    setMenuAnchorEl(event.currentTarget);
    setSelectedTrip(trip);
  }

  function handleMenuClose() {
    setMenuAnchorEl(null);
    setSelectedTrip(null);
  }
}
