import { createMuiTheme } from "@material-ui/core/styles"
import "./layout.css"

export default createMuiTheme({
  palette: {
    primary: {
      main: "#122932",
    },
    secondary: { main: "#2c514c" },
    black: { main: "#000000" },
    white: { main: "#fefefe" },
    error: { main: "#CC2936" }
  },

})

/*
  --lightest: #e3c0d3;
  --light: #95818d;
  --grey: #576066;
  --dark: #2c514c;
  --darker: #122932;
  --error: #CC2936;
  */
