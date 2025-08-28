import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  InputAdornment,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Card,
  CardContent,
  Stack,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  alpha,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip
} from "@mui/material";
import {
  LocationOn,
  Schedule,
  DirectionsCar,
  TwoWheeler,
  Person,
  Route,
  CalendarToday,
  AccessTime,
  AccountCircle,
  Info,
  CheckCircle,
  Phone,
  Chat,
  Verified,
  DriveEta,
  Receipt,
  Navigation,
  LocalGasStation,
  Warning,
  Timeline,
  TrendingFlat,
  ExpandMore
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { db, auth } from "../firebase";
import {
  getRouteById,
  getAvailablePickupStops,
  getAvailableDropStops,
  calculateDistanceBetweenStops,
  createDirectRoute
} from "./routesData";

const PRICE_PER_KM = 3; // ₹3 per kilometer

export default function BookTrip({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [trip, setTrip] = useState(null);
  const [tripOwner, setTripOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState(""); // For debugging

  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    seats: "1",
    pickupLocation: "",
    dropLocation: "",
  });

  const [availablePickupStops, setAvailablePickupStops] = useState([]);
  const [availableDropStops, setAvailableDropStops] = useState([]);
  const [calculatedDistance, setCalculatedDistance] = useState(null);
  const [estimatedFare, setEstimatedFare] = useState(null);

  useEffect(() => {
    console.log("🔍 BookTrip: Loading trip data for ID:", id);
    if (!id) return;
    loadTripData();
  }, [id]);

  // ✅ ENHANCED: Better pickup stops loading with debugging
  useEffect(() => {
    console.log("🚌 BookTrip: Loading pickup stops for trip:", trip?.id);
    
    if (!trip) {
      console.log("❌ No trip data available");
      setDebugInfo("No trip data available");
      return;
    }

    console.log("Trip data:", {
      id: trip.id,
      routeId: trip.routeId,
      startLocation: trip.startLocation,
      endLocation: trip.endLocation,
      totalStops: trip.totalStops,
      isDirectRoute: trip.isDirectRoute
    });

    let routeForPickup = null;

    if (trip.routeId) {
      // Try to get existing route
      routeForPickup = getRouteById(trip.routeId);
      console.log("📍 Retrieved route by ID:", routeForPickup);
    }

    if (!routeForPickup && trip.isDirectRoute) {
      // Create direct route from trip data
      console.log("🛤️ Creating direct route from trip data");
      routeForPickup = createDirectRoute(
        trip.startLocation,
        trip.endLocation,
        trip.intermediateStops || []
      );
      console.log("✅ Created direct route:", routeForPickup);
    }

    if (!routeForPickup && trip.totalStops && trip.totalStops.length >= 2) {
      // Fallback: create route from totalStops
      console.log("🔧 Fallback: creating route from totalStops");
      routeForPickup = {
        route_id: `fallback_${trip.id}`,
        route_name: `${trip.startLocation} to ${trip.endLocation}`,
        total_stops: trip.totalStops,
        distance_km: trip.estimatedDistance || 10,
        from: trip.startLocation,
        to: trip.endLocation
      };
      console.log("✅ Created fallback route:", routeForPickup);
    }

    if (routeForPickup) {
      const pickupStops = getAvailablePickupStops(routeForPickup.route_id);
      console.log("✅ Available pickup stops:", pickupStops);
      setAvailablePickupStops(pickupStops);
      setDebugInfo(`Found ${pickupStops.length} pickup stops: ${pickupStops.join(', ')}`);
    } else {
      console.log("❌ Could not determine route for pickup stops");
      setAvailablePickupStops([]);
      setDebugInfo("Could not determine route - missing routeId and totalStops");
    }
  }, [trip]);

  // ✅ ENHANCED: Better drop stops loading
  useEffect(() => {
    console.log("🏁 BookTrip: Loading drop stops for pickup:", bookingForm.pickupLocation);
    
    if (!trip || !bookingForm.pickupLocation) {
      setAvailableDropStops([]);
      return;
    }

    let routeForDrop = null;

    if (trip.routeId) {
      routeForDrop = getRouteById(trip.routeId);
    }

    if (!routeForDrop && trip.isDirectRoute) {
      routeForDrop = createDirectRoute(
        trip.startLocation,
        trip.endLocation,
        trip.intermediateStops || []
      );
    }

    if (!routeForDrop && trip.totalStops && trip.totalStops.length >= 2) {
      routeForDrop = {
        route_id: `fallback_${trip.id}`,
        route_name: `${trip.startLocation} to ${trip.endLocation}`,
        total_stops: trip.totalStops,
        distance_km: trip.estimatedDistance || 10
      };
    }

    if (routeForDrop) {
      const dropStops = getAvailableDropStops(routeForDrop.route_id, bookingForm.pickupLocation);
      console.log("✅ Available drop stops:", dropStops);
      setAvailableDropStops(dropStops);
    } else {
      console.log("❌ Could not determine route for drop stops");
      setAvailableDropStops([]);
    }
  }, [trip, bookingForm.pickupLocation]);

  // Calculate distance and fare when pickup/drop changes
  useEffect(() => {
    if (trip && bookingForm.pickupLocation && bookingForm.dropLocation) {
      console.log("📏 Calculating distance and fare");
      
      let routeForCalculation = null;
      
      if (trip.routeId) {
        routeForCalculation = getRouteById(trip.routeId);
      }
      
      if (!routeForCalculation && trip.totalStops && trip.totalStops.length >= 2) {
        routeForCalculation = {
          route_id: `calc_${trip.id}`,
          total_stops: trip.totalStops,
          distance_km: trip.estimatedDistance || 10
        };
      }
      
      if (routeForCalculation) {
        const distance = calculateDistanceBetweenStops(
          routeForCalculation.route_id,
          bookingForm.pickupLocation,
          bookingForm.dropLocation
        );
        console.log("✅ Calculated distance:", distance, "km");
        setCalculatedDistance(distance);
        setEstimatedFare(distance > 0 ? (distance * PRICE_PER_KM).toFixed(2) : null);
      } else {
        console.log("❌ Could not calculate distance - no route available");
        setCalculatedDistance(null);
        setEstimatedFare(null);
      }
    } else {
      setCalculatedDistance(null);
      setEstimatedFare(null);
    }
  }, [trip, bookingForm.pickupLocation, bookingForm.dropLocation]);

  const loadTripData = async () => {
    setLoading(true);
    setError("");
    
    try {
      console.log("📥 Loading trip data for ID:", id);
      
      // Load trip details
      const tripSnap = await getDoc(doc(db, "trips", id));
      if (!tripSnap.exists()) {
        setError("Trip not found");
        return;
      }

      const tripData = { id: tripSnap.id, ...tripSnap.data() };
      console.log("✅ Trip data loaded:", tripData);
      setTrip(tripData);

      // Load trip owner details
      const ownerSnap = await getDoc(doc(db, "users", tripData.uploaderId));
      if (ownerSnap.exists()) {
        setTripOwner(ownerSnap.data());
        console.log("✅ Trip owner data loaded");
      }

      // Check if trip is still available
      const bookingsQuery = query(
        collection(db, "bookings"),
        where("tripId", "==", id),
        where("status", "!=", "cancelled")
      );
      const bookingsSnap = await getDocs(bookingsQuery);
      
      if (tripData.vehicleType === "Car" && tripData.seatsAvailable) {
        const bookedSeats = bookingsSnap.docs.reduce((sum, doc) =>
          sum + (doc.data().bookingSeats || 0), 0
        );
        const availableSeats = tripData.seatsAvailable - bookedSeats;
        if (availableSeats <= 0) {
          setError("This trip is fully booked");
          return;
        }
      }
      
    } catch (err) {
      setError("Failed to load trip details");
      console.error("❌ Error loading trip:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    console.log(`📝 Form change: ${field} = ${value}`);
    setBookingForm(prev => ({
      ...prev,
      [field]: value
    }));

    // Reset drop location if pickup changes
    if (field === 'pickupLocation') {
      setBookingForm(prev => ({
        ...prev,
        dropLocation: ""
      }));
    }
  };

  const handleBookingConfirmation = () => {
    if (!user) {
      alert("Please login to book the trip.");
      return;
    }

    if (!trip) return;

    if (!bookingForm.pickupLocation || !bookingForm.dropLocation) {
      setError("Please select both pickup and drop locations.");
      return;
    }

    if (!calculatedDistance || calculatedDistance <= 0) {
      setError("Invalid route segment selected.");
      return;
    }

    const seatCount = parseInt(bookingForm.seats);
    if (!seatCount || seatCount < 1) {
      setError("Please select valid number of seats.");
      return;
    }

    setConfirmDialogOpen(true);
  };

  const handleBooking = async () => {
    setSubmitting(true);
    setError("");
    setConfirmDialogOpen(false);

    try {
      const seatCount = parseInt(bookingForm.seats);

      // Create booking
      const bookingData = {
        tripId: trip.id,
        userId: user.uid,
        bookingSeats: seatCount,
        pickupLocation: bookingForm.pickupLocation,
        dropLocation: bookingForm.dropLocation,
        routeId: trip.routeId,
        estimatedDistance: calculatedDistance,
        estimatedFare: estimatedFare ? parseFloat(estimatedFare) : null,
        bookedAt: serverTimestamp(),
        status: 'confirmed'
      };

      await addDoc(collection(db, "bookings"), bookingData);

      // Update available seats if it's a car
      if (trip.vehicleType === "Car" && trip.seatsAvailable) {
        const tripRef = doc(db, "trips", trip.id);
        await updateDoc(tripRef, {
          seatsAvailable: trip.seatsAvailable - seatCount,
        });
      }

      // Create notification for trip owner
      const notificationData = {
        userId: trip.uploaderId,
        type: 'booking',
        title: 'New Booking!',
        message: `${user.displayName || user.email} booked your trip from ${bookingForm.pickupLocation} to ${bookingForm.dropLocation}`,
        tripId: trip.id,
        bookerId: user.uid,
        createdAt: serverTimestamp(),
        read: false
      };
      await addDoc(collection(db, "notifications"), notificationData);

      setSuccess("Booking successful! You can now contact the driver.");
      setTimeout(() => navigate("/my-bookings"), 3000);

    } catch (e) {
      console.error("Booking error:", e);
      setError("Booking failed, please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    try {
      const dt = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
      return dt.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        weekday: "short"
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  const formatTime = (date) => {
    if (!date) return "N/A";
    try {
      const dt = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
      return dt.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    } catch (error) {
      console.error("Error formatting time:", error);
      return "Invalid Time";
    }
  };

  const getVehicleIcon = () => {
    switch (trip?.vehicleType) {
      case "Car": return <DirectionsCar />;
      case "Bike":
      case "Scooter": return <TwoWheeler />;
      default: return <DirectionsCar />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading trip details...
        </Typography>
      </Container>
    );
  }

  if (!trip) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || "Trip not found."}
        </Alert>
        <Button
          onClick={() => navigate("/trips")}
          variant="contained"
          sx={{ mt: 2, borderRadius: 2 }}
        >
          Back to Trips
        </Button>
      </Container>
    );
  }

  const tripDate = trip.date
    ? trip.date.seconds
      ? new Date(trip.date.seconds * 1000)
      : new Date(trip.date)
    : null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Typography variant="h3" gutterBottom fontWeight="bold">
          Book This Trip
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Select your pickup and drop points along the route
        </Typography>
      </Paper>

      <Grid container spacing={4}>
        {/* Left Column - Trip Info */}
        <Grid item xs={12} lg={8}>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          {/* ✅ DEBUG INFO - Remove in production */}
          {debugInfo && (
            <Accordion sx={{ mb: 3 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle2">Debug Information</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" component="pre">
                  {debugInfo}
                  {"\n\nTrip Data:"}
                  {JSON.stringify({
                    routeId: trip.routeId,
                    totalStops: trip.totalStops,
                    isDirectRoute: trip.isDirectRoute,
                    availablePickups: availablePickupStops.length,
                    availableDrops: availableDropStops.length
                  }, null, 2)}
                </Typography>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Trip Information */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Info color="primary" />
                Trip Details
              </Typography>

              <Grid container spacing={3}>
                {/* Vehicle Info */}
                <Grid item xs={12} md={6}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                    {getVehicleIcon()}
                    <Box>
                      <Typography variant="h6">
                        {trip.vehicleType} - {trip.vehicleNumber}
                      </Typography>
                      {trip.vehicleModel && (
                        <Chip label={trip.vehicleModel} size="small" variant="outlined" />
                      )}
                    </Box>
                  </Stack>
                </Grid>

                {/* Original Route */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    FULL ROUTE
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Chip label={trip.startLocation} color="success" size="small" />
                    <TrendingFlat />
                    <Chip label={trip.endLocation} color="error" size="small" />
                  </Stack>
                  
                  {trip.totalStops && trip.totalStops.length > 2 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Route: {trip.totalStops.join(' → ')}
                      </Typography>
                    </Box>
                  )}
                </Grid>

                {/* Trip Details Grid */}
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    DEPARTURE
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(trip.date)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatTime(trip.date)}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    DRIVER
                  </Typography>
                  <Typography variant="body1">
                    {trip.uploaderName || "Driver"}
                  </Typography>
                  {trip.uploaderUsername && (
                    <Typography variant="body2" color="text.secondary">
                      @{trip.uploaderUsername}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} md={4}>
                  {trip.vehicleType === "Car" && trip.seatsAvailable && (
                    <>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        AVAILABLE SEATS
                      </Typography>
                      <Chip 
                        label={`${trip.seatsAvailable} seats available`}
                        color="success"
                        variant="outlined"
                      />
                    </>
                  )}
                  {trip.estimatedDistance && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        FULL TRIP DISTANCE
                      </Typography>
                      <Chip 
                        label={`${trip.estimatedDistance} km`}
                        color="info"
                        variant="outlined"
                      />
                    </Box>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* ✅ ENHANCED Booking Form */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Navigation color="primary" />
                Your Booking
              </Typography>

              <Grid container spacing={3}>
                {/* Seats Selection - Only for Cars */}
                {trip.vehicleType === "Car" && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Number of Seats *"
                      type="number"
                      value={bookingForm.seats}
                      onChange={(e) => handleInputChange('seats', e.target.value)}
                      inputProps={{
                        min: 1,
                        max: trip.seatsAvailable || 1
                      }}
                      helperText={`Maximum ${trip.seatsAvailable || 1} seats available`}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                )}

                {/* ✅ FIXED Pickup Location */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Pickup Location *</InputLabel>
                    <Select
                      value={bookingForm.pickupLocation}
                      onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
                      label="Pickup Location *"
                      disabled={availablePickupStops.length === 0}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="">
                        <em>Select pickup point</em>
                      </MenuItem>
                      {availablePickupStops.map((stop) => (
                        <MenuItem key={stop} value={stop}>
                          {stop}
                        </MenuItem>
                      ))}
                    </Select>
                    {availablePickupStops.length === 0 && (
                      <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                        No pickup stops available. Please contact support.
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                {/* ✅ FIXED Drop Location */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Drop Location *</InputLabel>
                    <Select
                      value={bookingForm.dropLocation}
                      onChange={(e) => handleInputChange('dropLocation', e.target.value)}
                      label="Drop Location *"
                      disabled={!bookingForm.pickupLocation || availableDropStops.length === 0}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="">
                        <em>Select drop point</em>
                      </MenuItem>
                      {availableDropStops.map((stop) => (
                        <MenuItem key={stop} value={stop}>
                          {stop}
                        </MenuItem>
                      ))}
                    </Select>
                    {!bookingForm.pickupLocation && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                        Select pickup location first
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
              </Grid>

              {/* Distance and Fare Display */}
              {calculatedDistance && estimatedFare && (
                <Card sx={{ mt: 3, bgcolor: alpha(theme.palette.success.main, 0.1) }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Journey Summary
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Distance
                        </Typography>
                        <Typography variant="h6">
                          {calculatedDistance} km
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Estimated Fare
                        </Typography>
                        <Typography variant="h6" color="success.main">
                          ₹{estimatedFare}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                      * Based on ₹{PRICE_PER_KM}/km. Final fare may be discussed with driver.
                    </Typography>
                  </CardContent>
                </Card>
              )}

              {/* Book Button */}
              <Button
                onClick={handleBookingConfirmation}
                variant="contained"
                size="large"
                disabled={submitting || !bookingForm.pickupLocation || !bookingForm.dropLocation}
                startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
                fullWidth
                sx={{
                  mt: 3,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)',
                  }
                }}
              >
                {submitting ? "Booking..." : "Confirm Booking"}
              </Button>

              {/* Contact Options - Only show after successful booking */}
              {success && (
                <Card sx={{ mt: 3, bgcolor: alpha(theme.palette.info.main, 0.1) }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Contact Driver
                    </Typography>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                      <Button
                        onClick={() => {
                          navigate(`/chat/${trip.uploaderId}`, {
                            state: {
                              user: {
                                uid: trip.uploaderId,
                                name: trip.uploaderName,
                                tripId: trip.id
                              },
                            },
                          });
                        }}
                        variant="outlined"
                        startIcon={<Chat />}
                        fullWidth
                        sx={{ borderRadius: 2 }}
                      >
                        Chat with {trip.uploaderName}
                      </Button>
                      {tripOwner?.phone && (
                        <Button
                          onClick={() => window.open(`tel:${tripOwner.phone}`, '_self')}
                          variant="outlined"
                          startIcon={<Phone />}
                          fullWidth
                          sx={{ borderRadius: 2 }}
                        >
                          Call Driver
                        </Button>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Back Button */}
          <Button
            onClick={() => navigate("/trips")}
            variant="outlined"
            fullWidth
            sx={{ mt: 2, borderRadius: 2 }}
          >
            Back to Trips
          </Button>

        </Grid>

        {/* Right Column - How it Works */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              How Route-Based Booking Works
            </Typography>

            <List>
              <ListItem sx={{ pl: 0 }}>
                <ListItemIcon>
                  <Timeline color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Select Route Segment"
                  secondary="Choose any pickup and drop points along the driver's route"
                />
              </ListItem>
              
              <ListItem sx={{ pl: 0 }}>
                <ListItemIcon>
                  <Verified color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Verified Drivers"
                  secondary="All drivers are verified with phone numbers and licenses"
                />
              </ListItem>
              
              <ListItem sx={{ pl: 0 }}>
                <ListItemIcon>
                  <Chat color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Easy Communication"
                  secondary="Chat or call drivers directly after booking"
                />
              </ListItem>
            </List>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" gutterBottom>
              💡 Booking Tips
            </Typography>
            <List dense>
              <ListItem sx={{ pl: 0 }}>
                <Typography variant="body2">
                  • Book at least 30 minutes before departure
                </Typography>
              </ListItem>
              <ListItem sx={{ pl: 0 }}>
                <Typography variant="body2">
                  • Be at pickup location 5 minutes early
                </Typography>
              </ListItem>
              <ListItem sx={{ pl: 0 }}>
                <Typography variant="body2">
                  • Save driver's contact after booking
                </Typography>
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog 
        open={confirmDialogOpen}
        onClose={() => !submitting && setConfirmDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>Confirm Your Booking</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Are you sure you want to book this trip?
          </Typography>
          <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Booking Summary:
            </Typography>
            <Typography variant="body2">
              • Route: {trip.startLocation} → {trip.endLocation}
            </Typography>
            <Typography variant="body2">
              • Your Journey: {bookingForm.pickupLocation} → {bookingForm.dropLocation}
            </Typography>
            <Typography variant="body2">
              • Seats: {bookingForm.seats}
            </Typography>
            {calculatedDistance && (
              <Typography variant="body2">
                • Distance: {calculatedDistance} km
              </Typography>
            )}
            {estimatedFare && (
              <Typography variant="body2">
                • Estimated Fare: ₹{estimatedFare}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDialogOpen(false)}
            disabled={submitting}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBooking}
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{ borderRadius: 2 }}
          >
            {submitting ? "Booking..." : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}