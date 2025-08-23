import React from 'react';
import { Container, Typography, Box, TextField, Button } from '@mui/material';

export default function Contact() {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for contacting us! We will get back to you shortly.');
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Contact Us
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, maxWidth: 600 }}>
        <TextField fullWidth label="Name" name="name" required margin="normal" />
        <TextField fullWidth label="Email" name="email" type="email" required margin="normal" />
        <TextField fullWidth label="Message" name="message" multiline rows={4} required margin="normal" />
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          Send Message
        </Button>
      </Box>
    </Container>
  );
}
