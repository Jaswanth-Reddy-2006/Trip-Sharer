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
  ListItemButton,
  Divider
} from "@mui/material";
import { 
  Logout, 
  Menu as MenuIcon,
  Home,
  DirectionsCar,
  Info,
  ContactMail,
  Person,
  BookmarkBorder
} from "@mui/icons-material";

export default function Navbar({ user, onNavigate, onLogout, darkMode, onToggleTheme }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const open = Boolean(anchorEl);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const navigationItems = [
    { label: "Home", path: "/", icon: <Home /> },
    { label: "Trips", path: "/trips", icon: <DirectionsCar /> },
    { label: "About", path: "/about", icon: <Info /> },
    { label: "Contact", path: "/contact", icon: <ContactMail /> },
  ];

  const userMenuItems = user ? [
    { label: "Profile", path: "/profile", icon: <Person /> },
    { label: "My Bookings", path: "/my-bookings", icon: <BookmarkBorder /> },
  ] : [];

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
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

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          color: 'text.primary'
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
          {/* Logo and Brand */}
          <Box 
            display="flex" 
            alignItems="center" 
            sx={{ cursor: 'pointer' }}
            onClick={() => onNavigate("/")}
          >
            <Box
              component="img"
              src="/sharo_logo.png"
              alt="Sharo Logo"
              sx={{
                height: 40,
                width: 40,
                backgroundColor: 'white',
                borderRadius: 2,
                p: 0.5,
                mr: 2,
                objectFit: 'contain'
              }}
            />
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '1.5rem', md: '1.75rem' }
              }}
            >
              Sharo
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.label}
                  onClick={() => onNavigate(item.path)}
                  sx={{
                    color: 'text.primary',
                    fontWeight: 500,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: 'rgba(102, 126, 234, 0.08)',
                      color: 'primary.main'
                    }
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* User Actions */}
          <Box sx={{ ml: 2 }}>
            {user ? (
              <>
                {isMobile && (
                  <IconButton
                    onClick={toggleMobileDrawer}
                    sx={{ mr: 1 }}
                  >
                    <MenuIcon />
                  </IconButton>
                )}
                <IconButton
                  onClick={handleProfileMenuOpen}
                  sx={{ 
                    p: 0,
                    border: '2px solid transparent',
                    '&:hover': {
                      border: '2px solid',
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <Avatar 
                    sx={{ 
                      width: 40, 
                      height: 40,
                      background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                      fontSize: '1rem',
                      fontWeight: 600
                    }}
                  >
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleProfileMenuClose}
                  onClick={handleProfileMenuClose}
                  PaperProps={{
                    sx: {
                      mt: 1.5,
                      minWidth: 200,
                      borderRadius: 2,
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
                    }
                  }}
                >
                  {/* Mobile Navigation Items in Profile Menu */}
                  {isMobile && (
                    <>
                      {navigationItems.map((item) => (
                        <MenuItem 
                          key={item.label}
                          onClick={() => handleNavigation(item.path)}
                          sx={{ gap: 2 }}
                        >
                          {item.icon}
                          {item.label}
                        </MenuItem>
                      ))}
                      <Divider />
                    </>
                  )}

                  {/* User Menu Items */}
                  {userMenuItems.map((item) => (
                    <MenuItem 
                      key={item.label}
                      onClick={() => handleNavigation(item.path)}
                      sx={{ gap: 2 }}
                    >
                      {item.icon}
                      {item.label}
                    </MenuItem>
                  ))}

                  <Divider />
                  <MenuItem onClick={handleLogout} sx={{ gap: 2, color: 'error.main' }}>
                    <Logout />
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                {isMobile && (
                  <IconButton
                    onClick={toggleMobileDrawer}
                    sx={{ mr: 1 }}
                  >
                    <MenuIcon />
                  </IconButton>
                )}
                <Button
                  variant="contained"
                  onClick={() => onNavigate("/auth")}
                  sx={{
                    borderRadius: 3,
                    px: 3,
                    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)',
                    }
                  }}
                >
                  Login
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer - Only show when not logged in */}
      {!user && (
        <Drawer
          anchor="right"
          open={mobileDrawerOpen}
          onClose={toggleMobileDrawer}
          PaperProps={{
            sx: {
              width: 280,
              pt: 2
            }
          }}
        >
          <Box sx={{ px: 3, pb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Navigation
            </Typography>
          </Box>
          <Divider />
          <List>
            {navigationItems.map((item) => (
              <ListItemButton 
                key={item.label}
                onClick={() => handleNavigation(item.path)}
                sx={{ 
                  mx: 1,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(102, 126, 234, 0.08)'
                  }
                }}
              >
                <ListItemIcon sx={{ color: 'primary.main' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Drawer>
      )}
    </>
  );
}