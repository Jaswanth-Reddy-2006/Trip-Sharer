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
      } else {
        return null;
      }
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

  // Input change handler
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
        uploaderName:
          auth.currentUser.displayName || auth.currentUser.email || "Anonymous",
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

  return (
    <Container maxWidth="sm" sx={{ mt: 2, mb: 2 }}>
      <Typography variant="h5" gutterBottom>
        Create New Trip
      </Typography>

      {submitError && <Alert severity="error">{submitError}</Alert>}

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

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        noValidate
      >
        {mapsLoaded && !mapsError ? (
          <>
            <Autocomplete
              onLoad={(ref) => (startRef.current = ref)}
              onPlaceChanged={() => onPlaceChanged("startLocation")}
            >
              <TextField
                name="startLocation"
                label="Start Location"
                value={formData.startLocation}
                onChange={handleInput}
                margin="normal"
                fullWidth
                error={!!errors.startLocation}
                helperText={errors.startLocation}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {loadingLocation ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Tooltip title="Use Current Location">
                          <IconButton onClick={useLocation} edge="end">
                            <MyLocationIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Pick on Map">
                        <IconButton onClick={() => openPickerFor("startLocation")} edge="end">
                          <MapIcon />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            </Autocomplete>

            <Autocomplete
              onLoad={(ref) => (endRef.current = ref)}
              onPlaceChanged={() => onPlaceChanged("endLocation")}
            >
              <TextField
                name="endLocation"
                label="End Location"
                value={formData.endLocation}
                onChange={handleInput}
                margin="normal"
                fullWidth
                error={!!errors.endLocation}
                helperText={errors.endLocation}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Pick on Map">
                        <IconButton onClick={() => openPickerFor("endLocation")} edge="end">
                          <MapIcon />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            </Autocomplete>
          </>
        ) : (
          <>
            <TextField
              name="startLocation"
              label="Start Location"
              value={formData.startLocation}
              onChange={handleInput}
              margin="normal"
              fullWidth
              error={!!errors.startLocation}
              helperText={errors.startLocation}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {loadingLocation ? (
                      <CircularProgress size={20} />
                    ) : (
                      <Tooltip title="Use Current Location">
                        <IconButton onClick={useLocation} edge="end">
                          <MyLocationIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              name="endLocation"
              label="End Location"
              value={formData.endLocation}
              onChange={handleInput}
              margin="normal"
              fullWidth
              error={!!errors.endLocation}
              helperText={errors.endLocation}
            />
          </>
        )}

        <TextField
          name="date"
          label="Date"
          type="date"
          value={formData.date}
          onChange={handleInput}
          margin="normal"
          fullWidth
          error={!!errors.date}
          helperText={errors.date}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          name="time"
          label="Time"
          type="time"
          value={formData.time}
          onChange={handleInput}
          margin="normal"
          fullWidth
          error={!!errors.time}
          helperText={errors.time}
          InputLabelProps={{ shrink: true }}
        />

        <FormControl margin="normal" fullWidth error={!!errors.vehicleType}>
          <InputLabel id="vehicle-type-label">Vehicle Type</InputLabel>
          <Select
            labelId="vehicle-type-label"
            name="vehicleType"
            value={formData.vehicleType}
            label="Vehicle Type"
            onChange={handleInput}
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
          name="seatsAvailable"
          label="Seats Available"
          type="number"
          value={formData.seatsAvailable}
          onChange={handleInput}
          margin="normal"
          fullWidth
          error={!!errors.seatsAvailable}
          helperText={errors.seatsAvailable}
          inputProps={{ min: 1 }}
        />

        <TextField
          name="vehicleNumber"
          label="Vehicle Number"
          value={formData.vehicleNumber}
          onChange={handleInput}
          margin="normal"
          fullWidth
          error={!!errors.vehicleNumber}
          helperText={errors.vehicleNumber}
          inputProps={{ style: { textTransform: "uppercase" } }}
        />

        <TextField
          name="licenseNumber"
          label="License Number"
          value={formData.licenseNumber}
          onChange={handleInput}
          margin="normal"
          fullWidth
          error={!!errors.licenseNumber}
          helperText={errors.licenseNumber}
          inputProps={{ style: { textTransform: "uppercase" } }}
        />

        <TextField
          name="description"
          label="Description"
          value={formData.description}
          onChange={handleInput}
          margin="normal"
          fullWidth
          multiline
          rows={3}
        />

        <Box mt={2}>
          <Button type="submit" variant="contained" color="primary" fullWidth disabled={submitting}>
            {submitting ? "Creating..." : "Create Trip"}
          </Button>
        </Box>
      </form>

      {openPicker && (
        <ModalPicker
          open={openPicker}
          onClose={() => setOpenPicker(false)}
          onSelect={onPickerSelect}
        />
      )}
    </Container>
  );
}
