import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  Stack,
  IconButton,
  Divider,
  CircularProgress, // ✅ Added missing import
  alpha,
  useTheme
} from '@mui/material';
import {
  Email,
  Phone,
  LocationOn,
  Send,
  AccessTime,
  Language,
  Support,
  Chat,
  Twitter,
  LinkedIn,
  Instagram,
  Facebook,
  CheckCircle
} from '@mui/icons-material';

const contactMethods = [
  {
    icon: <Email />,
    title: "Email Us",
    description: "Get in touch via email",
    contact: "hello@sharo.com",
    color: "#1976d2"
  },
  {
    icon: <Phone />,
    title: "Call Us",
    description: "Speak with our support team",
    contact: "+91 90000 00000",
    color: "#4caf50"
  },
  {
    icon: <LocationOn />,
    title: "Visit Us",
    description: "Our office location",
    contact: "Hyderabad, Telangana, India",
    color: "#ff9800"
  },
  {
    icon: <AccessTime />,
    title: "Support Hours",
    description: "We're here to help",
    contact: "24/7 Available",
    color: "#9c27b0"
  }
];

const socialLinks = [
  { icon: <Twitter />, name: "Twitter", color: "#1DA1F2" },
  { icon: <LinkedIn />, name: "LinkedIn", color: "#0077B5" },
  { icon: <Instagram />, name: "Instagram", color: "#E4405F" },
  { icon: <Facebook />, name: "Facebook", color: "#1877F2" }
];

const faqs = [
  {
    question: "How do I book a trip?",
    answer: "Browse available trips, select one that matches your route and timing, then click 'Book Trip' to confirm your seat."
  },
  {
    question: "Is it safe to travel with strangers?",
    answer: "Yes! All users are verified through phone number and profile completion. We also have rating systems and safety features."
  },
  {
    question: "How do I cancel a booking?",
    answer: "Go to 'My Bookings', find your trip, and click 'Cancel'. You can only cancel future trips, and seats will be restored."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We currently support UPI, credit/debit cards, and digital wallets for secure transactions."
  }
];

export default function Contact() {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSent(true);
    setSubmitting(false);
    // Reset form after 3 seconds
    setTimeout(() => {
      setSent(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

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
          Get In Touch
        </Typography>
        <Typography variant="h5" sx={{ opacity: 0.9, mb: 2 }}>
          Have questions, suggestions, or need help? We're here for you 24/7.
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.8 }}>
          Reach out and let's make your travel experience better together.
        </Typography>
      </Box>

      {/* Contact Methods */}
      <Grid container spacing={3} sx={{ mb: 8 }}>
        {contactMethods.map((method, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ p: 3, textAlign: 'center', height: '100%', borderRadius: 3 }}>
              <Avatar
                sx={{
                  bgcolor: alpha(method.color, 0.1),
                  color: method.color,
                  width: 60,
                  height: 60,
                  mx: 'auto',
                  mb: 2
                }}
              >
                {method.icon}
              </Avatar>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                {method.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {method.description}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {method.contact}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Contact Form and FAQs */}
      <Grid container spacing={6}>
        {/* Contact Form */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              Send us a Message
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Fill out the form below and we'll get back to you as soon as possible.
            </Typography>

            {sent && (
              <Alert 
                severity="success" 
                sx={{ mb: 3, borderRadius: 2 }}
                icon={<CheckCircle />}
              >
                Thank you! We've received your message and will respond within 24 hours.
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="name"
                    label="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    fullWidth
                    required
                    disabled={submitting}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="email"
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    fullWidth
                    required
                    disabled={submitting}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="subject"
                    label="Subject"
                    value={formData.subject}
                    onChange={handleChange}
                    fullWidth
                    required
                    disabled={submitting}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="message"
                    label="Message"
                    value={formData.message}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    fullWidth
                    required
                    disabled={submitting}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={submitting}
                    endIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Send />}
                    sx={{
                      py: 2,
                      borderRadius: 2,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)'
                      }
                    }}
                  >
                    {submitting ? 'Sending...' : sent ? 'Message Sent!' : 'Send Message'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* FAQs and Social */}
        <Grid item xs={12} md={4}>
          <Stack spacing={4}>
            {/* Quick Help */}
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Quick Help
              </Typography>
              {faqs.map((faq, index) => (
                <Box key={index}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                    {faq.question}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {faq.answer}
                  </Typography>
                  {index < faqs.length - 1 && <Divider sx={{ my: 2 }} />}
                </Box>
              ))}
            </Paper>

            {/* Social Links */}
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Follow Us
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Stay connected for updates, tips, and community stories
              </Typography>
              <Stack direction="row" spacing={1}>
                {socialLinks.map((social, index) => (
                  <IconButton
                    key={index}
                    sx={{
                      bgcolor: alpha(social.color, 0.1),
                      color: social.color,
                      '&:hover': {
                        bgcolor: alpha(social.color, 0.2)
                      }
                    }}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </Stack>
            </Paper>

            {/* Support Promise */}
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Our Support Promise
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                We're committed to providing excellent support. Most queries are resolved within 24 hours,
                and our team is always ready to help make your experience better.
              </Typography>
              {[
                { icon: <Support />, label: "24/7 Support", desc: "Always available" },
                { icon: <Chat />, label: "Quick Response", desc: "Within 2 hours" },
                { icon: <CheckCircle />, label: "Issue Resolution", desc: "Within 24 hours" }
              ].map((item, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, mr: 2 }}>
                    {item.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {item.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.desc}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}