import { chakra, Container, Heading } from "@chakra-ui/react";
import SEO from "components/SEO";
import React, { FunctionComponent } from "react";
import { useIntl } from "react-intl";

const About: FunctionComponent = () => {
  const { formatMessage } = useIntl();

  return (
    <>
      <SEO page={formatMessage({ id: 'about.title' })} />
      <Container py="4rem" maxW="container.md">
        <Heading as="h1" size="lg" mb="2rem" color="dark_green">
          {formatMessage({ id: 'about.title' })}
        </Heading>
        <chakra.p>
          {formatMessage({ id: 'about.content' })}
        </chakra.p>
      </Container>
    </>
  );
};

export default About;
