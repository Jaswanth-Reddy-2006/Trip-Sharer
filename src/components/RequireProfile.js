import React from "react";
import { Navigate } from "react-router-dom";
import { Box, CircularProgress, Typography, Alert, Button } from "@mui/material";

export default function RequireProfile({ user, profile, children }) {
  console.log("RequireProfile check:", { 
    user: !!user, 
    userId: user?.uid,
    profile: !!profile, 
    profileComplete: profile?.profileComplete 
  });

  // Show loading if we're still checking auth or user data
  if (user === undefined || user === null) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="50vh"
        gap={2}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Checking authentication...
        </Typography>
      </Box>
    );
  }

  // Redirect to login if not authenticated or user doesn't have uid
  if (!user || !user.uid) {
    console.log("No user or missing uid, redirecting to auth");
    return <Navigate to="/auth" replace />;
  }

  // Show loading if we're still fetching profile
  if (profile === undefined) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="50vh"
        gap={2}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Loading profile...
        </Typography>
      </Box>
    );
  }

  // Handle profile loading error
  if (profile === null) {
    console.log("Profile is null, may need to complete profile");
    return <Navigate to="/complete-profile" replace />;
  }

  // Redirect to complete profile if profile doesn't exist or isn't complete
  if (!profile || !profile.profileComplete) {
    console.log("Profile incomplete, redirecting to complete-profile");
    return <Navigate to="/complete-profile" replace />;
  }

  // Validate that user has required fields
  if (!user.uid || typeof user.uid !== 'string') {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="50vh"
        gap={2}
        p={3}
      >
        <Alert severity="error" sx={{ mb: 2 }}>
          User authentication error. Please log in again.
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => window.location.href = '/auth'}
          sx={{ borderRadius: 2 }}
        >
          Go to Login
        </Button>
      </Box>
    );
  }

  // All checks passed, render the protected component
  console.log("All checks passed, rendering protected component");
  return children;
}