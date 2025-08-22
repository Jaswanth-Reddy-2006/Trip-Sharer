import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, MenuItem, CircularProgress, Alert } from '@mui/material';
import { useSnackbar } from 'notistack';
import { db, auth } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export default function CreateTrip({ onNavigate }) {
  const { enqueueSnackbar } = useSnackbar();

  const [form, setForm] = useState({
    from: '',
    to: '',
    date: '',
    time: '',
    vehicleType: 'Car',
    seats: 1,
    vehicleNumber: '',
    drivingLicenseNumber: '',
    rcNumber: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'vehicleType' && value === '2-Wheeler' ? { seats: '' } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.from || !form.to || !form.date || !form.time) {
      setError('Please fill in all required fields.');
      return;
    }
    if (form.vehicleType === 'Car' && (!form.seats || form.seats < 1 || form.seats > 3)) {
      setError('Seats available must be between 1 and 3 for cars.');
      return;
    }
    if (!form.vehicleNumber || !form.drivingLicenseNumber || !form.rcNumber) {
      setError('Please enter vehicle number, driving license number, and RC number.');
      return;
    }

    setLoading(true);

    try {
      const dateTime = new Date(`${form.date}T${form.time}`);
      const user = auth.currentUser;

      await addDoc(collection(db, 'trips'), {
        from: form.from,
        to: form.to,
        vehicleType: form.vehicleType,
        seats: form.vehicleType === 'Car' ? Number(form.seats) : null,
        vehicleNumber: form.vehicleNumber,
        drivingLicenseNumber: form.drivingLicenseNumber,
        rcNumber: form.rcNumber,
        dateTime: Timestamp.fromDate(dateTime),
        createdAt: Timestamp.now(),
        ownerId: user.uid,
      });

      enqueueSnackbar('Trip created successfully!', { variant: 'success' });
      onNavigate('home');
    } catch (err) {
      setError('Failed to create trip: ' + err.message);
      enqueueSnackbar('Failed to create trip: ' + err.message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container sx={{ marginTop: 8, maxWidth: 600 }}>
      <Typography variant="h4" gutterBottom color="green" fontWeight="bold">
        Post a New Trip
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField label="From" name="from" fullWidth value={form.from} onChange={handleChange} required margin="normal" />
        <TextField label="To" name="to" fullWidth value={form.to} onChange={handleChange} required margin="normal" />
        <TextField label="Date" name="date" type="date" fullWidth value={form.date} onChange={handleChange} required margin="normal" InputLabelProps={{ shrink: true }} />
        <TextField label="Time" name="time" type="time" fullWidth value={form.time} onChange={handleChange} required margin="normal" InputLabelProps={{ shrink: true }} />

        <TextField select label="Vehicle Type" name="vehicleType" value={form.vehicleType} onChange={handleChange} fullWidth margin="normal">
          <MenuItem value="Car">Car</MenuItem>
          <MenuItem value="2-Wheeler">2-Wheeler</MenuItem>
        </TextField>

        {form.vehicleType === 'Car' && (
          <TextField
            label="Seats Available"
            name="seats"
            type="number"
            value={form.seats}
            onChange={handleChange}
            fullWidth
            margin="normal"
            inputProps={{ min: 1, max: 3 }}
            required
          />
        )}

        <TextField label="Vehicle Number" name="vehicleNumber" value={form.vehicleNumber} onChange={handleChange} fullWidth required margin="normal" />
        <TextField label="Driving License Number" name="drivingLicenseNumber" value={form.drivingLicenseNumber} onChange={handleChange} fullWidth required margin="normal" />
        <TextField label="RC Number" name="rcNumber" value={form.rcNumber} onChange={handleChange} fullWidth required margin="normal" />

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button type="submit" variant="contained" color="success" disabled={loading} sx={{ fontWeight: 'bold', flexGrow: 1 }}>
            {loading ? 'Posting...' : 'Post Trip'}
          </Button>
          <Button variant="outlined" color="inherit" sx={{ fontWeight: 'bold', flexGrow: 1 }} onClick={() => onNavigate('home')} disabled={loading}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
