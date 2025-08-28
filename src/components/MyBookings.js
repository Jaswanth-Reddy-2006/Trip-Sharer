import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Alert,
  Chip,
  Grid,
  Stack,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  alpha,
  useTheme,
  useMediaQuery,
  Paper,
  Skeleton,
  Tooltip,
  Badge,
  Fade,
  Tabs,
  Tab
} from "@mui/material";
import {
  DirectionsCar,
  TwoWheeler,
  Schedule,
  LocationOn,
  Cancel,
  Chat,
  Phone,
  Star,
  Info,
  Receipt,
  Navigation,
  CheckCircle,
  ErrorOutline,
  AccessTime,
  Person,
  Route,
  Payment,
  History,
  Refresh,
  Event,
  EventAvailable,
  Edit,
  Visibility
} from "@mui/icons-material";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  serverTimestamp,
  addDoc
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function MyBookings({ user, onNavigate }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  const [bookings, setBookings] = useState([]);
  const [createdTrips, setCreatedTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [tabValue, setTabValue] = useState(0); // 0 = bookings, 1 = created trips
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    if (!user || !user.uid) {
      console.error("User is undefined or missing uid:", user);
      onNavigate("/auth");
      return;
    }
    loadData();
  }, [user, onNavigate]);

  const loadData = async (isRefresh = false) => {
    if (!user || !user.uid) {
      console.error("Cannot load data: user is undefined");
      setError("User authentication error. Please log in again.");
      setLoading(false);
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      // Load bookings (trips user booked)
      await loadBookings();
      // Load created trips (trips user created)
      await loadCreatedTrips();
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadBookings = async () => {
    try {
      const bookingsQuery = query(
        collection(db, "bookings"),
        where("userId", "==", user.uid)
      );
      const bookingsSnapshot = await getDocs(bookingsQuery);
      const bookingsData = [];

      for (const bookingDoc of bookingsSnapshot.docs) {
        const booking = { id: bookingDoc.id, ...bookingDoc.data() };
        
        if (booking.tripId) {
          try {
            const tripDoc = await getDoc(doc(db, "trips", booking.tripId));
            if (tripDoc.exists()) {
              booking.trip = tripDoc.data();
              
              if (booking.trip && booking.trip.uploaderId) {
                const driverDoc = await getDoc(doc(db, "users", booking.trip.uploaderId));
                if (driverDoc.exists()) {
                  booking.driver = driverDoc.data();
                }
              }
            }
          } catch (err) {
            console.error("Error fetching trip details:", err);
          }
        }
        
        bookingsData.push(booking);
      }

      // Auto-update trip status based on time
      const now = new Date();
      const updatedBookings = bookingsData.map(booking => {
        if (booking.trip && booking.trip.date && booking.status === 'confirmed') {
          const tripDate = booking.trip.date.seconds 
            ? new Date(booking.trip.date.seconds * 1000) 
            : new Date(booking.trip.date);
          
          const twelveHoursAfterTrip = new Date(tripDate.getTime() + (12 * 60 * 60 * 1000));
          
          if (now >= twelveHoursAfterTrip) {
            booking.status = 'completed';
            updateDoc(doc(db, "bookings", booking.id), {
              status: 'completed',
              completedAt: serverTimestamp()
            }).catch(console.error);
          }
        }
        return booking;
      });

      updatedBookings.sort((a, b) => {
        const aTime = a.bookedAt?.seconds || 0;
        const bTime = b.bookedAt?.seconds || 0;
        return bTime - aTime;
      });

      setBookings(updatedBookings);
    } catch (error) {
      console.error("Error loading bookings:", error);
      throw error;
    }
  };

  const loadCreatedTrips = async () => {
    try {
      const tripsQuery = query(
        collection(db, "trips"),
        where("uploaderId", "==", user.uid)
      );
      const tripsSnapshot = await getDocs(tripsQuery);
      const tripsData = [];

      for (const tripDoc of tripsSnapshot.docs) {
        const trip = { id: tripDoc.id, ...tripDoc.data() };
        
        // Get bookings for this trip
        const bookingsQuery = query(
          collection(db, "bookings"),
          where("tripId", "==", tripDoc.id),
          where("status", "!=", "cancelled")
        );
        const bookingsSnapshot = await getDocs(bookingsQuery);
        
        trip.bookings = bookingsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Calculate available seats
        if (trip.vehicleType === "Car" && trip.seatsAvailable) {
          const bookedSeats = trip.bookings.reduce((sum, booking) => 
            sum + (booking.bookingSeats || 0), 0
          );
          trip.currentAvailableSeats = Math.max(0, trip.seatsAvailable - bookedSeats);
        }

        tripsData.push(trip);
      }

      tripsData.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });

      setCreatedTrips(tripsData);
    } catch (error) {
      console.error("Error loading created trips:", error);
      throw error;
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking || !user || !user.uid) return;

    setCancelling(true);
    try {
      await updateDoc(doc(db, "bookings", selectedBooking.id), {
        status: "cancelled",
        cancelledAt: serverTimestamp()
      });

      if (selectedBooking.trip?.vehicleType === "Car" && selectedBooking.bookingSeats) {
        const tripRef = doc(db, "trips", selectedBooking.tripId);
        const currentTrip = await getDoc(tripRef);
        if (currentTrip.exists()) {
          await updateDoc(tripRef, {
            seatsAvailable: currentTrip.data().seatsAvailable + selectedBooking.bookingSeats
          });
        }
      }

      if (selectedBooking.driver && selectedBooking.trip) {
        const userName = user.displayName || user.email || "User";
        const notificationData = {
          userId: selectedBooking.trip.uploaderId,
          type: 'cancellation',
          title: 'Booking Cancelled',
          message: `${userName} cancelled their booking for your trip from ${selectedBooking.pickupLocation || 'Unknown'} to ${selectedBooking.dropLocation || 'Unknown'}`,
          tripId: selectedBooking.tripId,
          bookerId: user.uid,
          createdAt: serverTimestamp(),
          read: false
        };
        await addDoc(collection(db, "notifications"), notificationData);
      }

      await loadData();
      setCancelDialogOpen(false);
      setSelectedBooking(null);
    } catch (error) {
      console.error("Error cancelling booking:", error);
      setError("Failed to cancel booking. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    try {
      const dt = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
      return dt.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        weekday: "short"
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  const formatTime = (date) => {
    if (!date) return "N/A";
    try {
      const dt = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
      return dt.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    } catch (error) {
      console.error("Error formatting time:", error);
      return "Invalid Time";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed": return "success";
      case "cancelled": return "error";
      case "completed": return "info";
      case "active": return "primary";
      default: return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed": return <CheckCircle />;
      case "cancelled": return <ErrorOutline />;
      case "completed": return <EventAvailable />;
      case "active": return <CheckCircle />;
      default: return <Info />;
    }
  };

  const getVehicleIcon = (vehicleType) => {
    switch (vehicleType) {
      case "Car": return <DirectionsCar />;
      case "Bike":
      case "Scooter": return <TwoWheeler />;
      default: return <DirectionsCar />;
    }
  };

  const calculateFare = (distance) => {
    if (!distance || isNaN(parseFloat(distance))) return "N/A";
    const fare = parseFloat(distance) * 2.5;
    return `₹${fare.toFixed(2)}`;
  };

  const isUpcomingTrip = (tripDate) => {
    if (!tripDate) return false;
    try {
      const dt = tripDate.seconds ? new Date(tripDate.seconds * 1000) : new Date(tripDate);
      return dt > new Date();
    } catch (error) {
      console.error("Error checking if trip is upcoming:", error);
      return false;
    }
  };

  const isTripCompleted = (tripDate) => {
    if (!tripDate) return false;
    try {
      const dt = tripDate.seconds ? new Date(tripDate.seconds * 1000) : new Date(tripDate);
      const now = new Date();
      const twelveHoursAfterTrip = new Date(dt.getTime() + (12 * 60 * 60 * 1000));
      return now >= twelveHoursAfterTrip;
    } catch (error) {
      console.error("Error checking trip completion:", error);
      return false;
    }
  };

  const getTimeUntilTrip = (tripDate) => {
    if (!tripDate) return "";
    try {
      const dt = tripDate.seconds ? new Date(tripDate.seconds * 1000) : new Date(tripDate);
      const now = new Date();
      const diffTime = dt.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffTime < 0) return "Past trip";
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Tomorrow";
      if (diffDays < 7) return `In ${diffDays} days`;
      return `In ${Math.ceil(diffDays / 7)} week${diffDays >= 14 ? 's' : ''}`;
    } catch (error) {
      console.error("Error calculating time until trip:", error);
      return "Unknown";
    }
  };

  // ✅ FIX: Safe user initial function
  const getUserInitial = () => {
    if (user?.displayName && user.displayName.length > 0) {
      return user.displayName.charAt(0).toUpperCase();
    }
    if (user?.email && user.email.length > 0) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          My Dashboard
        </Typography>
        {[1, 2, 3].map((n) => (
          <Skeleton key={n} variant="rectangular" height={200} sx={{ mb: 2, borderRadius: 2 }} />
        ))}
      </Container>
    );
  }

  if (!user || !user.uid) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          User authentication error. Please log in again.
          <Button onClick={() => onNavigate("/auth")} sx={{ ml: 2 }} variant="outlined">
            Go to Login
          </Button>
        </Alert>
      </Container>
    );
  }

  const currentData = tabValue === 0 ? bookings : createdTrips;

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            My Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {tabValue === 0 ? "Track and manage your trip bookings" : "Manage trips you've created"}
          </Typography>
        </Box>
        
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button
            onClick={() => loadData(true)}
            disabled={refreshing}
            variant="outlined"
            startIcon={refreshing ? <CircularProgress size={16} /> : <Refresh />}
            sx={{ borderRadius: 2 }}
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          
          <Button
            onClick={() => onNavigate('/trips')}
            variant="contained"
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)',
              },
            }}
          >
            Find New Trips
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <Button onClick={() => loadData()} size="small">Retry</Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* ✅ NEW: Tabs for Bookings vs Created Trips */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab 
            icon={<Receipt />} 
            label={`My Bookings (${bookings.length})`} 
            sx={{ textTransform: 'none', fontWeight: 500 }}
          />
          <Tab 
            icon={<DirectionsCar />} 
            label={`My Trips (${createdTrips.length})`} 
            sx={{ textTransform: 'none', fontWeight: 500 }}
          />
        </Tabs>
      </Box>

      {currentData.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="h5" gutterBottom>
            {tabValue === 0 ? "No Bookings Yet" : "No Trips Created Yet"}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {tabValue === 0 
              ? "You haven't booked any trips yet. Explore available rides and start your journey!"
              : "You haven't created any trips yet. Share your ride and help others travel!"
            }
          </Typography>
          <Button
            onClick={() => onNavigate(tabValue === 0 ? '/trips' : '/create-trip')}
            variant="contained"
            size="large"
            sx={{
              borderRadius: 3,
              px: { xs: 3, md: 4 },
              py: 1.5,
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)',
              },
            }}
          >
            {tabValue === 0 ? "Find Rides" : "Create Trip"}
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {/* ✅ BOOKINGS TAB */}
          {tabValue === 0 && bookings.map((booking, index) => (
            <Grid item xs={12} key={`booking-${booking.id}-${index}`}>
              <Card 
                elevation={2} 
                sx={{ 
                  borderRadius: 3,
                  transition: 'all 0.2s ease',
                  '&:hover': { 
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[4]
                  }
                }}
              >
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  {/* Status Badge */}
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Chip
                      icon={getStatusIcon(booking.status)}
                      label={booking.status === 'completed' ? 'Trip Completed' : booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      color={getStatusColor(booking.status)}
                      variant="filled"
                      sx={{ fontWeight: 'medium' }}
                    />
                    
                    {booking.status === 'completed' && (
                      <Chip
                        icon={<EventAvailable />}
                        label="Journey Complete"
                        color="success"
                        variant="outlined"
                        size="small"
                      />
                    )}
                  </Box>

                  <Grid container spacing={3}>
                    {/* Vehicle and Time Info */}
                    <Grid item xs={12} md={4}>
                      <Stack spacing={1}>
                        <Box display="flex" alignItems="center" gap={1}>
                          {getVehicleIcon(booking.trip?.vehicleType)}
                          <Typography variant="h6" fontWeight="medium">
                            {booking.trip?.vehicleType || 'Unknown'} - {booking.trip?.vehicleNumber || 'Unknown'}
                          </Typography>
                        </Box>
                        
                        {booking.trip?.vehicleModel && (
                          <Typography variant="body2" color="text.secondary">
                            {booking.trip.vehicleModel}
                          </Typography>
                        )}

                        {isUpcomingTrip(booking.trip?.date) && booking.status === "confirmed" && (
                          <Chip
                            icon={<AccessTime />}
                            label={getTimeUntilTrip(booking.trip?.date)}
                            color="warning"
                            variant="outlined"
                            size="small"
                          />
                        )}
                      </Stack>
                    </Grid>

                    {/* Journey Information */}
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        Your Journey
                      </Typography>
                      <Stack spacing={1}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">From</Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {booking.pickupLocation || 'Not specified'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">To</Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {booking.dropLocation || 'Not specified'}
                          </Typography>
                        </Box>
                      </Stack>

                      {booking.estimatedDistance && (
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          <Chip
                            icon={<Route />}
                            label={`${booking.estimatedDistance} km`}
                            variant="outlined"
                            size="small"
                          />
                          <Chip
                            icon={<Payment />}
                            label={calculateFare(booking.estimatedDistance)}
                            color="success"
                            variant="outlined"
                            size="small"
                          />
                        </Stack>
                      )}
                    </Grid>

                    {/* Trip and Driver Info */}
                    <Grid item xs={12} md={4}>
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="subtitle2" color="primary" gutterBottom>
                            Trip Schedule
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {formatDate(booking.trip?.date)} at {formatTime(booking.trip?.date)}
                          </Typography>
                        </Box>

                        {booking.driver && (
                          <Box>
                            <Typography variant="subtitle2" color="primary" gutterBottom>
                              Driver
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {booking.driver.name || 'Unknown Driver'}
                            </Typography>
                            {booking.driver.username && (
                              <Typography variant="body2" color="text.secondary">
                                @{booking.driver.username}
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Stack>
                    </Grid>
                  </Grid>

                  {/* Action Buttons */}
                  <Divider sx={{ my: 2 }} />
                  
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    {booking.status === "confirmed" && booking.driver && !isTripCompleted(booking.trip?.date) && (
                      <>
                        <Button
                          onClick={() => {
                            if (navigate && booking.driver?.uid) {
                              navigate(`/chat/${booking.driver.uid}`, {
                                state: {
                                  user: {
                                    uid: booking.driver.uid,
                                    name: booking.driver.name || 'Driver',
                                    tripId: booking.tripId
                                  }
                                }
                              });
                            }
                          }}
                          startIcon={<Chat />}
                          variant="outlined"
                          size="small"
                          sx={{ borderRadius: 2 }}
                        >
                          Chat Driver
                        </Button>

                        {booking.driver.phone && (
                          <Button
                            onClick={() => window.open(`tel:${booking.driver.phone}`, '_self')}
                            startIcon={<Phone />}
                            variant="outlined"
                            size="small"
                            sx={{ borderRadius: 2 }}
                          >
                            Call
                          </Button>
                        )}

                        {isUpcomingTrip(booking.trip?.date) && (
                          <Button
                            onClick={() => {
                              setSelectedBooking(booking);
                              setCancelDialogOpen(true);
                            }}
                            startIcon={<Cancel />}
                            color="error"
                            variant="outlined"
                            size="small"
                            sx={{ borderRadius: 2 }}
                          >
                            Cancel
                          </Button>
                        )}
                      </>
                    )}

                    {booking.status === "completed" && (
                      <Button
                        onClick={() => {
                          alert("Rating system coming soon!");
                        }}
                        startIcon={<Star />}
                        variant="outlined"
                        color="primary"
                        size="small"
                        sx={{ borderRadius: 2 }}
                      >
                        Rate Trip
                      </Button>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {/* ✅ CREATED TRIPS TAB */}
          {tabValue === 1 && createdTrips.map((trip, index) => (
            <Grid item xs={12} key={`trip-${trip.id}-${index}`}>
              <Card 
                elevation={2} 
                sx={{ 
                  borderRadius: 3,
                  transition: 'all 0.2s ease',
                  '&:hover': { 
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[4]
                  }
                }}
              >
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  {/* Status Badge */}
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Chip
                      icon={getStatusIcon(trip.status || 'active')}
                      label="Active Trip"
                      color="primary"
                      variant="filled"
                      sx={{ fontWeight: 'medium' }}
                    />
                    
                    <Chip
                      label={`${trip.bookings?.length || 0} booking${trip.bookings?.length !== 1 ? 's' : ''}`}
                      color="info"
                      variant="outlined"
                      size="small"
                    />
                  </Box>

                  <Grid container spacing={3}>
                    {/* Vehicle Info */}
                    <Grid item xs={12} md={4}>
                      <Stack spacing={1}>
                        <Box display="flex" alignItems="center" gap={1}>
                          {getVehicleIcon(trip.vehicleType)}
                          <Typography variant="h6" fontWeight="medium">
                            {trip.vehicleType} - {trip.vehicleNumber}
                          </Typography>
                        </Box>
                        
                        {trip.vehicleModel && (
                          <Typography variant="body2" color="text.secondary">
                            {trip.vehicleModel}
                          </Typography>
                        )}

                        {trip.vehicleType === "Car" && trip.currentAvailableSeats !== undefined && (
                          <Chip
                            icon={<Person />}
                            label={`${trip.currentAvailableSeats}/${trip.seatsAvailable} seats available`}
                            color={trip.currentAvailableSeats > 0 ? "success" : "error"}
                            variant="outlined"
                            size="small"
                          />
                        )}
                      </Stack>
                    </Grid>

                    {/* Route Information */}
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        Route
                      </Typography>
                      <Stack spacing={1}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">From</Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {trip.startLocation}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">To</Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {trip.endLocation}
                          </Typography>
                        </Box>
                      </Stack>

                      {trip.estimatedDistance && (
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          <Chip
                            icon={<Route />}
                            label={`${trip.estimatedDistance} km`}
                            variant="outlined"
                            size="small"
                          />
                        </Stack>
                      )}
                    </Grid>

                    {/* Trip Details */}
                    <Grid item xs={12} md={4}>
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="subtitle2" color="primary" gutterBottom>
                            Departure
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {formatDate(trip.date)} at {formatTime(trip.date)}
                          </Typography>
                        </Box>

                        {trip.description && (
                          <Box>
                            <Typography variant="subtitle2" color="primary" gutterBottom>
                              Description
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {trip.description}
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </Grid>
                  </Grid>

                  {/* Passengers List */}
                  {trip.bookings && trip.bookings.length > 0 && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        Passengers ({trip.bookings.length})
                      </Typography>
                      <Grid container spacing={1}>
                        {trip.bookings.map((booking, idx) => (
                          <Grid item xs={12} sm={6} md={4} key={booking.id}>
                            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                              <Typography variant="body2" fontWeight="medium">
                                Passenger {idx + 1}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {booking.pickupLocation} → {booking.dropLocation}
                              </Typography>
                              {booking.bookingSeats && (
                                <Typography variant="body2" color="text.secondary">
                                  {booking.bookingSeats} seat{booking.bookingSeats > 1 ? 's' : ''}
                                </Typography>
                              )}
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    </>
                  )}

                  {/* Action Buttons */}
                  <Divider sx={{ my: 2 }} />
                  
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button
                      onClick={() => onNavigate(`/trip-details/${trip.id}`)}
                      startIcon={<Visibility />}
                      variant="outlined"
                      size="small"
                      sx={{ borderRadius: 2 }}
                    >
                      View Details
                    </Button>
                    
                    {trip.bookings && trip.bookings.length > 0 && (
                      <Button
                        onClick={() => onNavigate('/chat')}
                        startIcon={<Chat />}
                        variant="outlined"
                        size="small"
                        sx={{ borderRadius: 2 }}
                      >
                        Chat with Passengers
                      </Button>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog 
        open={cancelDialogOpen} 
        onClose={() => !cancelling && setCancelDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel this booking? This action cannot be undone.
          </Typography>
          
          {selectedBooking && (
            <Box sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.info.main, 0.1), borderRadius: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Booking Details:</Typography>
              <Typography variant="body2">• From: {selectedBooking.pickupLocation || 'Not specified'}</Typography>
              <Typography variant="body2">• To: {selectedBooking.dropLocation || 'Not specified'}</Typography>
              <Typography variant="body2">• Date: {formatDate(selectedBooking.trip?.date)}</Typography>
              
              {selectedBooking.trip?.vehicleType === "Car" && selectedBooking.bookingSeats && (
                <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                  Your {selectedBooking.bookingSeats} seat(s) will be restored and available for other passengers.
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setCancelDialogOpen(false)}
            disabled={cancelling}
            sx={{ borderRadius: 2 }}
          >
            Keep Booking
          </Button>
          <Button 
            onClick={handleCancelBooking}
            disabled={cancelling}
            color="error"
            variant="contained"
            startIcon={cancelling ? <CircularProgress size={16} /> : null}
            sx={{ borderRadius: 2 }}
          >
            {cancelling ? "Cancelling..." : "Cancel Booking"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
