import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  LoadScript,
  DirectionsRenderer,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "450px",
};

export default function TripMap({ trip, apiKey }) {
  const [directions, setDirections] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!trip || !window.google) return;

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
        } else {
          setError("Could not fetch directions");
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
          const element = response.rows[0].elements[0];
          if (element.status === "OK") {
            setDistance(element.distance.text);
            setDuration(element.duration.text);
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
  }, [trip, apiKey]);

  if (error) return <div>Error loading map: {error}</div>;
  if (!directions) return <div>Loading map...</div>;

  const center = directions.routes[0].bounds.getCenter();

  return (
    <div>
      <LoadScript googleMapsApiKey={apiKey}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center.toJSON()}
          zoom={7}
        >
          <DirectionsRenderer directions={directions} />
        </GoogleMap>
      </LoadScript>
      <div style={{ marginTop: "10px" }}>
        <strong>Distance:</strong> {distance ?? "Calculating..."}
        <br />
        <strong>Estimated Duration:</strong> {duration ?? "Calculating..."}
      </div>
    </div>
  );
}
