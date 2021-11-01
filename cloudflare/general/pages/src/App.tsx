import {
  ChakraProvider,
} from "@chakra-ui/react"
import { useEffect, useState } from "react";
import { createAxiosClient } from "./utils/axios";
import Main from 'layouts/main'
import { BrowserRouter } from "react-router-dom";
import React from "react";
import theme from './theme';
import { HelmetProvider } from "react-helmet-async";
import { LocalizedRouter } from "i18n/components/LocalizedRouter";
import * as appStrings from 'i18n/localizations/base-strings';
import { AppLanguage } from "i18n/const/app-languages";

export const App = () => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    createAxiosClient();
    setLoading(false);
  }, []);

  return (
    <HelmetProvider>
      <ChakraProvider theme={theme}>
        <LocalizedRouter          RouterComponent={BrowserRouter}
          languages={AppLanguage}
          appStrings={appStrings}
        >
          {loading ? null : <Main />}
        </LocalizedRouter>
      </ChakraProvider>
    </HelmetProvider>
  )
}
