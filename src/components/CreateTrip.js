import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';

export default function CreateTrip({ onNavigate, user }) {
  const [formData, setFormData] = useState({
    startLocation: '',
    endLocation: '',
    date: '',
    time: '',
    vehicleType: '',
    description: '',
    seatsAvailable: '',
    vehicleNumber: '',
    licenseNumber: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (!user) return <Navigate to="/auth" replace />;

  const vehicleNumberPattern = /^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/;
  const licenseNumberPattern = /^DL[-\s]?[A-Z0-9]{13}$/i;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const val = (name === 'vehicleNumber' || name === 'licenseNumber') ? value.toUpperCase() : value;
    setFormData((prev) => ({ ...prev, [name]: val }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const requiredFields = ['startLocation', 'endLocation', 'date', 'time', 'vehicleType', 'seatsAvailable', 'vehicleNumber', 'licenseNumber'];
    const newErrors = {};
    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field].trim() === '') newErrors[field] = `Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}.`;
    });

    if (formData.vehicleNumber && !vehicleNumberPattern.test(formData.vehicleNumber)) newErrors.vehicleNumber = 'Vehicle number must be in format TS08HD2006.';
    if (formData.licenseNumber) {
      const lic = formData.licenseNumber;
      if (lic.length !== 16) newErrors.licenseNumber = 'License number must be exactly 16 chars including space or hyphen.';
      else if (!licenseNumberPattern.test(lic)) newErrors.licenseNumber = "License number must be like 'DL-1420110012345' or 'DL14 20110012345'.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setTimeout(() => setErrors({}), 3000);
      return;
    }
    setSubmitting(true);
    try {
      const combinedDateTime = new Date(`${formData.date}T${formData.time}`);
      await addDoc(collection(db, 'trips'), {
        startLocation: formData.startLocation.trim(),
        endLocation: formData.endLocation.trim(),
        date: combinedDateTime,
        vehicleType: formData.vehicleType,
        description: formData.description.trim(),
        seatsAvailable: Number(formData.seatsAvailable),
        vehicleNumber: formData.vehicleNumber.trim(),
        licenseNumber: formData.licenseNumber.trim(),
        uploaderId: auth.currentUser.uid,
        uploaderName: auth.currentUser.displayName || auth.currentUser.email || 'Anonymous',
      });
      setFormData({
        startLocation: '',
        endLocation: '',
        date: '',
        time: '',
        vehicleType: '',
        description: '',
        seatsAvailable: '',
        vehicleNumber: '',
        licenseNumber: '',
      });
      onNavigate('/');
    } catch (error) {
      alert('Failed to create trip. Try again.');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h5" gutterBottom>Create New Trip</Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField label="Start Location" name="startLocation" value={formData.startLocation} onChange={handleInputChange} error={!!errors.startLocation} helperText={errors.startLocation || ''} required />
        <TextField label="End Location" name="endLocation" value={formData.endLocation} onChange={handleInputChange} error={!!errors.endLocation} helperText={errors.endLocation || ''} required />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField label="Date" type="date" name="date" value={formData.date} onChange={handleInputChange} error={!!errors.date} helperText={errors.date || ''} InputLabelProps={{ shrink: true }} inputProps={{ min: new Date().toISOString().split('T')[0], style: { cursor: 'pointer' } }} required sx={{ flex: 1 }} />
          <TextField label="Time" type="time" name="time" value={formData.time} onChange={handleInputChange} error={!!errors.time} helperText={errors.time || ''} InputLabelProps={{ shrink: true }} required sx={{ flex: 1, cursor: 'pointer' }} />
        </Box>
        <FormControl fullWidth error={!!errors.vehicleType}>
          <InputLabel id="vehicle-type-label" required>Vehicle Type</InputLabel>
          <Select labelId="vehicle-type-label" id="vehicleType" name="vehicleType" value={formData.vehicleType} label="Vehicle Type *" onChange={handleInputChange} required>
            <MenuItem value="Bike">Bike</MenuItem>
            <MenuItem value="Scooter">Scooter</MenuItem>
            <MenuItem value="Car">Car</MenuItem>
          </Select>
          {errors.vehicleType && <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>{errors.vehicleType}</Typography>}
        </FormControl>
        <TextField label="Seats Available" name="seatsAvailable" type="number" value={formData.seatsAvailable} onChange={handleInputChange} inputProps={{ min: 0 }} error={!!errors.seatsAvailable} helperText={errors.seatsAvailable || ''} required />
        <TextField label="Vehicle Number (e.g. TS08HD2006)" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleInputChange} error={!!errors.vehicleNumber} helperText={errors.vehicleNumber || ''} inputProps={{ style: { textTransform: 'uppercase' } }} required />
        <TextField label="License Number (Format: DL-1420110012345 or DL14 20110012345)" name="licenseNumber" value={formData.licenseNumber} onChange={handleInputChange} error={!!errors.licenseNumber} helperText={errors.licenseNumber || '16 characters including space or hyphen'} inputProps={{ style: { textTransform: 'uppercase' }, maxLength: 16 }} required />
        <TextField label="Description (Optional)" name="description" value={formData.description} onChange={handleInputChange} multiline rows={3} />
        <Button type="submit" variant="contained" color="primary" disabled={submitting}>{submitting ? 'Creating...' : 'Create Trip'}</Button>
      </Box>
    </Container>
  );
}
