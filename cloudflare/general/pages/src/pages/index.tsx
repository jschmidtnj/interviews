import { chakra } from "@chakra-ui/system";
import SEO from "components/SEO";
import React, { FunctionComponent, useEffect } from "react";
import { axiosClient } from "utils/axios";

const Index: FunctionComponent = () => {
  useEffect(() => {
    (async () => {
      try {
        const res = await axiosClient.get('/');
        console.log(res.data);
      } catch (err) {
        console.log(err);
      }
    })();
  }, []);
  return (
    <>
      <SEO page="home" />
      <chakra.h1>
        home page
      </chakra.h1>
    </>
  );
};

export default Index;
