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
  Fade
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
  Refresh
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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  // Add comprehensive user validation
  useEffect(() => {
    if (!user || !user.uid) {
      console.error("User is undefined or missing uid:", user);
      onNavigate("/auth");
      return;
    }

    loadBookings();
  }, [user, onNavigate]);

  const loadBookings = async (isRefresh = false) => {
    // Early return if user is not properly defined
    if (!user || !user.uid) {
      console.error("Cannot load bookings: user is undefined");
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
      // Get user's bookings with proper error handling
      const bookingsQuery = query(
        collection(db, "bookings"),
        where("userId", "==", user.uid)
      );
      
      const bookingsSnapshot = await getDocs(bookingsQuery);
      const bookingsData = [];

      for (const bookingDoc of bookingsSnapshot.docs) {
        const booking = { id: bookingDoc.id, ...bookingDoc.data() };
        
        // Get trip details with proper error handling
        if (booking.tripId) {
          try {
            const tripDoc = await getDoc(doc(db, "trips", booking.tripId));
            if (tripDoc.exists()) {
              booking.trip = tripDoc.data();
              
              // Get driver details with null checks
              if (booking.trip && booking.trip.uploaderId) {
                const driverDoc = await getDoc(doc(db, "users", booking.trip.uploaderId));
                if (driverDoc.exists()) {
                  booking.driver = driverDoc.data();
                }
              }
            }
          } catch (err) {
            console.error("Error fetching trip details:", err);
            // Continue processing other bookings even if one fails
          }
        }
        bookingsData.push(booking);
      }

      // Sort by booking date (most recent first)
      bookingsData.sort((a, b) => {
        const aTime = a.bookedAt?.seconds || 0;
        const bTime = b.bookedAt?.seconds || 0;
        return bTime - aTime;
      });

      setBookings(bookingsData);
    } catch (error) {
      console.error("Error loading bookings:", error);
      setError("Failed to load bookings. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking || !user || !user.uid) return;

    setCancelling(true);
    try {
      // Update booking status
      await updateDoc(doc(db, "bookings", selectedBooking.id), {
        status: "cancelled",
        cancelledAt: serverTimestamp()
      });

      // Restore seats if it's a car booking
      if (selectedBooking.trip?.vehicleType === "Car" && selectedBooking.bookingSeats) {
        const tripRef = doc(db, "trips", selectedBooking.tripId);
        const currentTrip = await getDoc(tripRef);
        if (currentTrip.exists()) {
          await updateDoc(tripRef, {
            seatsAvailable: currentTrip.data().seatsAvailable + selectedBooking.bookingSeats
          });
        }
      }

      // Create notification for driver with proper null checks
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

      // Refresh bookings
      await loadBookings();
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
      default: return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed": return <CheckCircle />;
      case "cancelled": return <ErrorOutline />;
      case "completed": return <CheckCircle />;
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
    const fare = parseFloat(distance) * 2.5; // ₹2.5 per km
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

  const filteredBookings = bookings.filter(booking => {
    if (filterStatus === "all") return true;
    if (filterStatus === "upcoming") return booking.status === "confirmed" && isUpcomingTrip(booking.trip?.date);
    if (filterStatus === "past") return booking.status === "completed" || !isUpcomingTrip(booking.trip?.date);
    return booking.status === filterStatus;
  });

  // Show loading with better error handling
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Bookings
        </Typography>
        {[1, 2, 3].map((n) => (
          <Skeleton key={n} variant="rectangular" height={200} sx={{ mb: 2, borderRadius: 2 }} />
        ))}
      </Container>
    );
  }

  // Early return if user is not properly defined
  if (!user || !user.uid) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          User authentication error. Please log in again.
        </Alert>
        <Button variant="contained" onClick={() => onNavigate("/auth")}>
          Go to Login
        </Button>
      </Container>
    );
  }

  return (
    <>
      {/* Header */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" gutterBottom fontWeight={700}>
              My Bookings
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track and manage your trip bookings
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              onClick={() => loadBookings(true)}
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
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            <Button onClick={() => loadBookings()}>Retry</Button>
            {error}
          </Alert>
        )}

        {/* Filter Chips */}
        {bookings.length > 0 && (
          <Stack direction="row" spacing={1} mb={3} flexWrap="wrap">
            {[
              { key: "all", label: "All Bookings", count: bookings.length },
              { key: "upcoming", label: "Upcoming", count: bookings.filter(b => b.status === "confirmed" && isUpcomingTrip(b.trip?.date)).length },
              { key: "completed", label: "Completed", count: bookings.filter(b => b.status === "completed").length },
              { key: "cancelled", label: "Cancelled", count: bookings.filter(b => b.status === "cancelled").length }
            ].map((filter) => (
              <Chip
                key={filter.key}
                label={`${filter.label} (${filter.count})`}
                onClick={() => setFilterStatus(filter.key)}
                color={filterStatus === filter.key ? "primary" : "default"}
                variant={filterStatus === filter.key ? "filled" : "outlined"}
                sx={{ borderRadius: 2 }}
              />
            ))}
          </Stack>
        )}

        {filteredBookings.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
            {bookings.length === 0 ? (
              <>
                <LocationOn sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  No Bookings Yet
                </Typography>
                <Typography variant="body1" color="text.secondary" mb={3}>
                  You haven't booked any trips yet. Explore available rides and start your journey!
                </Typography>
                <Button
                  onClick={() => onNavigate('/trips')}
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
                  Find Rides
                </Button>
              </>
            ) : (
              <>
                <Info sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No {filterStatus} bookings found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try selecting a different filter to see your bookings.
                </Typography>
              </>
            )}
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredBookings.map((booking, index) => (
              <Grid item xs={12} key={booking.id}>
                <Card
                  elevation={2}
                  sx={{
                    borderRadius: 3,
                    overflow: 'visible',
                    position: 'relative',
                    '&:hover': {
                      boxShadow: theme.shadows[6],
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* Status Badge */}
                    <Chip
                      icon={getStatusIcon(booking.status)}
                      label={booking.status?.charAt(0)?.toUpperCase() + booking.status?.slice(1) || 'Unknown'}
                      color={getStatusColor(booking.status)}
                      variant="filled"
                      size="small"
                      sx={{ position: 'absolute', top: 16, right: 16 }}
                    />

                    {/* Vehicle and Time Info */}
                    <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                      {getVehicleIcon(booking.trip?.vehicleType)}
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          {booking.trip?.vehicleType || 'Unknown'} - {booking.trip?.vehicleNumber || 'Unknown'}
                        </Typography>
                        {booking.trip?.vehicleModel && (
                          <Chip label={booking.trip.vehicleModel} size="small" variant="outlined" />
                        )}
                      </Box>
                      {isUpcomingTrip(booking.trip?.date) && booking.status === "confirmed" && (
                        <Chip
                          icon={<Schedule />}
                          label={getTimeUntilTrip(booking.trip?.date)}
                          color="warning"
                          variant="outlined"
                          size="small"
                        />
                      )}
                    </Stack>

                    <Grid container spacing={3}>
                      {/* Journey Information */}
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Your Journey
                        </Typography>
                        <Stack spacing={1}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <LocationOn color="success" fontSize="small" />
                            <Typography variant="body2" fontWeight={500}>
                              From
                            </Typography>
                          </Box>
                          <Typography variant="body1" sx={{ ml: 3, mb: 1 }}>
                            {booking.pickupLocation || 'Not specified'}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1}>
                            <LocationOn color="error" fontSize="small" />
                            <Typography variant="body2" fontWeight={500}>
                              To
                            </Typography>
                          </Box>
                          <Typography variant="body1" sx={{ ml: 3 }}>
                            {booking.dropLocation || 'Not specified'}
                          </Typography>
                        </Stack>

                        {/* Fare and Distance */}
                        {booking.estimatedDistance && (
                          <Stack direction="row" spacing={1} mt={2}>
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
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Trip Schedule
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {formatDate(booking.trip?.date)} at {formatTime(booking.trip?.date)}
                        </Typography>

                        {booking.driver && (
                          <>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                              Driver
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Person fontSize="small" />
                              <Typography variant="body1">
                                {booking.driver.name || 'Unknown Driver'}
                              </Typography>
                            </Stack>
                            {booking.driver.username && (
                              <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
                                @{booking.driver.username}
                              </Typography>
                            )}
                          </>
                        )}

                        {booking.trip?.vehicleType === "Car" && booking.bookingSeats && (
                          <Chip
                            icon={<Person />}
                            label={`${booking.bookingSeats} seat${booking.bookingSeats > 1 ? 's' : ''} booked`}
                            color="info"
                            variant="outlined"
                            size="small"
                            sx={{ mb: 2 }}
                          />
                        )}
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    {/* Action Buttons */}
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                      {booking.status === "confirmed" && booking.driver && (
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
                          variant="outlined"
                          size="small"
                          sx={{ borderRadius: 2 }}
                          onClick={() => {
                            // TODO: Implement rating system
                            alert("Rating system coming soon!");
                          }}
                        >
                          Rate Trip
                        </Button>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

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
          <Typography gutterBottom>
            Are you sure you want to cancel this booking? This action cannot be undone.
          </Typography>
          {selectedBooking && (
            <Box mt={2}>
              <Typography variant="subtitle2" gutterBottom>
                Booking Details:
              </Typography>
              <Typography variant="body2">
                • From: {selectedBooking.pickupLocation || 'Not specified'}
              </Typography>
              <Typography variant="body2">
                • To: {selectedBooking.dropLocation || 'Not specified'}
              </Typography>
              <Typography variant="body2">
                • Date: {formatDate(selectedBooking.trip?.date)}
              </Typography>
              {selectedBooking.trip?.vehicleType === "Car" && selectedBooking.bookingSeats && (
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Your {selectedBooking.bookingSeats} seat(s) will be restored and available for other passengers.
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setCancelDialogOpen(false)}
            disabled={cancelling}
            sx={{ borderRadius: 2 }}
          >
            Keep Booking
          </Button>
          <Button
            onClick={handleCancelBooking}
            color="error"
            variant="contained"
            disabled={cancelling}
            startIcon={cancelling ? <CircularProgress size={16} /> : null}
            sx={{ borderRadius: 2 }}
          >
            {cancelling ? "Cancelling..." : "Cancel Booking"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}