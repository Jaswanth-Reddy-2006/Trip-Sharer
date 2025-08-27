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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Chat,
  Star,
  AccessTime,
  CalendarToday,
  Route as RouteIcon,
  AccountCircle,
  Info,
  Map as MapIcon,
  Verified,
  Phone,
  Receipt,
  Navigation,
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
import TripMap from "./TripMap";

const VEHICLE_TYPES = ["Car", "Bike", "Scooter"];
const PRICE_PER_KM = 2.5; // ₹2.5 per kilometer

const SORT_OPTIONS = [
  { value: "soonest", label: "Date: Soonest", icon: <Schedule /> },
  { value: "timeAsc", label: "Time: Earliest", icon: <AccessTime /> },
  { value: "seatsDesc", label: "Seats: Most Available", icon: <Person /> },
  { value: "newest", label: "Recently Added", icon: <Star /> }
];

// Hyderabad locations for autocomplete
const hyderabadLocations = [
  "Nagole", "Uppal", "Secunderabad", "Hitech City", "Gachibowli",
  "Madhapur", "Kondapur", "Miyapur", "Kukatpally", "JNTU",
  "Ameerpet", "Begumpet", "Jubilee Hills", "Banjara Hills", "Mehdipatnam",
  "Tolichowki", "Golconda", "Charminar", "Abids", "Nampally",
  "Koti", "Malakpet", "Dilsukhnagar", "LB Nagar", "Vanasthalipuram",
  "Kompally", "Bachupally", "Nizampet", "Madinaguda", "Lingampally"
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
  const [selectedTripForMap, setSelectedTripForMap] = useState(null);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);

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

  const showTripOnMap = (trip) => {
    setSelectedTripForMap(trip);
    setMapDialogOpen(true);
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
    <>
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        {/* Header */}
        <Box mb={{ xs: 3, md: 4 }}>
          <Typography 
            variant={isMobile ? "h4" : "h3"} 
            component="h1" 
            gutterBottom
            sx={{ fontWeight: 700, color: 'text.primary' }}
          >
            Available Trips
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}
          >
            Find your perfect ride in Hyderabad with distance-based fair pricing
          </Typography>
        </Box>

        {/* Search & Filter Bar */}
        <Paper 
          elevation={2}
          sx={{ 
            p: { xs: 2, md: 3 }, 
            mb: 4, 
            borderRadius: { xs: 2, md: 3 },
            bgcolor: 'background.paper'
          }}
        >
          {/* Main Search */}
          <Grid container spacing={2} alignItems="center" mb={showFilters ? 2 : 0}>
            <Grid item xs={12} sm={4}>
              <Autocomplete
                value={searchPickup}
                onChange={(event, newValue) => setSearchPickup(newValue || '')}
                options={hyderabadLocations}
                freeSolo
                fullWidth
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="From"
                    placeholder="Pickup location"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOn color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Autocomplete
                value={searchDrop}
                onChange={(event, newValue) => setSearchDrop(newValue || '')}
                options={hyderabadLocations}
                freeSolo
                fullWidth
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="To"
                    placeholder="Drop location"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <Navigation color="secondary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Stack direction="row" spacing={1}>
                <Button
                  variant={showFilters ? "contained" : "outlined"}
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
                    <Badge 
                      variant="dot" 
                      color="error" 
                      sx={{ mr: 1 }}
                    />
                  )}
                  Filters
                </Button>
                
                <IconButton
                  onClick={handleRefresh}
                  disabled={refreshing}
                  sx={{ 
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    color: 'success.main'
                  }}
                >
                  <Refresh />
                </IconButton>
              </Stack>
            </Grid>
          </Grid>

          {/* Extended Filters */}
          <Fade in={showFilters}>
            <Box sx={{ display: showFilters ? 'block' : 'none' }}>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Date"
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: new Date().toISOString().split('T')[0] }}
                    fullWidth
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Time"
                    type="time"
                    value={filterTime}
                    onChange={(e) => setFilterTime(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    disabled={!filterDate}
                    fullWidth
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
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

                <Grid item xs={12} sm={6} md={3}>
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
                    variant="outlined"
                    color="error"
                    startIcon={<Clear />}
                    onClick={clearFilters}
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
          <Grid container spacing={3}>
            {[1, 2, 3].map((n) => (
              <Grid item xs={12} key={n}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <CircularProgress size={24} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        ) : filteredTrips.length === 0 ? (
          <Box
            textAlign="center"
            py={{ xs: 4, md: 8 }}
            sx={{
              background: alpha(theme.palette.primary.main, 0.02),
              borderRadius: 3,
              border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`
            }}
          >
            <DirectionsCar 
              sx={{ 
                fontSize: { xs: 48, md: 64 }, 
                color: 'text.secondary', 
                mb: 2 
              }} 
            />
            <Typography variant="h5" gutterBottom color="text.secondary">
              No trips found
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
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
              sx={{
                borderRadius: 2,
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)',
                }
              }}
            >
              Create Trip
            </Button>
          </Box>
        ) : (
          <>
            <Box mb={3}>
              <Typography variant="h6" color="text.secondary">
                Found {filteredTrips.length} available trip{filteredTrips.length !== 1 ? 's' : ''}
              </Typography>
            </Box>

            <Grid container spacing={{ xs: 2, md: 3 }}>
              {filteredTrips.map((trip) => (
                <Grid item xs={12} key={trip.id}>
                  <Card
                    elevation={2}
                    sx={{
                      borderRadius: { xs: 2, md: 3 },
                      overflow: 'hidden',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 4
                      }
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                      {/* Header with Vehicle Type */}
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        justifyContent="space-between"
                        mb={2}
                        spacing={{ xs: 1, sm: 0 }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box
                            sx={{
                              p: 1,
                              borderRadius: 2,
                              bgcolor: alpha(getVehicleColor(trip.vehicleType), 0.1),
                              color: getVehicleColor(trip.vehicleType)
                            }}
                          >
                            {getVehicleIcon(trip.vehicleType)}
                          </Box>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {trip.vehicleType} - {trip.vehicleNumber}
                            </Typography>
                            {trip.vehicleModel && (
                              <Typography variant="body2" color="text.secondary">
                                {trip.vehicleModel}
                              </Typography>
                            )}
                          </Box>
                        </Stack>

                        <Stack direction="row" spacing={1} alignItems="center">
                          <IconButton
                            onClick={() => showTripOnMap(trip)}
                            sx={{ 
                              bgcolor: alpha(theme.palette.info.main, 0.1),
                              color: 'info.main'
                            }}
                          >
                            <MapIcon />
                          </IconButton>
                          
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
                      </Stack>

                      <Divider sx={{ mb: 2 }} />

                      {/* Trip Details Grid */}
                      <Grid container spacing={{ xs: 2, md: 3 }}>
                        {/* Route Information */}
                        <Grid item xs={12} md={6}>
                          <Stack spacing={2}>
                            <Box>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                ROUTE
                              </Typography>
                              <Stack spacing={1}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <LocationOn color="primary" fontSize="small" />
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {trip.startLocation}
                                  </Typography>
                                </Stack>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <Navigation color="secondary" fontSize="small" />
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {trip.endLocation}
                                  </Typography>
                                </Stack>
                              </Stack>
                            </Box>

                            {trip.estimatedDistance && (
                              <Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  DISTANCE & PRICING
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                  <Chip
                                    icon={<DriveEta />}
                                    label={`${trip.estimatedDistance} km`}
                                    variant="outlined"
                                    size="small"
                                  />
                                  <Chip
                                    icon={<Receipt />}
                                    label={`₹${calculateEstimatedFare(trip.estimatedDistance)} (full trip)`}
                                    color="success"
                                    variant="outlined"
                                    size="small"
                                  />
                                </Stack>
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                  Partial trips priced at ₹{PRICE_PER_KM}/km
                                </Typography>
                              </Box>
                            )}
                          </Stack>
                        </Grid>

                        {/* Time and Driver Info */}
                        <Grid item xs={12} md={6}>
                          <Stack spacing={2}>
                            <Box>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                DEPARTURE
                              </Typography>
                              <Stack direction="row" alignItems="center" spacing={2}>
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                  <CalendarToday fontSize="small" />
                                  <Typography variant="body2">
                                    {formatDate(trip.date)}
                                  </Typography>
                                </Stack>
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                  <AccessTime fontSize="small" />
                                  <Typography variant="body2">
                                    {formatTime(trip.date)}
                                  </Typography>
                                </Stack>
                              </Stack>
                            </Box>

                            <Box>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                DRIVER
                              </Typography>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <AccountCircle fontSize="small" />
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {trip.uploaderName}
                                  </Typography>
                                  {trip.uploaderUsername && (
                                    <Typography variant="caption" color="text.secondary">
                                      @{trip.uploaderUsername}
                                    </Typography>
                                  )}
                                </Box>
                                <Verified color="success" fontSize="small" />
                              </Stack>
                            </Box>
                          </Stack>
                        </Grid>
                      </Grid>

                      {/* Description */}
                      {trip.description && (
                        <>
                          <Divider sx={{ my: 2 }} />
                          <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              ADDITIONAL INFO
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontStyle: 'italic',
                                p: 1.5,
                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                                borderRadius: 1,
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                              }}
                            >
                              "{trip.description}"
                            </Typography>
                          </Box>
                        </>
                      )}

                      <Divider sx={{ my: 2 }} />

                      {/* Actions */}
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1}
                        justifyContent="flex-end"
                      >
                        <Button
                          variant="outlined"
                          startIcon={<Chat />}
                          onClick={() => {
                            onNavigate(`/chat/${trip.uploaderId}`, {
                              state: {
                                user: {
                                  uid: trip.uploaderId,
                                  name: trip.uploaderName,
                                  tripId: trip.id
                                },
                              },
                            });
                          }}
                          sx={{ borderRadius: 2, minWidth: 'auto', px: 2 }}
                        >
                          Chat
                        </Button>

                        <Button
                          variant="contained"
                          onClick={() => {
                            if (!user) {
                              alert("Please log in to book.");
                              return;
                            }
                            onNavigate(`/book-trip/${trip.id}`);
                          }}
                          sx={{
                            py: 1,
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
                </Grid>
              ))}
            </Grid>

            {/* Additional Info */}
            <Card 
              elevation={1}
              sx={{ 
                mt: 4, 
                borderRadius: { xs: 2, md: 3 },
                bgcolor: alpha(theme.palette.primary.main, 0.02)
              }}
            >
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  How It Works
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <LocationOn color="primary" />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          Search & Filter
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Find trips that match your route and timing preferences
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Receipt color="success" />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          Flexible Booking
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Book partial routes at distance-based fair pricing (₹{PRICE_PER_KM}/km)
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Verified color="info" />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          Safe & Verified
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          All drivers are verified with licenses and phone numbers
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </>
        )}
      </Container>

      {/* Map Dialog */}
      <Dialog
        open={mapDialogOpen}
        onClose={() => setMapDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Trip Route
            </Typography>
            <IconButton
              onClick={() => setMapDialogOpen(false)}
              sx={{ 
                bgcolor: alpha(theme.palette.error.main, 0.1),
                color: 'error.main'
              }}
            >
              <Clear />
            </IconButton>
          </Stack>
          {selectedTripForMap && (
            <Typography variant="body2" color="text.secondary">
              {selectedTripForMap.startLocation} → {selectedTripForMap.endLocation}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {selectedTripForMap && (
            <TripMap
              trip={selectedTripForMap}
              apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setMapDialogOpen(false)}
            sx={{ borderRadius: 2 }}
          >
            Close
          </Button>
          {selectedTripForMap && (
            <Button
              variant="contained"
              onClick={() => {
                setMapDialogOpen(false);
                onNavigate(`/book-trip/${selectedTripForMap.id}`);
              }}
              sx={{ borderRadius: 2 }}
            >
              Book This Trip
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}