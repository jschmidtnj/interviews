import { useEffect } from 'react';
import {
  Switch,
  Route,
} from "react-router-dom";
import { createAxiosClient } from "utils/axios";

const Home = () => (
  <div>
    <h2>Home</h2>
  </div>
);

export const Router = () => {
  useEffect(() => {
    createAxiosClient();
  }, []);

  return (
    <Switch>
      {/* TODO - see https://github.com/vlaja/multilanguage-routing-react for fixing international */}
      {/* routing. right now going to /en/ doesn't route to / */}
      <Route exact path="/">
        <Home />
      </Route>
    </Switch>
  )
}


export default Router
