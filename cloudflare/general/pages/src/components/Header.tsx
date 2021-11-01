import { FunctionComponent, useState } from 'react';
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
  useBreakpointValue,
  Heading,
  Container,
  Button,
  useToast,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { AiOutlineMenu, AiOutlineClose } from 'react-icons/ai';
import VisibilitySensor from 'react-visibility-sensor';
import React from 'react';

interface HeaderLink {
  name: string;
  href: string;
}

const links: HeaderLink[] = [
  {
    name: 'Login',
    href: '/login',
  },
  {
    name: 'About',
    href: '/about',
  }
];

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
        onClick={(evt) => {
          evt.preventDefault();
          // TODO - logout!
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

  // TODO - get logged in from state
  const loggedIn = false;

  return (
    <Box bg={useColorModeValue('teal', 'teal.800')}>
      <Container maxW="container.lg">
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          {/* TODO - adding this causes a findDOMNode error in the app. */}
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
              bg={useColorModeValue('teal', 'teal.700')}
              _hover={{
                bg: useColorModeValue('teal', 'teal.800'),
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
              <Heading
                size="md"
                textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
                color="gray.100"
              >
                Post It
              </Heading>
            </Link>
            <Box display={{ base: 'none', md: 'flex' }}>
              <HStack as={'nav'} spacing={4}>
                {links.map((link) => (
                  <NavLink key={`nav-link-${link.href}`} linkData={link} />
                ))}
                {loggedIn ? <Logout /> : null}
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
              {loggedIn ? <Logout /> : null}
            </Stack>
          </Box>
        ) : null}
      </Container>
    </Box>
  );
};

export default Header;
