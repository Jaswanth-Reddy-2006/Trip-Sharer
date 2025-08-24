import React from 'react';
import { Container, Typography, Box, Grid, Paper, Avatar } from '@mui/material';
import EmojiNatureIcon from '@mui/icons-material/EmojiNature';
import GroupsIcon from '@mui/icons-material/Groups';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

export default function About() {
  return (
    <Container maxWidth="md" sx={{ my: 6 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" fontWeight={900} color="primary" gutterBottom>
          Our Mission & Vision
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          Sharo is more than a ride-sharing app—it's a movement for smarter, greener, friendlier travel.
        </Typography>
      </Box>
      <Grid container spacing={3} justifyContent="center" sx={{ mb: 5 }}>
        <Grid item xs={12} sm={4}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
            <Avatar sx={{ bgcolor: 'success.light', mx: 'auto', mb: 1 }}><EmojiNatureIcon fontSize="large" /></Avatar>
            <Typography variant="h6" fontWeight={700} color="text.primary">
              Eco Friendly
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Every trip you share saves fuel, reduces emissions, and keeps the planet greener.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
            <Avatar sx={{ bgcolor: 'primary.light', mx: 'auto', mb: 1 }}><GroupsIcon fontSize="large" /></Avatar>
            <Typography variant="h6" fontWeight={700} color="text.primary">
              Community First
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              We connect trusted riders and drivers, creating friendships and building a reliable network.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
            <Avatar sx={{ bgcolor: 'teal', mx: 'auto', mb: 1 }}><LocalOfferIcon fontSize="large" /></Avatar>
            <Typography variant="h6" fontWeight={700} color="text.primary">
              Save More
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Traveling together means sharing costs—make journeys affordable for everyone.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      <Box sx={{ textAlign: "center", mt: 3 }}>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Whether you're offering a seat or searching for a ride, you're part of the Sharo family.
          <br />
          Start traveling the smart way—choose Sharo for your next trip!
        </Typography>
      </Box>
    </Container>
  );
}
