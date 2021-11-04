import SEO from 'components/SEO';
import { FunctionComponent } from 'react';
import { ReactComponent as CatSVG } from 'svg/cat.svg';
import { Box, Container, Flex, Heading, SimpleGrid } from '@chakra-ui/layout';
import { chakra } from '@chakra-ui/system';
import { Button } from '@chakra-ui/button';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { useIntl } from 'react-intl';

const NotFoundPage: FunctionComponent = () => {
  const history = useHistory();
  const { formatMessage } = useIntl();

  return (
    <>
      <SEO page={formatMessage({ id: 'error.title' })} />
      <Container pt={40} maxW="container.lg">
        <SimpleGrid columns={{ sm: 1, md: 2 }}>
          <Flex maxW="md" alignItems="center" height="full">
            <Box pb="1rem">
              <Heading as="h1" size="3xl">
                {formatMessage({ id: 'error.title' })}
              </Heading>
              <chakra.p fontSize="2xl" fontWeight="light" mb={2}>
                {formatMessage({ id: 'error.message' })}
              </chakra.p>
              <chakra.p mb={8}>
              {formatMessage({ id: 'error.secondary' })}
              </chakra.p>
              <Button onClick={() => history.goBack()} colorScheme="teal">
                {formatMessage({ id: 'error.back' })}
              </Button>
            </Box>
          </Flex>
          <Box maxWidth="lg">
            <CatSVG />
          </Box>
        </SimpleGrid>
      </Container>
    </>
  );
};

export default NotFoundPage;
