import React, { useState, useEffect } from "react";
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
  FormControl,
  Select,
  InputLabel,
  CircularProgress,
  Alert,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleIcon from "@mui/icons-material/People";

import { db } from "../firebase";
import { collection, query, getDocs } from "firebase/firestore";

import TripMap from "./TripMap";

const VEHICLE_TYPES = ["Bike", "Scooter", "Car"];

export default function Trips({ user, onNavigate, mapsLoaded, mapsError }) {
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [distances, setDistances] = useState({});

  const [searchPickup, setSearchPickup] = useState("");
  const [searchDrop, setSearchDrop] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterTime, setFilterTime] = useState("");
  const [filterVehicle, setFilterVehicle] = useState("");
  const [sortBy, setSortBy] = useState("soonest");

  const isMenuOpen = Boolean(menuAnchorEl);

  // Load trips once on mount
  useEffect(() => {
    async function loadTrips() {
      setLoading(true);
      setError("");
      try {
        const q = query(collection(db, "trips"));
        const snapshot = await getDocs(q);
        setTrips(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch {
        setError("Failed to load trips. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    loadTrips();
  }, []);

  // Filter, sort trips when dependencies change
  useEffect(() => {
    let data = [...trips];

    if (searchPickup.length > 1) {
      const lower = searchPickup.toLowerCase();
      data = data.filter(trip => trip.startLocation?.toLowerCase().includes(lower));
    }
    if (searchDrop.length > 1) {
      const lower = searchDrop.toLowerCase();
      data = data.filter(trip => trip.endLocation?.toLowerCase().includes(lower));
    }
    if (filterDate) {
      data = data.filter(trip => {
        if (!trip.date) return false;
        const dt = trip.date.seconds ? new Date(trip.date.seconds * 1000) : new Date(trip.date);
        return dt.toISOString().slice(0, 10) >= filterDate;
      });
    }
    if (filterTime && filterDate) {
      data = data.filter(trip => {
        if (!trip.date) return false;
        const dt = trip.date.seconds ? new Date(trip.date.seconds * 1000) : new Date(trip.date);
        return dt.toTimeString().slice(0, 5) >= filterTime;
      });
    }
    if (filterVehicle) {
      data = data.filter(trip => trip.vehicleType === filterVehicle);
    }

    data.sort((a, b) => {
      const toMinutes = dt => {
        if (!dt) return Number.MAX_SAFE_INTEGER;
        const dateObj = dt.seconds ? new Date(dt.seconds * 1000) : new Date(dt);
        return dateObj.getHours() * 60 + dateObj.getMinutes();
      };
      if (sortBy === "soonest") {
        const aTime = a.date ? (a.date.seconds ? a.date.seconds * 1000 : new Date(a.date).getTime()) : Number.MAX_SAFE_INTEGER;
        const bTime = b.date ? (b.date.seconds ? b.date.seconds * 1000 : new Date(b.date).getTime()) : Number.MAX_SAFE_INTEGER;
        return aTime - bTime;
      }
      if (sortBy === "timeAsc") return toMinutes(a.date) - toMinutes(b.date);
      if (sortBy === "seatsAsc") return (a.seatsAvailable ?? 0) - (b.seatsAvailable ?? 0);
      if (sortBy === "seatsDesc") return (b.seatsAvailable ?? 0) - (a.seatsAvailable ?? 0);
      return 0;
    });

    setFilteredTrips(data);
  }, [trips, searchPickup, searchDrop, filterDate, filterTime, filterVehicle, sortBy]);

  // Calculate distances on filtered trips when maps are loaded
  useEffect(() => {
    if (!mapsLoaded || filteredTrips.length === 0) {
      setDistances({});
      return;
    }
    if (!window.google || !window.google.maps) return;

    const service = new window.google.maps.DistanceMatrixService();
    const origins = filteredTrips.map(trip => trip.startLocation);
    const destinations = filteredTrips.map(trip => trip.endLocation);

    service.getDistanceMatrix(
      {
        origins,
        destinations,
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.METRIC,
      },
      (response, status) => {
        if (status !== "OK" || !response?.rows) {
          setDistances({});
          return;
        }
        const distanceMap = {};
        response.rows.forEach((row, i) => {
          const element = row.elements[i];
          distanceMap[filteredTrips[i].id] = element && element.status === "OK" ? element.distance.text : "N/A";
        });
        setDistances(distanceMap);
      }
    );
  }, [filteredTrips, mapsLoaded]);

  const formatDate = date => {
    if (!date) return "N/A";
    const dt = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    return dt.toLocaleDateString();
  };

  const formatTime = date => {
    if (!date) return "N/A";
    const dt = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    return dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Single declarations of handlers
  const openMenu = (event, trip) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedTrip(trip);
  };

  const closeMenu = () => {
    setMenuAnchorEl(null);
    setSelectedTrip(null);
  };

  const handleBook = () => {
    if (!user) {
      alert("Please login to book a trip.");
      return;
    }
    if (selectedTrip) {
      onNavigate(`/book-trip/${selectedTrip.id}`);
      closeMenu();
    }
  };

  const resetFilters = () => {
    setSearchPickup("");
    setSearchDrop("");
    setFilterDate("");
    setFilterTime("");
    setFilterVehicle("");
    setSortBy("soonest");
    setDistances({});
  };

  return (
    <Container maxWidth="lg" sx={{ pt: 4, pb: 8 }}>
      <Typography variant="h3" gutterBottom>
        Available Trips
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 4, display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
        <TextField
          label="Pickup Location"
          size="small"
          value={searchPickup}
          onChange={e => setSearchPickup(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><LocationOnIcon /></InputAdornment> }}
          sx={{ minWidth: 200 }}
        />
        <TextField
          label="Drop Location"
          size="small"
          value={searchDrop}
          onChange={e => setSearchDrop(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><LocationOnIcon sx={{ transform: "rotate(180deg)" }} /></InputAdornment> }}
          sx={{ minWidth: 200 }}
        />
        <TextField
          label="Date"
          size="small"
          type="date"
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 150 }}
        />
        <TextField
          label="Time"
          size="small"
          type="time"
          value={filterTime}
          onChange={e => setFilterTime(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 120 }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Vehicle Type</InputLabel>
          <Select
            value={filterVehicle}
            onChange={e => setFilterVehicle(e.target.value)}
            label="Vehicle Type"
            displayEmpty
          >
            <MenuItem value=""><em>All</em></MenuItem>
            {VEHICLE_TYPES.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Sort By</InputLabel>
          <Select value={sortBy} onChange={e => setSortBy(e.target.value)} label="Sort By">
            <MenuItem value="soonest">Date: Soonest</MenuItem>
            <MenuItem value="timeAsc">Time: Earliest</MenuItem>
            <MenuItem value="seatsAsc">Seats: Fewest</MenuItem>
            <MenuItem value="seatsDesc">Seats: Most</MenuItem>
          </Select>
        </FormControl>
        <Button variant="outlined" sx={{ minWidth: 150 }} onClick={resetFilters}>
          Reset Filters
        </Button>
      </Paper>

      {/* Error and Loading */}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {(!mapsLoaded && !error) && <Alert severity="info" sx={{ mb: 2 }}>Loading maps data...</Alert>}

      {/* Trips List */}
      {loading ? (
        <Box textAlign="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : filteredTrips.length === 0 ? (
        <Typography variant="h6" align="center" mt={4}>
          No trips available matching criteria.
        </Typography>
      ) : (
        <Grid container spacing={4}>
          {filteredTrips.map(trip => (
            <Grid item xs={12} md={6} lg={4} key={trip.id}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <DirectionsCarIcon color="primary" />
                    <Typography variant="h6">{trip.vehicleType || "Vehicle"}</Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <LocationOnIcon color="secondary" sx={{ verticalAlign: "middle" }} />
                    <Typography component="span" sx={{ ml: 0.5 }}>{trip.startLocation}</Typography>
                    <Typography component="span" sx={{ mx: 1 }}>→</Typography>
                    <LocationOnIcon color="primary" sx={{ verticalAlign: "middle", transform: "rotate(180deg)" }} />
                    <Typography component="span" sx={{ ml: 0.5 }}>{trip.endLocation}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <CalendarTodayIcon fontSize="small" color="action" />
                      <Typography sx={{ ml: 0.5 }}>{formatDate(trip.date)}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <AccessTimeIcon fontSize="small" color="action" />
                      <Typography sx={{ ml: 0.5 }}>{formatTime(trip.date)}</Typography>
                    </Box>
                  </Box>
                  <Typography sx={{ mb: 1 }}>
                    <strong>Distance:</strong> {mapsLoaded ? (distances[trip.id] ?? "Loading...") : "N/A"}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PeopleIcon fontSize="small" color="action" />
                    <Typography>{`Seats Left: ${trip.seatsAvailable ?? "N/A"}`}</Typography>
                  </Box>
                  <Typography sx={{ mt: 1, color: "text.secondary" }}>
                    {trip.description || "No description"}
                  </Typography>
                </CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ borderRadius: 2, textTransform: "none" }}
                    onClick={() => {
                      if (!user) {
                        alert("Please login to book a trip.");
                        return;
                      }
                      onNavigate(`/book-trip/${trip.id}`);
                    }}
                  >
                    Book
                  </Button>
                  <Tooltip title="More info">
                    <IconButton size="small" onClick={(e) => openMenu(e, trip)}>
                      <MoreVertIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Trip Details Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={isMenuOpen}
        onClose={closeMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {selectedTrip && (
          <>
            <MenuItem disabled><Typography variant="subtitle1" fontWeight="bold">Trip Details</Typography></MenuItem>
            <MenuItem>From: {selectedTrip.startLocation}</MenuItem>
            <MenuItem>To: {selectedTrip.endLocation}</MenuItem>
            <MenuItem>Date: {formatDate(selectedTrip.date)}</MenuItem>
            <MenuItem>Time: {formatTime(selectedTrip.date)}</MenuItem>
            <MenuItem>Vehicle: {selectedTrip.vehicleType}</MenuItem>
            <MenuItem>Seats Left: {selectedTrip.seatsAvailable}</MenuItem>
            <MenuItem>Description: {selectedTrip.description || "No description"}</MenuItem>
            <MenuItem>Vehicle Number: {selectedTrip.vehicleNumber}</MenuItem>
            <MenuItem>License Number: {selectedTrip.license}</MenuItem>
            <MenuItem>Uploaded by: {selectedTrip.uploaderName || "Unknown"}</MenuItem>
          </>
        )}
      </Menu>

      {/* Trip Route & Info Map */}
      {selectedTrip && mapsLoaded && (
        <Box mt={4}>
          <Typography variant="h5" gutterBottom>Trip Route & Info</Typography>
          <TripMap trip={selectedTrip} apiKey={mapsLoaded ? undefined : ""} />
        </Box>
      )}
    </Container>
  );
}
