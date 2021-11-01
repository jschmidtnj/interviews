import {
  ChakraProvider,
} from "@chakra-ui/react"
import { useEffect } from "react";
import { createAxiosClient } from "./utils/axios";
import Main from 'layouts/main'
import { BrowserRouter } from "react-router-dom";
import React from "react";
import theme from './theme';
import { HelmetProvider } from "react-helmet-async";

export const App = () => {
  useEffect(() => {
    createAxiosClient();
  }, []);

  return (
    <HelmetProvider>
      <ChakraProvider theme={theme}>
        <BrowserRouter>
          <Main />
        </BrowserRouter>
      </ChakraProvider>
    </HelmetProvider>
  )
}
