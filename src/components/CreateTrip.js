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
  Grid,
  Card,
  CardContent,
  Alert,
  Chip,
  Stack,
  Avatar,
  InputAdornment,
  Switch,
  FormControlLabel,
  Divider,
  Fade,
  Slide,
  alpha,
  useTheme
} from "@mui/material";
import {
  LocationOn,
  Schedule,
  DirectionsCar,
  TwoWheeler,
  Person,
  Description,
  Add,
  MyLocation,
  CalendarToday,
  AccessTime,
  DriveEta,
  Info
} from "@mui/icons-material";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const vehicleTypes = [
  { 
    value: "Car", 
    label: "Car", 
    icon: <DirectionsCar />, 
    color: "#1976d2",
    description: "4-wheeler vehicle with seating capacity",
    hasSeats: true
  },
  { 
    value: "Bike", 
    label: "Bike/Motorcycle", 
    icon: <TwoWheeler />, 
    color: "#f57c00",
    description: "2-wheeler vehicle for single passenger",
    hasSeats: false
  },
  { 
    value: "Scooter", 
    label: "Scooter", 
    icon: <TwoWheeler />, 
    color: "#388e3c",
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
    licenseNumber: "",
    seatsAvailable: "",
    description: "",
    useProfileVehicle: false
  });
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

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
        
        // Pre-fill vehicle details if available in profile
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

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    
    if (type === "checkbox") {
      setForm(prev => ({ 
        ...prev, 
        [name]: checked,
        // Reset vehicle details if unchecked
        ...(name === "useProfileVehicle" && !checked ? {
          vehicleNumber: "",
          licenseNumber: ""
        } : {})
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
      
      // Clear related errors when user starts typing
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: "" }));
      }
      
      // Reset seats when changing vehicle type
      if (name === "vehicleType") {
        setForm(prev => ({ ...prev, seatsAvailable: "" }));
      }
    }
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
    
    // Validate future date
    const selectedDate = new Date(`${form.date}T${form.time}`);
    const now = new Date();
    if (selectedDate <= now) {
      newErrors.date = "Trip date and time must be in the future";
    }
    
    // Validate seats for cars only
    const selectedVehicle = vehicleTypes.find(v => v.value === form.vehicleType);
    if (selectedVehicle?.hasSeats) {
      if (!form.seatsAvailable || form.seatsAvailable < 1 || form.seatsAvailable > 8) {
        newErrors.seatsAvailable = "Please enter seats available (1-8)";
      }
    }
    
    // Vehicle number format validation (basic)
    const vehicleNumberPattern = /^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/;
    if (form.vehicleNumber && !vehicleNumberPattern.test(form.vehicleNumber.toUpperCase().replace(/\s/g, ''))) {
      newErrors.vehicleNumber = "Vehicle number format: TS08HD2006";
    }
    
    // License number validation
    if (form.licenseNumber && form.licenseNumber.length !== 16) {
      newErrors.licenseNumber = "License number must be 16 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
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
        date: serverTimestamp(), // Will be updated to combine date and time
        createdAt: serverTimestamp(),
        status: 'active'
      };
      
      // Combine date and time for proper timestamp
      const combinedDateTime = new Date(`${form.date}T${form.time}`);
      tripData.date = combinedDateTime;
      
      await addDoc(collection(db, "trips"), tripData);
      
      setShowSuccess(true);
      setTimeout(() => {
        onNavigate("/trips");
      }, 2000);
      
    } catch (error) {
      console.error("Error creating trip:", error);
      setErrors({ general: "Failed to create trip. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedVehicleType = vehicleTypes.find(v => v.value === form.vehicleType);
  const minDate = new Date().toISOString().split('T');
  const minTime = new Date().toTimeString().slice(0,5);

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Box textAlign="center">
          <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main', mx: 'auto', mb: 2 }}>
            <DirectionsCar />
          </Avatar>
          <Typography variant="h6" color="text.secondary">Loading...</Typography>
        </Box>
      </Container>
    );
  }

  if (showSuccess) {
    return (
      <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Fade in timeout={800}>
          <Card sx={{ textAlign: 'center', p: 4, borderRadius: 4 }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'success.main', mx: 'auto', mb: 2 }}>
              <DirectionsCar />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: 'success.main' }}>
              Trip Created Successfully!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Redirecting to trips page...
            </Typography>
          </Card>
        </Fade>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Fade in timeout={600}>
        <Box>
          {/* Header */}
          <Paper 
            elevation={0}
            sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              p: 4,
              borderRadius: 4,
              mb: 4,
              textAlign: 'center'
            }}
          >
            <Avatar sx={{ width: 60, height: 60, bgcolor: alpha('#ffffff', 0.2), mx: 'auto', mb: 2 }}>
              <Add />
            </Avatar>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              Create a New Trip
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Share your journey and connect with fellow travelers
            </Typography>
          </Paper>

          {/* Form */}
          <Paper 
            elevation={0}
            sx={{ 
              borderRadius: 4,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              overflow: 'hidden'
            }}
          >
            {errors.general && (
              <Alert severity="error" sx={{ borderRadius: 0 }}>
                {errors.general}
              </Alert>
            )}
            
            <Box sx={{ p: 4 }}>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={4}>
                  {/* Route Section */}
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                      <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
                      Route Details
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="From (Pickup Location)"
                      name="startLocation"
                      value={form.startLocation}
                      onChange={handleChange}
                      error={!!errors.startLocation}
                      helperText={errors.startLocation}
                      placeholder="Enter pickup location in Hyderabad"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <MyLocation color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="To (Drop Location)"
                      name="endLocation"
                      value={form.endLocation}
                      onChange={handleChange}
                      error={!!errors.endLocation}
                      helperText={errors.endLocation}
                      placeholder="Enter destination in Hyderabad"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationOn color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>

                  {/* Date & Time Section */}
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                      <Schedule sx={{ mr: 1, color: 'primary.main' }} />
                      When are you traveling?
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Travel Date"
                      name="date"
                      value={form.date}
                      onChange={handleChange}
                      error={!!errors.date}
                      helperText={errors.date}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: minDate }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarToday color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="time"
                      label="Departure Time"
                      name="time"
                      value={form.time}
                      onChange={handleChange}
                      error={!!errors.time}
                      helperText={errors.time}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AccessTime color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>

                  {/* Vehicle Section */}
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                      <DirectionsCar sx={{ mr: 1, color: 'primary.main' }} />
                      Vehicle Information
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth error={!!errors.vehicleType}>
                      <InputLabel>Select Vehicle Type</InputLabel>
                      <Select
                        name="vehicleType"
                        value={form.vehicleType}
                        onChange={handleChange}
                        label="Select Vehicle Type"
                        sx={{ borderRadius: 2 }}
                      >
                        {vehicleTypes.map((vehicle) => (
                          <MenuItem key={vehicle.value} value={vehicle.value}>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Avatar sx={{ width: 40, height: 40, bgcolor: alpha(vehicle.color, 0.1) }}>
                                {React.cloneElement(vehicle.icon, { sx: { color: vehicle.color } })}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                  {vehicle.label}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {vehicle.description}
                                </Typography>
                              </Box>
                            </Stack>
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.vehicleType && (
                        <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                          {errors.vehicleType}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>

                  {/* Seats - Only for Cars */}
                  {selectedVehicleType?.hasSeats && (
                    <Grid item xs={12} md={6}>
                      <Slide direction="right" in={selectedVehicleType?.hasSeats} timeout={500}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Seats Available"
                          name="seatsAvailable"
                          value={form.seatsAvailable}
                          onChange={handleChange}
                          error={!!errors.seatsAvailable}
                          helperText={errors.seatsAvailable || "How many passengers can you accommodate?"}
                          inputProps={{ min: 1, max: 8 }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Person color="action" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      </Slide>
                    </Grid>
                  )}

                  {/* Vehicle Details */}
                  {profile?.hasVehicle && profile?.vehicleNumber && (
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={form.useProfileVehicle}
                            onChange={handleChange}
                            name="useProfileVehicle"
                            color="primary"
                          />
                        }
                        label={`Use vehicle from profile (${profile.vehicleNumber})`}
                      />
                    </Grid>
                  )}

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Vehicle Number"
                      name="vehicleNumber"
                      value={form.useProfileVehicle ? profile?.vehicleNumber || '' : form.vehicleNumber}
                      onChange={handleChange}
                      disabled={form.useProfileVehicle}
                      error={!!errors.vehicleNumber}
                      helperText={errors.vehicleNumber || "Format: TS08HD2006"}
                      placeholder="TS08HD2006"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <DriveEta color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="License Number"
                      name="licenseNumber"
                      value={form.useProfileVehicle ? profile?.licenseNumber || '' : form.licenseNumber}
                      onChange={handleChange}
                      disabled={form.useProfileVehicle}
                      error={!!errors.licenseNumber}
                      helperText={errors.licenseNumber || "16 characters including DL-"}
                      placeholder="DL-142011223344"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>

                  {/* Description */}
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Trip Description (Optional)"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Add any specific instructions, preferences, or additional details about your trip..."
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 2 }}>
                            <Description color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>

                  {/* Submit Button */}
                  <Grid item xs={12}>
                    <Box sx={{ textAlign: 'center', pt: 2 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={submitting}
                        sx={{
                          minWidth: 200,
                          py: 2,
                          borderRadius: 3,
                          background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          '&:hover': {
                            background: 'linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)',
                            transform: 'translateY(-2px)',
                            boxShadow: theme.shadows
                          },
                          '&:disabled': {
                            background: 'grey.400'
                          }
                        }}
                      >
                        {submitting ? "Creating Trip..." : "Create Trip"}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </Box>
          </Paper>

          {/* Info Card */}
          <Card sx={{ mt: 4, borderRadius: 3, border: `1px solid ${alpha('#2196F3', 0.2)}` }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: alpha('#2196F3', 0.1) }}>
                  <Info sx={{ color: '#2196F3' }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Trip Creation Tips
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Be specific about pickup and drop locations for better matches
                    <br />• Set realistic departure times and allow buffer for delays
                    <br />• For cars, seats represent available passenger capacity
                    <br />• Add contact details in description if needed
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Fade>
    </Container>
  );
}
