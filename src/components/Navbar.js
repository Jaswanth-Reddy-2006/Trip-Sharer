import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
  Divider,
  ListItemIcon,
  Switch,
} from "@mui/material";
import {
  Brightness4,
  Brightness7,
  Logout,
  AccountCircle,
  Chat as ChatIcon,
  Book as BookIcon,
} from "@mui/icons-material";

export default function Navbar({ user, onNavigate, onLogout, darkMode, onToggleTheme }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static" color="primary" enableColorOnDark>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Left: logo with white background + site name */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }} onClick={() => onNavigate("/")}>
          <Box
            sx={{
              bgcolor: "white",
              borderRadius: "50%",
              width: 40,
              height: 40,
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src="/sharo_logo.png"
              alt="Sharo Logo"
              style={{ maxHeight: "75%", maxWidth: "75%" }}
              loading="lazy"
            />
          </Box>
          <Typography variant="h6" color="inherit" noWrap>
            Sharo
          </Typography>
        </Box>

        {/* Navigation buttons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button color="inherit" onClick={() => onNavigate("/")} >Home</Button>
          <Button color="inherit" onClick={() => onNavigate("/trips")} >Trips</Button>
          <Button color="inherit" onClick={() => onNavigate("/about")} >About</Button>
          <Button color="inherit" onClick={() => onNavigate("/contact")} >Contact</Button>
          {user && <Button color="inherit" onClick={() => onNavigate("/chat")} >Chat</Button>}
        </Box>

        {/* Right: user menu and dark mode toggle inside the menu */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {user ? (
            <>
              <Tooltip title="Account settings">
                <IconButton onClick={handleAvatarClick} size="small" sx={{ ml: 2 }}>
                  {user.photoURL ? (
                    <Avatar src={user.photoURL} alt={user.displayName || "User"} />
                  ) : (
                    <Avatar>{(user.displayName || user.email || "U")[0].toUpperCase()}</Avatar>
                  )}
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                  elevation: 4,
                  sx: { mt: 1.5, minWidth: 220 },
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                <MenuItem onClick={() => { onNavigate("/profile"); handleClose(); }}>
                  <ListItemIcon><AccountCircle fontSize="small" /></ListItemIcon>
                  Profile
                </MenuItem>

                <MenuItem onClick={() => { onNavigate("/my-bookings"); handleClose(); }}>
                  <ListItemIcon><BookIcon fontSize="small" /></ListItemIcon>
                  My Bookings
                </MenuItem>

                <Divider />

                <MenuItem>
                  <ListItemIcon>{darkMode ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}</ListItemIcon>
                  Dark Mode
                  <Switch
                    checked={darkMode}
                    onChange={() => {
                      onToggleTheme();
                      handleClose();
                    }}
                    inputProps={{ "aria-label": "toggle dark mode" }}
                    sx={{ ml: 1 }}
                  />
                </MenuItem>

                <Divider />

                <MenuItem
                  onClick={() => {
                    onLogout();
                    handleClose();
                  }}
                  sx={{ color: "error.main" }}
                >
                  <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button color="inherit" onClick={() => onNavigate("/auth")}>Login</Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
