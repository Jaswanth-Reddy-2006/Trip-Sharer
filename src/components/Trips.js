import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Typography,
  Button,
  CircularProgress,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
} from "@mui/material";
import { collection, query, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";

const VEHICLE_TYPES = ["Bike", "Scooter", "Car"];

export default function Trips({ user, onNavigate }) {
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchPickup, setSearchPickup] = useState("");
  const [searchDrop, setSearchDrop] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterTime, setFilterTime] = useState("");
  const [filterVehicle, setFilterVehicle] = useState("");
  const [sortBy, setSortBy] = useState("soonest");

  useEffect(() => {
    async function loadTrips() {
      setLoading(true);
      setError("");
      try {
        const q = query(collection(db, "trips"));
        const snapshot = await getDocs(q);
        setTrips(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch {
        setError("Failed to load trips. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    loadTrips();
  }, []);

  useEffect(() => {
    let data = [...trips];

    if (searchPickup.length > 1) {
      const lower = searchPickup.toLowerCase();
      data = data.filter((trip) =>
        trip.startLocation?.toLowerCase().includes(lower)
      );
    }

    if (searchDrop.length > 1) {
      const lower = searchDrop.toLowerCase();
      data = data.filter((trip) =>
        trip.endLocation?.toLowerCase().includes(lower)
      );
    }

    if (filterDate) {
      data = data.filter((trip) => {
        if (!trip.date) return false;
        const dt = trip.date.seconds
          ? new Date(trip.date.seconds * 1000)
          : new Date(trip.date);
        return dt.toISOString().slice(0, 10) >= filterDate;
      });
    }

    if (filterTime && filterDate) {
      data = data.filter((trip) => {
        if (!trip.date) return false;
        const dt = trip.date.seconds
          ? new Date(trip.date.seconds * 1000)
          : new Date(trip.date);
        return dt.toTimeString().slice(0, 5) >= filterTime;
      });
    }

    if (filterVehicle) {
      data = data.filter((trip) => trip.vehicleType === filterVehicle);
    }

    const toMinutes = (dt) => {
      if (!dt) return Number.MAX_SAFE_INTEGER;
      const dateObj = dt.seconds ? new Date(dt.seconds * 1000) : new Date(dt);
      return dateObj.getHours() * 60 + dateObj.getMinutes();
    };

    data.sort((a, b) => {
      if (sortBy === "soonest") {
        const aTime = a.date
          ? a.date.seconds
            ? a.date.seconds * 1000
            : new Date(a.date).getTime()
          : Number.MAX_SAFE_INTEGER;
        const bTime = b.date
          ? b.date.seconds
            ? b.date.seconds * 1000
            : new Date(b.date).getTime()
          : Number.MAX_SAFE_INTEGER;
        return aTime - bTime;
      }
      if (sortBy === "timeAsc") return toMinutes(a.date) - toMinutes(b.date);
      if (sortBy === "seatsAsc")
        return (a.seatsAvailable ?? 0) - (b.seatsAvailable ?? 0);
      if (sortBy === "seatsDesc")
        return (b.seatsAvailable ?? 0) - (a.seatsAvailable ?? 0);
      return 0;
    });

    setFilteredTrips(data);
  }, [
    trips,
    searchPickup,
    searchDrop,
    filterDate,
    filterTime,
    filterVehicle,
    sortBy,
  ]);

  const formatDate = (date) => {
    if (!date) return "N/A";
    const dt = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    return dt.toLocaleDateString();
  };

  const formatTime = (date) => {
    if (!date) return "N/A";
    const dt = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    return dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Available Trips
      </Typography>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
        <TextField
          label="Pickup"
          value={searchPickup}
          onChange={(e) => setSearchPickup(e.target.value)}
          sx={{ minWidth: 200 }}
          InputProps={{ startAdornment: <InputAdornment>📍</InputAdornment> }}
        />
        <TextField
          label="Drop"
          value={searchDrop}
          onChange={(e) => setSearchDrop(e.target.value)}
          sx={{ minWidth: 200 }}
          InputProps={{ startAdornment: <InputAdornment>⬇️</InputAdornment> }}
        />
        <TextField
          type="date"
          label="Date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 150 }}
        />
        <TextField
          type="time"
          label="Time"
          value={filterTime}
          onChange={(e) => setFilterTime(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 120 }}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Vehicle</InputLabel>
          <Select
            value={filterVehicle}
            onChange={(e) => setFilterVehicle(e.target.value)}
            displayEmpty
            label="Vehicle"
          >
            <MenuItem value="">All</MenuItem>
            {VEHICLE_TYPES.map((v) => (
              <MenuItem key={v} value={v}>
                {v}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            label="Sort By"
          >
            <MenuItem value="soonest">Date: Soonest</MenuItem>
            <MenuItem value="timeAsc">Time: Earliest</MenuItem>
            <MenuItem value="seatsAsc">Seats: Fewest</MenuItem>
            <MenuItem value="seatsDesc">Seats: Most</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : filteredTrips.length === 0 ? (
        <Typography>No matching trips found.</Typography>
      ) : (
        filteredTrips.map((trip) => (
          <Card key={trip.id} sx={{ mb: 2, p: 2 }}>
            <Typography variant="h6">{trip.vehicleType}</Typography>
            <Typography>
              From: {trip.startLocation} → To: {trip.endLocation}
            </Typography>
            <Typography>
              Date: {formatDate(trip.date)} • Time: {formatTime(trip.date)}
            </Typography>
            <Typography>Seats Left: {trip.seatsAvailable}</Typography>
            <Typography sx={{ mt: 1 }}>{trip.description || "No description"}</Typography>
            <Typography sx={{ mt: 1, fontStyle: "italic" }}>
              Posted by: {trip.uploaderName || "Unknown"}
            </Typography>

            <Button
              sx={{ mt: 2 }}
              variant="contained"
              onClick={() => {
                if (!user) {
                  alert("Please log in to book.");
                  return;
                }
                onNavigate(`/book-trip/${trip.id}`);
              }}
            >
              Book
            </Button>
          </Card>
        ))
      )}
    </Container>
  );
}
