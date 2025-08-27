import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  useTheme,
  alpha,
  Fade,
  Paper,
  Stack,
  Avatar,
  IconButton,
  Chip
} from "@mui/material";
import {
  DirectionsCar,
  TwoWheeler,
  Nature,
  Savings,
  People,
  Security,
  LocationOn,
  Schedule,
  StarRate,
  ArrowForward,
  PlayArrow,
  CheckCircle,
  Phone,
  Shield,
  Group
} from "@mui/icons-material";

const features = [
  {
    title: "Smart Ride Matching",
    description: "Advanced algorithm matches you with travelers going your way, optimizing routes and schedules for maximum convenience.",
    icon: <DirectionsCar />,
    color: "#667eea",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  },
  {
    title: "Eco-Friendly Travel",
    description: "Reduce your carbon footprint by sharing rides. Every shared journey contributes to a cleaner, greener environment.",
    icon: <Nature />,
    color: "#48bb78",
    gradient: "linear-gradient(135deg, #48bb78 0%, #38a169 100%)"
  },
  {
    title: "Cost Effective",
    description: "Split fuel costs and travel expenses. Save money while enjoying comfortable, shared transportation.",
    icon: <Savings />,
    color: "#ed8936",
    gradient: "linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)"
  },
  {
    title: "Verified Community",
    description: "Join a trusted network of verified travelers. Phone verification and profile screening ensure safe journeys.",
    icon: <Security />,
    color: "#9f7aea",
    gradient: "linear-gradient(135deg, #9f7aea 0%, #805ad5 100%)"
  }
];

const howItWorks = [
  {
    step: "1",
    title: "Complete Your Profile",
    description: "Sign up and verify your phone number. Add your travel preferences and vehicle details if you plan to offer rides.",
    icon: <Phone />,
    color: "#667eea"
  },
  {
    step: "2",
    title: "Find or Post Trips",
    description: "Search for available rides going your way, or post your own trip to offer rides to fellow travelers.",
    icon: <LocationOn />,
    color: "#48bb78"
  },
  {
    step: "3",
    title: "Connect & Travel",
    description: "Match with verified travelers, coordinate pickup details, and enjoy safe, affordable shared journeys.",
    icon: <Group />,
    color: "#ed8936"
  }
];

const benefits = [
  { text: "Verified phone numbers for all users", icon: <CheckCircle /> },
  { text: "Real-time trip tracking and updates", icon: <CheckCircle /> },
  { text: "Secure in-app messaging", icon: <CheckCircle /> },
  { text: "Flexible pickup and drop points", icon: <CheckCircle /> },
  { text: "Distance-based fair pricing", icon: <CheckCircle /> },
  { text: "24/7 community support", icon: <CheckCircle /> }
];

