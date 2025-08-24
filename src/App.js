import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link as RouterLink,
  Navigate,
  useNavigate,
} from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  Box,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  CssBaseline,
  Container,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { ThemeProvider } from "@mui/material/styles";
import { auth } from "./firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import theme from "./theme";

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

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currUser) => {
      setUser(currUser);
      if (currUser) {
        try {
          const docRef = doc(db, "users", currUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfile(data);
            if (
              !data.profileComplete &&
              window.location.pathname !== "/complete-profile"
            ) {
              navigate("/complete-profile");
            }
          } else {
            setProfile(null);
            if (window.location.pathname !== "/complete-profile")
              navigate("/complete-profile");
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
  }, [navigate]);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
    setAnchorEl(null);
    navigate("/");
  };

  const onCreateClick = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!profile || !profile.profileComplete) {
      navigate("/complete-profile");
      return;
    }
    navigate("/create");
  };

  if (loading) return null;

  const avatarContent =
    user && (user.photoURL ? (
      <Avatar alt={user.displayName} src={user.photoURL} />
    ) : profile && profile.name ? (
      <Avatar>{profile.name.charAt(0).toUpperCase()}</Avatar>
    ) : (
      <Avatar>{user.email.charAt(0).toUpperCase()}</Avatar>
    ));

  return (
    <>
      <AppBar
        position="static"
        sx={{ background: "linear-gradient(90deg, #2e7d32, #388e3c)" }}
      >
        <Toolbar>
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: "flex",
              alignItems: "center",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            <Box
              component="img"
              src="/sharo_logo.png"
              alt="Logo"
              sx={{
                width: 40,
                height: 40,
                bgcolor: "white",
                borderRadius: "50%",
                mr: 1,
              }}
            />
            <Typography variant="h6" noWrap>
              sharo
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 2,
            }}
          >
            <Button component={RouterLink} to="/" color="inherit">
              Home
            </Button>
            <Button component={RouterLink} to="/trips" color="inherit">
              View Trips
            </Button>
            <Button component={RouterLink} to="/about" color="inherit">
              About
            </Button>
            <Button component={RouterLink} to="/contact" color="inherit">
              Contact
            </Button>
            <Button color="inherit" onClick={onCreateClick}>
              Create Trip
            </Button>
            {user ? (
              <>
                <Button
                  color="inherit"
                  onClick={() => navigate("/my-bookings")}
                >
                  My Bookings
                </Button>
                <Tooltip title="Account">
                  <IconButton
                    onClick={handleMenuOpen}
                    size="small"
                    sx={{ ml: 2 }}
                  >
                    {avatarContent}
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <Button component={RouterLink} to="/auth" color="inherit">
                Login / Sign Up
              </Button>
            )}
          </Box>

          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton onClick={handleMenuOpen} color="inherit" size="large">
              <MenuIcon />
            </IconButton>
          </Box>

          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            PaperProps={{
              elevation: 1,
              sx: {
                mt: "45px",
                minWidth: 220,
                "& .MuiMenuItem-root": {
                  px: 2,
                  py: 1,
                },
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            {user && (
              <>
                <Box sx={{ px: 2, pt: 1 }}>
                  <Typography variant="subtitle1" noWrap>
                    {profile?.name || user.displayName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {user.email}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem onClick={() => navigate("/profile")}>Profile</MenuItem>
                <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
                  Logout
                </MenuItem>
              </>
            )}
            {!user && (
              <MenuItem
                onClick={() => {
                  navigate("/auth");
                }}
              >
                Login / Sign Up
              </MenuItem>
            )}
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          pt: 3,
          pb: 3,
        }}
      >
        <Container maxWidth="md">
          <Routes>
            <Route path="/" element={<Home onNavigate={navigate} />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route
              path="/trips"
              element={<Trips user={user} onNavigate={navigate} />}
            />
            <Route
              path="/create"
              element={<CreateTrip user={user} onNavigate={navigate} />}
            />
            <Route path="/my-bookings" element={<MyBookings user={user} />} />
            <Route path="/profile" element={<Profile />} />
            <Route
              path="/complete-profile"
              element={<CompleteProfile />}
            />
            <Route
              path="/auth"
              element={!user ? <Auth /> : <Navigate to="/" replace />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Container>
      </Box>
      <Footer />
    </>
  );
}
