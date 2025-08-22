import React from 'react';
import { Container, Typography, Box } from '@mui/material';

export default function About() {
  return (
    <Container sx={{ mt: 8, mb: 8 }}>
      <Typography variant="h3" color="green" gutterBottom fontWeight="bold">
        About Trip Sharer
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem', lineHeight: 1.7 }}>
        Trip Sharer is committed to creating a sustainable future by enabling people to share rides,
        reduce traffic congestion, and lower carbon emissions. Our platform connects travelers,
        making transportation affordable, eco-friendly, and community-oriented.
      </Typography>
      <Box sx={{ bgcolor: '#E8F5E9', p: 3, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          Our Mission
        </Typography>
        <Typography variant="body1" sx={{ fontSize: '1rem', lineHeight: 1.6 }}>
          To revolutionize urban and intercity mobility with a user-friendly, secure, and sustainable ride-sharing platform.
        </Typography>
      </Box>
    </Container>
  );
}
