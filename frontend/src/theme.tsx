import { extendTheme } from "@chakra-ui/react";
import { createBreakpoints, mode } from "@chakra-ui/theme-tools";

const fonts = { mono: `'Menlo', monospace` };

const breakpoints = createBreakpoints({
  sm: "40em",
  md: "52em",
  lg: "64em",
  xl: "80em",
});

const theme = extendTheme({
  colors: {
    osu: {
      50: "#ffedf5",
      100: "#ffd1e6",
      200: "#ffb3d5",
      300: "#ff94c4",
      400: "#ff7db7",
      500: "#ff66aa",
      600: "#ff5ea3",
      700: "#ff5399",
      800: "#ff4990",
      900: "#ff387f",
      A100: "#ffffff",
      A200: "#ffffff",
      A400: "#ffe1eb",
      A700: "#ffc8da",
    },
  },
  fonts,
  breakpoints,
});

export default theme;
