import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Card,
  CardContent,
  Avatar,
  Chip,
  Stack,
  useTheme,
  alpha,
  Fade,
  Slide
} from "@mui/material";
import {
  DirectionsCar,
  TwoWheeler,
  Nature, // Fixed: Using Nature instead of Eco
  Savings,
  People,
  Security,
  TrendingUp,
  LocationOn,
  Schedule,
  StarRate,
  ArrowForward,
  PlayCircle
} from "@mui/icons-material";

const stats = [
  { label: "Happy Users", value: "10K+", icon: <People />, color: "#4CAF50" },
  { label: "Trips Completed", value: "50K+", icon: <DirectionsCar />, color: "#2196F3" },
  { label: "Cities", value: "15+", icon: <LocationOn />, color: "#FF9800" },
  { label: "CO₂ Saved", value: "2.5T", icon: <Nature />, color: "#8BC34A" }
];

const features = [
  {
    title: "Eco-Friendly Travel",
    description: "Share rides and reduce carbon footprint. Every shared trip helps save our planet.",
    icon: <Nature />, // Fixed: Using Nature instead of Eco
    color: "#4CAF50",
    gradient: "linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)"
  },
  {
    title: "Save Money",
    description: "Split costs with fellow travelers. Make every journey affordable and enjoyable.",
    icon: <Savings />,
    color: "#FF9800",
    gradient: "linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)"
  },
  {
    title: "Build Community",
    description: "Meet like-minded people on the go. Create lasting connections through shared journeys.",
    icon: <People />,
    color: "#2196F3",
    gradient: "linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)"
  },
  {
    title: "Safe & Secure",
    description: "Verified profiles, secure payments, and 24/7 support ensure your peace of mind.",
    icon: <Security />,
    color: "#9C27B0",
    gradient: "linear-gradient(135deg, #9C27B0 0%, #CE93D8 100%)"
  }
];

const howItWorks = [
  {
    step: "1",
    title: "Create Your Profile",
    description: "Sign up with your phone number and complete verification. Add your travel preferences.",
    icon: <People />,
    color: "#E91E63"
  },
  {
    step: "2",
    title: "Find or Offer Rides",
    description: "Browse available trips or create your own. Set pickup points, destinations, and timings.",
    icon: <LocationOn />,
    color: "#FF9800"
  },
  {
    step: "3",
    title: "Connect & Travel",
    description: "Match with fellow travelers, confirm bookings, and enjoy your shared journey safely.",
    icon: <DirectionsCar />,
    color: "#4CAF50"
  }
];

