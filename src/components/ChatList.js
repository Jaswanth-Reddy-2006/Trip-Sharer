// src/components/ChatList.js
import React, { useEffect, useState } from "react";
import { collection, query, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import {
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Container,
  CircularProgress,
} from "@mui/material";

export default function ChatList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) {
      setError("Please login to see users");
      setLoading(false);
      return;
    }

    async function fetchUsers() {
      setLoading(true);
      setError("");
      try {
        const q = query(collection(db, "users"));
        const snapshot = await getDocs(q);
        const filtered = snapshot.docs
          .map((doc) => ({ uid: doc.id, ...doc.data() }))
          .filter((u) => u.uid !== currentUser.uid);
        setUsers(filtered);
      } catch {
        setError("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [currentUser]);

  const openChat = (user) => {
    navigate(`/chat/${user.uid}`, { state: { user } });
  };

  if (loading)
    return (
      <Container sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography>Loading users...</Typography>
      </Container>
    );

  if (error)
    return (
      <Container sx={{ mt: 4, textAlign: "center", color: "error.main" }}>
        <Typography>{error}</Typography>
      </Container>
    );

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Users to Chat
      </Typography>
      <List>
        {users.map((user) => (
          <ListItemButton key={user.uid} onClick={() => openChat(user)}>
            <ListItemText
              primary={user.name || user.email || "Unnamed User"}
              secondary={user.email}
            />
          </ListItemButton>
        ))}
        {users.length === 0 && <Typography>No other users found.</Typography>}
      </List>
    </Container>
  );
}
