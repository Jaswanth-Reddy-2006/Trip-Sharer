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
  InputAdornment
} from "@mui/material";
import {
  LocationOn,
  Schedule,
  DirectionsCar,
  TwoWheeler,
  Person,
  CurrencyRupee,
  RouteIcon,
  CalendarToday,
  AccessTime,
  AccountCircle,
  Map as MapIcon,
  Info,
  CheckCircle
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, addDoc, serverTimestamp, updateDoc } from "firebase/firestore";
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

export default function BookTrip({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
  const [estimatedPrice, setEstimatedPrice] = useState(null);

  // Google Maps API
  const { isLoaded: mapsLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"]
  });

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError("");

    getDoc(doc(db, "trips", id))
      .then((docSnap) => {
        if (docSnap.exists()) {
          const tripData = { id: docSnap.id, ...docSnap.data() };
          setTrip(tripData);

          // Initialize with full trip by default
          setBookingForm(prev => ({
            ...prev,
            pickupLocation: tripData.startLocation,
            dropLocation: tripData.endLocation,
            pickupCoordinates: tripData.startCoordinates || null,
            dropCoordinates: tripData.endCoordinates || null
          }));
        } else {
          setError("Trip not found");
        }
      })
      .catch(() => setError("Failed to load trip"))
      .finally(() => setLoading(false));
  }, [id]);

  // Calculate distance and price when locations change
  useEffect(() => {
    if (bookingForm.pickupCoordinates && bookingForm.dropCoordinates && window.google && mapsLoaded) {
      const service = new window.google.maps.DistanceMatrixService();

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
            setCalculatedDistance(distance.toFixed(1));
            setEstimatedPrice((distance * 2.5).toFixed(2));
          }
        }
      });
    }
  }, [bookingForm.pickupCoordinates, bookingForm.dropCoordinates, mapsLoaded]);

  // Check if booking is partial (different from original trip route)
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

  const handleBooking = async () => {
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
    if (!seatCount || seatCount < 1 || (trip.seatsAvailable && seatCount > trip.seatsAvailable)) {
      setError(`Please select between 1 and ${trip.seatsAvailable || 1} seats.`);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const bookingData = {
        tripId: trip.id,
        userId: user.uid,
        bookingSeats: seatCount,
        pickupLocation: bookingForm.pickupLocation,
        dropLocation: bookingForm.dropLocation,
        pickupCoordinates: bookingForm.pickupCoordinates,
        dropCoordinates: bookingForm.dropCoordinates,
        isPartialTrip: bookingForm.isPartialTrip,
        estimatedDistance: calculatedDistance ? parseFloat(calculatedDistance) : null,
        estimatedPrice: estimatedPrice ? parseFloat(estimatedPrice) : null,
        pricePerKm: 2.5,
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

      setSuccess("Booking successful!");
      setTimeout(() => navigate("/my-bookings"), 2000);
    } catch (e) {
      console.error("Booking error:", e);
      setError("Booking failed, please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4 }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading trip details...</Typography>
        </Paper>
      </Container>
    );
  }

  if (!trip) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {error || "Trip not found."}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate("/trips")}
          sx={{ mt: 2 }}
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
      case "Car":
        return <DirectionsCar />;
      case "Bike":
      case "Scooter":
        return <TwoWheeler />;
      default:
        return <DirectionsCar />;
    }
  };

  return (
    <>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
          {/* Header */}
          <Box sx={{ p: 4, bgcolor: 'primary.main', color: 'white' }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
              Book This Trip
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Choose your pickup and drop points, then confirm your booking
            </Typography>
          </Box>

          <Box sx={{ p: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert 
                severity="success" 
                sx={{ mb: 4, borderRadius: 2 }}
                icon={<CheckCircle />}
              >
                {success}
              </Alert>
            )}

            <Grid container spacing={4}>
              {/* Trip Information */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ borderRadius: 3, mb: 4 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                      Trip Details
                    </Typography>

                    <Stack spacing={3}>
                      {/* Vehicle Info */}
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: 'primary.50',
                            color: 'primary.main'
                          }}
                        >
                          {getVehicleIcon()}
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {trip.vehicleType}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {trip.vehicleNumber}
                          </Typography>
                        </Box>
                      </Stack>

                      {/* Original Route */}
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                          ORIGINAL TRIP ROUTE
                        </Typography>
                        <Stack spacing={1}>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <LocationOn color="primary" />
                            <Typography>{trip.startLocation}</Typography>
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <LocationOn color="secondary" />
                            <Typography>{trip.endLocation}</Typography>
                          </Stack>
                        </Stack>
                      </Box>

                      {/* Time */}
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                          DEPARTURE
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <CalendarToday sx={{ color: 'text.secondary' }} />
                          <Typography>
                            {tripDate ? tripDate.toLocaleDateString() : "N/A"}
                          </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <AccessTime sx={{ color: 'text.secondary' }} />
                          <Typography>
                            {tripDate ? tripDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "N/A"}
                          </Typography>
                        </Stack>
                      </Box>

                      {/* Driver */}
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                          DRIVER
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <AccountCircle sx={{ color: 'text.secondary' }} />
                          <Typography>{trip.uploaderName || "Driver"}</Typography>
                        </Stack>
                      </Box>

                      {/* Seats */}
                      {trip.vehicleType === "Car" && trip.seatsAvailable && (
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
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
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Booking Form */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
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
                        />
                      )}

                      {/* Pickup Location */}
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                          Pickup Location *
                        </Typography>
                        <Stack direction="row" spacing={2}>
                          <Autocomplete
                            fullWidth
                            freeSolo
                            options={hyderabadLocations}
                            value={bookingForm.pickupLocation}
                            onInputChange={(event, newValue) => 
                              handleInputChange('pickupLocation', newValue || '')
                            }
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder="Enter your pickup point"
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
                          {mapsLoaded && (
                            <IconButton
                              onClick={() => openMapPicker('pickup')}
                              sx={{ 
                                bgcolor: 'primary.light',
                                color: 'white',
                                '&:hover': { bgcolor: 'primary.main' }
                              }}
                            >
                              <MapIcon />
                            </IconButton>
                          )}
                        </Stack>
                      </Box>

                      {/* Drop Location */}
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                          Drop Location *
                        </Typography>
                        <Stack direction="row" spacing={2}>
                          <Autocomplete
                            fullWidth
                            freeSolo
                            options={hyderabadLocations}
                            value={bookingForm.dropLocation}
                            onInputChange={(event, newValue) => 
                              handleInputChange('dropLocation', newValue || '')
                            }
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder="Enter your drop point"
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
                          {mapsLoaded && (
                            <IconButton
                              onClick={() => openMapPicker('drop')}
                              sx={{ 
                                bgcolor: 'secondary.light',
                                color: 'white',
                                '&:hover': { bgcolor: 'secondary.main' }
                              }}
                            >
                              <MapIcon />
                            </IconButton>
                          )}
                        </Stack>
                      </Box>

                      {/* Partial Trip Notice */}
                      {bookingForm.isPartialTrip && (
                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Partial Trip Booking
                          </Typography>
                          <Typography variant="body2">
                            You're booking a part of the original trip. 
                            You'll only pay for the distance you travel.
                          </Typography>
                        </Alert>
                      )}

                      {/* Price Calculation */}
                      {calculatedDistance && estimatedPrice && (
                        <Card sx={{ p: 2, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200' }}>
                          <Stack spacing={2}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                              Estimated Cost
                            </Typography>
                            <Grid container spacing={3}>
                              <Grid item xs={4}>
                                <Box textAlign="center">
                                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {calculatedDistance} km
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Distance
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={4}>
                                <Box textAlign="center">
                                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    ₹2.5/km
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Rate
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={4}>
                                <Box textAlign="center">
                                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                                    ₹{estimatedPrice}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Total
                                  </Typography>
                                </Box>
                              </Grid>
                            </Grid>
                          </Stack>
                        </Card>
                      )}

                      <Divider />

                      {/* Book Button */}
                      <Button
                        variant="contained"
                        size="large"
                        onClick={handleBooking}
                        disabled={submitting || !bookingForm.pickupLocation || !bookingForm.dropLocation}
                        sx={{
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

                      {/* Chat Option */}
                      {success && (
                        <Button
                          variant="outlined"
                          onClick={() => {
                            navigate(`/chat/${trip.uploaderId}`, {
                              state: { 
                                user: { 
                                  uid: trip.uploaderId, 
                                  name: trip.uploaderName,
                                  tripId: trip.id
                                } 
                              },
                            });
                          }}
                          sx={{ borderRadius: 3 }}
                        >
                          Chat with {trip.uploaderName || "Driver"}
                        </Button>
                      )}

                      <Button 
                        variant="text" 
                        onClick={() => navigate("/trips")}
                        sx={{ borderRadius: 3 }}
                      >
                        Back to Trips
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Additional Information */}
            <Card sx={{ mt: 4, p: 3, bgcolor: 'info.50', border: '1px solid', borderColor: 'info.200' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'info.main' }}>
                How Partial Booking Works
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Stack direction="row" alignItems="flex-start" spacing={2}>
                    <LocationOn color="primary" />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Flexible Pickup & Drop
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Choose any points along the driver's route
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Stack direction="row" alignItems="flex-start" spacing={2}>
                    <CurrencyRupee color="success" />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Pay Per Distance
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Only pay ₹2.5 per km you actually travel
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Stack direction="row" alignItems="flex-start" spacing={2}>
                    <Info color="info" />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Fair & Transparent
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        No hidden charges, calculated automatically
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </Card>
          </Box>
        </Paper>
      </Container>

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