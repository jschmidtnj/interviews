import { Container } from "@chakra-ui/react";
import Posts from "components/Posts";
import SEO from "components/SEO";
import React, { FunctionComponent } from "react";
import { useIntl } from "react-intl";

const Index: FunctionComponent = () => {
  const { formatMessage } = useIntl();

  return (
    <>
      <SEO page={formatMessage({ id: 'home.title' })} />
      <Container py="4rem" maxW="container.md">
        <Posts />
      </Container>
    </>
  );
};

export default Index;
