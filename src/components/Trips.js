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
  CardContent,
  Chip,
  Grid,
  Paper,
  Stack,
  Avatar,
  Divider,
  Fade,
  Skeleton,
  IconButton,
  Tooltip,
  Badge,
  alpha,
  useTheme
} from "@mui/material";
import {
  DirectionsCar,
  TwoWheeler,
  Person,
  Schedule,
  LocationOn,
  Search as SearchIcon,
  FilterList,
  Sort,
  Clear,
  Refresh,
  Chat,
  Phone,
  Star,
  Verified,
  AccessTime,
  CalendarToday,
  Route,
  AccountCircle
} from "@mui/icons-material";
import {
  collection,
  query,
  getDocs,
  doc,
  getDoc,
  where,
  orderBy,
  limit
} from "firebase/firestore";
import { db, auth } from "../firebase";

const VEHICLE_TYPES = ["Car", "Bike", "Scooter"];
const SORT_OPTIONS = [
  { value: "soonest", label: "Date: Soonest", icon: <Schedule /> },
  { value: "timeAsc", label: "Time: Earliest", icon: <AccessTime /> },
  { value: "seatsDesc", label: "Seats: Most Available", icon: <Person /> },
  { value: "seatsAsc", label: "Seats: Least Available", icon: <Person /> },
  { value: "newest", label: "Recently Added", icon: <Schedule /> }
];

