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
import { useJsApiLoader } from "@react-google-maps/api";
import ModalMapPicker from "./ModalMapPicker";
import { validateCreateTripForm } from "../validation";

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
  "Lakdikapul", "Masab Tank", "Narayanguda", "Himayatnagar", "Domalguda"
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
    vehicleModel: "", // New field
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
  const [mapType, setMapType] = useState("");
  const [estimatedDistance, setEstimatedDistance] = useState(null);

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
            vehicleModel: userData.vehicleModel || "",
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

  // Calculate distance when coordinates are set
  useEffect(() => {
    if (form.startCoordinates && form.endCoordinates && window.google && mapsLoaded) {
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
          }
        }
      });
    }
  }, [form.startCoordinates, form.endCoordinates, mapsLoaded]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    if (type === "checkbox") {
      setForm(prev => ({
        ...prev,
        [name]: checked,
        ...(name === "useProfileVehicle" && !checked ? {
          vehicleNumber: "",
          vehicleModel: "",
          licenseNumber: ""
        } : {})
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: "" }));
      }
    }

    if (name === "vehicleType") {
      setForm(prev => ({ ...prev, seatsAvailable: "" }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateCreateTripForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Additional validation for future date/time
    const selectedDateTime = new Date(`${form.date}T${form.time}`);
    const now = new Date();
    if (selectedDateTime <= now) {
      setErrors({ date: "Trip date and time must be in the future" });
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const selectedVehicle = vehicleTypes.find(v => v.value === form.vehicleType);

      const tripData = {
        // Basic trip info
        startLocation: form.startLocation.trim(),
        endLocation: form.endLocation.trim(),
        startCoordinates: form.startCoordinates,
        endCoordinates: form.endCoordinates,
        date: selectedDateTime,

        // Vehicle info
        vehicleType: form.vehicleType,
        vehicleNumber: form.vehicleNumber.toUpperCase().replace(/\s/g, ''),
        vehicleModel: form.vehicleModel.trim(),
        licenseNumber: form.licenseNumber.toUpperCase().replace(/[\s\-]/g, ''),
        seatsAvailable: selectedVehicle?.hasSeats ? Number(form.seatsAvailable) : null,

        // User info
        uploaderId: auth.currentUser.uid,
        uploaderName: profile.name,
        uploaderUsername: profile.username,
        uploaderPhone: profile.phone,

        // Additional info
        description: form.description.trim(),
        estimatedDistance: estimatedDistance ? parseFloat(estimatedDistance) : null,

        // Metadata
        createdAt: serverTimestamp(),
        status: 'active'
      };

      console.log("Creating trip with data:", tripData);

      const docRef = await addDoc(collection(db, "trips"), tripData);
      console.log("Trip created successfully with ID:", docRef.id);

      setShowSuccess(true);
      setTimeout(() => onNavigate("/trips"), 2000);

    } catch (error) {
      console.error("Error creating trip:", error);
      setErrors({ general: `Failed to create trip: ${error.message}` });
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
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    );
  }

  if (showSuccess) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="h6">Trip Created Successfully!</Typography>
          <Typography>Redirecting to trips page...</Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Header */}
        <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Create a New Trip
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Share your journey and connect with fellow travelers
          </Typography>
        </Paper>

        {/* Form */}
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <form onSubmit={handleSubmit}>
            {errors.general && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {errors.general}
              </Alert>
            )}

            {/* Route Section */}
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Route Details
            </Typography>

            <Stack spacing={3} sx={{ mb: 4 }}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Start Location *
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Autocomplete
                    value={form.startLocation}
                    onChange={(_, newValue) => handleLocationChange('startLocation', newValue || '')}
                    options={hyderabadLocations}
                    freeSolo
                    fullWidth
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
                <Typography variant="subtitle2" gutterBottom>
                  End Location *
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Autocomplete
                    value={form.endLocation}
                    onChange={(_, newValue) => handleLocationChange('endLocation', newValue || '')}
                    options={hyderabadLocations}
                    freeSolo
                    fullWidth
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

              {/* Distance Display */}
              {estimatedDistance && (
                <Alert severity="info" icon={<DriveEta />}>
                  <Typography variant="subtitle2">
                    Estimated Distance: {estimatedDistance} km
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Route calculated using Google Maps
                  </Typography>
                </Alert>
              )}
            </Stack>

            <Divider sx={{ my: 4 }} />

            {/* Date & Time Section */}
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              When are you traveling?
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mb: 4 }}>
              <TextField
                name="date"
                label="Date"
                type="date"
                value={form.date}
                onChange={handleChange}
                required
                fullWidth
                error={!!errors.date}
                helperText={errors.date}
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
                label="Time"
                type="time"
                value={form.time}
                onChange={handleChange}
                required
                fullWidth
                error={!!errors.time}
                helperText={errors.time}
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

            <Divider sx={{ my: 4 }} />

            {/* Vehicle Section */}
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Vehicle Information
            </Typography>

            {/* Vehicle Type Selection */}
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
              Select Vehicle Type *
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: 'wrap', gap: 2 }}>
              {vehicleTypes.map((vehicle) => (
                <Card
                  key={vehicle.value}
                  onClick={() => handleChange({ target: { name: 'vehicleType', value: vehicle.value } })}
                  sx={{
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor: form.vehicleType === vehicle.value ? vehicle.color : 'divider',
                    backgroundColor: form.vehicleType === vehicle.value ? alpha(vehicle.color, 0.05) : 'transparent',
                    '&:hover': {
                      borderColor: vehicle.color,
                      backgroundColor: alpha(vehicle.color, 0.05),
                    },
                    transition: 'all 0.2s'
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Box sx={{ color: vehicle.color, mb: 1 }}>
                      {vehicle.icon}
                    </Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {vehicle.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                      {vehicle.description}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Stack>
            {errors.vehicleType && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.vehicleType}
              </Alert>
            )}

            {/* Seats - Only for Cars */}
            {selectedVehicleType?.hasSeats && (
              <TextField
                name="seatsAvailable"
                label="Seats Available"
                type="number"
                value={form.seatsAvailable}
                onChange={handleChange}
                required
                fullWidth
                sx={{ mb: 3 }}
                inputProps={{ min: 1, max: 8 }}
                error={!!errors.seatsAvailable}
                helperText={errors.seatsAvailable || "Number of passenger seats available"}
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
                sx={{ mb: 2 }}
              />
            )}

            <Stack spacing={3} sx={{ mb: 4 }}>
              <TextField
                name="vehicleNumber"
                label="Vehicle Number"
                value={form.vehicleNumber}
                onChange={handleChange}
                required
                fullWidth
                placeholder="TG07HD2006"
                error={!!errors.vehicleNumber}
                helperText={errors.vehicleNumber || "Enter your vehicle registration number"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DirectionsCar />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                name="vehicleModel"
                label="Vehicle Model (Optional)"
                value={form.vehicleModel}
                onChange={handleChange}
                fullWidth
                placeholder="e.g., Honda City, Activa 6G, etc."
                helperText="Vehicle model for better identification"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Info />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                name="licenseNumber"
                label="License Number"
                value={form.licenseNumber}
                onChange={handleChange}
                required
                fullWidth
                placeholder="TG0720220001234"
                error={!!errors.licenseNumber}
                helperText={errors.licenseNumber || "Enter your driving license number"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DriveEta />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>

            <Divider sx={{ my: 4 }} />

            {/* Description */}
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Additional Details
            </Typography>
            <TextField
              name="description"
              label="Trip Description (Optional)"
              value={form.description}
              onChange={handleChange}
              multiline
              rows={3}
              fullWidth
              placeholder="Any additional information about your trip..."
              sx={{ mb: 4 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Description />
                  </InputAdornment>
                ),
              }}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={submitting}
              sx={{
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 3,
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)',
                },
                mb: 3
              }}
            >
              {submitting ? "Creating Trip..." : "Create Trip"}
            </Button>

            {/* Info Card */}
            <Alert severity="info" icon={<Info />}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Trip Creation Tips
              </Typography>
              <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                <li>Be specific about pickup and drop locations for better matches</li>
                <li>Set realistic departure times and allow buffer for delays</li>
                <li>For cars, seats represent available passenger capacity</li>
                <li>Add vehicle model for better identification by passengers</li>
                <li>Use map picker for exact location selection</li>
              </ul>
            </Alert>
          </form>
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