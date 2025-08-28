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
  Stack,
  Divider,
  IconButton,
  Tooltip,
  Badge,
  alpha,
  useTheme,
  Paper,
  Autocomplete,
  useMediaQuery,
  Fade
} from "@mui/material";
import {
  DirectionsCar,
  TwoWheeler,
  Person,
  Schedule,
  LocationOn,
  Search as SearchIcon,
  FilterList,
  Clear,
  Refresh,
  Star,
  AccessTime,
  CalendarToday,
  Route, // Fixed: RouteIcon -> Route
  AccountCircle,
  Info,
  Verified,
  DriveEta
} from "@mui/icons-material";
import {
  collection,
  query,
  getDocs,
  doc,
  getDoc,
  where,
  orderBy
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { searchLocations } from "./routesData";

const VEHICLE_TYPES = ["Car", "Bike", "Scooter"];
const PRICE_PER_KM = 3; // ₹3 per kilometer as specified

const SORT_OPTIONS = [
  { value: "soonest", label: "Date: Soonest", icon: <Schedule /> },
  { value: "timeAsc", label: "Time: Earliest", icon: <AccessTime /> },
  { value: "seatsDesc", label: "Seats: Most Available", icon: <Person /> },
  { value: "newest", label: "Recently Added", icon: <Star /> }
];

export default function Trips({ user, onNavigate }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
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

  useEffect(() => {
    if (!user) {
      onNavigate("/auth");
      return;
    }

    checkProfile();
  }, [user, onNavigate]);

  useEffect(() => {
    if (user && userProfile) {
      loadTrips();
    }
  }, [user, userProfile]);

  // Apply filters and sorting
  useEffect(() => {
    let data = [...trips];

    // Search filters
    if (searchPickup) {
      const lower = searchPickup.toLowerCase();
      data = data.filter((trip) =>
        trip.startLocation?.toLowerCase().includes(lower)
      );
    }

    if (searchDrop) {
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

    // Time filter
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
        case "newest":
          const aCreated = a.createdAt?.seconds || 0;
          const bCreated = b.createdAt?.seconds || 0;
          return bCreated - aCreated;
        default:
          return 0;
      }
    });

    setFilteredTrips(data);
  }, [trips, searchPickup, searchDrop, filterDate, filterTime, filterVehicle, sortBy]);

  const checkProfile = async () => {
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
  };

  const loadTrips = async () => {
    setLoading(true);
    setError("");
    
    try {
      // Load all trips
      const tripsRef = collection(db, "trips");
      const q = query(tripsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const allTrips = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      // Load all bookings to calculate availability
      const bookingsRef = collection(db, "bookings");
      const bookingsSnapshot = await getDocs(bookingsRef);
      const allBookings = bookingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter and process trips
      const availableTrips = allTrips.filter(trip => {
        // Parse trip date
        let tripDate;
        if (trip.date?.seconds) {
          tripDate = new Date(trip.date.seconds * 1000);
        } else if (trip.date) {
          tripDate = new Date(trip.date);
        } else {
          return false;
        }

        // Only show future trips
        const now = new Date();
        if (tripDate <= now) return false;
        
        // Don't show user's own trips
        if (trip.uploaderId === user.uid) return false;

        // Check if trip is fully booked
        if (trip.vehicleType === "Car" && trip.seatsAvailable) {
          const tripBookings = allBookings.filter(booking =>
            booking.tripId === trip.id && booking.status === 'confirmed'
          );
          const bookedSeats = tripBookings.reduce((sum, booking) =>
            sum + (booking.bookingSeats || 0), 0
          );
          const availableSeats = trip.seatsAvailable - bookedSeats;
          if (availableSeats <= 0) return false;
          trip.currentAvailableSeats = Math.max(0, availableSeats);
        } else {
          // For bikes/scooters, check if already booked
          const isBooked = allBookings.some(booking =>
            booking.tripId === trip.id && booking.status === 'confirmed'
          );
          if (isBooked) return false;
        }

        return true;
      });

      setTrips(availableTrips);
    } catch (error) {
      console.error("Error loading trips:", error);
      setError("Failed to load trips. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

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

  const getVehicleIcon = (vehicleType) => {
    switch (vehicleType) {
      case "Car": return <DirectionsCar />;
      case "Bike":
      case "Scooter": return <TwoWheeler />;
      default: return <DirectionsCar />;
    }
  };

  const getVehicleColor = (vehicleType) => {
    switch (vehicleType) {
      case "Car": return "#667eea";
      case "Bike": return "#ed8936";
      case "Scooter": return "#48bb78";
      default: return "#666";
    }
  };

  const calculateEstimatedFare = (distance) => {
    if (!distance) return null;
    return (parseFloat(distance) * PRICE_PER_KM).toFixed(2);
  };

  const clearFilters = () => {
    setSearchPickup("");
    setSearchDrop("");
    setFilterDate("");
    setFilterTime("");
    setFilterVehicle("");
    setSortBy("soonest");
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadTrips();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const hasActiveFilters = searchPickup || searchDrop || filterDate || filterTime || filterVehicle;

  if (!user || !userProfile) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom fontWeight={700}>
          Available Trips
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Find your perfect ride in Hyderabad with route-based fair pricing
        </Typography>
      </Box>

      {/* Search & Filter Bar */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        {/* Main Search */}
        <Grid container spacing={2} alignItems="center" mb={showFilters ? 2 : 0}>
          <Grid item xs={12} md={4}>
            <Autocomplete
              options={searchLocations(searchPickup)}
              value={searchPickup}
              onChange={(event, newValue) => setSearchPickup(newValue || '')}
              onInputChange={(event, newValue) => setSearchPickup(newValue || '')}
              freeSolo
              fullWidth
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="From (Pickup Location)"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn color="success" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Autocomplete
              options={searchLocations(searchDrop)}
              value={searchDrop}
              onChange={(event, newValue) => setSearchDrop(newValue || '')}
              onInputChange={(event, newValue) => setSearchDrop(newValue || '')}
              freeSolo
              fullWidth
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="To (Drop Location)"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn color="error" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack direction="row" spacing={1}>
              <Button
                onClick={() => setShowFilters(!showFilters)}
                startIcon={<FilterList />}
                fullWidth
                sx={{
                  borderRadius: 2,
                  bgcolor: showFilters ? 'primary.main' : alpha(theme.palette.primary.main, 0.1),
                  color: showFilters ? 'white' : 'primary.main',
                }}
              >
                {hasActiveFilters && (
                  <Badge badgeContent=" " color="error" variant="dot" sx={{ mr: 1 }} />
                )}
                Filters
              </Button>
              <Tooltip title="Refresh">
                <IconButton onClick={handleRefresh} disabled={refreshing}>
                  {refreshing ? <CircularProgress size={20} /> : <Refresh />}
                </IconButton>
              </Tooltip>
            </Stack>
          </Grid>
        </Grid>

        {/* Extended Filters */}
        <Fade in={showFilters}>
          <Box sx={{ display: showFilters ? 'block' : 'none' }}>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField
                  label="Departure Date"
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: new Date().toISOString().split('T')[0] }}
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="Departure Time"
                  type="time"
                  value={filterTime}
                  onChange={(e) => setFilterTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  disabled={!filterDate}
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                    <MenuItem value="">All Vehicles</MenuItem>
                    {VEHICLE_TYPES.map((v) => (
                      <MenuItem key={v} value={v}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          {getVehicleIcon(v)}
                          <span>{v}</span>
                        </Stack>
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
                        <Stack direction="row" alignItems="center" spacing={1}>
                          {option.icon}
                          <span>{option.label}</span>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {hasActiveFilters && (
              <Box mt={2}>
                <Button
                  onClick={clearFilters}
                  startIcon={<Clear />}
                  sx={{ borderRadius: 2 }}
                >
                  Clear All Filters
                </Button>
              </Box>
            )}
          </Box>
        </Fade>
      </Paper>

      {/* Results */}
      {loading ? (
        <Stack spacing={3}>
          {[1, 2, 3].map((n) => (
            <Card key={n} sx={{ borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <CircularProgress size={24} />
                  <Typography>Loading trips...</Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      ) : filteredTrips.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Route sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No trips found
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            {hasActiveFilters
              ? "Try adjusting your filters or search criteria"
              : "Be the first to create a trip!"
            }
          </Typography>
          
          {hasActiveFilters && (
            <Button variant="outlined" onClick={clearFilters} sx={{ mb: 2, borderRadius: 2 }}>
              Clear Filters
            </Button>
          )}
          
          <Button
            onClick={() => onNavigate('/create-trip')}
            variant="contained"
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)',
              },
            }}
          >
            Create Trip
          </Button>
        </Paper>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Found {filteredTrips.length} available trip{filteredTrips.length !== 1 ? 's' : ''}
          </Typography>
          
          <Stack spacing={3}>
            {filteredTrips.map((trip) => (
              <Card
                key={trip.id}
                elevation={2}
                sx={{
                  borderRadius: 3,
                  '&:hover': {
                    boxShadow: theme.shadows[6],
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Header with Vehicle Type */}
                  <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                    {getVehicleIcon(trip.vehicleType)}
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {trip.vehicleType} - {trip.vehicleNumber}
                      </Typography>
                      {trip.vehicleModel && (
                        <Chip label={trip.vehicleModel} size="small" variant="outlined" />
                      )}
                    </Box>
                    
                    {trip.vehicleType === "Car" && trip.currentAvailableSeats && (
                      <Chip
                        icon={<Person />}
                        label={`${trip.currentAvailableSeats} seats available`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </Stack>

                  {/* Trip Details Grid */}
                  <Grid container spacing={3}>
                    {/* Route Information */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        ROUTE
                      </Typography>
                      <Stack spacing={1}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LocationOn color="success" fontSize="small" />
                          <Typography variant="body1" fontWeight={500}>
                            {trip.startLocation}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LocationOn color="error" fontSize="small" />
                          <Typography variant="body1" fontWeight={500}>
                            {trip.endLocation}
                          </Typography>
                        </Box>
                      </Stack>
                      
                      {/* Show intermediate stops if available */}
                      {trip.intermediateStops && trip.intermediateStops.length > 0 && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          Via: {trip.intermediateStops.join(', ')}
                        </Typography>
                      )}

                      {trip.estimatedDistance && (
                        <Box mt={2}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            DISTANCE & PRICING
                          </Typography>
                          <Stack direction="row" spacing={1}>
                            <Chip
                              icon={<Route />}
                              label={`${trip.estimatedDistance} km`}
                              variant="outlined"
                              size="small"
                            />
                            <Chip
                              icon={<Info />}
                              label={`₹${calculateEstimatedFare(trip.estimatedDistance)} (full trip)`}
                              color="success"
                              variant="outlined"
                              size="small"
                            />
                          </Stack>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            Partial trips priced at ₹{PRICE_PER_KM}/km
                          </Typography>
                        </Box>
                      )}
                    </Grid>

                    {/* Time and Driver Info */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        DEPARTURE
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                        <CalendarToday fontSize="small" />
                        <Typography variant="body1">
                          {formatDate(trip.date)}
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                        <AccessTime fontSize="small" />
                        <Typography variant="body1">
                          {formatTime(trip.date)}
                        </Typography>
                      </Stack>

                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        DRIVER
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <AccountCircle fontSize="small" />
                        <Typography variant="body1">
                          {trip.uploaderName}
                        </Typography>
                      </Stack>
                      {trip.uploaderUsername && (
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
                          @{trip.uploaderUsername}
                        </Typography>
                      )}
                    </Grid>
                  </Grid>

                  {/* Description */}
                  {trip.description && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        ADDITIONAL INFO
                      </Typography>
                      <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                        "{trip.description}"
                      </Typography>
                    </>
                  )}

                  {/* Actions */}
                  <Divider sx={{ my: 2 }} />
                  <Stack direction="row" justifyContent="flex-end">
                    <Button
                      onClick={() => {
                        if (!user) {
                          alert("Please log in to book.");
                          return;
                        }
                        onNavigate(`/book-trip/${trip.id}`);
                      }}
                      variant="contained"
                      size="large"
                      sx={{
                        py: 1,
                        px: 4,
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        borderRadius: 2,
                        background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)',
                          transform: 'translateY(-1px)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Book Trip
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>

          {/* Additional Info */}
          <Paper sx={{ p: 3, mt: 4, borderRadius: 3, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
            <Typography variant="h6" gutterBottom>
              How It Works
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box display="flex" alignItems="flex-start" gap={2}>
                  <SearchIcon color="primary" />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Search & Filter
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Find trips that match your route and timing preferences
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box display="flex" alignItems="flex-start" gap={2}>
                  <Route color="primary" />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Route-Based Booking
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Book any segment along the driver's route at ₹{PRICE_PER_KM}/km
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box display="flex" alignItems="flex-start" gap={2}>
                  <Verified color="primary" />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Safe & Verified
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      All drivers are verified with licenses and phone numbers
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </>
      )}
    </Container>
  );
}