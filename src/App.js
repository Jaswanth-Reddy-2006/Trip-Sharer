import React, { useState, useEffect, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { CssBaseline, CircularProgress, Box } from "@mui/material";
import { SnackbarProvider } from "notistack";
import { ThemeProvider } from "@mui/material/styles";
import { useJsApiLoader } from "@react-google-maps/api";
import { auth, db } from "./firebase";
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
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { lightTheme, darkTheme } from "./theme";

const libraries = ["places"];

function AppWrapper() {
  return (
    <SnackbarProvider maxSnack={3}>
      <Router>
        <ThemeProviderWrapper />
      </Router>
    </SnackbarProvider>
  );
}

function ThemeProviderWrapper() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem("darkMode") || "false"));
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const { isLoaded: mapsLoaded, loadError: mapsError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const theme = useMemo(() => (darkMode ? darkTheme : lightTheme), [darkMode]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const snap = await getDoc(doc(db, "users", u.uid));
        setProfile(snap.exists() ? snap.data() : null);
        if (snap.exists() && !snap.data().profileComplete) {
          navigate("/complete-profile");
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, [navigate]);

  const handleToggleTheme = () => {
    localStorage.setItem("darkMode", JSON.stringify(!darkMode));
    setDarkMode(!darkMode);
  };

  const handleLogout = () => {
    auth.signOut();
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  if (loading || !mapsLoaded) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar 
        user={user} 
        onNavigate={handleNavigate} 
        onLogout={handleLogout} 
        darkMode={darkMode} 
        onToggleTheme={handleToggleTheme} 
      />
      <Routes>
        <Route path="/" element={<Home onNavigate={handleNavigate} />} />
        <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Auth />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        <Route element={<RequireProfile user={user} profile={profile} />}>
          <Route path="/trips" element={<Trips user={user} onNavigate={handleNavigate} />} />
          <Route path="/create-trip" element={<CreateTrip user={user} onNavigate={handleNavigate} />} />
          <Route path="/book-trip/:id" element={<BookTrip user={user} />} />
          <Route path="/my-bookings" element={<MyBookings user={user} onNavigate={handleNavigate} />} />
          <Route path="/profile" element={<Profile user={user} />} />
          <Route path="/chat" element={<ChatList user={user} onNavigate={handleNavigate} />} />
          <Route path="/chat/:chatId" element={<ChatRoom />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </ThemeProvider>
  );
}

export default AppWrapper;