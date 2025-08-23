import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';
import Feedback from './components/Feedback';
import Profile from './components/Profile';
import CompleteProfile from './components/CompleteProfile';
import Trips from './components/Trips';
import CreateTrip from './components/CreateTrip';
import Auth from './components/Auth';
import Footer from './components/Footer';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slide,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
} from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from '@mui/material/styles';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const AnimatedPage = ({ children, key }) => (
  <motion.div
    key={key}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [page, setPage] = useState('home');
  const [user, setUser] = useState(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [mobileAnchorEl, setMobileAnchorEl] = useState(null);
  const isMobileMenuOpen = Boolean(mobileAnchorEl);

  // Sync page state with browser history for proper navigation
  useEffect(() => {
    const onPopState = (event) => {
      if (event.state && event.state.page) {
        setPage(event.state.page);
      } else {
        setPage('home');
      }
    };
    window.addEventListener('popstate', onPopState);

    // Initialize history state on page load
    window.history.replaceState({ page: 'home' }, '', '#home');

    return () => {
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        setProfileComplete(userSnap.exists() && userSnap.data().profileComplete);
      } else {
        setProfileComplete(false);
      }
    });
    return unsubscribe;
  }, []);

  // Log out user
  const handleLogout = async () => {
    await signOut(auth);
    setPage('home');
    handleMobileMenuClose();
    window.history.pushState({ page: 'home' }, '', '#home');
  };

  // Central page navigation with history push
  const handleNavigate = (targetPage) => {
    if (!user && (targetPage === 'create' || targetPage === 'trips' || targetPage === 'profile')) {
      setLoginPromptOpen(true);
    } else if (user && !profileComplete && (targetPage === 'create' || targetPage === 'profile')) {
      setPage('completeProfile');
      handleMobileMenuClose();
      window.history.pushState({ page: 'completeProfile' }, '', '#completeProfile');
    } else {
      setPage(targetPage);
      handleMobileMenuClose();
      window.history.pushState({ page: targetPage }, '', `#${targetPage}`);
    }
  };

  const closeLoginPrompt = () => setLoginPromptOpen(false);

  const handleMobileMenuOpen = (event) => setMobileAnchorEl(event.currentTarget);

  const handleMobileMenuClose = () => setMobileAnchorEl(null);

  const onProfileComplete = () => {
    setProfileComplete(true);
    setPage('home');
    window.history.pushState({ page: 'home' }, '', '#home');
  };

  return (
    <>
      <AppBar position="sticky" sx={{ backgroundColor: '#2E7D32' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
          <img
            src={`${process.env.PUBLIC_URL}/favicon.png`}
            alt="sharo logo"
            style={{
              height: 42,
              cursor: 'pointer',
              marginRight: 16,
              borderRadius: 8,
              background: '#fff',
            }}
            onClick={() => {
              setPage('home');
              handleMobileMenuClose();
              window.history.pushState({ page: 'home' }, '', '#home');
            }}
          />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bolder',
              cursor: 'pointer',
              color: '#388e3c',
              textShadow: '1px 1px 5px #c8e6c9',
              letterSpacing: 3,
              ml: 1,
              fontFamily: "'Montserrat', Arial, sans-serif",
              background: 'linear-gradient(90deg,#43e97b,#38f9d7 70%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
            onClick={() => {
              setPage('home');
              handleMobileMenuClose();
              window.history.pushState({ page: 'home' }, '', '#home');
            }}
          >
            sharo
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          {isMobile ? (
            <>
              <IconButton color="inherit" onClick={handleMobileMenuOpen}>
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={mobileAnchorEl}
                open={isMobileMenuOpen}
                onClose={handleMobileMenuClose}
              >
                <MenuItem onClick={() => handleNavigate('home')}>Home</MenuItem>
                <MenuItem onClick={() => handleNavigate('about')}>About Us</MenuItem>
                <MenuItem onClick={() => handleNavigate('contact')}>Contact Us</MenuItem>
                <MenuItem onClick={() => handleNavigate('feedback')}>Feedback</MenuItem>
                <MenuItem onClick={() => handleNavigate('profile')}>Profile</MenuItem>
                {user ? (
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                ) : (
                  <MenuItem onClick={() => handleNavigate('auth')}>Login / Sign Up</MenuItem>
                )}
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button color="inherit" onClick={() => handleNavigate('home')}>
                Home
              </Button>
              <Button color="inherit" onClick={() => handleNavigate('about')}>
                About Us
              </Button>
              <Button color="inherit" onClick={() => handleNavigate('contact')}>
                Contact Us
              </Button>
              <Button color="inherit" onClick={() => handleNavigate('feedback')}>
                Feedback
              </Button>
              <Button color="inherit" onClick={() => handleNavigate('profile')}>
                Profile
              </Button>
              {user ? (
                <>
                  <Avatar
                    sx={{ mr: 1, bgcolor: '#66BB6A', cursor: 'pointer' }}
                    onClick={() => handleNavigate('profile')}
                    title="Go to Profile"
                  >
                    {user.displayName?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                  </Avatar>
                  <Button variant="outlined" color="inherit" onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              ) : (
                <Button variant="outlined" color="inherit" onClick={() => handleNavigate('auth')}>
                  Login / Sign Up
                </Button>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <AnimatePresence exitBeforeEnter>
        {page === 'home' && (
          <AnimatedPage key="home">
            <Home onNavigate={handleNavigate} user={user} />
          </AnimatedPage>
        )}
        {page === 'about' && (
          <AnimatedPage key="about">
            <About />
          </AnimatedPage>
        )}
        {page === 'contact' && (
          <AnimatedPage key="contact">
            <Contact />
          </AnimatedPage>
        )}
        {page === 'feedback' && (
          <AnimatedPage key="feedback">
            <Feedback />
          </AnimatedPage>
        )}
        {page === 'auth' && (
          <AnimatedPage key="auth">
            <Auth onLogin={() => handleNavigate('home')} />
          </AnimatedPage>
        )}
        {page === 'trips' && user && (
          <AnimatedPage key="trips">
            <Trips onNavigate={handleNavigate} />
          </AnimatedPage>
        )}
        {page === 'create' && user && profileComplete && (
          <AnimatedPage key="create">
            <CreateTrip onNavigate={handleNavigate} />
          </AnimatedPage>
        )}
        {page === 'profile' && user && (
          <AnimatedPage key="profile">
            <Profile onNavigate={handleNavigate} />
          </AnimatedPage>
        )}
        {page === 'completeProfile' && user && !profileComplete && (
          <AnimatedPage key="completeProfile">
            <CompleteProfile onComplete={onProfileComplete} />
          </AnimatedPage>
        )}
      </AnimatePresence>

      <Dialog
        open={loginPromptOpen}
        TransitionComponent={Transition}
        keepMounted
        onClose={closeLoginPrompt}
        aria-describedby="login-required-dialog"
      >
        <DialogTitle>Login Required</DialogTitle>
        <DialogContent>
          Please login or sign up to access this feature.
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              handleNavigate('auth');
              closeLoginPrompt();
            }}
            color="primary"
          >
            Login / Sign Up
          </Button>
          <Button onClick={closeLoginPrompt} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </>
  );
}

export default App;
