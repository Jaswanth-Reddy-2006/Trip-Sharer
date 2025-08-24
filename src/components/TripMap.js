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
      <Alert severity="warning" sx={{ mt: 2 }}>
        Google Maps is not configured. Map preview is disabled.
      </Alert>
    );
  }

  return (
    <LoadScript
      googleMapsApiKey={apiKey}
      onError={() =>
        setMapsError("Failed to load Google Maps. Check API key and referrer settings.")
      }
    >
      {error && <Alert severity="error">{error}</Alert>}
      {mapsError && <Alert severity="error">{mapsError}</Alert>}

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={trip.startLocation}
        zoom={10}
        onLoad={onLoad}
        options={{
          styles: darkMode
            ? [
                { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                // More dark theme styles can be added here
              ]
            : undefined,
        }}
      >
        {directions && <DirectionsRenderer directions={directions} />}
        {trip?.startLocation && (
          <Marker
            position={typeof trip.startLocation === "string" ? null : trip.startLocation}
            onClick={() => setInfoWindowOpen("start")}
          />
        )}
        {trip?.endLocation && (
          <Marker
            position={typeof trip.endLocation === "string" ? null : trip.endLocation}
            onClick={() => setInfoWindowOpen("end")}
          />
        )}
        {infoWindowOpen && (
          <InfoWindow
            position={
              infoWindowOpen === "start"
                ? typeof trip.startLocation === "string"
                  ? null
                  : trip.startLocation
                : typeof trip.endLocation === "string"
                ? null
                : trip.endLocation
            }
            onCloseClick={() => setInfoWindowOpen(null)}
          >
            <Box>
              <Typography variant="body2" fontWeight="bold">
                {infoWindowOpen === "start" ? trip.startLocation : trip.endLocation}
              </Typography>
            </Box>
          </InfoWindow>
        )}
        {currentPos && <Marker position={currentPos} label="You" />}
      </GoogleMap>

      <Box mt={2}>
        <Typography>
          Distance: {distance ?? "N/A"} | Estimated Duration: {duration ?? "N/A"}
        </Typography>
      </Box>
    </LoadScript>
  );
}
