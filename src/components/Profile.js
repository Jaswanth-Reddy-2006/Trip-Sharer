import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
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
  Chip,
  InputAdornment,
  MenuItem,
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
  Edit,
  Save,
  Cancel,
  Verified,
  AccountCircle,
  ContactPhone,
  DriveEta
} from "@mui/icons-material";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const genders = ["Male", "Female", "Other", "Prefer not to say"];

export default function Profile({ user, onNavigate }) {
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [form, setForm] = useState({
    name: "",
    username: "",
    gender: "",
    phone: "",
    email: "",
    hasVehicle: false,
    vehicleNumber: "",
    vehicleModel: "",
    licenseNumber: "",
  });

  useEffect(() => {
    if (!user) {
      onNavigate("/auth");
      return;
    }
    loadProfile();
  }, [user, onNavigate]);

  const loadProfile = async () => {
    setLoading(true);
    setError("");
    
    try {
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile(data);
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
      } else {
        // If no profile exists, redirect to complete profile
        onNavigate("/complete-profile");
        return;
      }
    } catch (err) {
      setError("Failed to load profile data");
      console.error("Profile loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    if (type === "checkbox") {
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          ...form,
          profileComplete: true,
          phoneVerified: true,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      setProfile({ ...form, profileComplete: true, phoneVerified: true });
      setEditing(false);
      setSuccess("Profile updated successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
      
    } catch (err) {
      setError("Failed to update profile");
      console.error("Profile update error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original profile data
    if (profile) {
      setForm({
        name: profile.name || "",
        username: profile.username || "",
        gender: profile.gender || "",
        phone: profile.phone || "",
        email: profile.email || "",
        hasVehicle: profile.hasVehicle || false,
        vehicleNumber: profile.vehicleNumber || "",
        vehicleModel: profile.vehicleModel || "",
        licenseNumber: profile.licenseNumber || "",
      });
    }
    setEditing(false);
    setError("");
  };

  // ✅ FIX: Proper loading state
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh" flexDirection="column">
          <CircularProgress size={48} />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading your profile...</Typography>
          <Typography variant="body2" color="text.secondary">Please wait a moment</Typography>
        </Box>
      </Container>
    );
  }

  // ✅ FIX: Handle missing profile
  if (!profile) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Profile not found. Please complete your profile setup.
          <Button 
            onClick={() => onNavigate("/complete-profile")} 
            sx={{ ml: 2 }}
            variant="outlined"
          >
            Complete Profile
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 2, mb: 4 }}>
      {/* Header */}
      <Box textAlign="center" mb={4}>
        <Avatar
          sx={{ 
            width: 100, 
            height: 100, 
            mx: 'auto', 
            mb: 2,
            bgcolor: 'primary.main',
            fontSize: '2rem',
            fontWeight: 'bold'
          }}
        >
          {profile.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
        </Avatar>
        
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          My Profile
        </Typography>
        
        <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 2 }}>
          {profile.phoneVerified && (
            <Chip
              icon={<Verified />}
              label="Verified"
              color="success"
              size="small"
            />
          )}
          {profile.profileComplete && (
            <Chip
              icon={<CheckCircle />}
              label="Complete"
              color="primary"
              size="small"
            />
          )}
          {profile.hasVehicle && (
            <Chip
              icon={<DirectionsCar />}
              label="Has Vehicle"
              color="info"
              size="small"
            />
          )}
        </Stack>

        <Typography variant="body1" color="text.secondary">
          {editing ? "Edit your profile information below" : "View and manage your profile information"}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {success}
        </Alert>
      )}

      <Paper elevation={2} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>
        {/* Action Buttons */}
        <Box display="flex" justifyContent="flex-end" sx={{ mb: 3 }}>
          {!editing ? (
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => setEditing(true)}
              sx={{ borderRadius: 2 }}
            >
              Edit Profile
            </Button>
          ) : (
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={handleCancel}
                disabled={saving}
                sx={{ borderRadius: 2 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={16} /> : <Save />}
                onClick={handleSave}
                disabled={saving}
                sx={{ borderRadius: 2 }}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </Stack>
          )}
        </Box>

        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person color="primary" />
              Basic Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              disabled={!editing}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountCircle color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Username"
              name="username"
              value={form.username}
              onChange={handleChange}
              disabled={!editing}
              fullWidth
              helperText={!editing ? "" : "8-16 characters, letters, numbers, underscore only"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    @
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Gender"
              name="gender"
              value={form.gender}
              onChange={handleChange}
              disabled={!editing}
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            >
              {genders.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Phone Number"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              disabled={!editing}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone color="primary" />
                    +91
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Email Address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              disabled={true} // Email should not be editable
              fullWidth
              helperText="Email cannot be changed"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>

          {/* Vehicle Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
              <DirectionsCar color="primary" />
              Vehicle Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.hasVehicle}
                  onChange={handleChange}
                  name="hasVehicle"
                  disabled={!editing}
                />
              }
              label="I have a vehicle and want to offer rides"
            />
          </Grid>

          {form.hasVehicle && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Vehicle Number"
                  name="vehicleNumber"
                  value={form.vehicleNumber}
                  onChange={handleChange}
                  disabled={!editing}
                  fullWidth
                  placeholder="TG07HD2006"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DriveEta color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Vehicle Model"
                  name="vehicleModel"
                  value={form.vehicleModel}
                  onChange={handleChange}
                  disabled={!editing}
                  fullWidth
                  placeholder="Honda City, Royal Enfield, etc."
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Driving License Number"
                  name="licenseNumber"
                  value={form.licenseNumber}
                  onChange={handleChange}
                  disabled={!editing}
                  fullWidth
                  placeholder="TG01320240009352"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Shield color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
            </>
          )}
        </Grid>

        {/* Additional Actions */}
        <Divider sx={{ my: 3 }} />
        
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button
            variant="outlined"
            onClick={() => onNavigate("/my-bookings")}
            sx={{ borderRadius: 2 }}
          >
            View My Bookings
          </Button>
          <Button
            variant="outlined"
            onClick={() => onNavigate("/create-trip")}
            sx={{ borderRadius: 2 }}
          >
            Create New Trip
          </Button>
          <Button
            variant="outlined"
            onClick={() => onNavigate("/chat")}
            sx={{ borderRadius: 2 }}
          >
            My Conversations
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}