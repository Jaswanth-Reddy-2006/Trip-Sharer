import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { Container, TextField, Button, Typography, Box, Divider, Alert } from '@mui/material';

export default function Auth() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (auth.currentUser) return <Navigate to="/" replace />;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Google login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ py: 6 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Login
      </Typography>

      <Box component="form" onSubmit={handleLogin}>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          fullWidth
          margin="normal"
          disabled={loading}
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          fullWidth
          margin="normal"
          disabled={loading}
        />

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3 }}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Log In'}
        </Button>

        <Divider sx={{ my: 3 }}>OR</Divider>

        <Button
          variant="outlined"
          color="primary"
          fullWidth
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          Login with Google
        </Button>
      </Box>
    </Container>
  );
}
