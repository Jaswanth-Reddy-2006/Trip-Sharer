import React from "react";
import { Navigate } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";

export default function RequireProfile({ user, profile, children }) {
  console.log("RequireProfile check:", { user: !!user, profile: !!profile, profileComplete: profile?.profileComplete });

  // Show loading if we're still checking auth
  if (user === undefined) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="50vh"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress />
        <Typography>Checking authentication...</Typography>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log("No user, redirecting to auth");
    return <Navigate to="/auth" replace />;
  }

  // Show loading if we're still fetching profile
  if (profile === undefined) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="50vh"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress />
        <Typography>Loading profile...</Typography>
      </Box>
    );
  }

  // Redirect to complete profile if profile doesn't exist or isn't complete
  if (!profile || !profile.profileComplete) {
    console.log("Profile incomplete, redirecting to complete-profile");
    return <Navigate to="/complete-profile" replace />;
  }

  // All checks passed, render the protected component
  console.log("All checks passed, rendering protected component");
  return children;
}