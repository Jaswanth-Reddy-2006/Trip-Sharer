import React, { useState, useEffect, useCallback } from "react";
import { 
  Modal, 
  Box, 
  Button, 
  Typography, 
  CircularProgress, 
  Alert,
  Paper,
  Stack,
  IconButton,
  TextField,
  Chip
} from "@mui/material";
import { Close, MyLocation, Search } from "@mui/icons-material";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = { 
  width: "100%", 
  height: "500px",
  borderRadius: "12px",
  overflow: "hidden"
};

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "95%", md: "80%" },
  maxWidth: 800,
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: 3,
  outline: "none",
  overflow: 'hidden'
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  scaleControl: true,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    }
  ]
};

const hyderabadBounds = {
  north: 17.6078,
  south: 17.2403,
  east: 78.6677,
  west: 78.2407
};

export default function ModalMapPicker({ apiKey, open, onClose, onSelect, initialLocation }) {
  const [selectedPos, setSelectedPos] = useState(null);
  const [address, setAddress] = useState("");
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [mapsError, setMapsError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);

  const center = initialLocation || { lat: 17.3850, lng: 78.4867 }; // Hyderabad center

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey || "",
    libraries: ["places"]
  });

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(pos);
        },
        (error) => {
          console.warn("Geolocation error:", error);
        }
      );
    }
  }, []);

  const onMapClick = useCallback((e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    // Check if location is within Hyderabad bounds (approximately)
    if (lat >= hyderabadBounds.south && lat <= hyderabadBounds.north && 
        lng >= hyderabadBounds.west && lng <= hyderabadBounds.east) {
      setSelectedPos({ lat, lng });
    } else {
      alert("Please select a location within Hyderabad city limits.");
    }
  }, []);

  const onMapLoad = useCallback((map) => {
    setMapInstance(map);
  }, []);

  useEffect(() => {
    if (!selectedPos || !apiKey || !isLoaded) return;

    setLoadingAddress(true);
    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ location: selectedPos }, (results, status) => {
      if (status === "OK" && results[0]) {
        setAddress(results[0].formatted_address);
      } else {
        setAddress("Address not found");
      }
      setLoadingAddress(false);
    });
  }, [selectedPos, apiKey, isLoaded]);

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

  const handleSearch = () => {
    if (!searchQuery.trim() || !mapInstance || !isLoaded) return;

    const service = new window.google.maps.places.PlacesService(mapInstance);
    const request = {
      query: searchQuery + " Hyderabad",
      fields: ["place_id", "geometry", "formatted_address"],
    };

    service.textSearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results[0]) {
        const place = results[0];
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };

        setSelectedPos(location);
        mapInstance.setCenter(location);
        mapInstance.setZoom(15);
      } else {
        alert("Location not found. Please try a different search term.");
      }
    });
  };

  const moveToCurrentLocation = () => {
    if (currentLocation && mapInstance) {
      setSelectedPos(currentLocation);
      mapInstance.setCenter(currentLocation);
      mapInstance.setZoom(15);
    } else {
      alert("Current location not available. Please enable location services.");
    }
  };

  const quickLocations = [
    { name: "Hitech City", lat: 17.4435, lng: 78.3772 },
    { name: "Gachibowli", lat: 17.4399, lng: 78.3489 },
    { name: "Secunderabad", lat: 17.4399, lng: 78.4983 },
    { name: "Uppal", lat: 17.4065, lng: 78.5691 },
    { name: "Ameerpet", lat: 17.4374, lng: 78.4482 }
  ];

  const selectQuickLocation = (location) => {
    setSelectedPos({ lat: location.lat, lng: location.lng });
    if (mapInstance) {
      mapInstance.setCenter({ lat: location.lat, lng: location.lng });
      mapInstance.setZoom(15);
    }
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <Modal open={open} onClose={onClose} closeAfterTransition>
      <Paper sx={modalStyle}>
        {/* Header */}
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Select Location on Map
            </Typography>
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Click on the map to select your exact pickup or drop location
          </Typography>
        </Box>

        {/* Search and Quick Actions */}
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack spacing={2}>
            {/* Search */}
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search for a location in Hyderabad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
              <Button 
                variant="outlined" 
                onClick={handleSearch}
                disabled={!searchQuery.trim()}
              >
                Search
              </Button>
            </Stack>

            {/* Quick Location Buttons */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                Quick Locations:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip
                  label="Current Location"
                  icon={<MyLocation />}
                  onClick={moveToCurrentLocation}
                  disabled={!currentLocation}
                  size="small"
                  variant="outlined"
                  clickable
                />
                {quickLocations.map((location) => (
                  <Chip
                    key={location.name}
                    label={location.name}
                    onClick={() => selectQuickLocation(location)}
                    size="small"
                    variant="outlined"
                    clickable
                  />
                ))}
              </Stack>
            </Box>
          </Stack>
        </Box>

        {/* Map */}
        <Box sx={{ height: 500, position: 'relative' }}>
          {!apiKey ? (
            <Alert severity="error" sx={{ m: 3 }}>
              Google Maps is not configured. Add REACT_APP_GOOGLE_MAPS_API_KEY to .env and restart the dev server.
            </Alert>
          ) : (
            <>
              {mapsError && (
                <Alert severity="error" sx={{ position: 'absolute', top: 16, left: 16, right: 16, zIndex: 1 }}>
                  {mapsError}
                </Alert>
              )}
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={12}
                onClick={onMapClick}
                onLoad={onMapLoad}
                options={mapOptions}
                onLoadError={() => setMapsError("Failed to load Google Maps. Check API key and referrer settings.")}
              >
                {selectedPos && (
                  <Marker
                    position={selectedPos}
                    animation={window.google?.maps?.Animation?.BOUNCE}
                  />
                )}
                {currentLocation && (
                  <Marker
                    position={currentLocation}
                    icon={{
                      url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                    }}
                  />
                )}
              </GoogleMap>
            </>
          )}
        </Box>

        {/* Selected Location Info */}
        {selectedPos && (
          <Box sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Selected Location:
            </Typography>
            {loadingAddress ? (
              <Stack direction="row" alignItems="center" spacing={1}>
                <CircularProgress size={16} />
                <Typography variant="body2">Fetching address...</Typography>
              </Stack>
            ) : (
              <Typography variant="body2" sx={{ mb: 2 }}>
                {address || "Click on map to select a location"}
              </Typography>
            )}
          </Box>
        )}

        {/* Actions */}
        <Box sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={onClose} color="inherit">
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={!selectedPos || !address || loadingAddress || 
                       ["Address not found", "Failed to fetch address"].includes(address)}
              sx={{
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)',
                }
              }}
            >
              Save Location
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Modal>
  );
}