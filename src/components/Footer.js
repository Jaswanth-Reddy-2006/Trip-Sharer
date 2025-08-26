import React from 'react';
import { Box, Typography, IconButton, Grid, Link as MuiLink } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={(t) => ({
        mt: 6,
        py: 4,
        px: 2,
        borderTop: `1px solid ${t.palette.divider}`,
        bgcolor: 'background.paper',
      })}
    >
      <Grid container spacing={4} maxWidth="lg" sx={{ mx: 'auto' }}>
        <Grid item xs={12} md={4}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            sharo
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Share rides. Split costs. Travel smarter and greener with a trusted community.
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Explore
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <MuiLink href="/" color="text.secondary" sx={{ mb: 1 }}>
              Home
            </MuiLink>
            <MuiLink href="/trips" color="text.secondary" sx={{ mb: 1 }}>
              Trips
            </MuiLink>
            <MuiLink href="/about" color="text.secondary" sx={{ mb: 1 }}>
              About
            </MuiLink>
            <MuiLink href="/contact" color="text.secondary">
              Contact
            </MuiLink>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Support
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <MuiLink href="#" color="text.secondary" sx={{ mb: 1 }}>
              Safety & Trust
            </MuiLink>
            <MuiLink href="#" color="text.secondary" sx={{ mb: 1 }}>
              FAQs
            </MuiLink>
            <MuiLink href="#" color="text.secondary" sx={{ mb: 1 }}>
              Terms
            </MuiLink>
            <MuiLink href="#" color="text.secondary">
              Privacy
            </MuiLink>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Follow
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton color="primary" size="small">
              <FacebookIcon />
            </IconButton>
            <IconButton color="primary" size="small">
              <TwitterIcon />
            </IconButton>
            <IconButton color="primary" size="small">
              <InstagramIcon />
            </IconButton>
            <IconButton color="primary" size="small">
              <GitHubIcon />
            </IconButton>
          </Box>
        </Grid>
      </Grid>

      <Box
        sx={(t) => ({
          mt: 4,
          pt: 2,
          borderTop: `1px dashed ${t.palette.divider}`,
          textAlign: 'center',
        })}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} Trip Sharer. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}