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
import { 
  validateProfileForm, 
  formatLicenseNumber, 
  formatVehicleNumber 
} from "../validation";

const genders = ["Male", "Female", "Other", "Prefer not to say"];

const steps = [
  {
    label: "Basic Information",
    description: "Tell us about yourself",
    icon: <Person />
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
    vehicleModel: "",
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
            vehicleModel: data.vehicleModel || "",
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
      // Auto-format license and vehicle numbers
      let formattedValue = value;
      if (name === "licenseNumber") {
        formattedValue = formatLicenseNumber(value);
      } else if (name === "vehicleNumber") {
        formattedValue = formatVehicleNumber(value);
      }

      setForm((prev) => ({ ...prev, [name]: formattedValue }));
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

    // Validate form using improved validation
    const validationErrors = validateProfileForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setError(Object.values(validationErrors)[0]);
      return;
    }

    if (!phoneVerified) {
      setError("Please verify your phone number.");
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
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <CircularProgress sx={{ mr: 2 }} />
          <Typography>Loading profile...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'primary.main',
              mx: 'auto',
              mb: 2,
              fontSize: '2rem'
            }}
          >
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Complete Your Profile
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Help us create a personalized experience for you
          </Typography>
        </Box>

        {/* Progress Bar */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Step {activeStep + 1} of {steps.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Math.round(getStepProgress())}% Complete
            </Typography>
          </Box>
          <Box
            sx={{
              height: 8,
              bgcolor: 'grey.200',
              borderRadius: 4,
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                height: '100%',
                bgcolor: 'primary.main',
                borderRadius: 4,
                width: `${getStepProgress()}%`,
                transition: 'width 0.3s ease-in-out'
              }}
            />
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
      </Paper>

      {/* Stepper Content */}
      <Paper elevation={3} sx={{ borderRadius: 3 }}>
        <Stepper activeStep={activeStep} orientation="vertical" sx={{ p: 3 }}>
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                StepIconComponent={() => (
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: isStepCompleted(index) 
                        ? 'success.main' 
                        : index === activeStep 
                        ? 'primary.main' 
                        : 'grey.300',
                      color: 'white'
                    }}
                  >
                    {isStepCompleted(index) ? <CheckCircle /> : step.icon}
                  </Avatar>
                )}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  {step.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>
              </StepLabel>

              <StepContent>
                <Box sx={{ py: 3 }}>
                  {/* Step 0: Basic Information */}
                  {index === 0 && (
                    <Stack spacing={3}>
                      <TextField
                        name="name"
                        label="Full Name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        fullWidth
                        placeholder="Enter your full name"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person />
                            </InputAdornment>
                          ),
                        }}
                      />

                      <TextField
                        name="username"
                        label="Username"
                        value={form.username}
                        onChange={handleChange}
                        required
                        fullWidth
                        placeholder="Choose a unique username"
                        error={!!usernameError}
                        helperText={usernameError || "8-16 characters: letters, numbers, underscore"}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              @
                            </InputAdornment>
                          ),
                          endAdornment: checkingUsername ? (
                            <InputAdornment position="end">
                              <CircularProgress size={20} />
                            </InputAdornment>
                          ) : null,
                        }}
                      />

                      <TextField
                        name="gender"
                        label="Gender"
                        value={form.gender}
                        onChange={handleChange}
                        required
                        fullWidth
                        select
                        helperText="Please select your gender"
                      >
                        {genders.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>

                      <TextField
                        name="phone"
                        label="Phone Number"
                        value={form.phone}
                        onChange={handleChange}
                        required
                        fullWidth
                        placeholder="Enter 10-digit mobile number"
                        inputProps={{ maxLength: 10 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              +91
                            </InputAdornment>
                          ),
                        }}
                      />

                      <TextField
                        name="email"
                        label="Email Address"
                        value={form.email}
                        disabled
                        fullWidth
                        helperText="Email cannot be changed"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Stack>
                  )}

                  {/* Step 1: Phone Verification */}
                  {index === 1 && (
                    <Stack spacing={3}>
                      <Alert severity="info" icon={<Phone />}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Phone Verification Required
                        </Typography>
                        <Typography variant="body2">
                          We'll send a verification code to +91 {form.phone}
                        </Typography>
                      </Alert>

                      {!otpSent ? (
                        <Button
                          onClick={sendOTP}
                          variant="contained"
                          startIcon={<Send />}
                          size="large"
                          sx={{ 
                            borderRadius: 3, 
                            px: 4,
                            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)',
                            }
                          }}
                        >
                          Send Verification Code
                        </Button>
                      ) : (
                        <Stack spacing={2}>
                          <TextField
                            label="Enter OTP"
                            value={phoneOtp}
                            onChange={(e) => setPhoneOtp(e.target.value)}
                            fullWidth
                            placeholder="6-digit OTP"
                            inputProps={{ 
                              maxLength: 6, 
                              style: { 
                                textAlign: 'center', 
                                fontSize: '1.5rem', 
                                letterSpacing: '0.5rem' 
                              } 
                            }}
                          />

                          <Stack direction="row" spacing={2}>
                            <Button
                              onClick={verifyOTP}
                              disabled={phoneOtp.length !== 6}
                              variant="contained"
                              fullWidth
                              sx={{ borderRadius: 3 }}
                            >
                              Verify OTP
                            </Button>

                            <Button
                              onClick={sendOTP}
                              disabled={otpTimer > 0}
                              variant="outlined"
                              fullWidth
                              sx={{ borderRadius: 3 }}
                            >
                              {otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Resend OTP'}
                            </Button>
                          </Stack>
                        </Stack>
                      )}

                      {phoneVerified && (
                        <Alert severity="success" icon={<CheckCircle />}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            Phone number verified successfully!
                          </Typography>
                        </Alert>
                      )}
                    </Stack>
                  )}

                  {/* Step 2: Vehicle Details */}
                  {index === 2 && (
                    <Stack spacing={3}>
                      <Alert severity="info" icon={<DriveEta />}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Vehicle Information (Optional)
                        </Typography>
                        <Typography variant="body2">
                          Add your vehicle details if you plan to offer rides to other users
                        </Typography>
                      </Alert>

                      <FormControlLabel
                        control={
                          <Switch
                            name="hasVehicle"
                            checked={form.hasVehicle}
                            onChange={handleChange}
                          />
                        }
                        label="I have a vehicle and want to offer rides"
                        sx={{ mb: 2 }}
                      />

                      {form.hasVehicle && (
                        <Fade in={form.hasVehicle}>
                          <Stack spacing={3}>
                            <Alert severity="info">
                              <Typography variant="body2">
                                <strong>Note:</strong> Vehicle details help other users identify your ride and build trust. 
                                Make sure to enter correct information as per your documents.
                              </Typography>
                            </Alert>

                            <TextField
                              name="vehicleNumber"
                              label="Vehicle Registration Number"
                              value={form.vehicleNumber}
                              onChange={handleChange}
                              required={form.hasVehicle}
                              fullWidth
                              placeholder="TG 07 HD 2006"
                              helperText="Enter your vehicle registration number"
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
                            />

                            <TextField
                              name="licenseNumber"
                              label="Driving License Number"
                              value={form.licenseNumber}
                              onChange={handleChange}
                              required={form.hasVehicle}
                              fullWidth
                              placeholder="TG 07 22 0001234"
                              helperText="Enter your Telangana driving license number"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Shield />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Stack>
                        </Fade>
                      )}
                    </Stack>
                  )}

                  {/* Action Buttons */}
                  <Box sx={{ mt: 4 }}>
                    <Stack direction="row" spacing={2}>
                      {activeStep > 0 && (
                        <Button onClick={handleBack} sx={{ borderRadius: 2 }}>
                          Back
                        </Button>
                      )}

                      <Box sx={{ flex: 1 }} />

                      {activeStep < steps.length - 1 ? (
                        <Button
                          onClick={handleNext}
                          variant="contained"
                          disabled={checkingUsername}
                          startIcon={checkingUsername ? <CircularProgress size={16} /> : null}
                          sx={{ borderRadius: 2, minWidth: 120 }}
                        >
                          {checkingUsername ? 'Checking...' : 'Next'}
                        </Button>
                      ) : (
                        <Button
                          onClick={handleSubmit}
                          variant="contained"
                          disabled={saving}
                          startIcon={saving ? <CircularProgress size={16} /> : <CheckCircle />}
                          sx={{ 
                            borderRadius: 2, 
                            minWidth: 120,
                            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)',
                            }
                          }}
                        >
                          {saving ? 'Saving...' : 'Complete Profile'}
                        </Button>
                      )}
                    </Stack>
                  </Box>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Tips Card */}
      <Paper elevation={3} sx={{ p: 3, mt: 4, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Profile Tips
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Verified color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="subtitle2" fontWeight="bold">
                Verified Profile
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Complete verification increases trust and booking chances
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Shield color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="subtitle2" fontWeight="bold">
                Accurate Details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enter correct vehicle and license details as per documents
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Person color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="subtitle2" fontWeight="bold">
                Unique Username
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose a memorable username that others can easily identify
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}