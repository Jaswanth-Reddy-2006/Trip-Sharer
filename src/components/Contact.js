import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import { useSnackbar } from 'notistack';

export default function Contact() {
  const { enqueueSnackbar } = useSnackbar();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.message) {
      setError('Please fill all fields.');
      return;
    }

    setError('');
    // Here, implement sending contact info (e.g., API call or email service)
    enqueueSnackbar('Thank you for contacting us!', { variant: 'success' });
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <Container sx={{ mt: 8, mb: 8, maxWidth: 600 }}>
      <Typography variant="h3" color="green" gutterBottom fontWeight="bold">
        Contact Us
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          label="Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Message"
          name="message"
          value={form.message}
          onChange={handleChange}
          multiline
          rows={4}
          fullWidth
          margin="normal"
          required
        />
        <Button type="submit" variant="contained" color="success" sx={{ mt: 3 }}>
          Send Message
        </Button>
      </Box>
    </Container>
  );
}
