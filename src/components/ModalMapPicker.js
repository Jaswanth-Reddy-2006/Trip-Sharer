import React, { useState, useEffect, useCallback } from "react";
import { Modal, Box, Button, Typography, CircularProgress, Alert } from "@mui/material";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const containerStyle = { width: "100%", height: "400px" };

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 600,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 2,
  borderRadius: 2,
  outline: "none",
};

export default function ModalMapPicker({ apiKey, open, onClose, onSelect, initialLocation }) {
  const [selectedPos, setSelectedPos] = useState(null);
  const [address, setAddress] = useState("");
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [mapsError, setMapsError] = useState("");

  const center = initialLocation || { lat: 20.5937, lng: 78.9629 };

  const onMapClick = useCallback((e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setSelectedPos({ lat, lng });
  }, []);

  useEffect(() => {
    if (!selectedPos || !apiKey) return;

    setLoadingAddress(true);
    fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${selectedPos.lat},${selectedPos.lng}&key=${apiKey}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "OK" && data.results.length > 0) {
          setAddress(data.results[0].formatted_address);
        } else {
          setAddress("Address not found");
        }
      })
      .catch(() => setAddress("Failed to fetch address"))
      .finally(() => setLoadingAddress(false));
  }, [selectedPos, apiKey]);

  const handleSave = () => {
    if (
      selectedPos &&
      address &&
      !["Address not found", "Failed to fetch address"].includes(address)
    ) {
      onSelect({ lat: selectedPos.lat, lng: selectedPos.lng, address });
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" component="h2" gutterBottom>
          Select Location on Map
        </Typography>

        {!apiKey ? (
          <Alert severity="warning">
            Google Maps is not configured. Add REACT_APP_GOOGLE_MAPS_API_KEY to .env and restart the dev server.
          </Alert>
        ) : (
          <>
            {mapsError && <Alert severity="error" sx={{ mb: 2 }}>{mapsError}</Alert>}

            <LoadScript
              googleMapsApiKey={apiKey}
              onError={() =>
                setMapsError("Failed to load Google Maps. Check API key and referrer settings.")
              }
            >
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={10}
                onClick={onMapClick}
              >
                {selectedPos && <Marker position={selectedPos} />}
              </GoogleMap>
            </LoadScript>

            {selectedPos && (
              <Box sx={{ mt: 2 }}>
                {loadingAddress ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={16} />
                    <Typography variant="body2">Fetching address...</Typography>
                  </Box>
                ) : (
                  <Typography variant="body2">
                    {address || "Click on map to select"}
                  </Typography>
                )}
              </Box>
            )}

            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button onClick={onClose} variant="outlined">
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                variant="contained"
                disabled={!selectedPos || loadingAddress}
              >
                Save
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
}