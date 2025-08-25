import React from 'react';
import { Box, Typography } from '@mui/material';

export default function EmptyState({ message, imageName = 'empty-state.svg' }) {
  return (
    <Box textAlign="center" py={5}>
      <Typography variant="body1">{message}</Typography>
    </Box>
  );
}
