import { createTheme } from "@mui/material/styles";
import { red } from "@mui/material/colors";

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: "#02BBBC",
    },
    secondary: {
      main: "#FFD24E",
    },
    error: {
      main: red.A400,
    },
  },
});

export default theme;