export default function Home({ onNavigate }) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  const heroStyles = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    background: `linear-gradient(135deg,
      ${alpha('#667eea', 0.9)} 0%,
      ${alpha('#764ba2', 0.8)} 50%,
      ${alpha('#667eea', 0.9)} 100%
    )`,
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `
        radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)
      `,
    }
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box sx={heroStyles}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Fade in={visible} timeout={1000}>
            <Grid container spacing={6} alignItems="center">
              <Grid item xs={12} lg={6}>
                <Typography
                  variant="h1"
                  sx={{
                    color: 'white',
                    fontWeight: 800,
                    mb: 3,
                    fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                    lineHeight: 1.1
                  }}
                >
                  Share Rides,{' '}
                  <Box
                    component="span"
                    sx={{
                      background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Share Dreams
                  </Box>
                </Typography>

                <Typography
                  variant="h5"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    mb: 4,
                    fontWeight: 400,
                    lineHeight: 1.6
                  }}
                >
                  Connect with trusted travelers in Hyderabad. Split costs, reduce emissions, 
                  and make every journey a social experience.
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => onNavigate("/trips")}
                    endIcon={<ArrowForward />}
                    sx={{
                      bgcolor: 'white',
                      color: '#667eea',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      py: 2,
                      px: 4,
                      borderRadius: 4,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                      '&:hover': {
                        bgcolor: '#f8f9fa',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
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
                    endIcon={<PlayArrow />}
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      py: 2,
                      px: 4,
                      borderRadius: 4,
                      borderWidth: 2,
                      '&:hover': {
                        borderColor: '#FFD700',
                        bgcolor: alpha('#FFD700', 0.1),
                        transform: 'translateY(-2px)',
                        borderWidth: 2
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Offer a Ride
                  </Button>
                </Stack>

                {/* Trust Indicators */}
                <Stack direction="row" spacing={3} alignItems="center">
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    {[1,2,3,4,5].map((star) => (
                      <StarRate key={star} sx={{ color: '#FFD700', fontSize: '1.5rem' }} />
                    ))}
                  </Stack>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Trusted by travelers across Hyderabad
                  </Typography>
                </Stack>
              </Grid>

              <Grid item xs={12} lg={6}>
                <Box
                  sx={{
                    position: 'relative',
                    display: { xs: 'none', lg: 'block' }
                  }}
                >
                  {/* Floating Cards Animation */}
                  {[
                    { icon: <DirectionsCar />, label: "Quick Rides", delay: 0 },
                    { icon: <Schedule />, label: "On Time", delay: 200 },
                    { icon: <Security />, label: "Safe Travel", delay: 400 },
                    { icon: <Savings />, label: "Save Money", delay: 600 }
                  ].map((item, index) => (
                    <Fade key={item.label} in={visible} timeout={1000 + item.delay}>
                      <Paper
                        sx={{
                          position: 'absolute',
                          p: 3,
                          borderRadius: 4,
                          bgcolor: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(20px)',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                          top: `${20 + index * 15}%`,
                          right: `${10 + (index % 2) * 30}%`,
                          animation: `float 6s ease-in-out infinite ${item.delay}ms`,
                          '@keyframes float': {
                            '0%, 100%': { transform: 'translateY(0px)' },
                            '50%': { transform: 'translateY(-10px)' }
                          }
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {item.icon}
                          </Avatar>
                          <Typography fontWeight={600}>
                            {item.label}
                          </Typography>
                        </Stack>
                      </Paper>
                    </Fade>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Fade>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box textAlign="center" sx={{ mb: 8 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              mb: 2,
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Why Choose Sharo?
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Experience the future of urban mobility with our smart, sustainable, and social ride-sharing platform
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} key={feature.title}>
              <Fade in={visible} timeout={1000 + index * 200}>
                <Card
                  sx={{
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.12)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: feature.gradient
                    }}
                  />
                  <CardContent sx={{ p: 4 }}>
                    <Stack direction="row" alignItems="flex-start" spacing={3}>
                      <Avatar
                        sx={{
                          bgcolor: feature.color,
                          width: 56,
                          height: 56,
                          fontSize: '1.5rem'
                        }}
                      >
                        {feature.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                          {feature.title}
                        </Typography>
                        <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                          {feature.description}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How It Works */}
      <Box sx={{ bgcolor: 'grey.50', py: 10 }}>
        <Container maxWidth="lg">
          <Box textAlign="center" sx={{ mb: 8 }}>
            <Typography variant="h2" sx={{ fontWeight: 700, mb: 2 }}>
              How It Works
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Get started in just 3 simple steps
            </Typography>
          </Box>

          <Grid container spacing={6} alignItems="center">
            {howItWorks.map((step, index) => (
              <Grid item xs={12} md={4} key={step.step}>
                <Box textAlign="center" position="relative">
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: step.color,
                      fontSize: '2rem',
                      fontWeight: 700,
                      mx: 'auto',
                      mb: 3
                    }}
                  >
                    {step.step}
                  </Avatar>

                  {index < howItWorks.length - 1 && (
                    <Box
                      sx={{
                        display: { xs: 'none', md: 'block' },
                        position: 'absolute',
                        top: 40,
                        right: '-50%',
                        width: '100%',
                        height: 2,
                        bgcolor: 'grey.200',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          right: -8,
                          top: -4,
                          width: 0,
                          height: 0,
                          borderTop: '5px solid transparent',
                          borderBottom: '5px solid transparent',
                          borderLeft: '10px solid',
                          borderLeftColor: 'grey.300'
                        }
                      }}
                    />
                  )}

                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                    {step.title}
                  </Typography>
                  <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {step.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h2" sx={{ fontWeight: 700, mb: 3 }}>
              Built for Modern Travelers
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4, lineHeight: 1.7 }}>
              We understand what today's commuters need. That's why we've built features that matter most for safe, convenient, and affordable travel.
            </Typography>

            <Stack spacing={2}>
              {benefits.map((benefit, index) => (
                <Stack key={index} direction="row" alignItems="center" spacing={2}>
                  <CheckCircle sx={{ color: 'success.main', fontSize: '1.25rem' }} />
                  <Typography variant="body1">{benefit.text}</Typography>
                </Stack>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              sx={{
                position: 'relative',
                height: 400,
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  color: 'white',
                  fontWeight: 700,
                  textAlign: 'center'
                }}
              >
                Your Journey
                <br />
                Starts Here
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          py: 10
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography
            variant="h2"
            sx={{
              color: 'white',
              fontWeight: 700,
              mb: 3
            }}
          >
            Ready to Start Your Journey?
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255, 255, 255, 0.9)',
              mb: 5,
              lineHeight: 1.7
            }}
          >
            Join our growing community of smart travelers who choose to share rides, 
            save money, and contribute to a sustainable future.
          </Typography>

          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={3} 
            justifyContent="center"
          >
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
                borderRadius: 4,
                '&:hover': {
                  bgcolor: '#f8f9fa',
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
                borderRadius: 4,
                borderWidth: 2,
                '&:hover': {
                  bgcolor: alpha('#ffffff', 0.1),
                  transform: 'translateY(-2px)',
                  borderWidth: 2
                }
              }}
            >
              Create Trip
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}