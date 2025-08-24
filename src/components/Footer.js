import React from 'react';
import { Box, Typography, IconButton, Grid, Link as MuiLink } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';

export default function Footer() {
  return (
    <Box component="footer" sx={{ mt: { xs: 6, md: 8 }, borderTop: (t) => `1px solid ${t.palette.divider}` }}>
      <Box sx={{ py: 4 }}>
        <Grid container spacing={3} sx={{ px: { xs: 2, md: 3 } }}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>sharo</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Share rides. Split costs. Travel smarter and greener with a trusted community.
            </Typography>
          </Grid>

          <Grid item xs={6} md={2}>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>Explore</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, color: 'text.secondary' }}>
              <MuiLink underline="hover" color="inherit" href="/">Home</MuiLink>
              <MuiLink underline="hover" color="inherit" href="/trips">Trips</MuiLink>
              <MuiLink underline="hover" color="inherit" href="/about">About</MuiLink>
              <MuiLink underline="hover" color="inherit" href="/contact">Contact</MuiLink>
            </Box>
          </Grid>

          <Grid item xs={6} md={3}>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>Support</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, color: 'text.secondary' }}>
              <MuiLink underline="hover" color="inherit" href="#">Safety & Trust</MuiLink>
              <MuiLink underline="hover" color="inherit" href="#">FAQs</MuiLink>
              <MuiLink underline="hover" color="inherit" href="#">Terms</MuiLink>
              <MuiLink underline="hover" color="inherit" href="#">Privacy</MuiLink>
            </Box>
          </Grid>

          <Grid item xs={12} md={3}>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>Follow</Typography>
            <Box>
              <IconButton color="inherit" size="small" aria-label="GitHub">
                <GitHubIcon fontSize="small" />
              </IconButton>
              <IconButton color="inherit" size="small" aria-label="Facebook">
                <FacebookIcon fontSize="small" />
              </IconButton>
              <IconButton color="inherit" size="small" aria-label="Twitter">
                <TwitterIcon fontSize="small" />
              </IconButton>
              <IconButton color="inherit" size="small" aria-label="Instagram">
                <InstagramIcon fontSize="small" />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ py: 2, textAlign: 'center', bgcolor: 'background.default', borderTop: (t) => `1px dashed ${t.palette.divider}` }}>
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} Trip Sharer. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}
