import { Container, Heading } from "@chakra-ui/react";
import SEO from "components/SEO";
import React, { FunctionComponent } from "react";
import { useIntl } from "react-intl";

const Login: FunctionComponent = () => {
  const { formatMessage } = useIntl();

  return (
    <>
      <SEO page={formatMessage({ id: 'login.title' })} />
      <Container py="4rem" maxW="container.md">
        <Heading as="h1" size="md" mb="2rem" color="dark_green">
          {formatMessage({ id: 'login.title' })}
        </Heading>
      </Container>
    </>
  );
};

export default Login;
