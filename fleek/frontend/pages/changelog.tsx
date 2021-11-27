import PrivateRoute from 'components/PrivateRoute';
import Layout from 'layouts/main';
import { FunctionComponent } from 'react';
import SEO from 'components/SEO';
import {
  Heading,
  Flex,
  Container,
  Box,
  useBreakpointValue,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
} from '@chakra-ui/react';
import changeLogs from 'data/changes';

const Changelog: FunctionComponent = () => {
  return (
    <PrivateRoute>
      <Layout>
        <SEO page="changelog" />
        <Container py={20} maxW="container.lg">
          <Flex mb={20} justifyContent="center">
            <Heading>Changelog</Heading>
          </Flex>
          <Box
            px={useBreakpointValue({ base: 2, md: 8 })}
            py={6}
            borderWidth={1}
            borderRadius={8}
            boxShadow="lg"
            w="100%"
            bg="white"
            mb="10rem"
          >
            <Table>
              <Thead>
                <Tr>
                  <Th>Version</Th>
                  <Th>Changes</Th>
                </Tr>
              </Thead>
              <Tbody>
                {changeLogs.map((changeLog, i) => (
                  <Tr
                    _hover={{
                      bgColor: 'gray.100',
                    }}
                    key={`version-${i}-${changeLog.version}`}
                  >
                    <Td>{changeLog.version}</Td>
                    <Td>{changeLog.description}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Container>
      </Layout>
    </PrivateRoute>
  );
};

export default Changelog;
