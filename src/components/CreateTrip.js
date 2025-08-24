import React, { useState, useRef } from "react";
import { Navigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton
} from "@mui/material";
import { LoadScript, Autocomplete } from "@react-google-maps/api";
import MyLocationIcon from "@mui/icons-material/MyLocation";

const libraries = ["places"];

export default function CreateTrip({ user, onNavigate }) {
  const [formData, setFormData] = useState({
    startLocation: "",
    endLocation: "",
    date: "",
    time: "",
    vehicleType: "",
    description: "",
    seatsAvailable: "",
    vehicleNumber: "",
    licenseNumber: ""
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const startAutocomplete = useRef(null);
  const endAutocomplete = useRef(null);

  if (!user) return <Navigate to="/auth" />;

  const vehiclePattern = /^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/;
  const licensePattern = /^DL[-\s]?[A-Z0-9]{13}$/i;

  const handlePlaceChanged = (type) => {
    const auto = type === "start" ? startAutocomplete.current : endAutocomplete.current;
    if (auto) {
      const place = auto.getPlace();
      if (place && place.formatted_address) {
        setFormData((prev) => ({
          ...prev,
          [type + "Location"]: place.formatted_address
        }));
        setErrors((prev) => {
          const copy = { ...prev };
          delete copy[type + "Location"];
          return copy;
        });
      }
    }
  };

  // Reverse geocode to get address from coordinates
  async function reverseGeocode(lat, lng) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.status === "OK" && data.results.length) {
        return data.results[0].formatted_address;
      }
    } catch (err) {
      console.error("Reverse geocode failed", err);
    }
    return null;
  }

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const address = await reverseGeocode(lat, lng);

        setFormData((prev) => ({
          ...prev,
          startLocation: address || `Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`
        }));
        setErrors((prev) => {
          const copy = { ...prev };
          delete copy.startLocation;
          return copy;
        });
        setLoadingLocation(false);
      },
      () => {
        alert("Unable to retrieve your location");
        setLoadingLocation(false);
      }
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const val = name === "vehicleNumber" || name === "licenseNumber" ? value.toUpperCase() : value;
    setFormData((prev) => ({
      ...prev,
      [name]: val
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validate = () => {
    let newErrors = {};
    [
      "startLocation",
      "endLocation",
      "date",
      "time",
      "vehicleType",
      "seatsAvailable",
      "vehicleNumber",
      "licenseNumber"
    ].forEach((field) => {
      if (!formData[field] || formData[field].trim() === "") {
        newErrors[field] = `Please enter ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`;
      }
    });
    if (formData.vehicleNumber && !vehiclePattern.test(formData.vehicleNumber)) {
      newErrors.vehicleNumber = "Vehicle number must be in the format TS08HD2006";
    }
    if (formData.licenseNumber) {
      if (formData.licenseNumber.length !== 16) {
        newErrors.licenseNumber = "License number must be exactly 16 characters";
      } else if (!licensePattern.test(formData.licenseNumber)) {
        newErrors.licenseNumber = "License number invalid, e.g., 'DL-142011223344'";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      setTimeout(() => setErrors({}), 3000);
      return;
    }
    setSubmitting(true);
    try {
      const combinedDate = new Date(`${formData.date}T${formData.time}`);
      await addDoc(collection(db, "trips"), {
        startLocation: formData.startLocation.trim(),
        endLocation: formData.endLocation.trim(),
        date: combinedDate,
        vehicleType: formData.vehicleType,
        description: formData.description.trim(),
        seatsAvailable: Number(formData.seatsAvailable),
        vehicleNumber: formData.vehicleNumber.trim(),
        licenseNumber: formData.licenseNumber.trim(),
        uploaderId: auth.currentUser.uid,
        uploaderName: auth.currentUser.displayName || auth.currentUser.email || "Anonymous"
      });
      setFormData({
        startLocation: "",
        endLocation: "",
        date: "",
        time: "",
        vehicleType: "",
        description: "",
        seatsAvailable: "",
        vehicleNumber: "",
        licenseNumber: ""
      });
      onNavigate("/");
    } catch (error) {
      alert("Failed to create trip. Please try again.");
      console.error(error);
    }
    setSubmitting(false);
  };

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} libraries={libraries}>
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Typography variant="h5" mb={3}>
          Create New Trip
        </Typography>

        <Autocomplete
          onLoad={(autocomplete) => (startAutocomplete.current = autocomplete)}
          onPlaceChanged={() => handlePlaceChanged("start")}
        >
          <TextField
            label="Start Location"
            name="startLocation"
            value={formData.startLocation}
            onChange={(e) => setFormData((prev) => ({ ...prev, startLocation: e.target.value }))}
            fullWidth
            required
            margin="normal"
            error={!!errors.startLocation}
            helperText={errors.startLocation}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={useCurrentLocation} edge="end" title="Use Current Location" disabled={loadingLocation}>
                    <MyLocationIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Autocomplete>

        <Autocomplete
          onLoad={(autocomplete) => (endAutocomplete.current = autocomplete)}
          onPlaceChanged={() => handlePlaceChanged("end")}
        >
          <TextField
            label="End Location"
            name="endLocation"
            value={formData.endLocation}
            onChange={handleInputChange}
            fullWidth
            required
            margin="normal"
            error={!!errors.endLocation}
            helperText={errors.endLocation}
          />
        </Autocomplete>

        <TextField
          label="Date"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleInputChange}
          fullWidth
          required
          margin="normal"
          error={!!errors.date}
          helperText={errors.date}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label="Time"
          name="time"
          type="time"
          value={formData.time}
          onChange={handleInputChange}
          fullWidth
          required
          margin="normal"
          error={!!errors.time}
          helperText={errors.time}
          InputLabelProps={{ shrink: true }}
        />

        <FormControl fullWidth required margin="normal" error={!!errors.vehicleType}>
          <InputLabel id="vehicle-type-label">Vehicle Type</InputLabel>
          <Select
            labelId="vehicle-type-label"
            name="vehicleType"
            value={formData.vehicleType}
            onChange={handleInputChange}
            label="Vehicle Type"
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            <MenuItem value="Bike">Bike</MenuItem>
            <MenuItem value="Scooter">Scooter</MenuItem>
            <MenuItem value="Car">Car</MenuItem>
          </Select>
          {!!errors.vehicleType && <Typography color="error">{errors.vehicleType}</Typography>}
        </FormControl>

        <TextField
          label="Available Seats"
          name="seatsAvailable"
          type="number"
          value={formData.seatsAvailable}
          onChange={handleInputChange}
          fullWidth
          required
          margin="normal"
          error={!!errors.seatsAvailable}
          helperText={errors.seatsAvailable}
          inputProps={{ min: 1 }}
        />

        <TextField
          label="Vehicle Number"
          name="vehicleNumber"
          value={formData.vehicleNumber}
          onChange={handleInputChange}
          fullWidth
          required
          margin="normal"
          error={!!errors.vehicleNumber}
          helperText={errors.vehicleNumber}
        />

        <TextField
          label="License Number"
          name="licenseNumber"
          value={formData.licenseNumber}
          onChange={handleInputChange}
          fullWidth
          required
          margin="normal"
          error={!!errors.licenseNumber}
          helperText={errors.licenseNumber}
        />

        <TextField
          label="Description"
          name="description"
          multiline
          rows={3}
          value={formData.description}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />

        <Box mt={3}>
          <Button variant="contained" fullWidth onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Creating..." : "Create Trip"}
          </Button>
        </Box>
      </Container>
    </LoadScript>
  );
}
