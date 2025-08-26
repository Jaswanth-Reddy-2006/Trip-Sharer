import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Typography,
  Button,
  CircularProgress,
  Box,
  Alert,
  CardContent,
  Chip,
  Grid,
  Paper,
  Stack,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Badge,
  IconButton,
  Tooltip,
  alpha,
  useTheme
} from "@mui/material";
import {
  DirectionsCar,
  TwoWheeler,
  Person,
  Schedule,
  LocationOn,
  Cancel,
  CheckCircle,
  Pending,
  Event,
  Phone,
  Chat,
  Info,
  Warning,
  History,
  BookmarkAdded,
  Route,
  AccessTime,
  CalendarToday
} from "@mui/icons-material";
import {
  collection,
  query,
  getDocs,
  doc,
  getDoc,
  where,
  updateDoc,
  serverTimestamp,
  orderBy
} from "firebase/firestore";
import { db, auth } from "../firebase";

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const BookingCard = ({ booking, type, onCancel, onChat, theme }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'cancelled': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckCircle />;
      case 'cancelled': return <Cancel />;
      case 'pending': return <Pending />;
      default: return <Event />;
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    const dt = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    return dt.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const formatTime = (date) => {
    if (!date) return "N/A";
    const dt = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    return dt.toLocaleTimeString("en-IN", { 
      hour: "2-digit", 
      minute: "2-digit",
      hour12: true 
    });
  };

  const getVehicleIcon = (vehicleType) => {
    return vehicleType === "Car" ? <DirectionsCar /> : <TwoWheeler />;
  };

  const isPastTrip = () => {
    if (!booking.tripDate) return false;
    const tripDate = booking.tripDate.seconds ? 
      new Date(booking.tripDate.seconds * 1000) : 
      new Date(booking.tripDate);
    return tripDate < new Date();
  };

  const canCancel = () => {
    return booking.status === 'confirmed' && !isPastTrip();
  };

  return (
    <Card 
      sx={{ 
        borderRadius: 4,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: alpha('primary.main', 0.1), width: 50, height: 50 }}>
              {getVehicleIcon(booking.vehicleType)}
            </Avatar>
            
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                {type === 'created' ? 'Your Trip' : 'Booked Trip'}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  {booking.vehicleType} • {booking.vehicleNumber}
                </Typography>
                {type === 'booked' && booking.bookingSeats && (
                  <Chip
                    size="small"
                    icon={<Person />}
                    label={`${booking.bookingSeats} seat${booking.bookingSeats > 1 ? 's' : ''}`}
                    variant="outlined"
                  />
                )}
              </Stack>
            </Box>
          </Stack>

          <Chip
            icon={getStatusIcon(booking.status)}
            label={booking.status?.toUpperCase() || 'ACTIVE'}
            color={getStatusColor(booking.status)}
            variant="outlined"
          />
        </Stack>

        {/* Route */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            ROUTE
          </Typography>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Avatar sx={{ width: 12, height: 12, bgcolor: 'success.main' }} />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {booking.startLocation}
                </Typography>
              </Stack>
            </Box>
            
            <Box sx={{ px: 2 }}>
              <Route sx={{ color: 'text.disabled', transform: 'rotate(90deg)' }} />
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Avatar sx={{ width: 12, height: 12, bgcolor: 'error.main' }} />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {booking.endLocation}
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </Box>

        {/* Trip Details */}
        <Grid container spacing={2} mb={2}>
          <Grid item xs={6}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <CalendarToday color="action" sx={{ fontSize: 20 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Date
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatDate(booking.tripDate)}
                </Typography>
              </Box>
            </Stack>
          </Grid>

          <Grid item xs={6}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <AccessTime color="action" sx={{ fontSize: 20 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Time
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatTime(booking.tripDate)}
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        {/* Driver/Passenger Info */}
        {type === 'booked' && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              DRIVER
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {booking.driverName} {booking.driverUsername && `(@${booking.driverUsername})`}
            </Typography>
          </Box>
        )}

        {type === 'created' && booking.totalBookings > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              BOOKINGS
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {booking.totalBookings} passenger{booking.totalBookings > 1 ? 's' : ''} booked
            </Typography>
          </Box>
        )}

        {/* Description */}
        {booking.description && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{
              fontStyle: 'italic',
              p: 2,
              bgcolor: alpha(theme.palette.background.default, 0.5),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
            }}>
              "{booking.description}"
            </Typography>
          </Box>
        )}

        {/* Actions */}
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          {type === 'booked' && booking.driverUserId && (
            <Tooltip title="Chat with driver">
              <IconButton 
                size="small"
                onClick={() => onChat(booking.driverUserId, booking.driverName)}
                sx={{ bgcolor: alpha('primary.main', 0.1) }}
              >
                <Chat color="primary" />
              </IconButton>
            </Tooltip>
          )}

          {canCancel() && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<Cancel />}
              onClick={() => onCancel(booking)}
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
          )}

          {booking.status === 'cancelled' && (
            <Chip
              icon={<Warning />}
              label="Cancelled"
              color="error"
              size="small"
            />
          )}

          {isPastTrip() && booking.status === 'confirmed' && (
            <Chip
              icon={<CheckCircle />}
              label="Completed"
              color="success"
              size="small"
            />
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default function MyBookings({ user, onNavigate }) {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [bookedTrips, setBookedTrips] = useState([]);
  const [createdTrips, setCreatedTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelDialog, setCancelDialog] = useState({ open: false, booking: null });
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!user) {
      onNavigate("/auth");
      return;
    }

    loadBookings();
  }, [user, onNavigate]);

  const loadBookings = async () => {
    setLoading(true);
    setError("");

    try {
      // Load trips user has booked
      const bookingsQuery = query(
        collection(db, "bookings"),
        where("userId", "==", user.uid),
        orderBy("bookedAt", "desc")
      );
      const bookingsSnapshot = await getDocs(bookingsQuery);
      
      const bookedTripsData = [];
      for (const bookingDoc of bookingsSnapshot.docs) {
        const booking = { id: bookingDoc.id, ...bookingDoc.data() };
        
        // Get trip details
        try {
          const tripDoc = await getDoc(doc(db, "trips", booking.tripId));
          if (tripDoc.exists()) {
            const trip = tripDoc.data();
            
            // Get driver details
            const driverDoc = await getDoc(doc(db, "users", trip.uploaderId));
            const driver = driverDoc.exists() ? driverDoc.data() : {};
            
            bookedTripsData.push({
              ...booking,
              ...trip,
              tripDate: trip.date,
              driverName: driver.name || "Unknown Driver",
              driverUsername: driver.username,
              driverUserId: trip.uploaderId
            });
          }
        } catch (err) {
          console.error("Error loading trip details:", err);
        }
      }

      // Load trips user has created
      const createdTripsQuery = query(
        collection(db, "trips"),
        where("uploaderId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const createdTripsSnapshot = await getDocs(createdTripsQuery);
      
      const createdTripsData = [];
      for (const tripDoc of createdTripsSnapshot.docs) {
        const trip = { id: tripDoc.id, ...tripDoc.data() };
        
        // Get booking count for this trip
        const tripBookingsQuery = query(
          collection(db, "bookings"),
          where("tripId", "==", tripDoc.id),
          where("status", "!=", "cancelled")
        );
        const tripBookingsSnapshot = await getDocs(tripBookingsQuery);
        
        createdTripsData.push({
          ...trip,
          tripDate: trip.date,
          totalBookings: tripBookingsSnapshot.size,
          status: 'confirmed' // Created trips are always active
        });
      }

      setBookedTrips(bookedTripsData);
      setCreatedTrips(createdTripsData);
    } catch (error) {
      console.error("Error loading bookings:", error);
      setError("Failed to load bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (booking) => {
    setCancelling(true);
    
    try {
      // Update booking status to cancelled
      await updateDoc(doc(db, "bookings", booking.id), {
        status: "cancelled",
        cancelledAt: serverTimestamp()
      });

      // Restore seats if it's a car trip
      if (booking.vehicleType === "Car" && booking.bookingSeats) {
        const tripRef = doc(db, "trips", booking.tripId);
        const tripDoc = await getDoc(tripRef);
        
        if (tripDoc.exists()) {
          const currentSeats = tripDoc.data().seatsAvailable || 0;
          await updateDoc(tripRef, {
            seatsAvailable: currentSeats + booking.bookingSeats
          });
        }
      }

      setCancelDialog({ open: false, booking: null });
      loadBookings(); // Refresh the list
      
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert("Failed to cancel booking. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  const handleChat = (userId, userName) => {
    onNavigate(`/chat/${userId}`, {
      state: {
        user: {
          uid: userId,
          name: userName
        }
      }
    });
  };

  const getTabCounts = () => {
    const activeBooked = bookedTrips.filter(b => b.status !== 'cancelled').length;
    const activeCreated = createdTrips.filter(t => {
      const tripDate = t.tripDate?.seconds ? 
        new Date(t.tripDate.seconds * 1000) : 
        new Date(t.tripDate || 0);
      return tripDate >= new Date();
    }).length;

    return { activeBooked, activeCreated };
  };

  const { activeBooked, activeCreated } = getTabCounts();

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
          Loading your bookings...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 4,
          borderRadius: 4,
          mb: 4,
          textAlign: 'center'
        }}
      >
        <BookmarkAdded sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          My Bookings
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Manage your trips and bookings
        </Typography>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ borderRadius: 3, mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ px: 2 }}
        >
          <Tab
            label={
              <Badge badgeContent={activeBooked} color="primary" sx={{ '& .MuiBadge-badge': { right: -8, top: 4 } }}>
                Booked Trips
              </Badge>
            }
          />
          <Tab
            label={
              <Badge badgeContent={activeCreated} color="secondary" sx={{ '& .MuiBadge-badge': { right: -8, top: 4 } }}>
                My Trips
              </Badge>
            }
          />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        {bookedTrips.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4 }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'grey.100', mx: 'auto', mb: 3 }}>
              <Event sx={{ fontSize: 40, color: 'grey.400' }} />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              No bookings yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Start exploring available trips and book your first ride!
            </Typography>
            <Button
              variant="contained"
              onClick={() => onNavigate('/trips')}
              sx={{ borderRadius: 2 }}
            >
              Find Trips
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {bookedTrips.map((booking) => (
              <Grid item xs={12} key={booking.id}>
                <BookingCard
                  booking={booking}
                  type="booked"
                  onCancel={(booking) => setCancelDialog({ open: true, booking })}
                  onChat={handleChat}
                  theme={theme}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        {createdTrips.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4 }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'grey.100', mx: 'auto', mb: 3 }}>
              <DirectionsCar sx={{ fontSize: 40, color: 'grey.400' }} />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              No trips created
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Create your first trip and start sharing rides with others!
            </Typography>
            <Button
              variant="contained"
              onClick={() => onNavigate('/create-trip')}
              sx={{ borderRadius: 2 }}
            >
              Create Trip
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {createdTrips.map((trip) => (
              <Grid item xs={12} key={trip.id}>
                <BookingCard
                  booking={trip}
                  type="created"
                  onChat={handleChat}
                  theme={theme}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={cancelDialog.open}
        onClose={() => setCancelDialog({ open: false, booking: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Are you sure you want to cancel this booking?
          </Alert>
          {cancelDialog.booking && (
            <Box>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Trip:</strong> {cancelDialog.booking.startLocation} → {cancelDialog.booking.endLocation}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This action cannot be undone. Your seats will be made available for other passengers.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setCancelDialog({ open: false, booking: null })}
            disabled={cancelling}
          >
            Keep Booking
          </Button>
          <Button
            onClick={() => handleCancelBooking(cancelDialog.booking)}
            color="error"
            variant="contained"
            disabled={cancelling}
            sx={{ borderRadius: 2 }}
          >
            {cancelling ? "Cancelling..." : "Cancel Booking"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
