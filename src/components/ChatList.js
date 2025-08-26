import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  Box,
  Paper,
  Chip,
  Stack,
  IconButton,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Divider,
  alpha,
  useTheme,
  Button
} from "@mui/material";
import {
  Chat,
  Person,
  DirectionsCar,
  TwoWheeler,
  Search,
  Message,
  Phone,
  Block,
  Info,
  Group,
  Schedule
} from "@mui/icons-material";
import {
  collection,
  query,
  getDocs,
  doc,
  getDoc,
  where,
  orderBy
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate } from "react-router-dom";

// Fixed ContactItem component structure
const ContactItem = ({ contact, onClick, theme }) => (
  <ListItem
    button
    onClick={onClick}
    sx={{
      borderRadius: 2,
      mb: 1,
      '&:hover': {
        bgcolor: alpha(theme.palette.primary.main, 0.05)
      }
    }}
  >
    <ListItemAvatar>
      <Badge
        badgeContent={contact.hasUnread ? "!" : null}
        color="error"
      >
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          <Person />
        </Avatar>
      </Badge>
    </ListItemAvatar>
    <ListItemText
      primary={contact.name}
      secondary={
        <Box>
          <Typography variant="body2" color="text.secondary">
            {contact.tripRoute}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
            {contact.vehicleType === 'Car' ? (
              <DirectionsCar sx={{ fontSize: '1rem' }} />
            ) : (
              <TwoWheeler sx={{ fontSize: '1rem' }} />
            )}
            <Typography variant="caption" color="text.secondary">
              {contact.tripDate}
            </Typography>
            <Chip 
              label={contact.relationship}
              size="small"
              variant="outlined"
              sx={{ height: 20, fontSize: '0.7rem' }}
            />
          </Stack>
        </Box>
      }
    />
  </ListItem>
);

