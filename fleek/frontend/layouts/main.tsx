import { FunctionComponent, ReactNode } from 'react';
import Header from 'components/Header';
import Footer from 'components/Footer';
import EmptyLayout from './empty';
import { Box } from '@chakra-ui/react';

interface LayoutArgs {
  children: ReactNode;
}

const Layout: FunctionComponent<LayoutArgs> = (args) => {
  return (
    <EmptyLayout>
      <Header />
      <Box
        style={{
          minHeight: '93vh',
        }}
        bg="gray.100"
      >
        {args.children}
      </Box>
      <Footer />
    </EmptyLayout>
  );
};

export default Layout;
