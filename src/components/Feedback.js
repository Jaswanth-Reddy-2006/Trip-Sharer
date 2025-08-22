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
    // Save feedback to database or process it here
    enqueueSnackbar('Thank you for your feedback!', { variant: 'success' });
    setRating(0);
    setComment('');
  };

  return (
    <Container sx={{ mt: 8, mb: 8, maxWidth: 600 }}>
      <Typography variant="h3" color="green" gutterBottom fontWeight="bold">
        Feedback
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Typography component="legend" sx={{ mb: 1 }}>
          Rate your experience:
        </Typography>
        <Rating
          name="rating"
          value={rating}
          onChange={(_, newValue) => setRating(newValue)}
          precision={1}
          size="large"
          sx={{ mb: 3 }}
        />
        <TextField
          label="Comments"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          multiline
          rows={4}
          fullWidth
          margin="normal"
          required
        />
        <Button type="submit" variant="contained" color="success" sx={{ mt: 3 }}>
          Submit Feedback
        </Button>
      </Box>
    </Container>
  );
}
