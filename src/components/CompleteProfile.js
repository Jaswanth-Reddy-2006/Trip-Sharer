import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const genders = ["Male", "Female", "Other"];

export default function CompleteProfile() {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const [form, setForm] = useState({
    name: "",
    gender: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setForm({
            name: data.name || "",
            gender: data.gender || "",
            phone: data.phone || "",
          });
        }
      } catch (err) {
        setError("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.gender || !form.phone) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!user) {
      setError("Not authenticated. Please log in.");
      return;
    }

    setSaving(true);
    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          ...form,
          profileComplete: true,
          createdAt: new Date(),
          uid: user.uid,
        },
        { merge: true }
      );
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <CircularProgress size={24} />
          <Typography>Loading profile data...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Complete Your Profile
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label="Full Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="Gender"
          name="gender"
          select
          value={form.gender}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        >
          {genders.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Phone"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        />

        <Button
          type="submit"
          variant="contained"
          sx={{ mt: 2 }}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Profile"}
        </Button>
      </Box>
    </Container>
  );
}
