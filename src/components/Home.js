import React from 'react';
import {
  Container,
  Box,
  Button,
  Typography,
  Stack,
  Grid,
  Paper,
  Chip,
  Avatar,
} from '@mui/material';
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import EmojiNatureIcon from '@mui/icons-material/EmojiNature';
import SavingsIcon from '@mui/icons-material/Savings';
import ShieldIcon from '@mui/icons-material/Shield';
import BoltIcon from '@mui/icons-material/Bolt';
import TripOriginIcon from '@mui/icons-material/TripOrigin';
import VerifiedIcon from '@mui/icons-material/Verified';
import MapIcon from '@mui/icons-material/Map';

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
    <Box sx={{ bgcolor: 'background.default' }}>
      {/* Hero */}
      <Box
        sx={{
          pt: { xs: 8, md: 12 },
          pb: { xs: 6, md: 10 },
          bgcolor: 'background.paper',
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
          backgroundImage: (t) =>
            `radial-gradient(700px 240px at 12% 0%, ${t.palette.action.hover} 0%, transparent 60%),
             radial-gradient(700px 240px at 88% 8%, ${t.palette.action.hover} 0%, transparent 60%)`,
        }}
      >
        <Container maxWidth="lg">
          <Chip
            label="Smarter. Greener. Together."
            color="primary"
            variant="outlined"
            sx={{ mb: 2, fontWeight: 600 }}
          />
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, lineHeight: 1.1 }}>
            Ride together. Save more. Travel better.
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 900 }}>
            Share your trip or find a ride with trusted people across India. Split costs,
            reduce emissions, and make journeys more fun—one trip at a time.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              variant="contained"
              size="large"
              startIcon={<DirectionsCarFilledIcon />}
              sx={{ px: 4, fontWeight: 700, borderRadius: 2 }}
              onClick={() => onNavigate('/trips')}
            >
              View Trips
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<PeopleAltIcon />}
              sx={{ px: 4, fontWeight: 700, borderRadius: 2 }}
              onClick={() => onNavigate('/create')}
            >
              Create Trip
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Features */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Grid container spacing={3}>
          <Feature
            icon={<SavingsIcon color="primary" />}
            title="Share and Save"
            text="Split travel costs easily so everyone pays less—affordable journeys for all."
          />
          <Feature
            icon={<EmojiNatureIcon color="primary" />}
            title="Go Greener"
            text="Reduce emissions by sharing rides—small changes add up for the planet."
          />
          <Feature
            icon={<ShieldIcon color="primary" />}
            title="Trusted Community"
            text="Connect with reliable riders and drivers—travel safer together."
          />
          <Feature
            icon={<BoltIcon color="primary" />}
            title="Flexible & Fast"
            text="Find rides that match your route and time—no hassle, just go."
          />
        </Grid>

        {/* How it works */}
        <Box sx={{ mt: { xs: 6, md: 8 } }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
            How it works
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Plan your next shared ride in three simple steps.
          </Typography>
          <Grid container spacing={3}>
            <Step
              icon={<TripOriginIcon />}
              title="1. Post or find a trip"
              text="Offer a seat or search for rides that match your route and time."
            />
            <Step
              icon={<PeopleAltIcon />}
              title="2. Connect & confirm"
              text="Confirm details and agree on the split with co-travelers."
            />
            <Step
              icon={<BoltIcon />}
              title="3. Ride & save"
              text="Travel together, split the cost, and enjoy a greener journey."
            />
          </Grid>
        </Box>

        {/* Why choose Sharo */}
        <Box sx={{ mt: { xs: 6, md: 8 } }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
            Why choose Sharo
          </Typography>
          <Grid container spacing={3}>
            <WhyCard
              icon={<VerifiedIcon />}
              title="Verified profiles"
              text="Real users, real identities—travel with more confidence."
            />
            <WhyCard
              icon={<SavingsIcon />}
              title="Transparent costs"
              text="Know what you’ll pay before the ride—no surprises."
            />
            <WhyCard
              icon={<MapIcon />}
              title="Route-friendly"
              text="See the route and timings clearly before you book."
            />
          </Grid>
        </Box>

        {/* Popular categories */}
        <Box sx={{ mt: { xs: 6, md: 8 } }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
            Popular categories
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {categories.map((label) => (
              <Chip
                key={label}
                label={label}
                variant="outlined"
                onClick={() => onNavigate('/trips')}
                sx={{ borderRadius: 2 }}
                clickable
              />
            ))}
          </Stack>
        </Box>

        {/* CTA band */}
        <Paper
          elevation={0}
          sx={{
            mt: { xs: 6, md: 8 },
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            border: (t) => `1px solid ${t.palette.divider}`,
            background: (t) =>
              `linear-gradient(180deg, ${t.palette.action.hover} 0%, transparent 120%)`,
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                Ready to share your next ride?
              </Typography>
              <Typography color="text.secondary">
                Post a trip in seconds or find a match that fits your route.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ justifyContent: { md: 'flex-end' } }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => onNavigate('/trips')}
                >
                  Find a Ride
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => onNavigate('/create')}
                >
                  Post a Trip
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}

function Feature({ icon, title, text }) {
  return (
    <Grid item xs={12} md={6} lg={3}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          height: '100%',
          borderRadius: 2,
          border: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <Avatar sx={{ bgcolor: 'action.hover', color: 'primary.main', mr: 1.5 }}>
            {icon}
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{title}</Typography>
        </Box>
        <Typography color="text.secondary">{text}</Typography>
      </Paper>
    </Grid>
  );
}

function Step({ icon, title, text }) {
  return (
    <Grid item xs={12} md={4}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          height: '100%',
          borderRadius: 2,
          border: (t) => `1px dashed ${t.palette.divider}`,
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 1.5 }}>{icon}</Avatar>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{title}</Typography>
        </Box>
        <Typography color="text.secondary">{text}</Typography>
      </Paper>
    </Grid>
  );
}

function WhyCard({ icon, title, text }) {
  return (
    <Grid item xs={12} md={4}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          height: '100%',
          borderRadius: 2,
          border: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <Avatar sx={{ bgcolor: 'action.hover', color: 'primary.main', mr: 1.5 }}>
            {icon}
          </Avatar>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{title}</Typography>
        </Box>
        <Typography color="text.secondary">{text}</Typography>
      </Paper>
    </Grid>
  );
}
