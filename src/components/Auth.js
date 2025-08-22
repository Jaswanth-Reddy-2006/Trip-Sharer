import React, { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Stack,
  Divider,
  CircularProgress,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

export default function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleMode = () => {
    setError('');
    setIsLogin(!isLogin);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8, mb: 8 }}>
      <Typography variant="h4" color="green" mb={3} align="center" fontWeight="bold">
        {isLogin ? 'Welcome Back' : 'Create an Account'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2, fontSize: '0.9rem' }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          margin="normal"
          required
          disabled={loading}
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          margin="normal"
          required
          disabled={loading}
        />
        <Button
          variant="contained"
          fullWidth
          type="submit"
          disabled={loading}
          size="large"
          sx={{ mt: 3, mb: 2, fontWeight: 'bold', fontSize: '1rem' }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : isLogin ? 'Login' : 'Sign Up'}
        </Button>
      </Box>

      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        justifyContent="center"
        sx={{ my: 3 }}
      >
        <Divider sx={{ flexGrow: 1 }} />
        <Typography color="text.secondary" sx={{ mx: 1, fontSize: '0.9rem' }}>
          OR
        </Typography>
        <Divider sx={{ flexGrow: 1 }} />
      </Stack>

      <Button
        variant="outlined"
        fullWidth
        startIcon={<GoogleIcon />}
        onClick={handleGoogleLogin}
        disabled={loading}
        sx={{ fontWeight: 'bold', fontSize: '1rem' }}
      >
        Continue with Google
      </Button>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button onClick={toggleMode} disabled={loading} sx={{ fontWeight: 'bold' }}>
          {isLogin
            ? "Don't have an account? Sign Up"
            : 'Already have an account? Login'}
        </Button>
      </Box>
    </Container>
  );
}
