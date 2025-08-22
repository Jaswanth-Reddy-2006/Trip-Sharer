import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';
import Feedback from './components/Feedback';
import Trips from './components/Trips';
import CreateTrip from './components/CreateTrip';
import Auth from './components/Auth';
import Footer from './components/Footer';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
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
} from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const AnimatedPage = ({ children, key }) => {
  return (
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
};

function App() {
  const [page, setPage] = useState('home');
  const [user, setUser] = useState(null);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // Optionally keep page when auth state changes
    });
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setPage('home');
  };

  const handleNavigate = (targetPage) => {
    if (!user && (targetPage === 'create' || targetPage === 'trips')) {
      setLoginPromptOpen(true);
    } else {
      setPage(targetPage);
    }
  };

  const closeLoginPrompt = () => setLoginPromptOpen(false);

  return (
    <>
      {/* Nav Bar */}
      <AppBar position="sticky" sx={{ backgroundColor: '#2E7D32' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography
            variant="h5"
            sx={{ fontWeight: 'bold', cursor: 'pointer' }}
            onClick={() => setPage('home')}
          >
            Trip Sharer
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button color="inherit" onClick={() => setPage('home')}>Home</Button>
            <Button color="inherit" onClick={() => setPage('about')}>About Us</Button>
            <Button color="inherit" onClick={() => setPage('contact')}>Contact Us</Button>
            <Button color="inherit" onClick={() => setPage('feedback')}>Feedback</Button>
            {user ? (
              <>
                <Avatar sx={{ mr: 1, bgcolor: '#66BB6A' }}>{user.email.charAt(0).toUpperCase()}</Avatar>
                <Typography sx={{ mr: 2 }}>{user.email}</Typography>
                <Button variant="outlined" color="inherit" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <Button variant="outlined" color="inherit" onClick={() => setPage('auth')}>
                Login / Sign Up
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Page Transitions */}
      <AnimatePresence exitBeforeEnter>
        {page === 'home' && <AnimatedPage key="home"><Home onNavigate={handleNavigate} user={user} /></AnimatedPage>}
        {page === 'about' && <AnimatedPage key="about"><About /></AnimatedPage>}
        {page === 'contact' && <AnimatedPage key="contact"><Contact /></AnimatedPage>}
        {page === 'feedback' && <AnimatedPage key="feedback"><Feedback /></AnimatedPage>}
        {page === 'auth' && <AnimatedPage key="auth"><Auth onLogin={() => setPage('home')} /></AnimatedPage>}
        {page === 'trips' && user && <AnimatedPage key="trips"><Trips onNavigate={handleNavigate} /></AnimatedPage>}
        {page === 'create' && user && <AnimatedPage key="create"><CreateTrip onNavigate={handleNavigate} /></AnimatedPage>}
      </AnimatePresence>

      {/* Login Prompt Dialog */}
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
          <Button
            onClick={() => {
              setPage('auth');
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

      {/* Footer */}
      <Footer />
    </>
  );
}

export default App;
