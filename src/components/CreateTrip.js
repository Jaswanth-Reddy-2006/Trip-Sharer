import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Box,
  Alert,
  Chip,
  Stack,
  InputAdornment,
  Switch,
  FormControlLabel,
  Divider,
  alpha,
  useTheme,
  Autocomplete,
  IconButton,
  Card,
  CardContent
} from "@mui/material";
import {
  LocationOn,
  Schedule,
  DirectionsCar,
  TwoWheeler,
  Person,
  Description,
  MyLocation,
  CalendarToday,
  AccessTime,
  DriveEta,
  Info,
  Map as MapIcon
} from "@mui/icons-material";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useJsApiLoader, Autocomplete as GoogleAutocomplete } from "@react-google-maps/api";
import ModalMapPicker from "./ModalMapPicker";

const vehicleTypes = [
  {
    value: "Car",
    label: "Car",
    icon: <DirectionsCar />,
    color: "#667eea",
    description: "4-wheeler vehicle with seating capacity",
    hasSeats: true
  },
  {
    value: "Bike",
    label: "Bike/Motorcycle", 
    icon: <TwoWheeler />,
    color: "#ed8936",
    description: "2-wheeler vehicle for single passenger",
    hasSeats: false
  },
  {
    value: "Scooter",
    label: "Scooter",
    icon: <TwoWheeler />,
    color: "#48bb78",
    description: "2-wheeler light vehicle for single passenger", 
    hasSeats: false
  }
];

// Hyderabad locations for autocomplete
const hyderabadLocations = [
  "Nagole", "Uppal", "Secunderabad", "Hitech City", "Gachibowli", 
  "Madhapur", "Kondapur", "Miyapur", "Kukatpally", "JNTU",
  "Ameerpet", "Begumpet", "Jubilee Hills", "Banjara Hills", "Mehdipatnam",
  "Tolichowki", "Golconda", "Charminar", "Abids", "Nampally",
  "Koti", "Malakpet", "Dilsukhnagar", "LB Nagar", "Vanasthalipuram",
  "Kompally", "Bachupally", "Nizampet", "Madinaguda", "Lingampally",
  "Chandanagar", "Borabanda", "SR Nagar", "Punjagutta", "Somajiguda",
  "Lakdikapul", "Masab Tank", "Narayanguda", "Himayatnagar", "Domalguda",
  "Tarnaka", "Habsiguda", "Ramanthapur", "Peerzadiguda", "Medchal",
  "Shamirpet", "Kompally", "Alwal", "Bollarum", "Trimulgherry",
  "Malkajgiri", "Sainikpuri", "Neredmet", "Tirmulgherry", "Yapral",
  "Secunderabad Cantonment", "Paradise", "Bowenpally", "Karkhana", "Marredpally"
];

