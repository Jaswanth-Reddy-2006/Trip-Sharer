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
} from "@mui/material";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const genders = ["Male", "Female", "Other"];

export default function CompleteProfile() {
  const navigate = useNavigate();
  const user = auth.currentUser;

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
        }
      } catch (err) {
        setError("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user]);

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
    
    // In a real app, you would integrate with SMS service
    // For demo purposes, we'll simulate OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("Generated OTP:", generatedOtp); // In real app, this would be sent via SMS
    localStorage.setItem("generatedOtp", generatedOtp);
    setOtpSent(true);
    setError("");
    alert(`Demo OTP sent: ${generatedOtp} (In production, this would be sent via SMS)`);
  };

  const verifyOTP = () => {
    const generatedOtp = localStorage.getItem("generatedOtp");
    if (phoneOtp === generatedOtp) {
      setPhoneVerified(true);
      setError("");
      localStorage.removeItem("generatedOtp");
      alert("Phone number verified successfully!");
    } else {
      setError("Invalid OTP. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!form.name || !form.username || !form.gender || !form.phone) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!phoneVerified) {
      setError("Please verify your phone number.");
      return;
    }

    if (usernameError) {
      setError("Please fix the username error.");
      return;
    }

    if (form.hasVehicle && (!form.vehicleNumber || !form.licenseNumber)) {
      setError("Please provide vehicle details or uncheck the vehicle option.");
      return;
    }

    // Final username validation
    const isUsernameValid = await validateUsername(form.username);
    if (!isUsernameValid) {
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

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading profile data...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4, fontWeight: 'bold' }}>
          Complete Your Profile
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Basic Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="Full Name"
                value={form.name}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="username"
                label="Username"
                value={form.username}
                onChange={handleChange}
                fullWidth
                required
                error={!!usernameError}
                helperText={usernameError || "8-16 characters: letters, numbers, underscore"}
                InputProps={{
                  endAdornment: checkingUsername && <CircularProgress size={20} />
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="Email"
                value={form.email}
                disabled
                fullWidth
                helperText="Email cannot be changed"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="gender"
                label="Gender"
                select
                value={form.gender}
                onChange={handleChange}
                fullWidth
                required
              >
                {genders.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Phone Verification */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Phone Verification
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="phone"
                label="Phone Number"
                value={form.phone}
                onChange={handleChange}
                fullWidth
                required
                disabled={phoneVerified}
                helperText={phoneVerified ? "Phone number verified ✓" : "10-digit phone number"}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              {!phoneVerified && !otpSent && (
                <Button
                  variant="outlined"
                  onClick={sendOTP}
                  fullWidth
                  sx={{ height: '56px' }}
                >
                  Send OTP
                </Button>
              )}
              
              {otpSent && !phoneVerified && (
                <Box>
                  <TextField
                    label="Enter OTP"
                    value={phoneOtp}
                    onChange={(e) => setPhoneOtp(e.target.value)}
                    fullWidth
                    sx={{ mb: 1 }}
                  />
                  <Button
                    variant="contained"
                    onClick={verifyOTP}
                    fullWidth
                  >
                    Verify OTP
                  </Button>
                </Box>
              )}
              
              {phoneVerified && (
                <Alert severity="success">
                  Phone number verified successfully!
                </Alert>
              )}
            </Grid>

            {/* Vehicle Information */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Vehicle Information (Optional)
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.hasVehicle}
                    onChange={handleChange}
                    name="hasVehicle"
                  />
                }
                label="I have a vehicle and want to offer rides"
              />
            </Grid>

            {form.hasVehicle && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="vehicleNumber"
                    label="Vehicle Number (e.g., TS08HD2006)"
                    value={form.vehicleNumber}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    name="licenseNumber"
                    label="License Number (e.g., DL-142011223344)"
                    value={form.licenseNumber}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={saving || checkingUsername || !phoneVerified}
                sx={{ mt: 3, py: 2, fontSize: '1.1rem', fontWeight: 'bold' }}
              >
                {saving ? "Saving Profile..." : "Complete Profile"}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}