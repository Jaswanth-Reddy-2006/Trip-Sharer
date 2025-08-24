import React, { useState } from 'react';
import { Container, Typography, Box, TextField, Button, Alert, Paper, Grid } from '@mui/material';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import EmailIcon from '@mui/icons-material/Email';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import RoomIcon from '@mui/icons-material/Room';

export default function Contact() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
      <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
        Contact Us
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 800 }}>
        Questions, partnerships, or product feedback—drop a message and the team will respond soon.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: (t) => `1px solid ${t.palette.divider}` }}>
            <Box component="form" onSubmit={handleSubmit}>
              <TextField label="Name" fullWidth required margin="normal" />
              <TextField label="Email" type="email" fullWidth required margin="normal" />
              <TextField label="Message" multiline rows={5} fullWidth required margin="normal" />
              <Button type="submit" variant="contained" sx={{ mt: 2 }}>
                Send Message
              </Button>
              {sent && (
                <Alert
                  icon={<MarkEmailReadIcon fontSize="inherit" />}
                  severity="success"
                  sx={{ mt: 2 }}
                >
                  Thank you! We’ve received your message.
                </Alert>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: (t) => `1px solid ${t.palette.divider}`, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Get in touch
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <EmailIcon color="primary" sx={{ mr: 1.5 }} />
              <Typography>team@sharo.app</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PhoneInTalkIcon color="primary" sx={{ mr: 1.5 }} />
              <Typography>+91 90000 00000</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <RoomIcon color="primary" sx={{ mr: 1.5 }} />
              <Typography>India</Typography>
            </Box>

            <Box
              sx={{
                mt: 3,
                p: 2,
                bgcolor: 'background.default',
                borderRadius: 2,
                border: (t) => `1px dashed ${t.palette.divider}`,
                color: 'text.secondary',
                fontSize: 14,
              }}
            >
              Tip: For account or booking issues, include your registered email to help us assist faster.
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