export default function Trips({ user, onNavigate }) {
  const theme = useTheme();
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userProfile, setUserProfile] = useState(null);

  // Filter states
  const [searchPickup, setSearchPickup] = useState("");
  const [searchDrop, setSearchDrop] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterTime, setFilterTime] = useState("");
  const [filterVehicle, setFilterVehicle] = useState("");
  const [sortBy, setSortBy] = useState("soonest");

  // UI states
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Check authentication and profile on mount
  useEffect(() => {
    if (!user) {
      onNavigate("/auth");
      return;
    }

    async function checkProfile() {
      try {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        if (!docSnap.exists() || !docSnap.data().profileComplete) {
          onNavigate("/complete-profile");
          return;
        }
        setUserProfile(docSnap.data());
      } catch (error) {
        console.error("Error checking profile:", error);
        setError("Failed to load user profile");
      }
    }
    checkProfile();
  }, [user, onNavigate]);

  // Load trips
  useEffect(() => {
    async function loadTrips() {
      if (!user || !userProfile) return;
      setLoading(true);
      setError("");
      try {
        // Get all active trips
        const tripsRef = collection(db, "trips");
        const q = query(tripsRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const allTrips = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));

        // Get all bookings to calculate available seats
        const bookingsRef = collection(db, "bookings");
        const bookingsSnapshot = await getDocs(bookingsRef);
        const allBookings = bookingsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Process trips to show only available ones
        const availableTrips = allTrips.filter(trip => {
          // Only show future trips
          let tripDate;
          if (trip.date?.seconds) {
            tripDate = new Date(trip.date.seconds * 1000);
          } else if (trip.date) {
            tripDate = new Date(trip.date);
          } else {
            return false;
          }
          if (tripDate <= new Date()) return false;

          // Don't show user's own trips
          if (trip.uploaderId === user.uid) return false;

          // For cars, check if seats are available (considering cancellations)
          if (trip.vehicleType === "Car" && trip.seatsAvailable) {
            const tripBookings = allBookings.filter(booking =>
              booking.tripId === trip.id &&
              booking.status !== 'cancelled' // Only count non-cancelled bookings
            );
            const bookedSeats = tripBookings.reduce((sum, booking) =>
              sum + (booking.bookingSeats || 0), 0
            );
            const availableSeats = trip.seatsAvailable - bookedSeats;
            // Update trip with current available seats
            trip.currentAvailableSeats = Math.max(0, availableSeats);
            return availableSeats > 0;
          }

          // Show all bike/scooter trips (no seat limitation)
          return true;
        });

        setTrips(availableTrips);
      } catch (error) {
        console.error("Error loading trips:", error);
        setError("Failed to load trips. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    loadTrips();
  }, [user, userProfile]);

  // Apply filters and sorting
  useEffect(() => {
    let data = [...trips];

    // Search filters
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

    // Date filter
    if (filterDate) {
      data = data.filter((trip) => {
        if (!trip.date) return false;
        const dt = trip.date.seconds
          ? new Date(trip.date.seconds * 1000)
          : new Date(trip.date);
        return dt.toISOString().slice(0, 10) >= filterDate;
      });
    }

    // Time filter (only works with date filter)
    if (filterTime && filterDate) {
      data = data.filter((trip) => {
        if (!trip.date) return false;
        const dt = trip.date.seconds
          ? new Date(trip.date.seconds * 1000)
          : new Date(trip.date);
        return dt.toTimeString().slice(0, 5) >= filterTime;
      });
    }

    // Vehicle filter
    if (filterVehicle) {
      data = data.filter((trip) => trip.vehicleType === filterVehicle);
    }

    // Sorting
    data.sort((a, b) => {
      switch (sortBy) {
        case "soonest":
          const aTime = a.date?.seconds ? a.date.seconds * 1000 : new Date(a.date || 0).getTime();
          const bTime = b.date?.seconds ? b.date.seconds * 1000 : new Date(b.date || 0).getTime();
          return aTime - bTime;
        case "timeAsc":
          const aMinutes = getMinutes(a.date);
          const bMinutes = getMinutes(b.date);
          return aMinutes - bMinutes;
        case "seatsDesc":
          return (b.currentAvailableSeats || 0) - (a.currentAvailableSeats || 0);
        case "seatsAsc":
          return (a.currentAvailableSeats || 0) - (b.currentAvailableSeats || 0);
        case "newest":
          const aCreated = a.createdAt?.seconds || 0;
          const bCreated = b.createdAt?.seconds || 0;
          return bCreated - aCreated;
        default:
          return 0;
      }
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

  const getMinutes = (date) => {
    if (!date) return Number.MAX_SAFE_INTEGER;
    const dateObj = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    return dateObj.getHours() * 60 + dateObj.getMinutes();
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    const dt = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    return dt.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const formatTime = (date) => {
    if (!date) return "N/A";
    const dt = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    return dt.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  const getVehicleIcon = (vehicleType, color = "action") => {
    switch (vehicleType) {
      case "Car":
        return <DirectionsCar color={color} />;
      case "Bike":
      case "Scooter":
        return <TwoWheeler color={color} />;
      default:
        return <DirectionsCar color={color} />;
    }
  };

  const getVehicleColor = (vehicleType) => {
    switch (vehicleType) {
      case "Car": return "#1976d2";
      case "Bike": return "#f57c00";
      case "Scooter": return "#388e3c";
      default: return "#666";
    }
  };

  const clearFilters = () => {
    setSearchPickup("");
    setSearchDrop("");
    setFilterDate("");
    setFilterTime("");
    setFilterVehicle("");
    setSortBy("soonest");
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Re-trigger the loadTrips effect
    setUserProfile(prev => ({ ...prev }));
    setTimeout(() => setRefreshing(false), 1000);
  };

  const hasActiveFilters = searchPickup || searchDrop || filterDate || filterTime || filterVehicle;

  if (!user || !userProfile) {
    return (
      <Container>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 3,
          color: 'white',
          p: 4,
          mb: 4,
          textAlign: 'center'
        }}
      >
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
          Available Trips
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
          Find your perfect ride in Hyderabad
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
          <Chip
            label={`${filteredTrips.length} trips available`}
            sx={{ bgcolor: alpha('#ffffff', 0.2), color: 'white' }} // Fixed: Changed 'white' to '#ffffff'
          />
          <Chip
            label="All verified drivers"
            sx={{ bgcolor: alpha('#ffffff', 0.2), color: 'white' }} // Fixed: Changed 'white' to '#ffffff'
          />
        </Stack>
      </Box>

      {/* Search & Filter Bar */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: 2 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Search Fields */}
          <Grid item xs={12} md={4}>
            <TextField
              placeholder="Search pickup location"
              value={searchPickup}
              onChange={(e) => setSearchPickup(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              placeholder="Search drop location"
              value={searchDrop}
              onChange={(e) => setSearchDrop(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              fullWidth
            />
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={4}>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <IconButton
                onClick={() => setShowFilters(!showFilters)}
                sx={{
                  bgcolor: showFilters ? 'primary.main' : alpha(theme.palette.primary.main, 0.1),
                  color: showFilters ? 'white' : 'primary.main'
                }}
              >
                <FilterList />
                {hasActiveFilters && (
                  <Badge color="error" variant="dot" />
                )}
              </IconButton>
              <IconButton onClick={handleRefresh} disabled={refreshing}>
                <Refresh />
              </IconButton>
              {hasActiveFilters && (
                <IconButton onClick={clearFilters} color="error">
                  <Clear />
                </IconButton>
              )}
            </Stack>
          </Grid>
        </Grid>

        {/* Extended Filters */}
        {showFilters && (
          <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField
                  label="Date"
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: new Date().toISOString().split('T')[0] }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="Time"
                  type="time"
                  value={filterTime}
                  onChange={(e) => setFilterTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  disabled={!filterDate}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Vehicle Type</InputLabel>
                  <Select
                    value={filterVehicle}
                    onChange={(e) => setFilterVehicle(e.target.value)}
                    label="Vehicle Type"
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">
                      <em>All Vehicles</em>
                    </MenuItem>
                    {VEHICLE_TYPES.map((v) => (
                      <MenuItem key={v} value={v}>
                        {getVehicleIcon(v)}
                        <span style={{ marginLeft: 8 }}>{v}</span>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    label="Sort By"
                    sx={{ borderRadius: 2 }}
                  >
                    {SORT_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.icon}
                        <span style={{ marginLeft: 8 }}>{option.label}</span>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Results */}
      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3].map((n) => (
            <Grid item xs={12} key={n}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      ) : filteredTrips.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="h5" gutterBottom>
            No trips found
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {hasActiveFilters
              ? "Try adjusting your filters or search criteria"
              : "Be the first to create a trip!"
            }
          </Typography>
          {hasActiveFilters && (
            <Button
              variant="outlined"
              onClick={clearFilters}
              sx={{ mr: 2, borderRadius: 2 }}
            >
              Clear Filters
            </Button>
          )}
          <Button
            variant="contained"
            onClick={() => onNavigate('/create-trip')}
            sx={{ borderRadius: 2 }}
          >
            Create Trip
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredTrips.map((trip, index) => (
            <Grid item xs={12} key={trip.id}>
              <Fade in timeout={300 + index * 100}>
                <Card sx={{ p: 3, borderRadius: 3, boxShadow: 2, '&:hover': { boxShadow: 4 } }}>
                  <Grid container spacing={3} alignItems="center">
                    {/* Header */}
                    <Grid item xs={12} md={8}>
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                        {getVehicleIcon(trip.vehicleType, 'inherit')}
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {trip.vehicleType}
                        </Typography>
                        {trip.vehicleType === "Car" && trip.currentAvailableSeats && (
                          <Chip
                            label={`${trip.currentAvailableSeats} seats`}
                            variant="outlined"
                            sx={{ borderColor: getVehicleColor(trip.vehicleType) }}
                          />
                        )}
                        <Chip
                          label={trip.vehicleNumber}
                          sx={{ bgcolor: alpha('primary.main', 0.1) }}
                        />
                      </Stack>

                      {/* Route */}
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          ROUTE
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {trip.startLocation} → {trip.endLocation}
                        </Typography>
                      </Box>

                      {/* Time & Details */}
                      <Grid container spacing={2}>
                        <Grid item>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Departure
                          </Typography>
                          <Typography variant="body2">
                            {formatTime(trip.date)}
                          </Typography>
                        </Grid>
                        <Grid item>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Driver
                          </Typography>
                          <Typography variant="body2">
                            {trip.uploaderName}
                          </Typography>
                          {trip.uploaderUsername && (
                            <Typography variant="caption" color="text.secondary">
                              Username: @{trip.uploaderUsername}
                            </Typography>
                          )}
                        </Grid>
                      </Grid>

                      {/* Description */}
                      {trip.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
                          "{trip.description}"
                        </Typography>
                      )}
                    </Grid>

                    {/* Actions */}
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                        <Button
                          variant="contained"
                          size="large"
                          onClick={() => {
                            if (!user) {
                              alert("Please log in to book.");
                              return;
                            }
                            onNavigate(`/book-trip/${trip.id}`);
                          }}
                          sx={{
                            borderRadius: 2,
                            fontWeight: 600,
                            px: 4,
                            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)',
                              transform: 'translateY(-1px)'
                            }
                          }}
                        >
                          Book This Trip
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}