export default function ChatList({ user, onNavigate }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) {
      onNavigate("/auth");
      return;
    }
    loadContacts();
  }, [user, onNavigate]);

  useEffect(() => {
    // Filter contacts based on search query
    const filtered = contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.tripRoute.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredContacts(filtered);
  }, [contacts, searchQuery]);

  const loadContacts = async () => {
    setLoading(true);
    setError("");
    try {
      const userContacts = new Map();

      // Get trips where user is the driver
      const userTripsQuery = query(
        collection(db, "trips"),
        where("uploaderId", "==", user.uid)
      );
      const userTrips = await getDocs(userTripsQuery);

      // Get bookings for user's trips (passengers who booked user's trips)
      for (const tripDoc of userTrips.docs) {
        const trip = tripDoc.data();
        const bookingsQuery = query(
          collection(db, "bookings"),
          where("tripId", "==", tripDoc.id),
          where("status", "!=", "cancelled")
        );
        const bookings = await getDocs(bookingsQuery);

        for (const bookingDoc of bookings.docs) {
          const booking = bookingDoc.data();
          if (booking.userId !== user.uid) {
            try {
              const passengerDoc = await getDoc(doc(db, "users", booking.userId));
              if (passengerDoc.exists()) {
                const passenger = passengerDoc.data();
                const contactKey = `${booking.userId}-${tripDoc.id}`;
                userContacts.set(contactKey, {
                  userId: booking.userId,
                  name: passenger.name || "Unknown User",
                  relationship: "Passenger",
                  tripRoute: `${trip.startLocation} → ${trip.endLocation}`,
                  tripDate: formatTripDate(trip.date),
                  vehicleType: trip.vehicleType,
                  tripId: tripDoc.id
                });
              }
            } catch (err) {
              console.error("Error fetching passenger data:", err);
            }
          }
        }
      }

      // Get bookings where user is the passenger
      const userBookingsQuery = query(
        collection(db, "bookings"),
        where("userId", "==", user.uid),
        where("status", "!=", "cancelled")
      );
      const userBookings = await getDocs(userBookingsQuery);

      // Get trip details and drivers for user's bookings
      for (const bookingDoc of userBookings.docs) {
        const booking = bookingDoc.data();
        try {
          const tripDoc = await getDoc(doc(db, "trips", booking.tripId));
          if (tripDoc.exists()) {
            const trip = tripDoc.data();
            const driverDoc = await getDoc(doc(db, "users", trip.uploaderId));
            if (driverDoc.exists()) {
              const driver = driverDoc.data();
              const contactKey = `${trip.uploaderId}-${booking.tripId}`;
              userContacts.set(contactKey, {
                userId: trip.uploaderId,
                name: driver.name || "Unknown Driver",
                relationship: "Driver",
                tripRoute: `${trip.startLocation} → ${trip.endLocation}`,
                tripDate: formatTripDate(trip.date),
                vehicleType: trip.vehicleType,
                tripId: booking.tripId
              });
            }
          }
        } catch (err) {
          console.error("Error fetching trip/driver data:", err);
        }
      }

      // Convert Map to Array and sort by most recent interaction
      const contactsArray = Array.from(userContacts.values());
      // TODO: Add logic to check for unread messages
      // For now, we'll set hasUnread to false for all contacts
      contactsArray.forEach(contact => {
        contact.hasUnread = false;
      });

      setContacts(contactsArray);
    } catch (error) {
      console.error("Error loading contacts:", error);
      setError("Failed to load contacts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatTripDate = (date) => {
    if (!date) return "Date unknown";
    const tripDate = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    const now = new Date();
    const diffTime = tripDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days ago`;
    } else if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Tomorrow";
    } else {
      return `In ${diffDays} days`;
    }
  };

  const handleContactClick = (contact) => {
    navigate(`/chat/${contact.userId}`, {
      state: {
        user: {
          uid: contact.userId,
          name: contact.name,
          relationship: contact.relationship,
          tripId: contact.tripId
        }
      }
    });
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>
          Loading your contacts...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 3,
          p: 4,
          mb: 4,
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          Your Travel Contacts
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Chat with drivers and passengers from your shared trips
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
      </Paper>

      {/* Contacts List */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        {filteredContacts.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            {contacts.length === 0 ? (
              <>
                {/* No contacts at all */}
                <Chat sx={{ fontSize: '4rem', color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No contacts yet
                </Typography>
                <Typography color="text.secondary" paragraph>
                  You can only chat with people you've shared trips with.
                  Book a trip or create your own to start connecting!
                </Typography>
                <Stack direction="row" spacing={2} justifyContent="center">
                  <Button
                    variant="contained"
                    onClick={() => onNavigate('/trips')}
                    sx={{ px: 3, py: 1 }}
                  >
                    Find Trips
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => onNavigate('/create-trip')}
                    sx={{ px: 3, py: 1 }}
                  >
                    Create Trip
                  </Button>
                </Stack>
              </>
            ) : (
              <>
                {/* No search results */}
                <Search sx={{ fontSize: '3rem', color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6">
                  No contacts found
                </Typography>
                <Typography color="text.secondary">
                  Try searching with different keywords
                </Typography>
              </>
            )}
          </Box>
        ) : (
          <>
            {/* Summary */}
            <Box sx={{ p: 2, bgcolor: 'background.default' }}>
              <Typography variant="body2" color="text.secondary">
                You have {filteredContacts.length} contact(s) from your trip bookings
              </Typography>
            </Box>

            {/* Contacts */}
            <List>
              {filteredContacts.map((contact, index) => (
                <React.Fragment key={`${contact.userId}-${contact.tripId}`}>
                  <ContactItem
                    contact={contact}
                    onClick={() => handleContactClick(contact)}
                    theme={theme}
                  />
                  {index < filteredContacts.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </>
        )}
      </Paper>

      {/* Information Card */}
      <Paper sx={{ mt: 3, p: 3, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.1) }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Info color="info" />
          Chat Security & Privacy
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • You can only chat with people from your shared trips<br />
          • All conversations are secure and private<br />
          • Report any inappropriate behavior to support<br />
          • Block users if needed for your safety
        </Typography>
      </Paper>
    </Container>
  );
}