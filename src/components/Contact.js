import React, { useState } from 'react';
import { Container, Typography, Box, TextField, Button, Alert, Paper } from '@mui/material';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';

export default function Contact() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <Container maxWidth="sm" sx={{ my: 6 }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <MarkEmailReadIcon sx={{ fontSize: 46, color: "primary.main" }} />
          <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
            Contact Us
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            We'd love to hear from you! Questions, partnership ideas, or feedback — use the form below and our team will respond soon.
          </Typography>
        </Box>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField label="Your Name" name="name" fullWidth required />
          <TextField label="Email Address" name="email" type="email" fullWidth required />
          <TextField label="Message" name="message" multiline rows={4} fullWidth required />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 1, borderRadius: 3 }}
            disabled={sent}
          >
            Send Message
          </Button>
          {sent && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Thank you! We’ve received your message.
            </Alert>
          )}
        </Box>
        <Box sx={{ mt: 4, textAlign: "center", color: "text.secondary" }}>
          <Typography variant="body2">
            Or reach us at: <b>team@sharo.app</b>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
