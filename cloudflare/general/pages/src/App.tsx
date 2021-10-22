import {
  ChakraProvider,
  theme,
} from "@chakra-ui/react"
import { useEffect } from "react";
import { createAxiosClient } from "./utils/axios";
import Main from 'layouts/main'
import { BrowserRouter } from "react-router-dom";

export const App = () => {
  useEffect(() => {
    createAxiosClient();
  }, []);

  return (
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <Main />
      </BrowserRouter>
    </ChakraProvider>
  )
}
