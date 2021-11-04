import { Container, Heading, OrderedList, ListItem } from "@chakra-ui/react";
import SEO from "components/SEO";
import { en } from "i18n/localizations";
import React, { FunctionComponent } from "react";
import { useIntl } from "react-intl";

const Changelog: FunctionComponent = () => {
  const { formatMessage } = useIntl();

  return (
    <>
      <SEO page={formatMessage({ id: 'changelog.title' })} />
      <Container py="4rem" maxW="container.md">
        <Heading as="h1" size="lg" mb="2rem" color="dark_green">
          {formatMessage({ id: 'changelog.title' })}
        </Heading>
        <OrderedList>
          {Object.keys(en).filter(key => key.startsWith('changelog.content.')).map((key, i) => (
            <ListItem key={`change-${i}`}>
              {formatMessage({ id: key })}
            </ListItem>
          ))}
        </OrderedList>
      </Container>
    </>
  );
};

export default Changelog;
