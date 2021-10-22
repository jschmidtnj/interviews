import { FunctionComponent } from 'react';
import { chakra, Link, useColorModeValue, Flex } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const githubLink = 'https://github.com/SSMIF-Quant/quant';
const docsLink = 'https://quant.ssmif.com';

const Footer: FunctionComponent = () => {
  return (
    <chakra.footer
      p={4}
      bgColor={useColorModeValue('gray.900', 'gray.300')}
      textColor={useColorModeValue('gray.300', 'gray.900')}
    >
      <Flex align="center" justifyContent="center">
        <chakra.p>© {new Date().getFullYear()}, SSMIF Quant</chakra.p>
        <chakra.div mx={2}>|</chakra.div>
        <RouterLink to="/changelog">
          <Link
            href="/changelog"
            _hover={{
              color: useColorModeValue('red.400', 'red.800'),
            }}
          >
            changelog
          </Link>
        </RouterLink>
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
