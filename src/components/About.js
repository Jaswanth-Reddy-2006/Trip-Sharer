import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Card,
  CardContent,
  Stack,
  Divider,
  Button,
  alpha,
  useTheme,
  Avatar,
  Chip
} from '@mui/material';
import {
  Nature,
  Groups,
  Savings,
  Security,
  TrendingUp,
  LocationOn,
  DirectionsCar,
  CheckCircle,
  Timeline,
  Public,
  Phone,
  Shield,
  Speed,
  EmojiEvents
} from '@mui/icons-material';

const features = [
  {
    icon: <Nature />,
    title: "Sustainable Travel",
    description: "Every shared ride reduces carbon emissions and helps protect our environment. Join the green mobility revolution.",
    color: "#48bb78"
  },
  {
    icon: <Groups />,
    title: "Community First",
    description: "Connect with verified travelers, build lasting friendships, and create a reliable network of trusted riders.",
    color: "#667eea"
  },
  {
    icon: <Savings />,
    title: "Affordable Mobility",
    description: "Share costs and make travel more affordable. Spend less on transportation and more on experiences.",
    color: "#ed8936"
  },
  {
    icon: <Security />,
    title: "Safety & Security",
    description: "Verified profiles, secure payments, real-time tracking, and 24/7 support ensure your peace of mind.",
    color: "#9f7aea"
  }
];

const timeline = [
  {
    year: "2025",
    title: "Launch in Hyderabad",
    description: "Starting our journey in the city of pearls with a focus on sustainable urban mobility and community building.",
    color: "#667eea"
  },
  {
    year: "2025",
    title: "Advanced Features",
    description: "Introducing smart route matching, distance-based pricing, and enhanced safety features for better user experience.",
    color: "#48bb78"
  },
  {
    year: "Future",
    title: "Multi-City Expansion",
    description: "Planning to expand to Bangalore, Chennai, and Mumbai to serve more travelers across India.",
    color: "#ed8936"
  },
  {
    year: "Vision",
    title: "Pan-India Network",
    description: "Building a nationwide network of shared mobility solutions for sustainable transportation.",
    color: "#9f7aea"
  }
];

