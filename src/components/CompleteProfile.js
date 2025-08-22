import React, { useState } from 'react';
import { Container, Typography, TextField, Button, MenuItem, Alert } from '@mui/material';
import { db, auth } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function CompleteProfile({ onComplete }) {
  const [form, setForm] = useState({
    name: '',
    username: '',
    dob: '',
    gender: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const genders = ['Male', 'Female', 'Other'];

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.username || !form.dob || !form.gender) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');

      await setDoc(
        doc(db, 'users', user.uid),
        {
          name: form.name.trim(),
          username: form.username.trim(),
          dob: form.dob,
          gender: form.gender,
          profileComplete: true,
          createdAt: new Date(),
        },
        { merge: true }
      );

      onComplete();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Typography variant="h5" gutterBottom>
        Complete Your Profile
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Full Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          disabled={loading}
        />
        <TextField
          label="Username"
          name="username"
          value={form.username}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          disabled={loading}
        />
        <TextField
          label="Date of Birth"
          name="dob"
          type="date"
          value={form.dob}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          InputLabelProps={{ shrink: true }}
          disabled={loading}
        />
        <TextField
          select
          label="Gender"
          name="gender"
          value={form.gender}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          disabled={loading}
        >
          {genders.map((g) => (
            <MenuItem key={g} value={g}>
              {g}
            </MenuItem>
          ))}
        </TextField>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </Button>
      </form>
    </Container>
  );
}
