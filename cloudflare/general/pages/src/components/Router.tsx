import React from 'react';
import { useEffect } from 'react';
import {
  Route,
} from "react-router-dom";
import { createAxiosClient } from "utils/axios";
import Home from 'pages';
import NotFoundPage from 'pages/404';
import { LocalizedSwitch } from 'i18n/components/LocalizedSwitch';
import { AppRoute } from 'i18n/const/app-routes';

export const Router = () => {
  useEffect(() => {
    createAxiosClient();
  }, []);

  return (
    <LocalizedSwitch>
      <Route exact path={AppRoute.Home} component={Home} />
      <Route path="*" component={NotFoundPage} />
    </LocalizedSwitch>
  )
}


export default Router
