import { ChakraProvider, useColorModeValue } from "@chakra-ui/react";
import { AppProps } from "next/app";
import NextNProgress from "nextjs-progressbar";

import theme from "../theme";
import { NavBar } from "../components/Navbar";

function MyApp({ Component, pageProps }: AppProps) {
  const mainColor = useColorModeValue("#ff5ea3", "#ff94c4");
  return (
    <ChakraProvider resetCSS theme={theme}>
      <NextNProgress color={mainColor} options={{ showSpinner: false }} />
      <NavBar />
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp;
