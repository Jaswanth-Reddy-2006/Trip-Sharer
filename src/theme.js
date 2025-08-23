import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#388e3c',         // green brand color
    },
    secondary: {
      main: '#38f9d7',         // teal accent color
    },
    background: {
      default: '#f5f5f5',      // light background
      paper: '#ffffff',        // white paper background
    },
    text: {
      primary: '#1b1b1b',
      secondary: '#555555',
    },
  },
  typography: {
    fontFamily: "'Montserrat', Arial, sans-serif",
    fontWeightRegular: 400,
    fontWeightMedium: 600,
    fontWeightBold: 700,
  },
  shape: {
    borderRadius: 8,
  },
});

export default theme;
