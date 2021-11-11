import { FunctionComponent, useMemo, useState } from 'react';
import {
  Box,
  Flex,
  HStack,
  Link,
  IconButton,
  useDisclosure,
  useColorModeValue,
  Stack,
  Icon,
  Container,
  Button,
  useToast,
  Image
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { AiOutlineMenu, AiOutlineClose } from 'react-icons/ai';
import VisibilitySensor from 'react-visibility-sensor';
import { useLocalStorageValue } from '@react-hookz/web';
import React from 'react';
import { AppRoute, AppRouteTitles } from 'i18n/const/app-routes';
import { useIntl } from 'react-intl';
import { usernameKey } from 'utils/auth';
import { axiosClient } from 'utils/axios';

interface HeaderLink {
  name: string;
  href: string;
}

interface NavLinkArgs {
  linkData: HeaderLink;
}

const NavLink: FunctionComponent<NavLinkArgs> = (args) => (
  <Link
    to={args.linkData.href}
    as={RouterLink}
    px={2}
    py={1}
    rounded={'md'}
    _hover={{
      textDecoration: 'none',
      color: useColorModeValue('gray.700', 'gray.200'),
      bg: useColorModeValue('gray.200', 'gray.700'),
    }}
    color="gray.100"
  >
    {args.linkData.name}
  </Link>
);

const Logout: FunctionComponent = () => {
  const toast = useToast();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_username, _setUsername, removeUsername] = useLocalStorageValue<string>(usernameKey);

  return (
    <Flex justifyContent="start">
      <Button
        px={2}
        py={1}
        rounded={'md'}
        _hover={{
          color: useColorModeValue('gray.700', 'gray.200'),
          bg: useColorModeValue('gray.200', 'gray.700'),
        }}
        fontWeight="normal"
        bg="transparent"
        color="gray.100"
        onClick={async (evt) => {
          evt.preventDefault();
          await axiosClient.put('/logout', undefined, {
            withCredentials: true
          });
          removeUsername();
          toast({
            status: 'success',
            description: 'logged out',
          });
        }}
      >
        Logout
      </Button>
    </Flex>
  );
};

const Header: FunctionComponent = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [hamburgerIsVisible, setHamburgerVisible] = useState(false);

  const [username] = useLocalStorageValue<string>(usernameKey);

  const { formatMessage, locale } = useIntl();

  const links = useMemo(() => {
    const links: AppRoute[] = [AppRoute.About];
    if (username === null) {
      links.push(AppRoute.Login);
    }
    return links.map(elem => ({
      href: `/${locale}` + formatMessage({ id: elem }),
      name: formatMessage({ id: AppRouteTitles[elem] })
    }));
  }, [username, locale, formatMessage]);

  return (
    <Box bg={useColorModeValue('light_teal', 'teal.800')}>
      <Container maxW="container.lg">
        <Flex h="5rem" alignItems={'center'} justifyContent={'space-between'}>
          {/* Note - adding this causes a findDOMNode error in the app. */}
          <VisibilitySensor
            onChange={setHamburgerVisible}
            partialVisibility={true}
          >
            <IconButton
              size={'md'}
              icon={
                isOpen ? (
                  <Icon as={AiOutlineClose} />
                ) : (
                  <Icon as={AiOutlineMenu} />
                )
              }
              color={useColorModeValue('gray.100', 'gray.700')}
              bg={useColorModeValue('light_teal', 'teal.700')}
              _hover={{
                bg: useColorModeValue('light_teal', 'teal.800'),
              }}
              aria-label={'Open Menu'}
              display={{ md: !isOpen ? 'none' : 'inherit' }}
              onClick={isOpen ? onClose : onOpen}
            />
          </VisibilitySensor>
          <HStack spacing={8} alignItems={'center'}>
            <Link
              to="/"
              as={RouterLink}
              px={2}
              py={1}
              color="gray.100"
              _hover={{
                textDecoration: 'none',
              }}
            >
              <Image src="/transparent_monster_long.png" alt="monster" maxHeight="5rem" />
            </Link>
            <Box display={{ base: 'none', md: 'flex' }}>
              <HStack as={'nav'} spacing={4}>
                {links.map((link) => (
                  <NavLink key={`nav-link-${link.href}`} linkData={link} />
                ))}
                {username ? <Logout /> : null}
              </HStack>
            </Box>
          </HStack>
          <Box w="3rem" />
        </Flex>

        {isOpen && hamburgerIsVisible ? (
          <Box pb={4}>
            <Stack as={'nav'} spacing={4}>
              {links.map((link) => (
                <NavLink key={`nav-link-${link.href}`} linkData={link} />
              ))}
              {username ? <Logout /> : null}
            </Stack>
          </Box>
        ) : null}
      </Container>
    </Box>
  );
};

export default Header;
