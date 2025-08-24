import React from 'react';
import { Box, Typography } from '@mui/material';

export default function EmptyState({ message, imageName = 'empty-state.svg' }) {
  return (
    <Box sx={{ textAlign: 'center', py: 6 }}>
      <img
        src={`/${imageName}`}
        alt="Empty state"
        style={{ maxWidth: 240, width: '100%', opacity: 0.85, marginBottom: 16 }}
      />
      <Typography color="text.secondary">{message}</Typography>
    </Box>
  );
}
