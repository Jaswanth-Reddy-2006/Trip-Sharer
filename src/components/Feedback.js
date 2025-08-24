import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  Rating,
} from '@mui/material';
import { useSnackbar } from 'notistack';

export default function Feedback() {
  const { enqueueSnackbar } = useSnackbar();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please provide a rating.');
      return;
    }
    if (!comment.trim()) {
      setError('Please provide a comment.');
      return;
    }
    setError('');
    // TODO: save feedback to DB
    enqueueSnackbar('Thank you for your feedback!', { variant: 'success' });
    setRating(0);
    setComment('');
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        Feedback
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit}>
        <Typography sx={{ mb: 1 }}>Rate your experience:</Typography>
        <Rating
          value={rating}
          onChange={(_, newValue) => setRating(newValue || 0)}
          precision={1}
          size="large"
          sx={{ mb: 3 }}
        />
        <TextField
          label="Comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          multiline
          rows={4}
          fullWidth
          margin="normal"
          required
        />
        <Button type="submit" variant="contained" sx={{ mt: 2 }}>
          Submit Feedback
        </Button>
      </Box>
    </Container>
  );
}