export default function Home({ onNavigate }) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  const heroBackground = {
    background: `linear-gradient(135deg,
      ${alpha('#1976d2', 0.9)} 0%,
      ${alpha('#42a5f5', 0.8)} 25%,
      ${alpha('#66bb6a', 0.8)} 75%,
      ${alpha('#4caf50', 0.9)} 100%
    )`,
    position: 'relative',
    overflow: 'hidden',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    color: 'white',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `
        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.2) 0%, transparent 50%)
      `,
      animation: 'float 6s ease-in-out infinite'
    }
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box sx={heroBackground}>
        <Container maxWidth="lg">
          <Grid container alignItems="center" spacing={4}>
            <Grid item xs={12} md={7}>
              <Fade in={visible} timeout={1000}>
                <Box>
                  <Typography 
                    variant="h2" 
                    component="h1" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 800,
                      fontSize: { xs: '2.5rem', md: '3.5rem' },
                      lineHeight: 1.2,
                      mb: 2
                    }}
                  >
                    Share Rides,<br />
                    Share Dreams
                  </Typography>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      mb: 4, 
                      opacity: 0.95,
                      fontWeight: 400,
                      lineHeight: 1.4
                    }}
                  >
                    Connect with trusted travelers, split costs, and make every journey memorable.
                    Experience the future of sustainable transportation.
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mb: 4 }}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => onNavigate("/trips")}
                      endIcon={<ArrowForward />}
                      sx={{
                        bgcolor: 'white',
                        color: '#1976d2',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        py: 2,
                        px: 4,
                        borderRadius: 3,
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                        '&:hover': {
                          bgcolor: '#f5f5f5',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 12px 35px rgba(0,0,0,0.2)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Find a Ride
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => onNavigate("/create-trip")}
                      endIcon={<PlayCircle />}
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
                          borderColor: '#FFD700',
                          bgcolor: alpha('#FFD700', 0.1),
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Offer a Ride
                    </Button>
                  </Stack>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {[1,2,3,4,5].map((star) => (
                      <StarRate key={star} sx={{ color: '#FFD700', fontSize: '1.5rem' }} />
                    ))}
                    <Typography sx={{ ml: 1, opacity: 0.9 }}>
                      Rated 4.8/5 by 10,000+ users
                    </Typography>
                  </Box>
                </Box>
              </Fade>
            </Grid>
            <Grid item xs={12} md={5}>
              {/* Floating Stats Cards */}
              <Grid container spacing={2}>
                {stats.map((stat, index) => (
                  <Grid item xs={6} key={index}>
                    <Slide in={visible} timeout={1000 + index * 200} direction="up">
                      <Card 
                        sx={{ 
                          p: 2,
                          textAlign: 'center',
                          bgcolor: alpha('#ffffff', 0.95), // Fixed: Changed 'white' to '#ffffff'
                          backdropFilter: 'blur(10px)',
                          borderRadius: 3,
                          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                        }}
                      >
                        {React.cloneElement(stat.icon, { sx: { fontSize: '2.5rem', color: stat.color } })}
                        <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color }}>
                          {stat.value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {stat.label}
                        </Typography>
                      </Card>
                    </Slide>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
            Why Choose Sharo?
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Experience the perfect blend of convenience, affordability, and sustainability
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card 
                sx={{ 
                  p: 4,
                  height: '100%',
                  borderRadius: 3,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.12)'
                  }
                }}
              >
                <Box sx={{ 
                  background: feature.gradient,
                  borderRadius: '50%',
                  width: 80,
                  height: 80,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3
                }}>
                  {React.cloneElement(feature.icon, { sx: { fontSize: '2rem', color: 'white' } })}
                </Box>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  {feature.title}
                </Typography>
                <Typography color="text.secondary">
                  {feature.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How It Works Section */}
      <Box sx={{ bgcolor: 'background.default', py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
              How It Works
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Get started in just 3 simple steps and join thousands of happy travelers
            </Typography>
          </Box>

          <Grid container spacing={4} alignItems="center">
            {howItWorks.map((step, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box sx={{ textAlign: 'center', position: 'relative' }}>
                  {/* Step Number */}
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: step.color,
                      fontSize: '2rem',
                      fontWeight: 700,
                      mx: 'auto',
                      mb: 3,
                      boxShadow: `0 8px 25px ${alpha(step.color, 0.3)}`
                    }}
                  >
                    {step.step}
                  </Avatar>

                  {/* Connection Line (except last item) */}
                  {index < howItWorks.length - 1 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 40,
                        left: '60%',
                        right: '-40%',
                        height: 2,
                        bgcolor: 'divider',
                        display: { xs: 'none', md: 'block' }
                      }}
                    />
                  )}

                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    {step.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {step.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          py: 8,
          color: 'white'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
              Ready to Start Your Journey?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Join thousands of travelers who are already saving money and making friends through shared rides.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center">
              <Button
                variant="contained"
                size="large"
                onClick={() => onNavigate("/trips")}
                sx={{
                  bgcolor: 'white',
                  color: '#667eea',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  py: 2,
                  px: 5,
                  borderRadius: 3,
                  '&:hover': {
                    bgcolor: '#f5f5f5',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                Explore Trips
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => onNavigate("/create-trip")}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  py: 2,
                  px: 5,
                  borderRadius: 3,
                  borderWidth: 2,
                  '&:hover': {
                    bgcolor: alpha('#ffffff', 0.1), // Fixed: Changed 'white' to '#ffffff'
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                Create Trip
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}