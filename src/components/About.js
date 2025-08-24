import React from 'react';
import { Container, Typography, Box, Grid, Paper, Avatar } from '@mui/material';
import EmojiNatureIcon from '@mui/icons-material/EmojiNature';
import GroupsIcon from '@mui/icons-material/Groups';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

export default function About() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
      <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
        Our Mission & Vision
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 900 }}>
        Sharo is more than ride-sharing—it's a movement for smarter, greener, friendlier travel.
        We’re building a community where people share rides, cut costs, and reduce their carbon footprint.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: (t) => `1px solid ${t.palette.divider}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 1.5 }}>
                <EmojiNatureIcon />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Eco Friendly</Typography>
            </Box>
            <Typography color="text.secondary">
              Every ride shared saves fuel and reduces emissions, helping keep the planet greener.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: (t) => `1px solid ${t.palette.divider}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 1.5 }}>
                <GroupsIcon />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Community First</Typography>
            </Box>
            <Typography color="text.secondary">
              We connect trusted riders and drivers, building lasting relationships and a reliable network.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: (t) => `1px solid ${t.palette.divider}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 1.5 }}>
                <LocalOfferIcon />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Save More</Typography>
            </Box>
            <Typography color="text.secondary">
              Share costs and make travel more affordable for everyone involved.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: { xs: 5, md: 6 } }}>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Whether you're offering a seat or searching for a ride, you're part of the Sharo family.
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 700 }}>
          Start traveling the smart way—choose Sharo for your next trip!
        </Typography>
      </Box>
    </Container>
  );
}
