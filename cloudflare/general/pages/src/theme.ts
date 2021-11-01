import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  fonts: {
    header: 'Open Sans',
    body: 'Open Sans'
  },
  colors: {
    light_teal: '#2fb1a2',
    dark_green: '#2d5362',
    light_yellow: '#efd595',
    burnt_sierra: '#e76a4b',
    dark_orange: '#f4a666',
  }
});

export default theme;
