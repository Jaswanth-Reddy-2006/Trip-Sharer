import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  GoogleMap,
  LoadScript,
  DirectionsRenderer,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { Typography, Box, Alert } from "@mui/material";

const containerStyle = { width: "100%", height: "450px", borderRadius: 8, overflow: "hidden" };

export default function TripMap({ trip, apiKey, darkMode = false }) {
  const [directions, setDirections] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [error, setError] = useState(null);
  const [mapsError, setMapsError] = useState("");
  const [infoWindowOpen, setInfoWindowOpen] = useState(null);
  const [currentPos, setCurrentPos] = useState(null);
  const mapRef = useRef();

  const onLoad = useCallback((mapInstance) => {
    mapRef.current = mapInstance;
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCurrentPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  }, []);

  const runServices = useCallback(() => {
    if (!(window.google && window.google.maps) || !trip) return;

    const directionsService = new window.google.maps.DirectionsService();
    const distanceMatrixService = new window.google.maps.DistanceMatrixService();

    directionsService.route(
      {
        origin: trip.startLocation,
        destination: trip.endLocation,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
          setError(null);
          if (mapRef.current && result.routes?.[0]?.bounds) {
            mapRef.current.fitBounds(result.routes[0].bounds);
          }
        } else {
          setError("Could not fetch directions.");
          setDirections(null);
        }
      }
    );

    distanceMatrixService.getDistanceMatrix(
      {
        origins: [trip.startLocation],
        destinations: [trip.endLocation],
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.METRIC,
      },
      (response, status) => {
        if (status === window.google.maps.DistanceMatrixStatus.OK) {
          const el = response?.rows?.[0]?.elements?.[0];
          if (el?.status === "OK") {
            setDistance(el.distance.text);
            setDuration(el.duration.text);
          } else {
            setDistance(null);
            setDuration(null);
          }
        } else {
          setDistance(null);
          setDuration(null);
        }
      }
    );
  }, [trip]);

  useEffect(() => {
    runServices();
  }, [runServices]);

  if (!apiKey) {
    return (
      <Alert severity="warning">
        Google Maps is not configured. Map preview is disabled.
      </Alert>
    );
  }

  return (
    <Box>
      <LoadScript
        googleMapsApiKey={apiKey}
        onError={() =>
          setMapsError("Failed to load Google Maps. Check API key and referrer settings.")
        }
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={currentPos || { lat: 17.3850, lng: 78.4867 }}
          zoom={12}
          onLoad={onLoad}
          options={{
            styles: darkMode ? [
              { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
              { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
              { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
            ] : undefined
          }}
        >
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {mapsError && <Alert severity="error" sx={{ mb: 2 }}>{mapsError}</Alert>}

          {directions && <DirectionsRenderer directions={directions} />}

          {trip?.startLocation && (
            <Marker
              position={trip.startLocation}
              onClick={() => setInfoWindowOpen("start")}
            />
          )}

          {trip?.endLocation && (
            <Marker
              position={trip.endLocation}
              onClick={() => setInfoWindowOpen("end")}
            />
          )}

          {infoWindowOpen && (
            <InfoWindow
              position={infoWindowOpen === "start" ? trip.startLocation : trip.endLocation}
              onCloseClick={() => setInfoWindowOpen(null)}
            >
              <div>
                {infoWindowOpen === "start" ? trip.startLocation : trip.endLocation}
              </div>
            </InfoWindow>
          )}

          {currentPos && <Marker position={currentPos} icon={{ url: '/current-location.png' }} />}
        </GoogleMap>
      </LoadScript>

      <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
        Distance: {distance ?? "N/A"} | Estimated Duration: {duration ?? "N/A"}
      </Typography>
    </Box>
  );
}