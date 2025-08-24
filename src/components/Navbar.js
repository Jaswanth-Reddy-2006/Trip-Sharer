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
  Switch,
  ListItemIcon,
  IconButton,
  Tooltip,
  Divider,
  Typography as MuiTypography
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { Brightness4, Brightness7, Logout, AccountCircle } from "@mui/icons-material";

export default function Navbar({ user, onNavigate, onLogout, darkMode, onToggleTheme }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static" color="primary" elevation={2}>
      <Toolbar>
        {/* Logo + Nav buttons */}
        <Box
          sx={{
            backgroundColor: "white",
            px: 2,
            py: 0.5,
            borderRadius: 1,
            boxShadow: 1,
            mr: 3,
            cursor: "pointer",
            minWidth: 150,
            display: "flex",
            alignItems: "center",
          }}
          component={RouterLink}
          to="/"
        >
          <Box
            component="img"
            src="/sharo_logo.png"
            alt="Sharo Logo"
            sx={{ height: 40, width: 40 }}
          />
          <Typography variant="h6" ml={1} color="black" fontWeight="bold">
            Sharo
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2, flexGrow: 1 }}>
          <Button color="inherit" component={RouterLink} to="/">
            Home
          </Button>
          <Button color="inherit" component={RouterLink} to="/trips">
            Trips
          </Button>
          <Button color="inherit" component={RouterLink} to="/about">
            About
          </Button>
          <Button color="inherit" component={RouterLink} to="/contact">
            Contact
          </Button>
        </Box>

        {user ? (
          <>
            <Tooltip title="Account settings">
              <IconButton onClick={handleAvatarClick} sx={{ p: 0, ml: 2 }}>
                {/* Show user's profile pic or fallback initials */}
                <Avatar alt={user.displayName || user.email} src={user.photoURL || ""}>
                  {!user.photoURL && (user.displayName || user.email || "U")[0].toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleMenuClose}
              onClick={handleMenuClose}
              PaperProps={{
                elevation: 3,
                sx: { width: 250, maxWidth: "90vw" },
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <Box px={2} py={1}>
                <MuiTypography variant="subtitle1" fontWeight="bold" noWrap>
                  {user.displayName || "User"}
                </MuiTypography>
                <MuiTypography variant="body2" color="text.secondary" noWrap>
                  {user.email}
                </MuiTypography>
              </Box>
              <Divider />
              <MenuItem onClick={() => onNavigate("/profile")}>
                <ListItemIcon>
                  <AccountCircle fontSize="small" />
                </ListItemIcon>
                Profile
              </MenuItem>
              <MenuItem>
                <ListItemIcon>
                  {darkMode ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}
                </ListItemIcon>
                Dark Mode
                <Switch
                  checked={darkMode}
                  onChange={onToggleTheme}
                  inputProps={{ "aria-label": "dark mode toggle" }}
                  sx={{ ml: "auto" }}
                />
              </MenuItem>
              <Divider />
              <MenuItem onClick={onLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Button color="inherit" component={RouterLink} to="/auth">
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}
