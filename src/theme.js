import { createTheme } from "@mui/material/styles";

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#388e3c" },
    secondary: { main: "#38f9d7" },
    background: { default: "#f5f5f5", paper: "#ffffff" },
    text: { primary: "#1b1b1b", secondary: "#555555" },
  },
  typography: {
    fontFamily: "'Montserrat', Arial, sans-serif",
    fontWeightRegular: 400,
    fontWeightMedium: 600,
    fontWeightBold: 700,
  },
  shape: { borderRadius: 8 },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#90caf9" },
    secondary: { main: "#f48fb1" },
    background: { default: "#121212", paper: "#1d1d1d" },
    text: { primary: "#fff", secondary: "#aaa" },
  },
  typography: {
    fontFamily: "'Montserrat', Arial, sans-serif",
  },
  shape: { borderRadius: 8 },
});
