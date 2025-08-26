import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Avatar,
  Card,
  CardContent,
  Stack,
  Chip,
  LinearProgress,
  Divider,
  Button,
  alpha,
  useTheme
} from '@mui/material';
import {
  Nature, // Fixed: Using Nature instead of Eco/EcoFriendly
  Groups,
  Savings,
  Security,
  TrendingUp,
  LocationOn,
  DirectionsCar,
  Person,
  Star,
  CheckCircle,
  Timeline,
  Public
} from '@mui/icons-material';

const features = [
  {
    icon: <Nature />, // Fixed: Using Nature instead of Eco
    title: "Eco-Friendly Travel",
    description: "Every shared ride reduces carbon emissions and helps protect our environment. Join the green mobility revolution.",
    color: "#4CAF50",
    stats: "2.5 tons CO₂ saved"
  },
  {
    icon: <Groups />,
    title: "Community First",
    description: "Connect with verified travelers, build lasting friendships, and create a reliable network of trusted riders.",
    color: "#2196F3",
    stats: "10K+ community members"
  },
  {
    icon: <Savings />,
    title: "Save Money",
    description: "Share costs and make travel more affordable. Spend less on transportation and more on experiences.",
    color: "#FF9800",
    stats: "₹500 avg. savings per trip"
  },
  {
    icon: <Security />,
    title: "Safe & Secure",
    description: "Verified profiles, secure payments, GPS tracking, and 24/7 support ensure your peace of mind.",
    color: "#9C27B0",
    stats: "99.9% safe trips"
  }
];

const stats = [
  { label: "Happy Users", value: "10,000+", icon: <Person />, color: "#4CAF50" },
  { label: "Trips Completed", value: "50,000+", icon: <DirectionsCar />, color: "#2196F3" },
  { label: "Cities Covered", value: "15+", icon: <LocationOn />, color: "#FF9800" },
  { label: "Average Rating", value: "4.8★", icon: <Star />, color: "#FFD700" }
];

const timeline = [
  {
    year: "2024",
    title: "Launch in Hyderabad",
    description: "Started our journey in the city of pearls with a focus on sustainable urban mobility.",
    color: "#1976d2"
  },
  {
    year: "2024",
    title: "10K Users Milestone",
    description: "Reached our first major milestone with 10,000 registered users and 50,000 completed trips.",
    color: "#4caf50"
  },
  {
    year: "2025",
    title: "Multi-City Expansion",
    description: "Planning to expand to Bangalore, Chennai, and Mumbai to serve more travelers.",
    color: "#ff9800"
  },
  {
    year: "Future",
    title: "Pan-India Network",
    description: "Vision to create a nationwide network of shared mobility solutions.",
    color: "#9c27b0"
  }
];

const values = [
  {
    title: "Trust & Transparency",
    description: "We believe in building relationships based on trust, with transparent pricing and clear communication.",
    icon: <CheckCircle />
  },
  {
    title: "Sustainability",
    description: "Our mission is to reduce carbon footprint through shared transportation and eco-friendly practices.",
    icon: <Nature />
  },
  {
    title: "Community",
    description: "We're not just a platform - we're a community of travelers who care about each other's safety and comfort.",
    icon: <Groups />
  },
  {
    title: "Innovation",
    description: "Continuously improving our technology to provide better user experiences and smarter mobility solutions.",
    icon: <TrendingUp />
  }
];