const values = [
  {
    title: "Trust & Transparency",
    description: "We believe in building relationships based on trust, with transparent pricing and clear communication.",
    icon: <Shield />
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

const achievements = [
  { text: "Phone verification for all users", icon: <Phone /> },
  { text: "Real-time trip tracking", icon: <LocationOn /> },
  { text: "Distance-based fair pricing", icon: <Speed /> },
  { text: "24/7 community support", icon: <Security /> },
  { text: "Eco-friendly transportation", icon: <Nature /> },
  { text: "Secure messaging system", icon: <Shield /> }
];

export default function About() {
  const theme = useTheme();

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          py: { xs: 8, md: 12 },
          color: 'white'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 800,
                  mb: 3,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  lineHeight: 1.2
                }}
              >
                About Sharo
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  opacity: 0.95,
                  fontWeight: 400,
                  lineHeight: 1.6
                }}
              >
                We're revolutionizing urban mobility by connecting travelers and creating a sustainable, 
                affordable, and community-driven transportation network.
              </Typography>
              <Button
                variant="contained"
                size="large"
                sx={{
                  bgcolor: 'white',
                  color: '#667eea',
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  '&:hover': {
                    bgcolor: '#f8f9fa'
                  }
                }}
              >
                Join Our Mission
              </Button>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 300,
                  position: 'relative'
                }}
              >
                <Avatar
                  sx={{
                    width: 200,
                    height: 200,
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    border: '2px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <DirectionsCar sx={{ fontSize: '4rem', color: 'white' }} />
                </Avatar>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Mission & Vision Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Grid container spacing={8}>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: '100%',
                background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <CardContent sx={{ p: 5, position: 'relative', zIndex: 1 }}>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 3 }}>
                  Our Mission
                </Typography>
                <Typography variant="h6" sx={{ mb: 3, opacity: 0.95, lineHeight: 1.7 }}>
                  To make urban transportation more sustainable, affordable, and social by connecting 
                  travelers who share similar routes and creating a trusted community of riders.
                </Typography>
                <Typography sx={{ opacity: 0.9, lineHeight: 1.7 }}>
                  We believe that shared mobility is not just about reducing costs – it's about 
                  building relationships, reducing environmental impact, and creating a more 
                  connected society.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: '100%',
                background: 'linear-gradient(135deg, #9f7aea 0%, #805ad5 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <CardContent sx={{ p: 5, position: 'relative', zIndex: 1 }}>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 3 }}>
                  Our Vision
                </Typography>
                <Typography variant="h6" sx={{ mb: 3, opacity: 0.95, lineHeight: 1.7 }}>
                  To become India's most trusted shared mobility platform, transforming how people 
                  travel in cities while contributing to a cleaner, greener future.
                </Typography>
                <Typography sx={{ opacity: 0.9, lineHeight: 1.7 }}>
                  We envision a future where every trip is shared, every journey is safe, and 
                  every traveler is part of a supportive community that values sustainability 
                  and human connection.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 10 }}>
        <Container maxWidth="lg">
          <Box textAlign="center" sx={{ mb: 8 }}>
            <Typography variant="h2" sx={{ fontWeight: 700, mb: 2 }}>
              Why Choose Sharo?
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Experience the perfect blend of technology, community, and sustainability
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} key={feature.title}>
                <Card
                  sx={{
                    height: '100%',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.08)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
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
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Values Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box textAlign="center" sx={{ mb: 8 }}>
          <Typography variant="h2" sx={{ fontWeight: 700, mb: 2 }}>
            Our Core Values
          </Typography>
          <Typography variant="h6" color="text.secondary">
            The principles that guide everything we do
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {values.map((value, index) => (
            <Grid item xs={12} md={6} key={value.title}>
              <Paper
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'grey.200',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.12)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    width: 48,
                    height: 48,
                    mb: 2,
                    fontSize: '1.25rem'
                  }}
                >
                  {value.icon}
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                  {value.title}
                </Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  {value.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Timeline Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 10 }}>
        <Container maxWidth="lg">
          <Box textAlign="center" sx={{ mb: 8 }}>
            <Typography variant="h2" sx={{ fontWeight: 700, mb: 2 }}>
              Our Journey
            </Typography>
            <Typography variant="h6" color="text.secondary">
              From concept to reality - building the future of shared mobility
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {timeline.map((item, index) => (
              <Grid item xs={12} md={6} key={item.title}>
                <Card
                  sx={{
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 32px rgba(0,0,0,0.08)'
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
                      bgcolor: item.color
                    }}
                  />
                  <CardContent sx={{ p: 4 }}>
                    <Chip
                      label={item.year}
                      sx={{
                        bgcolor: item.color,
                        color: 'white',
                        fontWeight: 600,
                        mb: 2
                      }}
                    />
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                      {item.title}
                    </Typography>
                    <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {item.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Achievements Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h2" sx={{ fontWeight: 700, mb: 3 }}>
              What We've Built
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4, lineHeight: 1.7 }}>
              We've focused on building features that matter most to modern travelers. 
              Every feature is designed with safety, convenience, and community in mind.
            </Typography>

            <Grid container spacing={2}>
              {achievements.map((achievement, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <CheckCircle sx={{ color: 'success.main', fontSize: '1.25rem' }} />
                    <Typography variant="body1">{achievement.text}</Typography>
                  </Stack>
                </Grid>
              ))}
            </Grid>

            <Button
              variant="contained"
              size="large"
              sx={{ mt: 4, borderRadius: 3, px: 4 }}
            >
              Experience Sharo Today
            </Button>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              sx={{
                height: 400,
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  color: 'white',
                  fontWeight: 700,
                  textAlign: 'center',
                  zIndex: 1,
                  position: 'relative'
                }}
              >
                Building the Future
                <br />
                of Mobility
              </Typography>
              <Box
                sx={{
                  position: 'absolute',
                  top: -50,
                  right: -50,
                  width: 200,
                  height: 200,
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Call to Action */}
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
            Ready to Join Our Community?
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255, 255, 255, 0.9)',
              mb: 5,
              lineHeight: 1.7
            }}
          >
            Whether you're looking to save money, meet new people, or contribute to a greener planet, 
            Sharo is the perfect platform for your travel needs.
          </Typography>

          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={3} 
            justifyContent="center"
          >
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: 'white',
                color: '#667eea',
                fontWeight: 700,
                px: 5,
                py: 2,
                borderRadius: 4,
                '&:hover': {
                  bgcolor: '#f8f9fa',
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
                fontWeight: 700,
                px: 5,
                py: 2,
                borderRadius: 4,
                borderWidth: 2,
                '&:hover': {
                  bgcolor: alpha('#ffffff', 0.1),
                  transform: 'translateY(-2px)',
                  borderWidth: 2
                }
              }}
            >
              Learn More
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}