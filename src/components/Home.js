import React from 'react';
import { Container, Box, Button, Typography, Stack } from '@mui/material';
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';

export default function Home({ onNavigate }) {
  return (
    <Box
      sx={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        background:
          'linear-gradient(120deg, #d4fc79 0%, #96e6a1 100%)',
        pb: 8,
      }}
    >
      <Container maxWidth="md">
        <Box
          sx={{
            bgcolor: 'white',
            borderRadius: 4,
            boxShadow: 4,
            p: { xs: 3, sm: 5 },
            textAlign: 'center',
            mt: { xs: 3, sm: 6 },
          }}
        >
          <Box sx={{ mb: 2 }}>
            <DirectionsCarFilledIcon sx={{ fontSize: 52, color: 'primary.main' }} />
          </Box>
          <Typography
            variant="h3"
            fontWeight={900}
            sx={{ color: 'primary.main', mb: 2, letterSpacing: '2px' }}
          >
            Welcome to sharo!
          </Typography>
          <Typography
            variant="h6"
            sx={{ color: 'text.secondary', mb: 3, maxWidth: 520, mx: 'auto' }}
          >
            Ride together, save money, and make travel fun. Share your trip or find a ride easily
            with trusted people. Let's connect, travel, and help the planet—one trip at a time.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={3} justifyContent="center" alignItems="center" sx={{ mt: 2, mb: 2 }}>
            <Button
              variant="contained"
              size="large"
              color="primary"
              startIcon={<PeopleAltIcon />}
              sx={{ px: 4, fontWeight: 600, borderRadius: 3 }}
              onClick={() => onNavigate('/trips')}
            >
              View Trips
            </Button>
            <Button
              variant="outlined"
              size="large"
              color="secondary"
              sx={{ px: 4, fontWeight: 600, borderRadius: 3 }}
              onClick={() => onNavigate('/create')}
            >
              Create Trip
            </Button>
          </Stack>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 3, fontStyle: 'italic' }}>
            Trusted by travelers across India for safe, affordable, sustainable journeys.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
