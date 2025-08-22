import React from 'react';
import { Container, Typography, Button, Box, Fade } from '@mui/material';

export default function Home({ onNavigate }) {
  return (
    <Fade in={true}>
      <Box
        sx={{
          height: 'calc(100vh - 64px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          px: 3,
          textAlign: 'center',
        }}
      >
        <Typography variant="h2" gutterBottom sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
          Welcome to Trip Sharer
        </Typography>
        <Typography variant="h6" mb={5} sx={{ maxWidth: 600 }}>
          Share your trips with others, save costs, reduce emissions, and be part of a greener future.
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: 4,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <Button
            variant="contained"
            size="large"
            color="success"
            sx={{
              minWidth: 180,
              fontSize: '1.25rem',
              boxShadow: 3,
              '&:hover': { boxShadow: 6, transform: 'scale(1.05)' },
              transition: '0.3s',
            }}
            onClick={() => onNavigate('create')}
          >
            Post Trips
          </Button>
          <Button
            variant="outlined"
            size="large"
            color="success"
            sx={{
              minWidth: 180,
              fontSize: '1.25rem',
              borderWidth: 2,
              '&:hover': { backgroundColor: '#E8F5E9', transform: 'scale(1.05)' },
              transition: '0.3s',
            }}
            onClick={() => onNavigate('trips')}
          >
            Search Trips
          </Button>
        </Box>
      </Box>
    </Fade>
  );
}
