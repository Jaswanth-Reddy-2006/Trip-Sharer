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
import ChatList from "./components/ChatList";
import ChatRoom from "./components/ChatRoom";
import About from "./components/About";
import Contact from "./components/Contact";
import Auth from "./components/Auth";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { lightTheme, darkTheme } from "./theme";

const libraries = ["places"];

function AppWrapper() {
  return (
    <Router>
      <SnackbarProvider maxSnack={3}>
        <ThemeProviderWrapper />
      </SnackbarProvider>
    </Router>
  );
}

function ThemeProviderWrapper() {
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem("darkMode");
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "";

  const { isLoaded: mapsLoaded, loadError: mapsError } = useJsApiLoader({
    googleMapsApiKey,
    libraries,
  });

  const theme = useMemo(() => (darkMode ? darkTheme : lightTheme), [darkMode]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(true);
      if (currentUser) {
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfile(data);
            if (!data.profileComplete && window.location.pathname !== "/complete-profile") {
              window.location.href = "/complete-profile";
              return;
            }
          } else {
            setProfile(null);
          }
        } catch {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    setUser(null);
    navigate("/auth");
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      localStorage.setItem("darkMode", JSON.stringify(!prev));
      return !prev;
    });
  };

  if (loading || !mapsLoaded) {
    return (
      <Box sx={{ width: "100vw", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar user={user} onNavigate={navigate} onLogout={handleLogout} darkMode={darkMode} onToggleTheme={toggleDarkMode} />
      <Routes>
        <Route path="/" element={<Home onNavigate={navigate} />} />
        <Route path="/trips" element={<Trips user={user} onNavigate={navigate} />} />
        <Route path="/create-trip" element={user ? <CreateTrip user={user} onNavigate={navigate} mapsLoaded={mapsLoaded} mapsError={mapsError} /> : <Navigate to="/auth" />} />
        <Route path="/book-trip/:id" element={user ? <BookTrip user={user} /> : <Navigate to="/auth" />} />
        <Route path="/my-bookings" element={user ? <MyBookings user={user} onNavigate={navigate} /> : <Navigate to="/auth" />} />
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/auth" />} />
        <Route path="/complete-profile" element={user ? <CompleteProfile /> : <Navigate to="/auth" />} />
        <Route path="/chat" element={user ? <ChatList /> : <Navigate to="/auth" />} />
        <Route path="/chat/:chatId" element={user ? <ChatRoom /> : <Navigate to="/auth" />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/auth" element={<Auth />} />

        {/* Redirect /create to /create-trip */}
        <Route path="/create" element={<Navigate to="/create-trip" replace />} />

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </ThemeProvider>
  );
}

export default AppWrapper;
