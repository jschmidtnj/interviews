import { FunctionComponent } from 'react';
import { chakra, Link, useColorModeValue, Flex } from '@chakra-ui/react';
import NextLink from 'next/link';

const githubLink = 'https://github.com/jschmidtnj/interviews/blob/master/fleek';
const docsLink = 'https://github.com/jschmidtnj/interviews/blob/master/fleek/README.md';

const Footer: FunctionComponent = () => {
  return (
    <chakra.footer
      p={4}
      bgColor={useColorModeValue('gray.900', 'gray.300')}
      textColor={useColorModeValue('gray.300', 'gray.900')}
    >
      <Flex align="center" justifyContent="center">
        <chakra.p>© {new Date().getFullYear()}, Joshua Schmidt</chakra.p>
        <chakra.div mx={2}>|</chakra.div>
        <NextLink href="/changelog">
          <Link
            href="/changelog"
            _hover={{
              color: useColorModeValue('red.400', 'red.800'),
            }}
          >
            changelog
          </Link>
        </NextLink>
        <chakra.div mx={2}>|</chakra.div>
        <Link
          href={githubLink}
          _hover={{
            color: useColorModeValue('red.400', 'red.800'),
          }}
          target="_blank"
        >
          github
        </Link>
        <chakra.div mx={2}>|</chakra.div>
        <Link
          href={docsLink}
          _hover={{
            color: useColorModeValue('red.400', 'red.800'),
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
