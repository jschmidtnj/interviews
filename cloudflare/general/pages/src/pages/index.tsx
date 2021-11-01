import { chakra } from "@chakra-ui/system";
import SEO from "components/SEO";
import React, { FunctionComponent } from "react";

const Index: FunctionComponent = () => {
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
