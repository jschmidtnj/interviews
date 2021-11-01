import { FunctionComponent } from 'react';
import Header from 'components/Header';
import Footer from 'components/Footer';
import { Box } from '@chakra-ui/react';
import Router from 'components/Router';
import React from 'react';

const Layout: FunctionComponent = () => {
  return (
    <>
      <Header />
      <Box
        style={{
          minHeight: '93vh',
        }}
        bg="gray.100"
      >
        <Router />
      </Box>
      <Footer />
    </>
  );
};

export default Layout;
