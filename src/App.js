import React, { useState, useEffect, useMemo } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { CssBaseline, CircularProgress, Box } from "@mui/material";
import { SnackbarProvider } from "notistack";
import { ThemeProvider } from "@mui/material/styles";
import { useJsApiLoader } from "@react-google-maps/api";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { lightTheme, darkTheme } from "./theme";

import Home from "./components/Home";
import Trips from "./components/Trips";
import CreateTrip from "./components/CreateTrip";
import MyBookings from "./components/MyBookings";
import About from "./components/About";
import Contact from "./components/Contact";
import Auth from "./components/Auth";
import CompleteProfile from "./components/CompleteProfile";
import Profile from "./components/Profile";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";

const libraries = ["places"];

function AppWrapper() {
  // Wrap App with Router and provide navigate hook
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {
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
    id: "global-loader",
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
            }
          } else {
            setProfile(null);
          }
        } catch {
          setProfile(null);
        }
      } else {
        setUser(null);
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

  const handleToggleTheme = () => {
    setDarkMode((prev) => {
      localStorage.setItem("darkMode", JSON.stringify(!prev));
      return !prev;
    });
  };

  if (loading || !mapsLoaded) {
    // Show loader while auth state or maps load
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3}>
        {/* Pass user, handlers, darkMode to Navbar */}
        <Navbar
          user={user}
          onNavigate={navigate}
          onLogout={handleLogout}
          darkMode={darkMode}
          onToggleTheme={handleToggleTheme}
        />
        <Routes>
          <Route path="/" element={<Home onNavigate={navigate} />} />
          <Route path="/trips" element={<Trips user={user} onNavigate={navigate} mapsLoaded={mapsLoaded} mapsError={mapsError} />} />
          <Route path="/create" element={user ? <CreateTrip user={user} onNavigate={navigate} mapsLoaded={mapsLoaded} mapsError={mapsError} /> : <Navigate to="/auth" />} />
          <Route path="/my-bookings" element={user ? <MyBookings user={user} /> : <Navigate to="/auth" />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/auth" element={user ? <Navigate to="/" /> : <Auth />} />
          <Route path="/complete-profile" element={user ? <CompleteProfile /> : <Navigate to="/auth" />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/auth" />} />
          {/* Add 404 or fallback route if desired */}
        </Routes>
        <Footer />
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default AppWrapper;
