// src/components/ChatRoom.js

import React, { useEffect, useState, useRef } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
} from "firebase/firestore";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  CircularProgress,
} from "@mui/material";

function getChatId(uid1, uid2) {
  return [uid1, uid2].sort().join("_");
}

export default function ChatRoom() {
  const { chatId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const otherUser = location.state?.user;
  const currentUser = auth.currentUser;

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!currentUser) {
      navigate("/auth");
      return;
    }
    if (!otherUser) {
      navigate("/chat");
      return;
    }
  }, [currentUser, otherUser, navigate]);

  const chatDocumentId = getChatId(currentUser?.uid, otherUser?.uid);

  useEffect(() => {
    if (!chatDocumentId) return;

    const chatDocRef = doc(db, "chats", chatDocumentId);

    // Ensure chat doc exists
    setDoc(
      chatDocRef,
      {
        users: [currentUser.uid, otherUser.uid],
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    ).catch(console.error);

    const messagesCollectionRef = collection(chatDocRef, "messages");
    const q = query(messagesCollectionRef, orderBy("createdAt"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(msgs);
        setLoading(false);
        scrollToBottom();
      },
      (error) => {
        console.error("Chat subscription error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [chatDocumentId, currentUser, otherUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const chatDocRef = doc(db, "chats", chatDocumentId);
    const messagesCollectionRef = collection(chatDocRef, "messages");

    try {
      await addDoc(messagesCollectionRef, {
        text: newMessage,
        from: currentUser.uid,
        to: otherUser.uid,
        createdAt: serverTimestamp(),
        read: false,
      });
      setNewMessage("");
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (!currentUser || !otherUser) {
    return (
      <Container sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography>Loading chat...</Typography>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="sm"
      sx={{ mt: 4, display: "flex", flexDirection: "column", height: "80vh" }}
    >
      <Typography variant="h5" gutterBottom>
        Chat with {otherUser.name || otherUser.email || "User"}
      </Typography>
      <Paper
        sx={{
          flex: 1,
          p: 2,
          mb: 2,
          overflowY: "auto",
          bgcolor: (theme) =>
            theme.palette.mode === "dark" ? "#333" : "#f5f5f5",
          borderRadius: 2,
        }}
        elevation={3}
      >
        {loading ? (
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.from === currentUser.uid;
            return (
              <Box
                key={msg.id}
                sx={{
                  display: "flex",
                  justifyContent: isOwn ? "flex-end" : "flex-start",
                  mb: 1,
                }}
              >
                <Box
                  sx={{
                    maxWidth: "75%",
                    p: 1.5,
                    bgcolor: isOwn ? "primary.main" : "grey.300",
                    color: isOwn ? "primary.contrastText" : "text.primary",
                    borderRadius: 2,
                    borderTopRightRadius: isOwn ? 0 : 8,
                    borderTopLeftRadius: isOwn ? 8 : 0,
                    wordBreak: "break-word",
                    boxShadow: isOwn ? 3 : 1,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  <Typography>{msg.text}</Typography>
                  <Typography
                    variant="caption"
                    sx={{ display: "block", textAlign: "right", mt: 0.5, opacity: 0.6, fontSize: "0.7rem" }}
                  >
                    {msg.createdAt?.toDate
                      ? msg.createdAt.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : ""}
                  </Typography>
                </Box>
              </Box>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </Paper>
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
      >
        <TextField
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message"
          multiline
          rows={2}
          fullWidth
        />
        <Button variant="contained" type="submit" sx={{ mt: 1 }}>
          Send
        </Button>
      </Box>
    </Container>
  );
}
