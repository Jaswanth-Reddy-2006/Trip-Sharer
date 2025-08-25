import React from 'react';
import { Container, Box, Button, Typography, Stack, Chip } from '@mui/material';

export default function Home({ onNavigate }) {
  const categories = [
    'Daily commute',
    'Weekend getaways',
    'Airport rides',
    'Intercity carpool',
    'College rides',
    'Office runs',
  ];

  return (
    <Container>
      {/* Hero Section */}
      <Box
        sx={(t) => ({
          border: `1px solid ${t.palette.divider}`,
          backgroundImage: `radial-gradient(700px 240px at 12% 0%, ${t.palette.action.hover} 0%, transparent 60%),
            radial-gradient(700px 240px at 88% 8%, ${t.palette.action.hover} 0%, transparent 60%)`,
          p: 4,
          mb: 4,
          borderRadius: 2,
          textAlign: 'center',
          fontWeight: 700,
        })}
      >
        <Typography variant="h4" mb={2}>
          Ride together. Save more. Travel better.
        </Typography>
        <Typography mb={4}>
          Share your trip or find a ride with trusted people across India. Split costs, reduce emissions,
          and make journeys more fun—one trip at a time.
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="contained"
            onClick={() => onNavigate('/trips')}
            sx={{ px: 4, fontWeight: 700, borderRadius: 2 }}
          >
            View Trips
          </Button>

          {/* Corrected path here */}
          <Button
            variant="contained"
            onClick={() => onNavigate('/create-trip')}
            sx={{ px: 4, fontWeight: 700, borderRadius: 2 }}
          >
            Create Trip
          </Button>
        </Stack>
      </Box>

      {/* Popular categories */}
      <Box my={4}>
        <Typography variant="h6" mb={2}>
          Popular categories
        </Typography>
        <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
          {categories.map((label) => (
            <Chip
              key={label}
              label={label}
              onClick={() => onNavigate('/trips')}
              clickable
              sx={{ m: 0.5, borderRadius: 2 }}
            />
          ))}
        </Stack>
      </Box>

      {/* CTA Band */}
      <Box
        sx={(t) => ({
          borderTop: `1px solid ${t.palette.divider}`,
          background: `linear-gradient(180deg, ${t.palette.action.hover} 0%, transparent 120%)`,
          py: 4,
          textAlign: 'center',
          borderRadius: 2,
        })}
      >
        <Typography variant="h6" mb={2}>
          Ready to share your next ride?
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button variant="outlined" onClick={() => onNavigate('/trips')}>
            Find a Ride
          </Button>
          <Button variant="contained" onClick={() => onNavigate('/create-trip')}>
            Post a Trip
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}
