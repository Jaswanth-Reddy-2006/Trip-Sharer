// About.js
import React from 'react';
import { Container, Typography, Box } from '@mui/material';

export default function About() {
  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 6 }}>
      <Typography variant="h3" gutterBottom fontWeight="bold" color="primary">
        About Us
      </Typography>
      <Box sx={{ mt: 3 }}>
        <Typography variant="body1" paragraph fontSize={18} color="text.primary" lineHeight={1.6}>
          Welcome to <strong>sharo</strong>! We connect travelers offering seats with people looking for rides,
          aiming to make travel easy, affordable, and environmentally friendly.
        </Typography>
        <Typography variant="body1" paragraph fontSize={18} color="text.primary" lineHeight={1.6}>
          Our platform fosters community and sustainability by helping people share trips and reduce travel costs.
        </Typography>
        <Typography variant="body1" paragraph fontSize={18} color="text.primary" lineHeight={1.6}>
          Whether you want to offer a ride or find one, we provide a safe and trusted space to connect.
        </Typography>
      </Box>
    </Container>
  );
}
