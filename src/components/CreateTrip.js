import React, { useState, useEffect } from "react";

import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Stack,
  InputAdornment,
  Divider,
  alpha,
  useTheme,
  Autocomplete,
  Card,
  CardContent,
  IconButton,
  FormControlLabel,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Grid,
  CircularProgress
} from "@mui/material";

import {
  LocationOn,
  Schedule,
  DirectionsCar,
  TwoWheeler,
  Person,
  Description,
  CalendarToday,
  AccessTime,
  DriveEta,
  Info,
  Add,
  Remove,
  Route,
  Stop,
  Warning,
  CheckCircle,
  ExpandMore,
  MyLocation,
  AutoAwesome,
  Timeline,
  Navigation,
  Phone,
  Shield,
  AccountCircle
} from "@mui/icons-material";

import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { validateCreateTripForm } from "../validation";
import {
  hyderabadLocations,
  findRoutesBetween,
  getRouteById,
  createDirectRoute,
  getUniqueIntermediateStops,
  filterRoutesByIntermediates
} from "./routesData";

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
    vehicleModel: "",
    licenseNumber: "",
    seatsAvailable: "",
    description: "",
    selectedIntermediates: []
  });

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);

  // ✅ ENHANCED Route Management
  const [routeInfo, setRouteInfo] = useState({
    availableRoutes: [],
    uniqueIntermediates: [],
    filteredRoutes: [],
    finalRoute: null,
    routeSelectionStep: "none" // "none", "loading", "multiple", "selected"
  });

  const [startLocationOptions, setStartLocationOptions] = useState([]);
  const [endLocationOptions, setEndLocationOptions] = useState([]);

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
          setShowProfileDialog(true);
          setLoading(false);
          return;
        }

        const userData = docSnap.data();
        setProfile(userData);

        if (userData.hasVehicle && userData.vehicleNumber && userData.licenseNumber) {
          setForm(prev => ({
            ...prev,
            vehicleNumber: userData.vehicleNumber,
            vehicleModel: userData.vehicleModel || "",
            licenseNumber: userData.licenseNumber
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

  // ✅ ENHANCED: Smart route detection and intermediate handling
  useEffect(() => {
    console.log("🔍 Route detection triggered:", form.startLocation, "→", form.endLocation);
    
    if (!form.startLocation || !form.endLocation) {
      console.log("❌ Missing locations, resetting route info");
      setRouteInfo({
        availableRoutes: [],
        uniqueIntermediates: [],
        filteredRoutes: [],
        finalRoute: null,
        routeSelectionStep: "none"
      });
      return;
    }

    if (form.startLocation.toLowerCase() === form.endLocation.toLowerCase()) {
      console.log("❌ Same start and end location");
      setRouteInfo(prev => ({ ...prev, routeSelectionStep: "none" }));
      return;
    }

    setRouteInfo(prev => ({ ...prev, routeSelectionStep: "loading" }));

    // Simulate async processing for better UX
    setTimeout(() => {
      const availableRoutes = findRoutesBetween(form.startLocation, form.endLocation);
      console.log(`📊 Found ${availableRoutes.length} routes`);

      if (availableRoutes.length === 0) {
        // No predefined routes - create direct route
        console.log("🛤️ No predefined routes, will create direct route");
        setRouteInfo({
          availableRoutes: [],
          uniqueIntermediates: [],
          filteredRoutes: [],
          finalRoute: null,
          routeSelectionStep: "none"
        });
        setForm(prev => ({ ...prev, selectedIntermediates: [] }));
      } else if (availableRoutes.length === 1) {
        // Single route - auto-select
        console.log("✅ Single route found, auto-selecting");
        setRouteInfo({
          availableRoutes,
          uniqueIntermediates: [],
          filteredRoutes: availableRoutes,
          finalRoute: availableRoutes[0],
          routeSelectionStep: "selected"
        });
        setForm(prev => ({ ...prev, selectedIntermediates: [] }));
      } else {
        // Multiple routes - show intermediate selection
        console.log("🛤️ Multiple routes found, showing intermediate selection");
        const uniqueIntermediates = getUniqueIntermediateStops(
          availableRoutes,
          form.startLocation,
          form.endLocation
        );
        setRouteInfo({
          availableRoutes,
          uniqueIntermediates,
          filteredRoutes: availableRoutes,
          finalRoute: null,
          routeSelectionStep: "multiple"
        });
        setForm(prev => ({ ...prev, selectedIntermediates: [] }));
      }
    }, 100);
  }, [form.startLocation, form.endLocation]);

  // ✅ ENHANCED: Handle intermediate selection
  useEffect(() => {
    if (routeInfo.routeSelectionStep !== "multiple" || !form.selectedIntermediates.length) {
      return;
    }

    console.log("🎯 Filtering routes by selected intermediates:", form.selectedIntermediates);
    const filteredRoutes = filterRoutesByIntermediates(
      routeInfo.availableRoutes,
      form.startLocation,
      form.endLocation,
      form.selectedIntermediates
    );

    if (filteredRoutes.length === 1) {
      console.log("✅ Filtered down to single route, auto-selecting");
      setRouteInfo(prev => ({
        ...prev,
        filteredRoutes,
        finalRoute: filteredRoutes[0],
        routeSelectionStep: "selected"
      }));
    } else {
      console.log(`🔍 Still ${filteredRoutes.length} routes after filtering`);
      setRouteInfo(prev => ({
        ...prev,
        filteredRoutes,
        finalRoute: null
      }));
    }
  }, [form.selectedIntermediates, routeInfo.availableRoutes, form.startLocation, form.endLocation, routeInfo.routeSelectionStep]);

  const filterLocations = (inputValue) => {
    if (!inputValue || inputValue.length < 1) return [];
    const lowerInput = inputValue.toLowerCase();
    return hyderabadLocations
      .filter(location => location.toLowerCase().includes(lowerInput))
      .slice(0, 15);
  };

  const handleLocationChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }

    if (name === "vehicleType") {
      setForm(prev => ({ ...prev, seatsAvailable: "" }));
    }
  };

  const handleIntermediateToggle = (intermediate) => {
    console.log("🎯 Toggling intermediate:", intermediate);
    const isSelected = form.selectedIntermediates.includes(intermediate);
    if (isSelected) {
      setForm(prev => ({
        ...prev,
        selectedIntermediates: prev.selectedIntermediates.filter(i => i !== intermediate)
      }));
    } else {
      setForm(prev => ({
        ...prev,
        selectedIntermediates: [...prev.selectedIntermediates, intermediate]
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🚀 Submit triggered with route info:", routeInfo);
    console.log("📝 Form data:", form);

    // Basic validation
    if (!form.startLocation || !form.endLocation) {
      setErrors({ general: "Please select start and end locations" });
      return;
    }

    if (routeInfo.routeSelectionStep === "multiple" && !routeInfo.finalRoute) {
      setErrors({ general: "Please select intermediate stops to determine your exact route" });
      return;
    }

    if (!profile || !profile.phone) {
      setErrors({ general: "Profile incomplete. Please update your profile with a valid phone number." });
      return;
    }

    const validationErrors = validateCreateTripForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

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

      let finalRoute;
      if (routeInfo.finalRoute) {
        // Use selected predefined route
        finalRoute = routeInfo.finalRoute;
        console.log("✅ Using predefined route:", finalRoute.route_name);
      } else {
        // Create direct route
        console.log("🛤️ Creating direct route with intermediates:", form.selectedIntermediates);
        finalRoute = createDirectRoute(
          form.startLocation,
          form.endLocation,
          form.selectedIntermediates
        );
      }

      const tripData = {
        startLocation: form.startLocation.trim(),
        endLocation: form.endLocation.trim(),
        date: selectedDateTime,
        routeId: finalRoute.route_id,
        routeName: finalRoute.route_name,
        intermediateStops: form.selectedIntermediates,
        totalStops: finalRoute.total_stops,
        estimatedDistance: finalRoute.distance_km,
        vehicleType: form.vehicleType,
        vehicleNumber: form.vehicleNumber.toUpperCase().replace(/\s/g, ''),
        vehicleModel: form.vehicleModel.trim(),
        licenseNumber: form.licenseNumber.toUpperCase().replace(/[\s\-]/g, ''),
        seatsAvailable: selectedVehicle?.hasSeats ? Number(form.seatsAvailable) : null,
        uploaderId: auth.currentUser.uid,
        uploaderName: profile.name || "Unknown User",
        uploaderUsername: profile.username || "",
        uploaderPhone: profile.phone || "",
        description: form.description.trim(),
        createdAt: serverTimestamp(),
        status: 'active',
        isDirectRoute: finalRoute.is_direct_route || false
      };

      console.log("🚀 Creating trip with data:", tripData);
      const docRef = await addDoc(collection(db, "trips"), tripData);
      console.log("✅ Trip created successfully:", docRef.id);

      setShowSuccess(true);
      setTimeout(() => onNavigate("/trips"), 2000);

    } catch (error) {
      console.error("❌ Error creating trip:", error);
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
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
          Setting up your trip creation...
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          This will only take a moment
        </Typography>
      </Container>
    );
  }

  if (showSuccess) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          🎉 Trip Created Successfully!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Redirecting to trips page...
        </Typography>
      </Container>
    );
  }

  return (
    <>
      {/* Profile Completion Dialog */}
      <Dialog
        open={showProfileDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 2 }}>
          <AccountCircle sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5">Complete Your Profile</Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
          <Typography variant="body1" paragraph>
            You need to complete your profile before creating trips. This helps other travelers trust and connect with you.
          </Typography>
          <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 3 }}>
            <Chip icon={<Person />} label="Personal Info" color="primary" variant="outlined" />
            <Chip icon={<Phone />} label="Phone Verification" color="primary" variant="outlined" />
            <Chip icon={<Shield />} label="Vehicle Details" color="primary" variant="outlined" />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button onClick={() => onNavigate("/")} variant="outlined" sx={{ borderRadius: 2, px: 3 }}>
            Go Back
          </Button>
          <Button
            onClick={() => onNavigate("/complete-profile")}
            variant="contained"
            sx={{
              borderRadius: 2,
              px: 4,
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)',
              }
            }}
          >
            Complete Profile
          </Button>
        </DialogActions>
      </Dialog>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Create a New Trip
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Share your journey and connect with fellow travelers
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Left Column - Main Form */}
          <Grid item xs={12} lg={8}>
            <form onSubmit={handleSubmit}>
              <Stack spacing={4}>
                {errors.general && (
                  <Alert severity="error">
                    {errors.general}
                  </Alert>
                )}

                {/* Route Details */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Route Details
                    </Typography>

                    <Grid container spacing={3}>
                      {/* Start Location */}
                      <Grid item xs={12} md={6}>
                        <Autocomplete
                          value={form.startLocation}
                          onChange={(event, newValue) => handleLocationChange('startLocation', newValue || '')}
                          onInputChange={(event, newValue) => {
                            handleLocationChange('startLocation', newValue || '');
                            setStartLocationOptions(filterLocations(newValue));
                          }}
                          options={startLocationOptions}
                          freeSolo
                          noOptionsText="Type to search locations..."
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Start Location *"
                              error={!!errors.startLocation}
                              helperText={errors.startLocation}
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

                      {/* End Location */}
                      <Grid item xs={12} md={6}>
                        <Autocomplete
                          value={form.endLocation}
                          onChange={(event, newValue) => handleLocationChange('endLocation', newValue || '')}
                          onInputChange={(event, newValue) => {
                            handleLocationChange('endLocation', newValue || '');
                            setEndLocationOptions(filterLocations(newValue));
                          }}
                          options={endLocationOptions}
                          freeSolo
                          noOptionsText="Type to search locations..."
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="End Location *"
                              error={!!errors.endLocation}
                              helperText={errors.endLocation}
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
                    </Grid>

                    {/* ✅ ENHANCED: Smart Route Selection */}
                    {routeInfo.routeSelectionStep === "loading" && (
                      <Box sx={{ mt: 3, textAlign: 'center', p: 3 }}>
                        <CircularProgress />
                        <Typography variant="h6" sx={{ mt: 2 }}>
                          🔍 Analyzing Available Routes...
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Finding the best paths between your locations
                        </Typography>
                      </Box>
                    )}

                    {routeInfo.routeSelectionStep === "selected" && routeInfo.finalRoute && (
                      <Alert severity="success" sx={{ mt: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          <CheckCircle sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Route Confirmed
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {routeInfo.finalRoute.route_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          Distance: {routeInfo.finalRoute.distance_km} km •
                          Duration: ~{routeInfo.finalRoute.estimated_time_minutes} minutes
                        </Typography>
                        <Typography variant="subtitle2" gutterBottom>
                          Route Stops:
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {routeInfo.finalRoute.total_stops.map((stop, index) => (
                            <Chip
                              key={stop}
                              label={stop}
                              size="small"
                              color={index === 0 ? "success" : 
                                     index === routeInfo.finalRoute.total_stops.length - 1 ? "error" : "default"}
                              variant="outlined"
                            />
                          ))}
                        </Stack>
                      </Alert>
                    )}

                    {routeInfo.routeSelectionStep === "multiple" && (
                      <Card variant="outlined" sx={{ mt: 3, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            <Route sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Select Your Route Stops
                          </Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            Multiple routes found! Select the intermediate stops where you'll pick up or drop passengers to determine your exact route.
                          </Typography>
                          
                          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                            Available Intermediate Stops:
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                            {routeInfo.uniqueIntermediates.map((intermediate) => (
                              <Chip
                                key={intermediate}
                                label={intermediate}
                                onClick={() => handleIntermediateToggle(intermediate)}
                                color={form.selectedIntermediates.includes(intermediate) ? "primary" : "default"}
                                variant={form.selectedIntermediates.includes(intermediate) ? "filled" : "outlined"}
                                sx={{
                                  borderRadius: 2,
                                  cursor: 'pointer',
                                  '&:hover': {
                                    transform: 'translateY(-1px)',
                                  },
                                  transition: 'all 0.2s ease'
                                }}
                              />
                            ))}
                          </Stack>

                          {form.selectedIntermediates.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                Selected Route Preview:
                              </Typography>
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                {form.startLocation} → {form.selectedIntermediates.join(' → ')} → {form.endLocation}
                              </Typography>
                              {routeInfo.filteredRoutes.length === 1 && (
                                <Alert severity="success" sx={{ mt: 1 }}>
                                  ✅ Route confirmed: {routeInfo.filteredRoutes[0].route_name}
                                </Alert>
                              )}
                              {routeInfo.filteredRoutes.length > 1 && (
                                <Alert severity="warning" sx={{ mt: 1 }}>
                                  ⚠️ Multiple routes still possible. Select more specific stops.
                                </Alert>
                              )}
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                </Card>

                {/* Date & Time */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      When are you traveling?
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          name="date"
                          label="Travel Date"
                          type="date"
                          value={form.date}
                          onChange={handleChange}
                          error={!!errors.date}
                          helperText={errors.date}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ min: minDate }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <CalendarToday />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          name="time"
                          label="Departure Time"
                          type="time"
                          value={form.time}
                          onChange={handleChange}
                          error={!!errors.time}
                          helperText={errors.time}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ min: minTime }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <AccessTime />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Vehicle Information */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Vehicle Information
                    </Typography>

                    {/* Vehicle Type Selection */}
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                      Select Vehicle Type *
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      {vehicleTypes.map((vehicle) => (
                        <Grid item xs={12} sm={4} key={vehicle.value}>
                          <Card
                            onClick={() => handleChange({ target: { name: 'vehicleType', value: vehicle.value } })}
                            sx={{
                              minWidth: 200,
                              cursor: 'pointer',
                              border: form.vehicleType === vehicle.value ? 2 : 1,
                              borderColor: form.vehicleType === vehicle.value ? vehicle.color : 'divider',
                              '&:hover': {
                                borderColor: vehicle.color,
                                transform: 'translateY(-2px)',
                              },
                              transition: 'all 0.2s ease',
                              borderRadius: 2
                            }}
                          >
                            <CardContent sx={{ textAlign: 'center' }}>
                              <Box sx={{ color: vehicle.color, mb: 1 }}>
                                {vehicle.icon}
                              </Box>
                              <Typography variant="h6" gutterBottom>
                                {vehicle.label}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {vehicle.description}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                    {errors.vehicleType && (
                      <Typography color="error" variant="caption">
                        {errors.vehicleType}
                      </Typography>
                    )}

                    {/* Seats - Only for Cars */}
                    {selectedVehicleType?.hasSeats && (
                      <TextField
                        name="seatsAvailable"
                        label="Available Seats"
                        type="number"
                        value={form.seatsAvailable}
                        onChange={handleChange}
                        error={!!errors.seatsAvailable}
                        helperText={errors.seatsAvailable}
                        inputProps={{ min: 1, max: 8 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, mb: 3 }}
                      />
                    )}

                    {/* Vehicle Details */}
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          name="vehicleNumber"
                          label="Vehicle Number (e.g., TG07HD2006)"
                          value={form.vehicleNumber}
                          onChange={handleChange}
                          error={!!errors.vehicleNumber}
                          helperText={errors.vehicleNumber}
                          fullWidth
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <DriveEta />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          name="vehicleModel"
                          label="Vehicle Model (Optional)"
                          value={form.vehicleModel}
                          onChange={handleChange}
                          error={!!errors.vehicleModel}
                          helperText={errors.vehicleModel}
                          fullWidth
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Info />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          name="licenseNumber"
                          label="Driving License Number"
                          value={form.licenseNumber}
                          onChange={handleChange}
                          error={!!errors.licenseNumber}
                          helperText={errors.licenseNumber}
                          fullWidth
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Shield />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Description */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Additional Details
                    </Typography>
                    <TextField
                      name="description"
                      label="Trip Description (Optional)"
                      multiline
                      rows={3}
                      value={form.description}
                      onChange={handleChange}
                      error={!!errors.description}
                      helperText={errors.description || "Add pickup instructions, landmarks, or other helpful details"}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Description />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={submitting}
                  variant="contained"
                  size="large"
                  startIcon={submitting ? <CircularProgress size={20} /> : <CheckCircle />}
                  fullWidth
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
              </Stack>
            </form>
          </Grid>

          {/* Right Column - Trip Preview & Tips */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ position: 'sticky', top: 20 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🚀 Trip Preview
                </Typography>

                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                  {selectedVehicleType?.icon || <DirectionsCar />}
                  <Box>
                    <Typography variant="subtitle1">
                      {selectedVehicleType?.label || "Select Vehicle"}
                    </Typography>
                    {form.vehicleNumber && (
                      <Typography variant="body2" color="text.secondary">
                        {form.vehicleNumber}
                      </Typography>
                    )}
                  </Box>
                </Stack>

                {form.startLocation && form.endLocation && (
                  <>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <LocationOn color="success" />
                      <Typography>{form.startLocation}</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                      <LocationOn color="error" />
                      <Typography>{form.endLocation}</Typography>
                    </Stack>
                  </>
                )}

                {form.date && form.time && (
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <Schedule />
                    <Typography>{form.date} at {form.time}</Typography>
                  </Stack>
                )}

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                  💡 Tips for Better Bookings
                </Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  • Add specific pickup locations in description
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  • Select intermediate stops for better visibility
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  • Verify your vehicle details are accurate
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  • Be responsive to passenger messages
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
