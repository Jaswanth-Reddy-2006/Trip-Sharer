import React, { useEffect, useState } from 'react';
import { Container, Typography, TextField, Button, Box, Alert, CircularProgress } from '@mui/material';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

export default function Profile({ onNavigate }) {
  const user = auth.currentUser;
  const [form, setForm] = useState({
    name: '',
    username: '',
    dob: '',
    gender: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      setLoading(true);
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setForm({
          name: data.name || '',
          username: data.username || '',
          dob: data.dob || '',
          gender: data.gender || '',
        });
      }
      setLoading(false);
    }
    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setError('');
    if (!form.name || !form.username || !form.dob || !form.gender) {
      setError('Please fill in all fields');
      return;
    }
    setSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { ...form }, { merge: true });
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  if (loading) return <CircularProgress />;

  return (
    <Container sx={{ mt: 8, maxWidth: 600 }}>
      <Typography variant="h4" color="green" gutterBottom fontWeight="bold">
        Profile
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {editMode ? (
        <Box>
          <TextField label="Full Name" name="name" value={form.name} onChange={handleChange} fullWidth margin="normal" disabled={saving} />
          <TextField label="Username" name="username" value={form.username} onChange={handleChange} fullWidth margin="normal" disabled={saving} />
          <TextField label="Date of Birth" name="dob" type="date" value={form.dob} onChange={handleChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} disabled={saving} />
          <TextField label="Gender" name="gender" value={form.gender} onChange={handleChange} fullWidth margin="normal" disabled={saving} />
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button variant="contained" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="outlined" onClick={() => setEditMode(false)} disabled={saving}>Cancel</Button>
          </Box>
        </Box>
      ) : (
        <Box>
          <Typography variant="h6" gutterBottom>Name:</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>{form.name || 'Not set'}</Typography>

          <Typography variant="h6" gutterBottom>Username:</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>{form.username || 'Not set'}</Typography>

          <Typography variant="h6" gutterBottom>Date of Birth:</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>{form.dob || 'Not set'}</Typography>

          <Typography variant="h6" gutterBottom>Gender:</Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>{form.gender || 'Not set'}</Typography>

          <Button variant="contained" onClick={() => setEditMode(true)}>Edit Profile</Button>
        </Box>
      )}
    </Container>
  );
}
