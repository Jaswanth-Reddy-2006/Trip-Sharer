import React from 'react';
import { Box, Typography, Link, IconButton } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#2E7D32',
        color: 'white',
        py: 3,
        mt: 8,
        textAlign: 'center',
      }}
    >
      <Typography variant="body1" gutterBottom>
        &copy; {new Date().getFullYear()} Trip Sharer. All rights reserved.
      </Typography>
      <Box>
        <IconButton color="inherit" href="https://github.com/" target="_blank" rel="noopener">
          <GitHubIcon />
        </IconButton>
        <IconButton color="inherit" href="https://facebook.com/" target="_blank" rel="noopener">
          <FacebookIcon />
        </IconButton>
        <IconButton color="inherit" href="https://twitter.com/" target="_blank" rel="noopener">
          <TwitterIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
