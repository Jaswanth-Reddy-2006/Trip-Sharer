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
  Autocomplete
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
  CurrencyRupee
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

const VEHICLE_TYPES = ["Car", "Bike", "Scooter"];

const SORT_OPTIONS = [
  { value: "soonest", label: "Date: Soonest", icon: <CalendarToday /> },
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

  useEffect(() => {
    async function loadTrips() {
      if (!user || !userProfile) return;

      setLoading(true);
      setError("");

      try {
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

        // Process trips
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

          // For cars, check seat availability
          if (trip.vehicleType === "Car" && trip.seatsAvailable) {
            const tripBookings = allBookings.filter(booking =>
              booking.tripId === trip.id && booking.status !== 'cancelled'
            );
            const bookedSeats = tripBookings.reduce((sum, booking) =>
              sum + (booking.bookingSeats || 0), 0
            );
            const availableSeats = trip.seatsAvailable - bookedSeats;
            trip.currentAvailableSeats = Math.max(0, availableSeats);
            return availableSeats > 0;
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
    }

    loadTrips();
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
      case "Car":
        return <DirectionsCar />;
      case "Bike":
      case "Scooter":
        return <TwoWheeler />;
      default:
        return <DirectionsCar />;
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
    setUserProfile(prev => ({ ...prev }));
    setTimeout(() => setRefreshing(false), 1000);
  };

  const hasActiveFilters = searchPickup || searchDrop || filterDate || filterTime || filterVehicle;

  if (!user || !userProfile) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box textAlign="center" sx={{ mb: 6 }}>
        <Typography
          variant="h2"
          sx={{
            fontWeight: 700,
            mb: 2,
            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Available Trips
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Find your perfect ride in Hyderabad
        </Typography>
      </Box>

      {/* Search & Filter Bar */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 4 }}>
        <Stack spacing={3}>
          {/* Main Search */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
              <Autocomplete
                freeSolo
                options={hyderabadLocations}
                value={searchPickup}
                onInputChange={(event, newValue) => setSearchPickup(newValue || '')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="From (Pickup location)"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOn color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={5}>
              <Autocomplete
                freeSolo
                options={hyderabadLocations}
                value={searchDrop}
                onInputChange={(event, newValue) => setSearchDrop(newValue || '')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="To (Drop location)"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOn color="secondary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <Stack direction="row" spacing={1} sx={{ height: '100%' }}>
                <Tooltip title="More filters">
                  <IconButton
                    onClick={() => setShowFilters(!showFilters)}
                    sx={{
                      bgcolor: showFilters ? 'primary.main' : alpha(theme.palette.primary.main, 0.1),
                      color: showFilters ? 'white' : 'primary.main',
                      flex: 1,
                      borderRadius: 2
                    }}
                  >
                    <FilterList />
                    {hasActiveFilters && (
                      <Badge
                        color="error"
                        variant="dot"
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                      />
                    )}
                  </IconButton>
                </Tooltip>

                {hasActiveFilters && (
                  <Tooltip title="Clear filters">
                    <IconButton onClick={clearFilters} sx={{ borderRadius: 2 }}>
                      <Clear />
                    </IconButton>
                  </Tooltip>
                )}

                <Tooltip title="Refresh">
                  <IconButton onClick={handleRefresh} disabled={refreshing} sx={{ borderRadius: 2 }}>
                    <Refresh />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Grid>
          </Grid>

          {/* Extended Filters */}
          {showFilters && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  type="date"
                  label="Travel Date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: new Date().toISOString().split('T')[0] }}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  type="time"
                  label="Departure Time"
                  value={filterTime}
                  onChange={(e) => setFilterTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  disabled={!filterDate}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Vehicle Type</InputLabel>
                  <Select
                    value={filterVehicle}
                    label="Vehicle Type"
                    onChange={(e) => setFilterVehicle(e.target.value)}
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
                    label="Sort By"
                    onChange={(e) => setSortBy(e.target.value)}
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
          )}
        </Stack>
      </Paper>

      {/* Results */}
      {loading ? (
        <Stack spacing={2}>
          {[1, 2, 3].map((n) => (
            <Paper key={n} sx={{ p: 4, borderRadius: 4 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <Box sx={{ height: 60, bgcolor: 'grey.100', borderRadius: 2, mb: 2 }} />
                  <Box sx={{ height: 20, bgcolor: 'grey.100', borderRadius: 1, mb: 1 }} />
                  <Box sx={{ height: 20, width: '60%', bgcolor: 'grey.100', borderRadius: 1 }} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ height: 40, bgcolor: 'grey.100', borderRadius: 2 }} />
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Stack>
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {error}
        </Alert>
      ) : filteredTrips.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            No trips found
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>
            {hasActiveFilters
              ? "Try adjusting your filters or search criteria"
              : "Be the first to create a trip!"
            }
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            {hasActiveFilters && (
              <Button variant="outlined" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
            <Button 
              variant="contained"
              onClick={() => onNavigate('/create-trip')}
              sx={{
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)',
                }
              }}
            >
              Create Trip
            </Button>
          </Stack>
        </Paper>
      ) : (
        <Stack spacing={3}>
          <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center' }}>
            Found {filteredTrips.length} available trip{filteredTrips.length !== 1 ? 's' : ''}
          </Typography>

          {filteredTrips.map((trip) => (
            <Card
              key={trip.id}
              sx={{
                borderRadius: 4,
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.12)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Grid container spacing={3}>
                  {/* Trip Details */}
                  <Grid item xs={12} md={8}>
                    <Stack spacing={3}>
                      {/* Header with Vehicle Type */}
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: alpha(getVehicleColor(trip.vehicleType), 0.1),
                            color: getVehicleColor(trip.vehicleType)
                          }}
                        >
                          {getVehicleIcon(trip.vehicleType)}
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {trip.vehicleType}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {trip.vehicleNumber}
                          </Typography>
                        </Box>
                        {trip.vehicleType === "Car" && trip.currentAvailableSeats && (
                          <Chip
                            icon={<Person />}
                            label={`${trip.currentAvailableSeats} seats`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        )}
                      </Stack>

                      {/* Route */}
                      <Box>
                        <Typography variant="overline" color="primary.main" sx={{ fontWeight: 600 }}>
                          ROUTE
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 1 }}>
                          <LocationOn color="primary" />
                          <Typography sx={{ fontWeight: 500 }}>
                            {trip.startLocation}
                          </Typography>
                          <RouteIcon color="action" />
                          <LocationOn color="secondary" />
                          <Typography sx={{ fontWeight: 500 }}>
                            {trip.endLocation}
                          </Typography>
                        </Stack>
                      </Box>

                      {/* Time & Details */}
                      <Grid container spacing={4}>
                        <Grid item xs={6} sm={4}>
                          <Typography variant="overline" color="text.secondary">
                            Departure
                          </Typography>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <CalendarToday sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                            <Typography sx={{ fontWeight: 500 }}>
                              {formatDate(trip.date)}
                            </Typography>
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <AccessTime sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                            <Typography sx={{ fontWeight: 500 }}>
                              {formatTime(trip.date)}
                            </Typography>
                          </Stack>
                        </Grid>

                        <Grid item xs={6} sm={4}>
                          <Typography variant="overline" color="text.secondary">
                            Driver
                          </Typography>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <AccountCircle sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                            <Typography sx={{ fontWeight: 500 }}>
                              {trip.uploaderName}
                            </Typography>
                          </Stack>
                          {trip.uploaderUsername && (
                            <Typography variant="body2" color="text.secondary">
                              @{trip.uploaderUsername}
                            </Typography>
                          )}
                        </Grid>

                        {trip.estimatedDistance && (
                          <Grid item xs={12} sm={4}>
                            <Typography variant="overline" color="text.secondary">
                              Estimated Cost
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <CurrencyRupee sx={{ fontSize: '1rem', color: 'success.main' }} />
                              <Typography sx={{ fontWeight: 600, color: 'success.main' }}>
                                ₹{(trip.estimatedDistance * 2.5).toFixed(2)}
                              </Typography>
                            </Stack>
                            <Typography variant="body2" color="text.secondary">
                              {trip.estimatedDistance.toFixed(1)} km @ ₹2.5/km
                            </Typography>
                          </Grid>
                        )}
                      </Grid>

                      {/* Description */}
                      {trip.description && (
                        <Box
                          sx={{
                            p: 2,
                            bgcolor: 'grey.50',
                            borderRadius: 2,
                            borderLeft: '4px solid',
                            borderLeftColor: 'primary.main'
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            "{trip.description}"
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Grid>

                  {/* Actions */}
                  <Grid item xs={12} md={4}>
                    <Stack spacing={2} sx={{ height: '100%', justifyContent: 'center' }}>
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
                          py: 2,
                          fontSize: '1rem',
                          fontWeight: 600,
                          borderRadius: 3,
                          background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)',
                            transform: 'translateY(-1px)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Book This Trip
                      </Button>

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
                              }
                            }
                          });
                        }}
                        sx={{ borderRadius: 3 }}
                      >
                        Chat with Driver
                      </Button>

                      {/* Pricing Info */}
                      <Paper
                        sx={{
                          p: 2,
                          bgcolor: 'info.50',
                          border: '1px solid',
                          borderColor: 'info.200',
                          borderRadius: 2
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                          <Info sx={{ fontSize: '1rem', color: 'info.main' }} />
                          <Typography variant="subtitle2" color="info.main">
                            Flexible Booking
                          </Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          Book partial routes at distance-based pricing. 
                          Pay only for the distance you travel.
                        </Typography>
                      </Paper>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
}