export default function CreateTrip({ user, onNavigate }) {
  const theme = useTheme();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    startLocation: "",
    endLocation: "",
    date: "",
    time: "",
    vehicleType: "",
    vehicleNumber: "",
    licenseNumber: "",
    seatsAvailable: "",
    description: "",
    useProfileVehicle: false,
    startCoordinates: null,
    endCoordinates: null
  });

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [mapType, setMapType] = useState(""); // "start" or "end"
  const [estimatedDistance, setEstimatedDistance] = useState(null);
  const [estimatedPrice, setEstimatedPrice] = useState(null);

  // Google Maps API
  const { isLoaded: mapsLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"]
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.currentUser) {
        onNavigate("/auth");
        return;
      }

      try {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists() || !docSnap.data().profileComplete) {
          onNavigate("/complete-profile");
          return;
        }

        const userData = docSnap.data();
        setProfile(userData);

        // Pre-fill vehicle details if available
        if (userData.hasVehicle && userData.vehicleNumber && userData.licenseNumber) {
          setForm(prev => ({
            ...prev,
            vehicleNumber: userData.vehicleNumber,
            licenseNumber: userData.licenseNumber,
            useProfileVehicle: true
          }));
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setErrors({ general: "Failed to load profile data" });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [onNavigate]);

  // Calculate distance and estimated price
  useEffect(() => {
    if (form.startCoordinates && form.endCoordinates && window.google) {
      const service = new window.google.maps.DistanceMatrixService();
      service.getDistanceMatrix({
        origins: [form.startCoordinates],
        destinations: [form.endCoordinates],
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.METRIC,
      }, (response, status) => {
        if (status === window.google.maps.DistanceMatrixStatus.OK) {
          const element = response.rows[0].elements[0];
          if (element.status === "OK") {
            const distance = element.distance.value / 1000; // Convert to km
            setEstimatedDistance(distance.toFixed(1));
            setEstimatedPrice((distance * 2.5).toFixed(2));
          }
        }
      });
    }
  }, [form.startCoordinates, form.endCoordinates]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    if (type === "checkbox") {
      setForm(prev => ({
        ...prev,
        [name]: checked,
        ...(name === "useProfileVehicle" && !checked ? {
          vehicleNumber: "",
          licenseNumber: ""
        } : {})
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: "" }));
      }

      if (name === "vehicleType") {
        setForm(prev => ({ ...prev, seatsAvailable: "" }));
      }
    }
  };

  const handleLocationChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const openMapPicker = (type) => {
    setMapType(type);
    setMapModalOpen(true);
  };

  const handleMapSelection = (locationData) => {
    if (mapType === "start") {
      setForm(prev => ({
        ...prev,
        startLocation: locationData.address,
        startCoordinates: { lat: locationData.lat, lng: locationData.lng }
      }));
    } else {
      setForm(prev => ({
        ...prev,
        endLocation: locationData.address,
        endCoordinates: { lat: locationData.lat, lng: locationData.lng }
      }));
    }
    setMapModalOpen(false);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.startLocation.trim()) newErrors.startLocation = "Start location is required";
    if (!form.endLocation.trim()) newErrors.endLocation = "End location is required";
    if (!form.date) newErrors.date = "Date is required";
    if (!form.time) newErrors.time = "Time is required";
    if (!form.vehicleType) newErrors.vehicleType = "Vehicle type is required";
    if (!form.vehicleNumber.trim()) newErrors.vehicleNumber = "Vehicle number is required";
    if (!form.licenseNumber.trim()) newErrors.licenseNumber = "License number is required";

    const selectedDate = new Date(`${form.date}T${form.time}`);
    const now = new Date();
    if (selectedDate <= now) {
      newErrors.date = "Trip date and time must be in the future";
    }

    const selectedVehicle = vehicleTypes.find(v => v.value === form.vehicleType);
    if (selectedVehicle?.hasSeats) {
      if (!form.seatsAvailable || form.seatsAvailable < 1 || form.seatsAvailable > 8) {
        newErrors.seatsAvailable = "Please enter seats available (1-8)";
      }
    }

    const vehicleNumberPattern = /^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/;
    if (form.vehicleNumber && !vehicleNumberPattern.test(form.vehicleNumber.toUpperCase().replace(/\s/g, ''))) {
      newErrors.vehicleNumber = "Vehicle number format: TS08HD2006";
    }

    if (form.licenseNumber && form.licenseNumber.length !== 16) {
      newErrors.licenseNumber = "License number must be 16 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const selectedVehicle = vehicleTypes.find(v => v.value === form.vehicleType);
      const tripData = {
        ...form,
        vehicleNumber: form.vehicleNumber.toUpperCase(),
        seatsAvailable: selectedVehicle?.hasSeats ? Number(form.seatsAvailable) : null,
        uploaderId: auth.currentUser.uid,
        uploaderName: profile.name,
        uploaderUsername: profile.username,
        uploaderPhone: profile.phone,
        createdAt: serverTimestamp(),
        status: 'active',
        estimatedDistance: estimatedDistance ? parseFloat(estimatedDistance) : null,
        pricePerKm: 2.5
      };

      const combinedDateTime = new Date(`${form.date}T${form.time}`);
      tripData.date = combinedDateTime;

      await addDoc(collection(db, "trips"), tripData);
      setShowSuccess(true);
      setTimeout(() => onNavigate("/trips"), 2000);
    } catch (error) {
      console.error("Error creating trip:", error);
      setErrors({ general: "Failed to create trip. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedVehicleType = vehicleTypes.find(v => v.value === form.vehicleType);
  const minDate = new Date().toISOString().split('T')[0];
  const currentTime = new Date();
  const minTime = form.date === minDate ? 
    `${currentTime.getHours().toString().padStart(2, '0')}:${(currentTime.getMinutes() + 30).toString().padStart(2, '0')}` : 
    "00:00";

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4 }}>
          <Typography>Loading...</Typography>
        </Paper>
      </Container>
    );
  }

  if (showSuccess) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4 }}>
          <Typography variant="h4" sx={{ color: 'success.main', mb: 2 }}>
            Trip Created Successfully!
          </Typography>
          <Typography>Redirecting to trips page...</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: { xs: 3, md: 6 }, borderRadius: 4 }}>
          {/* Header */}
          <Box textAlign="center" sx={{ mb: 6 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 2,
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Create a New Trip
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Share your journey and connect with fellow travelers
            </Typography>
          </Box>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            {errors.general && (
              <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
                {errors.general}
              </Alert>
            )}

            <Stack spacing={4}>
              {/* Route Section */}
              <Card variant="outlined" sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn color="primary" />
                  Route Details
                </Typography>

                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                      Start Location *
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      <Autocomplete
                        fullWidth
                        freeSolo
                        options={hyderabadLocations}
                        value={form.startLocation}
                        onInputChange={(event, newValue) => handleLocationChange('startLocation', newValue || '')}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Enter pickup location"
                            error={!!errors.startLocation}
                            helperText={errors.startLocation}
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
                          onClick={() => openMapPicker('start')}
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

                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                      End Location *
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      <Autocomplete
                        fullWidth
                        freeSolo
                        options={hyderabadLocations}
                        value={form.endLocation}
                        onInputChange={(event, newValue) => handleLocationChange('endLocation', newValue || '')}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Enter destination"
                            error={!!errors.endLocation}
                            helperText={errors.endLocation}
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
                          onClick={() => openMapPicker('end')}
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

                  {/* Distance and Price Estimation */}
                  {estimatedDistance && estimatedPrice && (
                    <Card sx={{ p: 2, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200' }}>
                      <Stack direction="row" spacing={4} justifyContent="center">
                        <Box textAlign="center">
                          <Typography variant="h6" color="success.main" sx={{ fontWeight: 600 }}>
                            {estimatedDistance} km
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Estimated Distance
                          </Typography>
                        </Box>
                        <Box textAlign="center">
                          <Typography variant="h6" color="success.main" sx={{ fontWeight: 600 }}>
                            ₹{estimatedPrice}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Max Trip Cost (₹2.5/km)
                          </Typography>
                        </Box>
                      </Stack>
                    </Card>
                  )}
                </Stack>
              </Card>

              {/* Date & Time Section */}
              <Card variant="outlined" sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Schedule color="primary" />
                  When are you traveling?
                </Typography>

                <Stack spacing={3}>
                  <TextField
                    name="date"
                    type="date"
                    label="Travel Date"
                    value={form.date}
                    onChange={handleChange}
                    error={!!errors.date}
                    helperText={errors.date}
                    fullWidth
                    required
                    inputProps={{ min: minDate }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarToday />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    name="time"
                    type="time"
                    label="Departure Time"
                    value={form.time}
                    onChange={handleChange}
                    error={!!errors.time}
                    helperText={errors.time}
                    fullWidth
                    required
                    inputProps={{ min: minTime }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccessTime />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Stack>
              </Card>

              {/* Vehicle Section */}
              <Card variant="outlined" sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DriveEta color="primary" />
                  Vehicle Information
                </Typography>

                <Stack spacing={3}>
                  {/* Vehicle Type Selection */}
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 2 }}>
                      Select Vehicle Type *
                    </Typography>
                    <Stack spacing={2}>
                      {vehicleTypes.map((vehicle) => (
                        <Paper
                          key={vehicle.value}
                          sx={{
                            p: 2,
                            border: '2px solid',
                            borderColor: form.vehicleType === vehicle.value ? vehicle.color : 'grey.200',
                            bgcolor: form.vehicleType === vehicle.value ? alpha(vehicle.color, 0.05) : 'transparent',
                            cursor: 'pointer',
                            '&:hover': {
                              borderColor: vehicle.color,
                              bgcolor: alpha(vehicle.color, 0.05)
                            },
                            transition: 'all 0.2s'
                          }}
                          onClick={() => handleChange({ target: { name: 'vehicleType', value: vehicle.value } })}
                        >
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Box sx={{ color: vehicle.color, fontSize: '2rem' }}>
                              {vehicle.icon}
                            </Box>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {vehicle.label}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {vehicle.description}
                              </Typography>
                            </Box>
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                    {errors.vehicleType && (
                      <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                        {errors.vehicleType}
                      </Typography>
                    )}
                  </Box>

                  {/* Seats - Only for Cars */}
                  {selectedVehicleType?.hasSeats && (
                    <TextField
                      name="seatsAvailable"
                      type="number"
                      label="Available Seats"
                      value={form.seatsAvailable}
                      onChange={handleChange}
                      error={!!errors.seatsAvailable}
                      helperText={errors.seatsAvailable || "How many passengers can you accommodate?"}
                      fullWidth
                      required
                      inputProps={{ min: 1, max: 8 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}

                  {/* Vehicle Details */}
                  {profile?.hasVehicle && profile?.vehicleNumber && (
                    <FormControlLabel
                      control={
                        <Switch
                          name="useProfileVehicle"
                          checked={form.useProfileVehicle}
                          onChange={handleChange}
                        />
                      }
                      label={`Use vehicle from profile (${profile.vehicleNumber})`}
                    />
                  )}

                  <TextField
                    name="vehicleNumber"
                    label="Vehicle Number"
                    value={form.useProfileVehicle ? profile?.vehicleNumber : form.vehicleNumber}
                    onChange={handleChange}
                    error={!!errors.vehicleNumber}
                    helperText={errors.vehicleNumber || "e.g., TS08HD2006"}
                    fullWidth
                    required
                    disabled={form.useProfileVehicle}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DirectionsCar />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    name="licenseNumber"
                    label="License Number"
                    value={form.useProfileVehicle ? profile?.licenseNumber : form.licenseNumber}
                    onChange={handleChange}
                    error={!!errors.licenseNumber}
                    helperText={errors.licenseNumber || "16-character driving license number"}
                    fullWidth
                    required
                    disabled={form.useProfileVehicle}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Info />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Stack>
              </Card>

              {/* Description */}
              <Card variant="outlined" sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Description color="primary" />
                  Additional Details
                </Typography>

                <TextField
                  name="description"
                  label="Trip Description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Add any specific instructions, landmarks, or preferences..."
                  multiline
                  rows={4}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 2 }}>
                        <Description />
                      </InputAdornment>
                    ),
                  }}
                />
              </Card>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={submitting}
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
                {submitting ? "Creating Trip..." : "Create Trip"}
              </Button>

              {/* Info Card */}
              <Card sx={{ p: 3, bgcolor: 'info.50', border: '1px solid', borderColor: 'info.200' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'info.main' }}>
                  Trip Creation Tips
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    • Be specific about pickup and drop locations for better matches
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Set realistic departure times and allow buffer for delays
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • For cars, seats represent available passenger capacity
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Pricing is distance-based at ₹2.5 per kilometer
                  </Typography>
                </Stack>
              </Card>
            </Stack>
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
          initialLocation={{ lat: 17.3850, lng: 78.4867 }} // Hyderabad center
        />
      )}
    </>
  );
}