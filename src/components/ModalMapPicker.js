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
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
  alpha,
  Zoom,
  Fade,
  InputAdornment
} from "@mui/material";
import {
  Close,
  MyLocation,
  Search,
  LocationOn,
  GpsFixed,
  Place,
  Navigation,
  CheckCircle,
  Warning,
  Refresh
} from "@mui/icons-material";
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
  width: { xs: "95%", md: "90%" },
  maxWidth: 900,
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: 3,
  outline: "none",
  overflow: 'hidden',
  maxHeight: "95vh"
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  scaleControl: true,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: true,
  clickableIcons: true,
  gestureHandling: "greedy",
  styles: [
    {
      featureType: "poi.business",
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

const quickLocations = [
  { name: "Hitech City", lat: 17.4435, lng: 78.3772, category: "Tech Hub" },
  { name: "Gachibowli", lat: 17.4399, lng: 78.3489, category: "Tech Hub" },
  { name: "Secunderabad", lat: 17.4399, lng: 78.4983, category: "Railway" },
  { name: "Uppal", lat: 17.4065, lng: 78.5691, category: "Metro" },
  { name: "Ameerpet", lat: 17.4374, lng: 78.4482, category: "Commercial" },
  { name: "Kukatpally", lat: 17.4849, lng: 78.4138, category: "Residential" },
  { name: "Madhapur", lat: 17.4483, lng: 78.3915, category: "Tech Hub" },
  { name: "Banjara Hills", lat: 17.4239, lng: 78.4738, category: "Upscale" }
];

export default function ModalMapPicker({
  apiKey,
  open,
  onClose,
  onSelect,
  initialLocation,
  title = "Select Location on Map"
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedPos, setSelectedPos] = useState(null);
  const [address, setAddress] = useState("");
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [mapsError, setMapsError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [markerAnimation, setMarkerAnimation] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const center = initialLocation || { lat: 17.3850, lng: 78.4867 }; // Hyderabad center

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey || "",
    libraries: ["places"]
  });

  // Get current location on mount
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
        },
        {
          timeout: 10000,
          enableHighAccuracy: true
        }
      );
    }
  }, []);

  const isWithinHyderabadBounds = useCallback((lat, lng) => {
    return lat >= hyderabadBounds.south && 
           lat <= hyderabadBounds.north && 
           lng >= hyderabadBounds.west && 
           lng <= hyderabadBounds.east;
  }, []);

  const onMapClick = useCallback((e) => {
    if (!e.latLng) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    if (isWithinHyderabadBounds(lat, lng)) {
      setSelectedPos({ lat, lng });
      setAddress(""); // Reset address to show loading
      // Add bounce animation
      setMarkerAnimation(window.google?.maps?.Animation?.BOUNCE);
      setTimeout(() => setMarkerAnimation(null), 750);
    } else {
      setMapsError("Please select a location within Hyderabad city limits.");
      setTimeout(() => setMapsError(""), 3000);
    }
  }, [isWithinHyderabadBounds]);

  const onMapLoad = useCallback((map) => {
    setMapInstance(map);
  }, []);

  // Geocode the selected position to get address
  useEffect(() => {
    if (!selectedPos || !apiKey || !isLoaded) return;

    setLoadingAddress(true);
    setAddress("");

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: selectedPos }, (results, status) => {
      if (status === "OK" && results[0]) {
        // Get the most relevant address
        const bestResult = results.find(result =>
          result.types.includes('street_address') ||
          result.types.includes('premise') ||
          result.types.includes('sublocality')
        ) || results[0];

        setAddress(bestResult.formatted_address);
      } else {
        setAddress("Address not found");
      }
      setLoadingAddress(false);
    });
  }, [selectedPos, apiKey, isLoaded]);

  const handleConfirm = () => {
    if (!selectedPos || !address || address === "Address not found") {
      setMapsError("Please select a valid location on the map.");
      setTimeout(() => setMapsError(""), 3000);
      return;
    }

    setIsConfirming(true);
    setTimeout(() => {
      onSelect({
        lat: selectedPos.lat,
        lng: selectedPos.lng,
        address: address
      });
      setIsConfirming(false);
      handleClose();
    }, 500);
  };

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim() || !mapInstance || !isLoaded) return;

    setSearching(true);
    const service = new window.google.maps.places.PlacesService(mapInstance);
    const request = {
      query: searchQuery + " Hyderabad",
      fields: ["place_id", "geometry", "formatted_address", "name"],
    };

    service.textSearch(request, (results, status) => {
      setSearching(false);
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results?.length > 0) {
        // Filter results within Hyderabad bounds
        const validResults = results.filter(place => {
          const location = place.geometry.location;
          return isWithinHyderabadBounds(location.lat(), location.lng());
        });

        if (validResults.length > 0) {
          setSearchResults(validResults.slice(0, 5)); // Show top 5 results
          const firstResult = validResults[0];
          const location = {
            lat: firstResult.geometry.location.lat(),
            lng: firstResult.geometry.location.lng()
          };

          setSelectedPos(location);
          mapInstance.setCenter(location);
          mapInstance.setZoom(16);
          setMarkerAnimation(window.google?.maps?.Animation?.BOUNCE);
          setTimeout(() => setMarkerAnimation(null), 750);
        } else {
          setMapsError("No results found within Hyderabad. Try a different search term.");
          setTimeout(() => setMapsError(""), 3000);
        }
      } else {
        setMapsError("Location not found. Please try a different search term.");
        setTimeout(() => setMapsError(""), 3000);
      }
    });
  }, [searchQuery, mapInstance, isLoaded, isWithinHyderabadBounds]);

  const moveToCurrentLocation = () => {
    if (currentLocation && mapInstance) {
      if (isWithinHyderabadBounds(currentLocation.lat, currentLocation.lng)) {
        setSelectedPos(currentLocation);
        mapInstance.setCenter(currentLocation);
        mapInstance.setZoom(16);
        setMarkerAnimation(window.google?.maps?.Animation?.BOUNCE);
        setTimeout(() => setMarkerAnimation(null), 750);
      } else {
        setMapsError("Your current location is outside Hyderabad. Showing city center instead.");
        mapInstance.setCenter(center);
        mapInstance.setZoom(12);
        setTimeout(() => setMapsError(""), 3000);
      }
    } else {
      setMapsError("Current location not available. Please enable location services or select manually.");
      setTimeout(() => setMapsError(""), 3000);
    }
  };

  const selectQuickLocation = (location) => {
    setSelectedPos({ lat: location.lat, lng: location.lng });
    if (mapInstance) {
      mapInstance.setCenter({ lat: location.lat, lng: location.lng });
      mapInstance.setZoom(15);
      setMarkerAnimation(window.google?.maps?.Animation?.BOUNCE);
      setTimeout(() => setMarkerAnimation(null), 750);
    }
  };

  const selectSearchResult = (place) => {
    const location = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng()
    };

    setSelectedPos(location);
    setSearchQuery(place.name);
    setSearchResults([]);

    if (mapInstance) {
      mapInstance.setCenter(location);
      mapInstance.setZoom(16);
      setMarkerAnimation(window.google?.maps?.Animation?.BOUNCE);
      setTimeout(() => setMarkerAnimation(null), 750);
    }
  };

  const handleClose = () => {
    setSelectedPos(null);
    setAddress("");
    setSearchQuery("");
    setSearchResults([]);
    setMarkerAnimation(null);
    setMapsError("");
    onClose();
  };

  const resetMap = () => {
    if (mapInstance) {
      mapInstance.setCenter(center);
      mapInstance.setZoom(12);
      setSelectedPos(null);
      setAddress("");
      setSearchQuery("");
      setSearchResults([]);
      setMapsError("");
    }
  };

  if (loadError) {
    return (
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Alert severity="error" sx={{ m: 2 }}>
            Failed to load Google Maps. Please check your internet connection and try again.
          </Alert>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
            <Button onClick={handleClose} sx={{ borderRadius: 2 }}>Close</Button>
          </Box>
        </Box>
      </Modal>
    );
  }

  if (!isLoaded) {
    return (
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
            <CircularProgress />
            <Typography variant="body1" sx={{ ml: 2 }}>Loading Google Maps...</Typography>
          </Box>
        </Box>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <Fade in={open}>
        <Box sx={modalStyle}>
          {/* Header */}
          <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h6" component="h2" fontWeight={600}>
                  <LocationOn sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
                  {title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Click anywhere on the map to select your exact location
                </Typography>
              </Box>
              <IconButton onClick={handleClose} size="small">
                <Close />
              </IconButton>
            </Stack>
          </Box>

          {/* Search and Quick Actions */}
          <Box sx={{ p: 2 }}>
            {/* Search Bar */}
            <Box sx={{ position: 'relative', mb: 2 }}>
              <TextField
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search for places in Hyderabad..."
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: searching ? (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ) : null,
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <Paper
                  elevation={8}
                  sx={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    maxHeight: 200,
                    overflow: 'auto',
                    borderRadius: 2,
                    mt: 1
                  }}
                >
                  {searchResults.map((place, index) => (
                    <Box
                      key={index}
                      onClick={() => selectSearchResult(place)}
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        borderBottom: index < searchResults.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.05)
                        }
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Place color="action" />
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {place.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {place.formatted_address}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  ))}
                </Paper>
              )}
            </Box>

            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Button
                onClick={handleSearch}
                disabled={!searchQuery.trim() || searching}
                variant="outlined"
                startIcon={searching ? <CircularProgress size={16} /> : <Search />}
                sx={{ borderRadius: 2 }}
              >
                {searching ? 'Searching...' : 'Search'}
              </Button>

              <Button
                onClick={resetMap}
                variant="outlined"
                startIcon={<Refresh />}
                sx={{ borderRadius: 2 }}
              >
                Reset
              </Button>
            </Stack>

            {/* Quick Location Buttons */}
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              <Chip
                icon={<MyLocation />}
                label="My Location"
                onClick={moveToCurrentLocation}
                disabled={!currentLocation}
                variant="outlined"
                clickable
                color="primary"
                sx={{ borderRadius: 2 }}
              />
              {quickLocations.map((location) => (
                <Chip
                  key={location.name}
                  icon={<LocationOn />}
                  label={location.name}
                  onClick={() => selectQuickLocation(location)}
                  variant="outlined"
                  clickable
                  sx={{ borderRadius: 2 }}
                />
              ))}
            </Stack>
          </Box>

          <Divider />

          {/* Map Container */}
          <Box sx={{ p: 2 }}>
            {!apiKey ? (
              <Alert severity="warning" sx={{ borderRadius: 2 }}>
                Google Maps is not configured. Add REACT_APP_GOOGLE_MAPS_API_KEY to .env and restart the server.
              </Alert>
            ) : (
              <>
                {mapsError && (
                  <Alert 
                    severity="warning" 
                    sx={{ mb: 2, borderRadius: 2 }}
                    icon={<Warning />}
                  >
                    {mapsError}
                  </Alert>
                )}

                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={selectedPos || center}
                  zoom={selectedPos ? 15 : 11}
                  options={mapOptions}
                  onClick={onMapClick}
                  onLoad={onMapLoad}
                  onError={() => setMapsError("Failed to load Google Maps. Check API key and settings.")}
                >
                  {/* Selected location marker with enhanced styling */}
                  {selectedPos && (
                    <Marker
                      position={selectedPos}
                      animation={markerAnimation}
                      icon={{
                        url: `data:image/svg+xml,${encodeURIComponent(`
                          <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 0C6.7 0 0 6.7 0 15c0 8.3 15 25 15 25s15-16.7 15-25c0-8.3-6.7-15-15-15z" fill="#667eea"/>
                            <circle cx="15" cy="15" r="8" fill="white"/>
                            <circle cx="15" cy="15" r="4" fill="#667eea"/>
                          </svg>
                        `)}`,
                        scaledSize: new window.google.maps.Size(30, 40),
                        anchor: new window.google.maps.Point(15, 40),
                      }}
                    />
                  )}

                  {/* Current location marker */}
                  {currentLocation && (
                    <Marker
                      position={currentLocation}
                      icon={{
                        url: `data:image/svg+xml,${encodeURIComponent(`
                          <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="10" cy="10" r="10" fill="#4CAF50"/>
                            <circle cx="10" cy="10" r="6" fill="white"/>
                            <circle cx="10" cy="10" r="3" fill="#4CAF50"/>
                          </svg>
                        `)}`,
                        scaledSize: new window.google.maps.Size(20, 20),
                        anchor: new window.google.maps.Point(10, 10),
                      }}
                    />
                  )}
                </GoogleMap>
              </>
            )}
          </Box>

          {/* Selected Location Info and Actions */}
          <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: 'background.default' }}>
            {selectedPos ? (
              <Stack spacing={2}>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <CheckCircle color="success" />
                    <Typography variant="subtitle2" fontWeight={600} color="success.main">
                      Selected Location:
                    </Typography>
                  </Stack>

                  {loadingAddress ? (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CircularProgress size={16} />
                      <Typography variant="body2" color="text.secondary">
                        Getting address...
                      </Typography>
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
                      {address || "Address not available"}
                    </Typography>
                  )}
                </Box>

                <Stack direction="row" spacing={2}>
                  <Button
                    onClick={handleClose}
                    variant="outlined"
                    sx={{ borderRadius: 2, flex: 1 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    disabled={isConfirming || loadingAddress || !address || address === "Address not found"}
                    variant="contained"
                    startIcon={isConfirming ? <CircularProgress size={16} /> : <CheckCircle />}
                    sx={{
                      borderRadius: 2,
                      flex: 2,
                      background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)',
                      }
                    }}
                  >
                    {isConfirming ? 'Confirming...' : 'Confirm Location'}
                  </Button>
                </Stack>
              </Stack>
            ) : (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <LocationOn sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Click on the map to select your location
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Use search or quick buttons above for faster selection
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
}