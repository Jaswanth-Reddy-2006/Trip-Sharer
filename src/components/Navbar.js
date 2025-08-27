import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  alpha,
  Stack,
  Chip
} from "@mui/material";
import {
  Logout,
  Menu as MenuIcon,
  Home,
  DirectionsCar,
  Info,
  ContactMail,
  Person,
  BookmarkBorder,
  Close,
  Chat,
  Add
} from "@mui/icons-material";

export default function Navbar({ user, onNavigate, onLogout, profile }) {
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const navigationItems = [
    { label: "Home", path: "/", icon: <Home /> },
    { label: "Find Trips", path: "/trips", icon: <DirectionsCar /> },
    { label: "About", path: "/about", icon: <Info /> },
    { label: "Contact", path: "/contact", icon: <ContactMail /> },
  ];

  const userMenuItems = user ? [
    { label: "Profile", path: "/profile", icon: <Person /> },
    { label: "My Bookings", path: "/my-bookings", icon: <BookmarkBorder /> },
    { label: "Chat", path: "/chat", icon: <Chat /> },
  ] : [];

  const handleProfileMenuOpen = (event) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleNavigation = (path) => {
    onNavigate(path);
    setMobileDrawerOpen(false);
    handleProfileMenuClose();
  };

  const handleLogout = () => {
    onLogout();
    handleProfileMenuClose();
  };

  const toggleMobileDrawer = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const getUserInitial = () => {
    if (profile?.name) {
      return profile.name.charAt(0).toUpperCase();
    }
    if (user?.displayName) {
      return user.displayName.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={1}
        sx={{
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 3 } }}>
          {/* Logo and Brand */}
          <Box 
            display="flex" 
            alignItems="center" 
            sx={{ cursor: 'pointer' }}
            onClick={() => onNavigate("/")}
          >
            <DirectionsCar 
              sx={{ 
                fontSize: { xs: 28, md: 32 }, 
                color: 'primary.main',
                mr: { xs: 1, md: 1.5 }
              }} 
            />
            <Typography
              variant={isSmallMobile ? "h6" : "h5"}
              component="div"
              sx={{
                fontWeight: 800,
                color: 'primary.main',
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: { xs: isSmallMobile ? 'none' : 'block', sm: 'block' }
              }}
            >
              Sharo
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Desktop Navigation */}
          {!isMobile && (
            <Stack direction="row" spacing={1} sx={{ mr: 2 }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  onClick={() => onNavigate(item.path)}
                  startIcon={item.icon}
                  sx={{
                    color: 'text.primary',
                    fontWeight: 500,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      color: 'primary.main'
                    }
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>
          )}

          {/* User Actions */}
          {user ? (
            <Stack direction="row" spacing={1} alignItems="center">
              {/* Create Trip Button - Desktop */}
              {!isMobile && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => onNavigate("/create-trip")}
                  sx={{
                    borderRadius: 3,
                    px: 2,
                    mr: 1,
                    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.2s ease',
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Create Trip
                </Button>
              )}

              {/* Mobile Menu Button */}
              {isMobile && (
                <IconButton
                  color="inherit"
                  onClick={toggleMobileDrawer}
                  sx={{ 
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                    mr: 1
                  }}
                >
                  <MenuIcon />
                </IconButton>
              )}

              {/* Profile Avatar */}
              <IconButton
                onClick={handleProfileMenuOpen}
                sx={{ p: 0 }}
              >
                <Avatar
                  sx={{
                    width: { xs: 36, md: 40 },
                    height: { xs: 36, md: 40 },
                    bgcolor: 'primary.main',
                    fontWeight: 600,
                    fontSize: { xs: '0.9rem', md: '1rem' }
                  }}
                >
                  {getUserInitial()}
                </Avatar>
              </IconButton>

              {/* Profile Menu */}
              <Menu
                anchorEl={profileMenuAnchor}
                open={Boolean(profileMenuAnchor)}
                onClose={handleProfileMenuClose}
                onClick={handleProfileMenuClose}
                PaperProps={{
                  elevation: 8,
                  sx: {
                    borderRadius: 2,
                    mt: 1.5,
                    minWidth: 200,
                    '& .MuiMenuItem-root': {
                      borderRadius: 1,
                      mx: 1,
                      my: 0.5
                    }
                  }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                {/* User Info */}
                <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {profile?.name || user?.displayName || "User"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>
                  {profile?.username && (
                    <Chip 
                      label={`@${profile.username}`}
                      size="small"
                      variant="outlined"
                      sx={{ mt: 0.5, fontSize: '0.7rem' }}
                    />
                  )}
                </Box>

                {/* Mobile Navigation Items in Profile Menu - Only on Mobile */}
                {isMobile && (
                  <>
                    {navigationItems.map((item) => (
                      <MenuItem
                        key={item.path}
                        onClick={() => handleNavigation(item.path)}
                        sx={{ gap: 2 }}
                      >
                        {item.icon}
                        <Typography variant="body2">{item.label}</Typography>
                      </MenuItem>
                    ))}
                    <Divider sx={{ my: 1 }} />
                  </>
                )}

                {/* User Menu Items */}
                {userMenuItems.map((item) => (
                  <MenuItem
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    sx={{ gap: 2 }}
                  >
                    {item.icon}
                    <Typography variant="body2">{item.label}</Typography>
                  </MenuItem>
                ))}

                <Divider sx={{ my: 1 }} />
                
                <MenuItem onClick={handleLogout} sx={{ gap: 2, color: 'error.main' }}>
                  <Logout />
                  <Typography variant="body2">Logout</Typography>
                </MenuItem>
              </Menu>
            </Stack>
          ) : (
            <Stack direction="row" spacing={1} alignItems="center">
              {/* Mobile Menu Button for non-logged in users */}
              {isMobile && (
                <IconButton
                  color="inherit"
                  onClick={toggleMobileDrawer}
                  sx={{ 
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main'
                  }}
                >
                  <MenuIcon />
                </IconButton>
              )}

              {/* Login Button for Desktop */}
              {!isMobile && (
                <Button
                  variant="contained"
                  onClick={() => onNavigate("/auth")}
                  sx={{
                    borderRadius: 3,
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    textTransform: 'none',
                    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  Login
                </Button>
              )}
            </Stack>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileDrawerOpen}
        onClose={toggleMobileDrawer}
        PaperProps={{
          sx: {
            width: { xs: '85%', sm: 320 },
            borderRadius: '16px 0 0 16px',
            bgcolor: 'background.paper'
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          {/* Header */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Navigation
            </Typography>
            <IconButton 
              onClick={toggleMobileDrawer}
              sx={{ 
                bgcolor: alpha(theme.palette.error.main, 0.1),
                color: 'error.main'
              }}
            >
              <Close />
            </IconButton>
          </Stack>

          <List sx={{ p: 0 }}>
            {/* Navigation Items */}
            {navigationItems.map((item) => (
              <ListItem
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08)
                  },
                  cursor: 'pointer'
                }}
              >
                <ListItemIcon sx={{ color: 'primary.main', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItem>
            ))}

            <Divider sx={{ my: 2 }} />

            {/* Create Trip Button - Mobile */}
            {user && (
              <ListItem
                onClick={() => handleNavigation("/create-trip")}
                sx={{
                  borderRadius: 2,
                  mb: 2,
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark'
                  },
                  cursor: 'pointer'
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                  <Add />
                </ListItemIcon>
                <ListItemText 
                  primary="Create Trip"
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
              </ListItem>
            )}

            {/* Login/User Actions */}
            {!user ? (
              <ListItem
                onClick={() => handleNavigation("/auth")}
                sx={{
                  borderRadius: 2,
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark'
                  },
                  cursor: 'pointer'
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                  <Person />
                </ListItemIcon>
                <ListItemText 
                  primary="Login"
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
              </ListItem>
            ) : (
              <>
                {/* User Info in Mobile Drawer */}
                <Box 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    mb: 2
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        width: 48,
                        height: 48,
                        fontWeight: 600
                      }}
                    >
                      {getUserInitial()}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {profile?.name || user?.displayName || "User"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {user?.email}
                      </Typography>
                      {profile?.username && (
                        <Chip 
                          label={`@${profile.username}`}
                          size="small"
                          variant="outlined"
                          sx={{ mt: 0.5, fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                  </Stack>
                </Box>

                {/* User Menu Items */}
                {userMenuItems.map((item) => (
                  <ListItem
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08)
                      },
                      cursor: 'pointer'
                    }}
                  >
                    <ListItemIcon sx={{ color: 'primary.main', minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.label}
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </ListItem>
                ))}

                <Divider sx={{ my: 2 }} />

                {/* Logout */}
                <ListItem
                  onClick={handleLogout}
                  sx={{
                    borderRadius: 2,
                    color: 'error.main',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.error.main, 0.08)
                    },
                    cursor: 'pointer'
                  }}
                >
                  <ListItemIcon sx={{ color: 'error.main', minWidth: 40 }}>
                    <Logout />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Logout"
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
}