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

  if (auth.currentUser) return null;

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
    <Container maxWidth="xs">
      <Typography variant="h5" gutterBottom>Login</Typography>
      <form onSubmit={handleLogin} autoComplete="off">
        <TextField
          label="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
          fullWidth
          margin="normal"
          disabled={loading}
        />
        <TextField
          label="Password"
          value={password}
          type="password"
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          fullWidth
          margin="normal"
          disabled={loading}
        />
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Button type="submit" variant="contained" fullWidth disabled={loading}>
          {loading ? 'Logging in...' : 'Log In'}
        </Button>
        <Divider sx={{ my: 2 }}>OR</Divider>
        <Button onClick={handleGoogleLogin} variant="outlined" fullWidth disabled={loading}>
          Login with Google
        </Button>
      </form>
    </Container>
  );
}
