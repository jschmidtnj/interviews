const baseStrings = {
  /** Routes */
  'routes.home': '/',
  'routes.about': '/about',
  'routes.changelog': '/changelog',
  'routes.login': '/login',

  /** Page content */
  'home.title': 'Home',
  'home.content': 'Thank you for visiting this multi-language routing example.',

  'about.title': 'About',
  'about.content': 'This is a simple social media website based on reddit / twitter, and created exclusively with cloudflare hosting. It uses cloudflare workers, key-value for storage, and pages for hosting.',

  'login.title': 'Login',
  'login.username': 'username',

  'changelog.title': 'Changelog',
  'changelog.content.1': '11/4: created initial implementation of website.',
  'changelog.content.2': '11/5: made website a pwa',

  'error.title': '404',
  'error.message': 'Sorry we couldn\'t find this page.',
  'error.secondary': 'But don\'t worry, you can find plenty of other things on our homepage.',
  'error.back': 'go back',

  /** Links */
  'links.github':
    'https://github.com/jschmidtnj/interviews/tree/master/cloudflare',
  'links.docs': 'https://github.com/jschmidtnj/interviews/blob/master/cloudflare/README.md'
};

export type LanguageStrings = typeof baseStrings;
export const en = baseStrings;
