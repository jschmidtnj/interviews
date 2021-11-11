import { Container } from "@chakra-ui/react";
import Posts from "components/Posts";
import PrivateRoute from "components/PrivateRoute";
import SEO from "components/SEO";
import React, { FunctionComponent } from "react";
import { useIntl } from "react-intl";

const Index: FunctionComponent = () => {
  const { formatMessage } = useIntl();

  return (
    <PrivateRoute>
      <SEO page={formatMessage({ id: 'home.title' })} />
      <Container py="4rem" maxW="container.md">
        <Posts />
      </Container>
    </PrivateRoute>
  );
};

export default Index;
