import { createTheme } from "@mui/material/styles";

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { 
      main: "#667eea",
      light: "#8b95f0", 
      dark: "#4c5ae8",
      contrastText: "#fff"
    },
    secondary: { 
      main: "#764ba2",
      light: "#9c6bc7", 
      dark: "#5a3577",
      contrastText: "#fff"
    },
    background: { 
      default: "#f8fafc", 
      paper: "#ffffff" 
    },
    text: { 
      primary: "#1a202c", 
      secondary: "#4a5568" 
    },
    success: { main: "#48bb78" },
    warning: { main: "#ed8936" },
    error: { main: "#f56565" },
    info: { main: "#4299e1" },
  },
  typography: {
    fontFamily: "'Inter', 'Poppins', 'Arial', sans-serif",
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      fontWeight: 700,
      fontSize: "2.5rem",
    },
    h2: {
      fontWeight: 600,
      fontSize: "2rem",
    },
    h3: {
      fontWeight: 600,
      fontSize: "1.5rem",
    },
    h4: {
      fontWeight: 500,
      fontSize: "1.25rem",
    },
    button: {
      textTransform: "none",
      fontWeight: 500,
    },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: "10px 24px",
          fontSize: "0.95rem",
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
          },
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { 
      main: "#667eea",
      light: "#8b95f0", 
      dark: "#4c5ae8",
      contrastText: "#fff"
    },
    secondary: { 
      main: "#764ba2",
      light: "#9c6bc7", 
      dark: "#5a3577",
      contrastText: "#fff"
    },
    background: { 
      default: "#0f172a", 
      paper: "#1e293b" 
    },
    text: { 
      primary: "#f1f5f9", 
      secondary: "#cbd5e1" 
    },
  },
  typography: {
    fontFamily: "'Inter', 'Poppins', 'Arial', sans-serif",
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    button: {
      textTransform: "none",
      fontWeight: 500,
    },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: "10px 24px",
          fontSize: "0.95rem",
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
          },
        },
      },
    },
  },
});