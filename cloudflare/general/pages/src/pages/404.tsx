import SEO from 'components/SEO';
import { FunctionComponent } from 'react';
import { ReactComponent as CatSVG } from 'svg/cat.svg';
import { Box, Container, Flex, Heading, SimpleGrid } from '@chakra-ui/layout';
import { chakra } from '@chakra-ui/system';
import { Button } from '@chakra-ui/button';
import React from 'react';
import { useHistory } from 'react-router-dom';

const NotFoundPage: FunctionComponent = () => {
  const history = useHistory();

  return (
    <>
      <SEO page="404" />
      <Container pt={40} maxW="container.lg">
        <SimpleGrid columns={{ sm: 1, md: 2 }}>
          <Flex maxW="md" alignItems="center" height="full">
            <Box pb="1rem">
              <Heading as="h1" size="3xl">
                404
              </Heading>
              <chakra.p fontSize="2xl" fontWeight="light" mb={2}>
                Sorry we couldn{"'"}t find this page.
              </chakra.p>
              <chakra.p mb={8}>
                But don{"'"}t worry, you can find plenty of other things on our
                homepage.
              </chakra.p>
              <Button onClick={() => history.goBack()} colorScheme="teal">
                go back
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
