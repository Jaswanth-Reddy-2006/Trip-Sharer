import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
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
  Autocomplete,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  alpha
} from "@mui/material";
import {
  LocationOn,
  Schedule,
  DirectionsCar,
  TwoWheeler,
  Person,
  RouteIcon,
  CalendarToday,
  AccessTime,
  AccountCircle,
  Map as MapIcon,
  Info,
  CheckCircle,
  Phone,
  Chat,
  Verified,
  DriveEta,
  Receipt,
  Navigation,
  LocalGasStation
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
import { useJsApiLoader } from "@react-google-maps/api";
import ModalMapPicker from "./ModalMapPicker";

// Hyderabad locations for autocomplete
const hyderabadLocations = [
  "Nagole", "Uppal", "Secunderabad", "Hitech City", "Gachibowli",
  "Madhapur", "Kondapur", "Miyapur", "Kukatpally", "JNTU",
  "Ameerpet", "Begumpet", "Jubilee Hills", "Banjara Hills", "Mehdipatnam",
  "Tolichowki", "Golconda", "Charminar", "Abids", "Nampally",
  "Koti", "Malakpet", "Dilsukhnagar", "LB Nagar", "Vanasthalipuram",
  "Kompally", "Bachupally", "Nizampet", "Madinaguda", "Lingampally"
];

const PRICE_PER_KM = 2.5; // ₹2.5 per kilometer

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

  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    seats: "1",
    pickupLocation: "",
    dropLocation: "",
    pickupCoordinates: null,
    dropCoordinates: null,
    isPartialTrip: false
  });

  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [mapType, setMapType] = useState("");
  const [calculatedDistance, setCalculatedDistance] = useState(null);
  const [estimatedFare, setEstimatedFare] = useState(null);
  const [isOnRoute, setIsOnRoute] = useState({ pickup: false, drop: false });

  // Google Maps API
  const { isLoaded: mapsLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"]
  });

  useEffect(() => {
    if (!id) return;
    loadTripData();
  }, [id]);

  // Calculate distance and fare when coordinates change
  useEffect(() => {
    if (bookingForm.pickupCoordinates && bookingForm.dropCoordinates && 
        trip?.startCoordinates && trip?.endCoordinates && 
        window.google && mapsLoaded) {
      
      const service = new window.google.maps.DistanceMatrixService();
      
      // Calculate user's journey distance
      service.getDistanceMatrix({
        origins: [bookingForm.pickupCoordinates],
        destinations: [bookingForm.dropCoordinates],
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.METRIC,
      }, (response, status) => {
        if (status === window.google.maps.DistanceMatrixStatus.OK) {
          const element = response.rows[0].elements[0];
          if (element.status === "OK") {
            const distance = element.distance.value / 1000; // Convert to km
            const roundedDistance = parseFloat(distance.toFixed(1));
            setCalculatedDistance(roundedDistance);
            
            // Calculate fare based on distance
            const fare = roundedDistance * PRICE_PER_KM;
            setEstimatedFare(fare.toFixed(2));
          }
        }
      });

      // Check if pickup/drop are on the original route
      const checkRouteAlignment = () => {
        const isPickupSameAsStart = bookingForm.pickupLocation === trip.startLocation;
        const isDropSameAsEnd = bookingForm.dropLocation === trip.endLocation;
        setIsOnRoute({
          pickup: isPickupSameAsStart,
          drop: isDropSameAsEnd
        });
      };
      checkRouteAlignment();
    }
  }, [bookingForm.pickupCoordinates, bookingForm.dropCoordinates, trip, mapsLoaded]);

  // Check if booking is partial
  useEffect(() => {
    if (trip) {
      const isPartial = 
        bookingForm.pickupLocation !== trip.startLocation ||
        bookingForm.dropLocation !== trip.endLocation;
      setBookingForm(prev => ({
        ...prev,
        isPartialTrip: isPartial
      }));
    }
  }, [bookingForm.pickupLocation, bookingForm.dropLocation, trip]);

  const loadTripData = async () => {
    setLoading(true);
    setError("");
    try {
      // Load trip details
      const tripSnap = await getDoc(doc(db, "trips", id));
      if (!tripSnap.exists()) {
        setError("Trip not found");
        return;
      }

      const tripData = { id: tripSnap.id, ...tripSnap.data() };
      setTrip(tripData);
      
      // Load trip owner details
      const ownerSnap = await getDoc(doc(db, "users", tripData.uploaderId));
      if (ownerSnap.exists()) {
        setTripOwner(ownerSnap.data());
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

      // Initialize with full trip by default
      setBookingForm(prev => ({
        ...prev,
        pickupLocation: tripData.startLocation,
        dropLocation: tripData.endLocation,
        pickupCoordinates: tripData.startCoordinates || null,
        dropCoordinates: tripData.endCoordinates || null
      }));
      
    } catch (err) {
      setError("Failed to load trip details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setBookingForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const openMapPicker = (type) => {
    setMapType(type);
    setMapModalOpen(true);
  };

  const handleMapSelection = (locationData) => {
    if (mapType === "pickup") {
      setBookingForm(prev => ({
        ...prev,
        pickupLocation: locationData.address,
        pickupCoordinates: { lat: locationData.lat, lng: locationData.lng }
      }));
    } else {
      setBookingForm(prev => ({
        ...prev,
        dropLocation: locationData.address,
        dropCoordinates: { lat: locationData.lat, lng: locationData.lng }
      }));
    }
    setMapModalOpen(false);
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
        pickupCoordinates: bookingForm.pickupCoordinates,
        dropCoordinates: bookingForm.dropCoordinates,
        isPartialTrip: bookingForm.isPartialTrip,
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

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!trip) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error || "Trip not found."}
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate("/trips")}
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

  const getVehicleIcon = () => {
    switch (trip.vehicleType) {
      case "Car": return <DirectionsCar />;
      case "Bike":
      case "Scooter": return <TwoWheeler />;
      default: return <DirectionsCar />;
    }
  };

  return (
    <>
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        {/* Header */}
        <Box mb={{ xs: 3, md: 4 }}>
          <Typography 
            variant={isMobile ? "h4" : "h3"} 
            component="h1" 
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            Book This Trip
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}
          >
            Choose your pickup and drop points, then confirm your booking
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert 
            severity="success" 
            icon={<CheckCircle />}
            sx={{ mb: 3, borderRadius: 2 }}
          >
            {success}
          </Alert>
        )}

        <Grid container spacing={{ xs: 2, md: 4 }}>
          {/* Trip Information */}
          <Grid item xs={12} lg={5}>
            <Card 
              elevation={3}
              sx={{ 
                borderRadius: { xs: 2, md: 3 },
                position: { lg: 'sticky' },
                top: { lg: 24 }
              }}
            >
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Trip Details
                </Typography>

                {/* Vehicle Info */}
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  {getVehicleIcon()}
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {trip.vehicleType} - {trip.vehicleNumber}
                  </Typography>
                </Stack>

                {trip.vehicleModel && (
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {trip.vehicleModel}
                  </Typography>
                )}

                <Divider sx={{ my: 2 }} />

                {/* Original Route */}
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    ORIGINAL TRIP ROUTE
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

                {/* Time */}
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    DEPARTURE
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <CalendarToday fontSize="small" />
                      <Typography variant="body2">
                        {tripDate ? tripDate.toLocaleDateString() : "N/A"}
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <AccessTime fontSize="small" />
                      <Typography variant="body2">
                        {tripDate ? tripDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "N/A"}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>

                {/* Driver */}
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    POSTED BY
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <AccountCircle fontSize="small" />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {trip.uploaderName || "Driver"}
                      </Typography>
                      {trip.uploaderUsername && (
                        <Typography variant="caption" color="text.secondary">
                          @{trip.uploaderUsername}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </Box>

                {/* Seats */}
                {trip.vehicleType === "Car" && trip.seatsAvailable && (
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      AVAILABLE SEATS
                    </Typography>
                    <Chip
                      icon={<Person />}
                      label={`${trip.seatsAvailable} seats available`}
                      color="success"
                      variant="outlined"
                    />
                  </Box>
                )}

                {/* Distance */}
                {trip.estimatedDistance && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      TRIP DISTANCE
                    </Typography>
                    <Chip
                      icon={<DriveEta />}
                      label={`${trip.estimatedDistance} km`}
                      color="info"
                      variant="outlined"
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Booking Form */}
          <Grid item xs={12} lg={7}>
            <Card 
              elevation={2}
              sx={{ borderRadius: { xs: 2, md: 3 } }}
            >
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Your Booking
                </Typography>

                <Stack spacing={3}>
                  {/* Seats Selection */}
                  {trip.vehicleType === "Car" && (
                    <TextField
                      label="Number of Seats"
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
                  )}

                  {/* Pickup Location */}
                  <Box>
                    <Stack 
                      direction={{ xs: 'column', sm: 'row' }} 
                      spacing={1} 
                      alignItems={{ sm: 'flex-end' }}
                    >
                      <Autocomplete
                        value={bookingForm.pickupLocation}
                        onChange={(event, newValue) => handleInputChange('pickupLocation', newValue || '')}
                        options={[trip.startLocation, ...hyderabadLocations]}
                        freeSolo
                        fullWidth
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Pickup Location *"
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <InputAdornment position="start">
                                  <LocationOn />
                                </InputAdornment>
                              ),
                            }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                          />
                        )}
                      />
                      {mapsLoaded && (
                        <IconButton
                          onClick={() => openMapPicker('pickup')}
                          sx={{
                            bgcolor: 'primary.light',
                            color: 'white',
                            '&:hover': { bgcolor: 'primary.main' },
                            borderRadius: 2,
                            minWidth: 48,
                            height: 48
                          }}
                        >
                          <MapIcon />
                        </IconButton>
                      )}
                    </Stack>
                    {bookingForm.isPartialTrip && !isOnRoute.pickup && (
                      <Alert severity="warning" sx={{ mt: 1, borderRadius: 2 }}>
                        ⚠️ This location may not be on the original route
                      </Alert>
                    )}
                  </Box>

                  {/* Drop Location */}
                  <Box>
                    <Stack 
                      direction={{ xs: 'column', sm: 'row' }} 
                      spacing={1} 
                      alignItems={{ sm: 'flex-end' }}
                    >
                      <Autocomplete
                        value={bookingForm.dropLocation}
                        onChange={(event, newValue) => handleInputChange('dropLocation', newValue || '')}
                        options={[trip.endLocation, ...hyderabadLocations]}
                        freeSolo
                        fullWidth
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Drop Location *"
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Navigation />
                                </InputAdornment>
                              ),
                            }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                          />
                        )}
                      />
                      {mapsLoaded && (
                        <IconButton
                          onClick={() => openMapPicker('drop')}
                          sx={{
                            bgcolor: 'secondary.light',
                            color: 'white',
                            '&:hover': { bgcolor: 'secondary.main' },
                            borderRadius: 2,
                            minWidth: 48,
                            height: 48
                          }}
                        >
                          <MapIcon />
                        </IconButton>
                      )}
                    </Stack>
                    {bookingForm.isPartialTrip && !isOnRoute.drop && (
                      <Alert severity="warning" sx={{ mt: 1, borderRadius: 2 }}>
                        ⚠️ This location may not be on the original route
                      </Alert>
                    )}
                  </Box>

                  {/* Partial Trip Notice */}
                  {bookingForm.isPartialTrip && (
                    <Alert 
                      severity="info" 
                      icon={<Info />}
                      sx={{ borderRadius: 2 }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Partial Trip Booking
                      </Typography>
                      <Typography variant="body2">
                        You're booking a part of the original trip. Make sure your locations are accessible from the driver's route.
                      </Typography>
                    </Alert>
                  )}

                  {/* Distance and Fare Display */}
                  {calculatedDistance && estimatedFare && (
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.success.main, 0.05),
                        border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                      }}
                    >
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                        Journey Summary
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <DriveEta color="primary" fontSize="small" />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Distance
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {calculatedDistance} km
                              </Typography>
                            </Box>
                          </Stack>
                        </Grid>
                        <Grid item xs={6}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Receipt color="success" fontSize="small" />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Estimated Fare
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                                ₹{estimatedFare}
                              </Typography>
                            </Box>
                          </Stack>
                        </Grid>
                      </Grid>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        * Based on ₹{PRICE_PER_KM}/km. Final fare may vary.
                      </Typography>
                    </Paper>
                  )}

                  {/* Book Button */}
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleBookingConfirmation}
                    disabled={submitting || !bookingForm.pickupLocation || !bookingForm.dropLocation}
                    sx={{
                      py: 1.5,
                      borderRadius: 3,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)',
                        transform: 'translateY(-2px)'
                      },
                      '&:disabled': {
                        background: theme.palette.action.disabledBackground
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {submitting ? "Booking..." : "Confirm Booking"}
                  </Button>

                  {/* Contact Options */}
                  {success && (
                    <Stack spacing={2}>
                      <Divider />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Contact Driver
                      </Typography>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                        <Button
                          variant="outlined"
                          startIcon={<Chat />}
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
                          fullWidth
                          sx={{ borderRadius: 2 }}
                        >
                          Chat with {trip.uploaderName}
                        </Button>

                        {tripOwner?.phone && (
                          <Button
                            variant="outlined"
                            startIcon={<Phone />}
                            onClick={() => window.open(`tel:${tripOwner.phone}`, '_self')}
                            fullWidth
                            sx={{ borderRadius: 2 }}
                          >
                            Call Driver
                          </Button>
                        )}
                      </Stack>
                    </Stack>
                  )}

                  <Button
                    variant="text"
                    onClick={() => navigate("/trips")}
                    fullWidth
                    sx={{ borderRadius: 2 }}
                  >
                    Back to Trips
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Additional Information */}
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
              How Booking Works
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <LocationOn color="primary" />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Flexible Pickup & Drop
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Choose any points along or near the driver's route
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={12} md={4}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Verified color="success" />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Verified Drivers
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      All drivers are verified with phone numbers and licenses
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={12} md={4}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Chat color="info" />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Easy Communication
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Chat or call drivers directly through the app
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>

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
          <Typography gutterBottom>
            Are you sure you want to book this trip?
          </Typography>
          
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Booking Summary:
            </Typography>
            <Typography variant="body2">• Pickup: {bookingForm.pickupLocation}</Typography>
            <Typography variant="body2">• Drop: {bookingForm.dropLocation}</Typography>
            <Typography variant="body2">• Seats: {bookingForm.seats}</Typography>
            {calculatedDistance && (
              <Typography variant="body2">• Distance: {calculatedDistance} km</Typography>
            )}
            {estimatedFare && (
              <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
                • Estimated Fare: ₹{estimatedFare}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
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
            startIcon={submitting ? <CircularProgress size={16} /> : <CheckCircle />}
            sx={{ borderRadius: 2 }}
          >
            {submitting ? "Booking..." : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Map Modal */}
      {mapsLoaded && (
        <ModalMapPicker
          apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
          open={mapModalOpen}
          onClose={() => setMapModalOpen(false)}
          onSelect={handleMapSelection}
          initialLocation={{ lat: 17.3850, lng: 78.4867 }}
        />
      )}
    </>
  );
}