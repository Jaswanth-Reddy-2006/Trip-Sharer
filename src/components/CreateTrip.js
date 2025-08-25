import React, { useState, useRef } from "react";
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
  IconButton,
  CircularProgress,
  Alert,
  Tooltip,
} from "@mui/material";

import { Autocomplete } from "@react-google-maps/api";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import MapIcon from "@mui/icons-material/Map";

import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

import ModalPicker from "./ModalPicker";

import { validateCreateTripForm as validate } from "./validation";

const vehicleTypes = ["Bike", "Scooter", "Car"];

export default function CreateTrip({ user, onNavigate, mapsLoaded, mapsError }) {
  const [formData, setFormData] = useState({
    startLocation: "",
    endLocation: "",
    date: "",
    time: "",
    vehicleType: "",
    description: "",
    seatsAvailable: "",
    vehicleNumber: "",
    licenseNumber: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [openPicker, setOpenPicker] = useState(false);
  const [pickerField, setPickerField] = useState(null);
  const [submitError, setSubmitError] = useState("");

  const startRef = useRef(null);
  const endRef = useRef(null);

  const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  if (!user) return null;

  // Reverse geocode helper
  async function reverseGeocode(lat, lng) {
    if (!googleMapsApiKey) return null;
    try {
      const resp = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleMapsApiKey}`
      );
      const data = await resp.json();
      if (data.status === "OK" && data.results.length) {
        return data.results[0].formatted_address;
      }
      return null;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  // Google Places autocomplete place changed
  function onPlaceChanged(field) {
    const ref = field === "startLocation" ? startRef.current : endRef.current;
    if (!ref) return;
    const place = ref.getPlace();
    if (place && place.formatted_address) {
      setFormData((f) => ({ ...f, [field]: place.formatted_address }));
      setErrors((e) => {
        const copy = { ...e };
        delete copy[field];
        return copy;
      });
    }
  }

  function handleInput(e) {
    const { name, value } = e.target;
    const val =
      name === "vehicleNumber" || name === "licenseNumber"
        ? value.toUpperCase()
        : value;
    setFormData((f) => ({ ...f, [name]: val }));
    if (errors[name]) {
      setErrors((e) => {
        const copy = { ...e };
        delete copy[name];
        return copy;
      });
    }
  }

  // Use browser geolocation to get current position
  function useLocation() {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const addr = await reverseGeocode(lat, lng);
        setFormData((f) => ({
          ...f,
          startLocation: addr || `Current location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        }));
        setErrors((e) => {
          const copy = { ...e };
          delete copy.startLocation;
          return copy;
        });
        setLoadingLocation(false);
      },
      () => {
        alert("Failed to get location");
        setLoadingLocation(false);
      }
    );
  }

  // Open the map picker modal for a given field
  function openPickerFor(field) {
    setPickerField(field);
    setOpenPicker(true);
  }

  // When a location is selected from modal picker
  function onPickerSelect(data) {
    if (!pickerField) return;
    setFormData((f) => ({ ...f, [pickerField]: data.address }));
    setErrors((e) => {
      const copy = { ...e };
      delete copy[pickerField];
      return copy;
    });
    setPickerField(null);
    setOpenPicker(false);
  }

  function validateForm() {
    const errs = validate(formData);
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function submit() {
    setSubmitError("");
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const dateObj = new Date(`${formData.date}T${formData.time}`);
      await addDoc(collection(db, "trips"), {
        startLocation: formData.startLocation.trim(),
        endLocation: formData.endLocation.trim(),
        date: dateObj,
        vehicleType: formData.vehicleType,
        description: formData.description.trim(),
        seatsAvailable: Math.max(1, Number(formData.seatsAvailable)),
        vehicleNumber: formData.vehicleNumber,
        licenseNumber: formData.licenseNumber,
        uploaderId: auth.currentUser.uid,
        uploaderName: auth.currentUser.displayName || auth.currentUser.email || "Anonymous",
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
        licenseNumber: "",
      });
      onNavigate("/");
    } catch (err) {
      console.error(err);
      setSubmitError("Failed to create trip. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!mapsLoaded && !mapsError) return <CircularProgress />;

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" mb={3}>
        Create New Trip
      </Typography>

      {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}
      {!googleMapsApiKey && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Google Maps API key missing. Map features disabled.
        </Alert>
      )}
      {mapsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load Google Maps. Map features disabled.
        </Alert>
      )}

      <Box component="form" onSubmit={(e) => { e.preventDefault(); submit(); }} noValidate>
        <Autocomplete
          apiKey={googleMapsApiKey}
          onLoad={(ref) => (startRef.current = ref)}
          onPlaceChanged={() => onPlaceChanged("startLocation")}
        >
          <TextField
            label="Start Location"
            name="startLocation"
            value={formData.startLocation}
            onChange={handleInput}
            required
            fullWidth
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {loadingLocation ? (
                    <CircularProgress size={20} />
                  ) : (
                    <>
                      <Tooltip title="Use my location">
                        <IconButton onClick={useLocation} edge="end" size="small">
                          <MyLocationIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Pick on map">
                        <IconButton onClick={() => openPickerFor("startLocation")} edge="end" size="small">
                          <MapIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </InputAdornment>
              ),
            }}
            error={Boolean(errors.startLocation)}
            helperText={errors.startLocation}
          />
        </Autocomplete>

        <Autocomplete
          apiKey={googleMapsApiKey}
          onLoad={(ref) => (endRef.current = ref)}
          onPlaceChanged={() => onPlaceChanged("endLocation")}
        >
          <TextField
            label="End Location"
            name="endLocation"
            value={formData.endLocation}
            onChange={handleInput}
            required
            fullWidth
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Pick on map">
                    <IconButton onClick={() => openPickerFor("endLocation")} edge="end" size="small">
                      <MapIcon />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
            error={Boolean(errors.endLocation)}
            helperText={errors.endLocation}
          />
        </Autocomplete>

        <TextField
          label="Date"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleInput}
          InputLabelProps={{ shrink: true }}
          required
          fullWidth
          margin="normal"
          error={Boolean(errors.date)}
          helperText={errors.date}
        />

        <TextField
          label="Time"
          name="time"
          type="time"
          value={formData.time}
          onChange={handleInput}
          InputLabelProps={{ shrink: true }}
          required
          fullWidth
          margin="normal"
          error={Boolean(errors.time)}
          helperText={errors.time}
        />

        <FormControl fullWidth margin="normal" error={Boolean(errors.vehicleType)}>
          <InputLabel id="vehicle-type-label">Vehicle Type</InputLabel>
          <Select
            labelId="vehicle-type-label"
            label="Vehicle Type"
            name="vehicleType"
            value={formData.vehicleType}
            onChange={handleInput}
            required
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {vehicleTypes.map((v) => (
              <MenuItem key={v} value={v}>
                {v}
              </MenuItem>
            ))}
          </Select>
          {errors.vehicleType && (
            <Typography variant="caption" color="error">
              {errors.vehicleType}
            </Typography>
          )}
        </FormControl>

        <TextField
          label="Seats Available"
          name="seatsAvailable"
          type="number"
          value={formData.seatsAvailable}
          onChange={handleInput}
          required
          fullWidth
          margin="normal"
          error={Boolean(errors.seatsAvailable)}
          helperText={errors.seatsAvailable}
          inputProps={{ min: 1 }}
        />

        <TextField
          label="Vehicle Number"
          name="vehicleNumber"
          value={formData.vehicleNumber}
          onChange={handleInput}
          required
          fullWidth
          margin="normal"
          inputProps={{ style: { textTransform: "uppercase" } }}
          error={Boolean(errors.vehicleNumber)}
          helperText={errors.vehicleNumber}
        />

        <TextField
          label="License Number"
          name="licenseNumber"
          value={formData.licenseNumber}
          onChange={handleInput}
          required
          fullWidth
          margin="normal"
          inputProps={{ style: { textTransform: "uppercase" } }}
          error={Boolean(errors.licenseNumber)}
          helperText={errors.licenseNumber}
        />

        <TextField
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleInput}
          fullWidth
          margin="normal"
          multiline
          rows={3}
        />

        <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }} disabled={submitting}>
          {submitting ? "Creating..." : "Create Trip"}
        </Button>
      </Box>

      {openPicker && (
        <ModalPicker
          apiKey={googleMapsApiKey}
          open={openPicker}
          onClose={() => setOpenPicker(false)}
          onSelect={onPickerSelect}
          initialLocation={null}
        />
      )}
    </Container>
  );
}
