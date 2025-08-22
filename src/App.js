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
  AppBar, Toolbar, Typography, Button, Avatar, Box, Dialog,
  DialogTitle, DialogContent, DialogActions, Slide,
  IconButton, Menu, MenuItem, useMediaQuery
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

  const handleLogout = async () => {
    await signOut(auth);
    setPage('home');
    handleMobileMenuClose();
  };

  const handleNavigate = (targetPage) => {
    if (!user && (targetPage === 'create' || targetPage === 'trips' || targetPage === 'profile')) {
      setLoginPromptOpen(true);
    } else if (user && !profileComplete && (targetPage === 'create' || targetPage === 'profile')) {
      setPage('completeProfile');
      handleMobileMenuClose();
    } else {
      setPage(targetPage);
      handleMobileMenuClose();
    }
  };

  const closeLoginPrompt = () => setLoginPromptOpen(false);

  const handleMobileMenuOpen = (event) => {
    setMobileAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileAnchorEl(null);
  };

  const onProfileComplete = () => {
    setProfileComplete(true);
    setPage('home');
  };

  return (
    <>
      {/* Nav Bar */}
      <AppBar position="sticky" sx={{ backgroundColor: '#2E7D32' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography
            variant="h5"
            sx={{ fontWeight: 'bold', cursor: 'pointer' }}
            onClick={() => { setPage('home'); handleMobileMenuClose(); }}
          >
            Trip Sharer
          </Typography>

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
                <MenuItem onClick={() => { handleNavigate('home'); }}>Home</MenuItem>
                <MenuItem onClick={() => { handleNavigate('about'); }}>About Us</MenuItem>
                <MenuItem onClick={() => { handleNavigate('contact'); }}>Contact Us</MenuItem>
                <MenuItem onClick={() => { handleNavigate('feedback'); }}>Feedback</MenuItem>
                <MenuItem onClick={() => { handleNavigate('profile'); }}>Profile</MenuItem>
                {user ? (
                  <MenuItem onClick={() => { handleLogout(); }}>Logout</MenuItem>
                ) : (
                  <MenuItem onClick={() => { handleNavigate('auth'); }}>Login / Sign Up</MenuItem>
                )}
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button color="inherit" onClick={() => setPage('home')}>Home</Button>
              <Button color="inherit" onClick={() => setPage('about')}>About Us</Button>
              <Button color="inherit" onClick={() => setPage('contact')}>Contact Us</Button>
              <Button color="inherit" onClick={() => setPage('feedback')}>Feedback</Button>
              <Button color="inherit" onClick={() => setPage('profile')}>Profile</Button>
              {user ? (
                <>
                  <Avatar
                    sx={{ mr: 1, bgcolor: '#66BB6A', cursor: 'pointer' }}
                    onClick={() => setPage('profile')}
                    title="Go to Profile"
                  >
                    {user.displayName?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                  </Avatar>
                  <Button variant="outlined" color="inherit" onClick={handleLogout}>Logout</Button>
                </>
              ) : (
                <Button variant="outlined" color="inherit" onClick={() => setPage('auth')}>
                  Login / Sign Up
                </Button>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Page Content */}
      <AnimatePresence exitBeforeEnter>
        {page === 'home' && <AnimatedPage key="home"><Home onNavigate={handleNavigate} user={user} /></AnimatedPage>}
        {page === 'about' && <AnimatedPage key="about"><About /></AnimatedPage>}
        {page === 'contact' && <AnimatedPage key="contact"><Contact /></AnimatedPage>}
        {page === 'feedback' && <AnimatedPage key="feedback"><Feedback /></AnimatedPage>}
        {page === 'auth' && <AnimatedPage key="auth"><Auth onLogin={() => setPage('home')} /></AnimatedPage>}
        {page === 'trips' && user && <AnimatedPage key="trips"><Trips onNavigate={handleNavigate} /></AnimatedPage>}
        {page === 'create' && user && profileComplete && <AnimatedPage key="create"><CreateTrip onNavigate={handleNavigate} /></AnimatedPage>}
        {page === 'profile' && user && <AnimatedPage key="profile"><Profile onNavigate={handleNavigate} /></AnimatedPage>}
        {page === 'completeProfile' && user && !profileComplete && (
          <AnimatedPage key="completeProfile">
            <CompleteProfile onComplete={onProfileComplete} />
          </AnimatedPage>
        )}
      </AnimatePresence>

      {/* Login Prompt */}
      <Dialog
        open={loginPromptOpen}
        TransitionComponent={Transition}
        keepMounted
        onClose={closeLoginPrompt}
        aria-describedby="login-required-dialog"
      >
        <DialogTitle>Login Required</DialogTitle>
        <DialogContent>Please login or sign up to access this feature.</DialogContent>
        <DialogActions>
          <Button onClick={() => { setPage('auth'); closeLoginPrompt(); }} color="primary">Login / Sign Up</Button>
          <Button onClick={closeLoginPrompt} color="primary">Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Footer */}
      <Footer />
    </>
  );
}

export default App;