export default function About() {
  const theme = useTheme();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 3,
          color: 'white',
          p: 6,
          mb: 6,
          textAlign: 'center'
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          About Sharo
        </Typography>
        <Typography variant="h5" sx={{ opacity: 0.9, maxWidth: 800, mx: 'auto' }}>
          We're revolutionizing urban mobility by connecting travelers and creating a sustainable,
          affordable, and community-driven transportation network.
        </Typography>
      </Box>

      {/* Stats */}
      <Grid container spacing={4} sx={{ mb: 8 }}>
        {stats.map((stat, index) => (
          <Grid item xs={6} md={3} key={index}>
            <Card sx={{ p: 3, textAlign: 'center', height: '100%', borderRadius: 3 }}>
              {React.cloneElement(stat.icon, {
                sx: { fontSize: '3rem', color: stat.color, mb: 2 }
              })}
              <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color }}>
                {stat.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stat.label}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Mission Section */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700, textAlign: 'center', mb: 4 }}>
          Our Mission & Vision
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mb: 6 }}>
          Building a world where shared mobility is the preferred choice for sustainable,
          affordable, and social transportation.
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 4, height: '100%', borderRadius: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Our Mission
              </Typography>
              <Typography paragraph>
                To make urban transportation more sustainable, affordable, and social by connecting
                travelers who share similar routes and creating a trusted community of riders.
              </Typography>
              <Typography>
                We believe that shared mobility is not just about reducing costs – it's about
                building relationships, reducing environmental impact, and creating a more
                connected society.
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 4, height: '100%', borderRadius: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Our Vision
              </Typography>
              <Typography paragraph>
                To become India's most trusted shared mobility platform, transforming how people
                travel in cities while contributing to a cleaner, greener future.
              </Typography>
              <Typography>
                We envision a future where every trip is shared, every journey is safe, and
                every traveler is part of a supportive community that values sustainability
                and human connection.
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Features Section */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700, textAlign: 'center', mb: 4 }}>
          Why Choose Sharo?
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mb: 6 }}>
          Experience the perfect blend of technology, community, and sustainability
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card sx={{ p: 4, height: '100%', borderRadius: 3, border: `2px solid ${feature.color}20` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {React.cloneElement(feature.icon, {
                    sx: { fontSize: '3rem', color: feature.color, mr: 2 }
                  })}
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                </Box>
                <Typography paragraph color="text.secondary">
                  {feature.description}
                </Typography>
                <Chip
                  label={feature.stats}
                  sx={{ bgcolor: alpha(feature.color, 0.1), color: feature.color }}
                />
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Values Section */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700, textAlign: 'center', mb: 4 }}>
          Our Core Values
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mb: 6 }}>
          The principles that guide everything we do
        </Typography>

        <Grid container spacing={4}>
          {values.map((value, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card sx={{ p: 4, height: '100%', borderRadius: 3 }}>
                {React.cloneElement(value.icon, {
                  sx: { fontSize: '2.5rem', color: 'primary.main', mb: 2 }
                })}
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  {value.title}
                </Typography>
                <Typography color="text.secondary">
                  {value.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Timeline Section */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700, textAlign: 'center', mb: 4 }}>
          Our Journey
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mb: 6 }}>
          From a simple idea to a growing community
        </Typography>

        <Grid container spacing={4}>
          {timeline.map((item, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card sx={{ p: 4, borderRadius: 3, position: 'relative' }}>
                <Avatar
                  sx={{
                    bgcolor: item.color,
                    width: 60,
                    height: 60,
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    mb: 2
                  }}
                >
                  {item.year.slice(-2)}
                </Avatar>
                {index < timeline.length - 1 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 60,
                      left: 60,
                      height: 100,
                      width: 2,
                      bgcolor: 'divider'
                    }}
                  />
                )}
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  {item.title}
                </Typography>
                <Typography color="text.secondary">
                  {item.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Call to Action */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 3,
          color: 'white',
          p: 6,
          textAlign: 'center'
        }}
      >
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
          Ready to Join Our Community?
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9, mb: 4, maxWidth: 600, mx: 'auto' }}>
          Whether you're looking to save money, meet new people, or contribute to a greener planet,
          Sharo is the perfect platform for your travel needs.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center">
          <Button
            variant="contained"
            size="large"
            sx={{
              bgcolor: 'white',
              color: '#667eea',
              fontSize: '1.1rem',
              fontWeight: 700,
              py: 2,
              px: 4,
              borderRadius: 3,
              '&:hover': {
                bgcolor: '#f5f5f5',
                transform: 'translateY(-2px)'
              }
            }}
          >
            Start Your Journey
          </Button>
          <Button
            variant="outlined"
            size="large"
            sx={{
              borderColor: 'white',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: 700,
              py: 2,
              px: 4,
              borderRadius: 3,
              borderWidth: 2,
              '&:hover': {
                bgcolor: alpha('#ffffff', 0.1), // Fixed: Changed 'white' to '#ffffff'
                transform: 'translateY(-2px)'
              }
            }}
          >
            Learn More
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}