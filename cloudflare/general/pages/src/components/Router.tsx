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
import About from 'pages/about';
import Changelog from 'pages/changelog';
import Login from 'pages/login';

export const Router = () => {
  useEffect(() => {
    createAxiosClient();
  }, []);

  return (
    <LocalizedSwitch>
      <Route exact path={AppRoute.Home} component={Home} />
      <Route exact path={AppRoute.About} component={About} />
      <Route exact path={AppRoute.Changelog} component={Changelog} />
      <Route exact path={AppRoute.Login} component={Login} />
      <Route path="*" component={NotFoundPage} />
    </LocalizedSwitch>
  )
}

export default Router
