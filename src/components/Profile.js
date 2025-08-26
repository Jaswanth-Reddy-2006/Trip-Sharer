import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  Box,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
  Divider,
  Paper,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  InputAdornment,
  Fade,
  alpha,
  useTheme
} from "@mui/material";
import {
  Person,
  Phone,
  Email,
  DirectionsCar,
  Shield,
  CheckCircle,
  Send,
  Verified,
  AccountCircle,
  ContactPhone,
  DriveEta
} from "@mui/icons-material";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const genders = ["Male", "Female", "Other", "Prefer not to say"];

const steps = [
  {
    label: "Basic Information",
    description: "Tell us about yourself",
    icon: <AccountCircle />
  },
  {
    label: "Phone Verification",
    description: "Verify your phone number",
    icon: <ContactPhone />
  },
  {
    label: "Vehicle Details",
    description: "Add your vehicle (optional)",
    icon: <DriveEta />
  }
];

export default function CompleteProfile() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    username: "",
    gender: "",
    phone: "",
    email: user?.email || "",
    hasVehicle: false,
    vehicleNumber: "",
    licenseNumber: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [generatedOtp, setGeneratedOtp] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setForm({
            name: data.name || "",
            username: data.username || "",
            gender: data.gender || "",
            phone: data.phone || "",
            email: data.email || user?.email || "",
            hasVehicle: data.hasVehicle || false,
            vehicleNumber: data.vehicleNumber || "",
            licenseNumber: data.licenseNumber || "",
          });
          setPhoneVerified(data.phoneVerified || false);
          
          // Auto advance to appropriate step based on completion
          if (data.name && data.username && data.gender) {
            setActiveStep(data.phoneVerified ? 2 : 1);
          }
        }
      } catch (err) {
        setError("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user]);

  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(time => time - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const validateUsername = async (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]{8,16}$/;
    if (!usernameRegex.test(username)) {
      setUsernameError("Username must be 8-16 characters long and contain only letters, numbers, and underscores");
      return false;
    }

    setCheckingUsername(true);
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty && querySnapshot.docs[0].id !== user.uid) {
        setUsernameError("Username is already taken");
        return false;
      }

      setUsernameError("");
      return true;
    } catch (error) {
      setUsernameError("Error checking username availability");
      return false;
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleChange = async (e) => {
    const { name, value, checked, type } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }

    // Validate username in real-time
    if (name === "username" && value.length >= 8) {
      await validateUsername(value);
    }
  };

  const sendOTP = async () => {
    if (!form.phone || form.phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    // Generate and store OTP (in real app, this would be sent via SMS service)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setOtpSent(true);
    setOtpTimer(60); // 60 second timer
    setError("");
    console.log("Generated OTP:", otp); // In production, this would be sent via SMS
    
    // Show demo alert
    setTimeout(() => {
      alert(`Demo OTP: ${otp}\n\n(In production, this would be sent via SMS)`);
    }, 500);
  };

  const verifyOTP = () => {
    if (phoneOtp === generatedOtp) {
      setPhoneVerified(true);
      setError("");
      setActiveStep(2);
      alert("Phone number verified successfully!");
    } else {
      setError("Invalid OTP. Please try again.");
    }
  };

  const handleNext = async () => {
    setError("");
    
    if (activeStep === 0) {
      // Validate basic information
      if (!form.name || !form.username || !form.gender) {
        setError("Please fill in all required fields.");
        return;
      }

      if (usernameError) {
        setError("Please fix the username error.");
        return;
      }

      // Final username validation
      const isUsernameValid = await validateUsername(form.username);
      if (!isUsernameValid) return;
      
      setActiveStep(1);
    } else if (activeStep === 1) {
      if (!phoneVerified) {
        setError("Please verify your phone number to continue.");
        return;
      }
      setActiveStep(2);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!phoneVerified) {
      setError("Please verify your phone number.");
      return;
    }

    if (form.hasVehicle && (!form.vehicleNumber || !form.licenseNumber)) {
      setError("Please provide vehicle details or uncheck the vehicle option.");
      return;
    }

    if (!user) {
      setError("Not authenticated. Please log in.");
      return;
    }

    setSaving(true);
    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          ...form,
          profileComplete: true,
          phoneVerified: true,
          createdAt: new Date(),
          uid: user.uid,
        },
        { merge: true }
      );
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const getStepProgress = () => ((activeStep + 1) / steps.length) * 100;

  // Function to check if a step is completed
  const isStepCompleted = (stepIndex) => {
    switch (stepIndex) {
      case 0:
        return form.name && form.username && form.gender && !usernameError;
      case 1:
        return phoneVerified;
      case 2:
        return true; // Last step is always considered completed when reached
      default:
        return false;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading profile...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Complete Your Profile
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Help us create a personalized experience for you
        </Typography>
      </Box>

      {/* Progress Bar */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Step {activeStep + 1} of {steps.length}
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={getStepProgress()} 
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stepper Content */}
      <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 4 }}>
        {steps.map((step, index) => (
          <Step key={step.label} completed={isStepCompleted(index)}>
            <StepLabel
              StepIconComponent={() => (
                <Avatar 
                  sx={{ 
                    bgcolor: isStepCompleted(index) ? 'success.main' : 
                            index === activeStep ? 'primary.main' : 'grey.400',
                    width: 40, 
                    height: 40 
                  }}
                >
                  {isStepCompleted(index) ? <CheckCircle /> : step.icon}
                </Avatar>
              )}
            >
              <Typography variant="h6" fontWeight="bold">
                {step.label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {step.description}
              </Typography>
            </StepLabel>

            <StepContent>
              {/* Step 0: Basic Information */}
              {index === 0 && (
                <Box sx={{ mt: 2 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        name="name"
                        label="Full Name"
                        value={form.name}
                        onChange={handleChange}
                        fullWidth
                        required
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

                    <Grid item xs={12}>
                      <TextField
                        name="username"
                        label="Username"
                        value={form.username}
                        onChange={handleChange}
                        fullWidth
                        required
                        error={!!usernameError}
                        helperText={usernameError || "8-16 characters, letters, numbers, and underscores only"}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              @
                            </InputAdornment>
                          ),
                          endAdornment: checkingUsername ? (
                            <CircularProgress size={20} />
                          ) : null,
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        name="gender"
                        label="Gender"
                        value={form.gender}
                        onChange={handleChange}
                        fullWidth
                        required
                        select
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      >
                        {genders.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        name="phone"
                        label="Phone Number"
                        value={form.phone}
                        onChange={handleChange}
                        fullWidth
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              +91
                            </InputAdornment>
                          ),
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        name="email"
                        label="Email Address"
                        value={form.email}
                        onChange={handleChange}
                        fullWidth
                        disabled
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Step 1: Phone Verification */}
              {index === 1 && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    We'll send a verification code to +91 {form.phone}
                  </Typography>

                  {!otpSent ? (
                    <Button
                      variant="contained"
                      startIcon={<Send />}
                      onClick={sendOTP}
                      size="large"
                      sx={{ borderRadius: 3, px: 4 }}
                    >
                      Send Verification Code
                    </Button>
                  ) : (
                    <Box>
                      <TextField
                        label="Enter 6-digit OTP"
                        value={phoneOtp}
                        onChange={(e) => setPhoneOtp(e.target.value)}
                        fullWidth
                        inputProps={{ maxLength: 6, style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' } }}
                        sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />

                      <Button
                        variant="contained"
                        startIcon={<Verified />}
                        onClick={verifyOTP}
                        disabled={phoneOtp.length !== 6}
                        sx={{ borderRadius: 3 }}
                      >
                        Verify OTP
                      </Button>

                      <Button
                        variant="text"
                        onClick={sendOTP}
                        disabled={otpTimer > 0}
                        sx={{ borderRadius: 3, ml: 2 }}
                      >
                        {otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Resend OTP'}
                      </Button>

                      {phoneVerified && (
                        <Alert severity="success" sx={{ mt: 2 }}>
                          Phone number verified successfully!
                        </Alert>
                      )}
                    </Box>
                  )}
                </Box>
              )}

              {/* Step 2: Vehicle Details */}
              {index === 2 && (
                <Box sx={{ mt: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.hasVehicle}
                        onChange={handleChange}
                        name="hasVehicle"
                      />
                    }
                    label="I have a vehicle and want to offer rides"
                    sx={{ mb: 3 }}
                  />

                  {form.hasVehicle && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Vehicle details help other users identify your ride and build trust
                      </Typography>
                      
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <TextField
                            name="vehicleNumber"
                            label="Vehicle Number (e.g., TS08HD2006)"
                            value={form.vehicleNumber}
                            onChange={handleChange}
                            fullWidth
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <DirectionsCar />
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
                    </Box>
                  )}
                </Box>
              )}

              {/* Action Buttons */}
              <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                {activeStep > 0 && (
                  <Button
                    onClick={handleBack}
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                  >
                    Back
                  </Button>
                )}

                {activeStep < steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={checkingUsername}
                    startIcon={checkingUsername ? <CircularProgress size={16} /> : null}
                    sx={{ borderRadius: 2, minWidth: 120 }}
                  >
                    {checkingUsername ? 'Checking...' : 'Next'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={16} /> : <CheckCircle />}
                    sx={{ borderRadius: 2, minWidth: 120 }}
                  >
                    {saving ? 'Saving...' : 'Complete Profile'}
                  </Button>
                )}
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </Container>
  );
}