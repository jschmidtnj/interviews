import { FunctionComponent } from 'react';
import { chakra, Link, useColorModeValue, Flex } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import React from 'react';
import { useIntl } from 'react-intl';
import { AppRoute, AppRouteTitles } from 'i18n/const/app-routes';

const Footer: FunctionComponent = () => {
  const { formatMessage, locale } = useIntl();

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
          to={`/${locale}` + formatMessage({ id: AppRoute.Changelog })}
          as={RouterLink}
          _hover={{
            color: useColorModeValue('light_teal', 'teal.800'),
          }}
        >
          {formatMessage({ id: AppRouteTitles[AppRoute.Changelog] })}
        </Link>
        <chakra.div mx={2}>|</chakra.div>
        <chakra.a
          href={formatMessage({ id: 'links.github' })}
          _hover={{
            color: useColorModeValue('light_teal', 'teal.800'),
          }}
          target="_blank"
        >
          github
        </chakra.a>
        <chakra.div mx={2}>|</chakra.div>
        <chakra.a
          href={formatMessage({ id: 'links.docs' })}
          _hover={{
            color: useColorModeValue('light_teal', 'teal.800'),
          }}
          target="_blank"
        >
          docs
        </chakra.a>
      </Flex>
    </chakra.footer>
  );
};

export default Footer;
