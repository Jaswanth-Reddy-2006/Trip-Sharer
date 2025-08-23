import React from 'react';
import { Box, Button, Typography, Container } from '@mui/material';

export default function Home({ onNavigate }) {
  return (
    <Container maxWidth="md" sx={{ textAlign: 'center', mt: 10 }}>
      <Typography variant="h3" gutterBottom fontWeight="bold" color="primary">
        Welcome to sharo
      </Typography>
      <Typography variant="h6" paragraph color="text.secondary">
        Share trips, save money, travel together.
      </Typography>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => onNavigate('/trips')}
        >
          View Trips
        </Button>

        <Button
          variant="outlined"
          color="primary"
          size="large"
          onClick={() => onNavigate('/create')}
        >
          Create Trip
        </Button>
      </Box>
    </Container>
  );
}
