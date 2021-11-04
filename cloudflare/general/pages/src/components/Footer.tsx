import { FunctionComponent } from 'react';
import { chakra, Link, useColorModeValue, Flex } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import React from 'react';

const githubLink = 'https://github.com/jschmidtnj/interviews/tree/master/cloudflare';
const docsLink = 'https://github.com/jschmidtnj/interviews/blob/master/cloudflare/README.md';

const Footer: FunctionComponent = () => {
  return (
    <chakra.footer
      p={4}
      bgColor={useColorModeValue('gray.900', 'gray.300')}
      textColor={useColorModeValue('gray.300', 'gray.900')}
    >
      <Flex align="center" justifyContent="center">
        <chakra.p>© {new Date().getFullYear()} Joshua</chakra.p>
        <chakra.div mx={2}>|</chakra.div>
        <Link
          to="/changelog"
          as={RouterLink}
          _hover={{
            color: useColorModeValue('light_teal', 'teal.800'),
          }}
        >
          changelog
        </Link>
        <chakra.div mx={2}>|</chakra.div>
        <Link
          to={githubLink}
          as={RouterLink}
          _hover={{
            color: useColorModeValue('light_teal', 'teal.800'),
          }}
          target="_blank"
        >
          github
        </Link>
        <chakra.div mx={2}>|</chakra.div>
        <Link
          to={docsLink}
          as={RouterLink}
          _hover={{
            color: useColorModeValue('light_teal', 'teal.800'),
          }}
          target="_blank"
        >
          docs
        </Link>
      </Flex>
    </chakra.footer>
  );
};

export default Footer;
