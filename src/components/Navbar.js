import React, { useState } from "react";
import { AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem, Avatar } from "@mui/material";
import { Brightness4, Brightness7, Logout } from "@mui/icons-material";

export default function Navbar({ user, onNavigate, onLogout, darkMode, onToggleTheme }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  return (
    <AppBar position="sticky">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, cursor: "pointer" }} onClick={() => onNavigate("/")}>
          Sharo
        </Typography>
        <Button color="inherit" onClick={() => onNavigate("/")}>Home</Button>
        <Button color="inherit" onClick={() => onNavigate("/trips")}>Trips</Button>
        <Button color="inherit" onClick={() => onNavigate("/about")}>About</Button>
        <Button color="inherit" onClick={() => onNavigate("/contact")}>Contact</Button>
        <IconButton color="inherit" onClick={onToggleTheme}>
          {darkMode ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
        {user ? (
          <>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar src={user.photoURL} />
            </IconButton>
            <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
              <MenuItem onClick={() => { onNavigate("/profile"); setAnchorEl(null); }}>Profile</MenuItem>
              <MenuItem onClick={() => { onNavigate("/my-bookings"); setAnchorEl(null); }}>My Bookings</MenuItem>
              <MenuItem onClick={() => { onLogout(); setAnchorEl(null); }}><Logout /> Logout</MenuItem>
            </Menu>
          </>
        ) : (
          <Button color="inherit" onClick={() => onNavigate("/auth")}>Login</Button>
        )}
      </Toolbar>
    </AppBar>
  );
}
