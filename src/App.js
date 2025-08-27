import React, { useState, useEffect, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { CssBaseline, CircularProgress, Box, Container, Alert } from "@mui/material";
import { SnackbarProvider } from "notistack";
import { ThemeProvider } from "@mui/material/styles";
import { useJsApiLoader } from "@react-google-maps/api";

// Firebase
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./components/Home";
import Trips from "./components/Trips";
import CreateTrip from "./components/CreateTrip";
import BookTrip from "./components/BookTrip";
import MyBookings from "./components/MyBookings";
import Profile from "./components/Profile";
import CompleteProfile from "./components/CompleteProfile";
import About from "./components/About";
import Contact from "./components/Contact";
import Auth from "./components/Auth";
import ChatList from "./components/ChatList";
import ChatRoom from "./components/ChatRoom";
import RequireProfile from "./components/RequireProfile";
import ErrorBoundary from "./components/ErrorBoundary";

// Theme
import { lightTheme, darkTheme } from "./theme";

const libraries = ["places"];

function AppWrapper() {
  return (
    <ErrorBoundary>
      <Router>
        <ThemeProviderWrapper />
      </Router>
    </ErrorBoundary>
  );
}

function ThemeProviderWrapper() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Using light theme only (dark mode removed as requested)
  const [darkMode] = useState(false);
  const [user, setUser] = useState(undefined); // Start with undefined to distinguish from null
  const [profile, setProfile] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [appError, setAppError] = useState("");

  const { isLoaded: mapsLoaded, loadError: mapsError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const theme = useMemo(() => lightTheme, []);

  useEffect(() => {
    console.log("🚀 App initialized, setting up auth listener");
    
    const unsub = onAuthStateChanged(auth, async (u) => {
      console.log("🔐 Auth state changed:", { 
        uid: u?.uid, 
        email: u?.email, 
        currentPath: location.pathname 
      });
      
      try {
        setUser(u);
        
        if (u && u.uid) {
          console.log("👤 Fetching user profile...");
          const snap = await getDoc(doc(db, "users", u.uid));
          
          if (snap.exists()) {
            const profileData = snap.data();
            setProfile(profileData);
            console.log("✅ Profile loaded:", { 
              name: profileData.name,
              profileComplete: profileData.profileComplete,
              hasVehicle: profileData.hasVehicle 
            });
            
            // Only redirect to complete profile if profile doesn't exist or isn't complete
            // and we're not already on that page
            if (!profileData.profileComplete && location.pathname !== '/complete-profile') {
              console.log("⚠️  Profile incomplete, scheduling redirect to complete-profile");
              setTimeout(() => {
                console.log("🔄 Redirecting to complete-profile");
                navigate("/complete-profile", { replace: true });
              }, 100);
            }
          } else {
            console.log("❌ No profile found, scheduling redirect to complete-profile");
            setProfile(null);
            if (location.pathname !== '/complete-profile') {
              setTimeout(() => {
                console.log("🔄 Redirecting to complete-profile (no profile)");
                navigate("/complete-profile", { replace: true });
              }, 100);
            }
          }
        } else {
          console.log("👋 User logged out");
          setProfile(null);
        }
      } catch (error) {
        console.error("💥 Error in auth state change:", error);
        setAppError("Authentication error occurred. Please refresh the page.");
        setProfile(null);
      } finally {
        setAuthChecked(true);
        setLoading(false);
      }
    });

    return () => {
      console.log("🧹 Cleaning up auth listener");
      unsub();
    };
  }, [navigate, location.pathname]);

  const handleLogout = () => {
    console.log("🚪 Logging out user");
    try {
      auth.signOut();
      setUser(null);
      setProfile(null);
      navigate('/', { replace: true });
    } catch (error) {
      console.error("Error during logout:", error);
      setAppError("Error logging out. Please try again.");
    }
  };

  const handleNavigate = (path) => {
    console.log("🧭 Navigation requested:", path);
    try {
      navigate(path);
    } catch (error) {
      console.error("Navigation error:", error);
      setAppError("Navigation error occurred.");
    }
  };

  // Show loading while auth is being checked
  if (!authChecked || loading) {
    console.log("⏳ Showing loading screen - authChecked:", authChecked, "loading:", loading);
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="100vh"
          flexDirection="column"
          gap={2}
        >
          <CircularProgress size={40} />
          <div>Loading application...</div>
        </Box>
      </ThemeProvider>
    );
  }

  if (mapsError) {
    console.error("🗺️ Google Maps loading error:", mapsError);
  }

  if (appError) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="sm" sx={{ mt: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {appError}
          </Alert>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </Container>
      </ThemeProvider>
    );
  }

  console.log("🎯 Rendering app with state:", {
    user: !!user,
    userId: user?.uid,
    profile: !!profile,
    profileComplete: profile?.profileComplete,
    currentPath: location.pathname,
    mapsLoaded
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar 
            user={user} 
            onNavigate={handleNavigate} 
            onLogout={handleLogout}
            profile={profile}
          />
          
          <Box component="main" sx={{ flexGrow: 1, pt: 0 }}>
            <ErrorBoundary>
              <Routes>
                {/* Public Routes */}
                <Route 
                  path="/" 
                  element={
                    <ErrorBoundary>
                      <Home onNavigate={handleNavigate} />
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="/about" 
                  element={
                    <ErrorBoundary>
                      <About />
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="/contact" 
                  element={
                    <ErrorBoundary>
                      <Contact />
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="/auth" 
                  element={
                    user && user.uid ? (
                      <Navigate to="/" replace />
                    ) : (
                      <ErrorBoundary>
                        <Auth />
                      </ErrorBoundary>
                    )
                  } 
                />

                {/* Profile Setup Routes - Accessible when logged in */}
                <Route 
                  path="/complete-profile" 
                  element={
                    user && user.uid ? (
                      <ErrorBoundary>
                        <CompleteProfile />
                      </ErrorBoundary>
                    ) : (
                      <Navigate to="/auth" replace />
                    )
                  } 
                />

                {/* Protected Routes - Require Authentication and Complete Profile */}
                <Route 
                  path="/profile" 
                  element={
                    <ErrorBoundary>
                      <RequireProfile user={user} profile={profile}>
                        <Profile user={user} onNavigate={handleNavigate} />
                      </RequireProfile>
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="/trips" 
                  element={
                    <ErrorBoundary>
                      <RequireProfile user={user} profile={profile}>
                        <Trips user={user} onNavigate={handleNavigate} />
                      </RequireProfile>
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="/create-trip" 
                  element={
                    <ErrorBoundary>
                      <RequireProfile user={user} profile={profile}>
                        <CreateTrip user={user} onNavigate={handleNavigate} />
                      </RequireProfile>
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="/book-trip/:id" 
                  element={
                    <ErrorBoundary>
                      <RequireProfile user={user} profile={profile}>
                        <BookTrip user={user} />
                      </RequireProfile>
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="/my-bookings" 
                  element={
                    <ErrorBoundary>
                      <RequireProfile user={user} profile={profile}>
                        <MyBookings user={user} onNavigate={handleNavigate} />
                      </RequireProfile>
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="/chat" 
                  element={
                    <ErrorBoundary>
                      <RequireProfile user={user} profile={profile}>
                        <ChatList user={user} onNavigate={handleNavigate} />
                      </RequireProfile>
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="/chat/:chatId" 
                  element={
                    <ErrorBoundary>
                      <RequireProfile user={user} profile={profile}>
                        <ChatRoom />
                      </RequireProfile>
                    </ErrorBoundary>
                  } 
                />

                {/* Catch all route */}
                <Route 
                  path="*" 
                  element={<Navigate to="/" replace />} 
                />
              </Routes>
            </ErrorBoundary>
          </Box>
          
          <Footer />
        </Box>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default AppWrapper;