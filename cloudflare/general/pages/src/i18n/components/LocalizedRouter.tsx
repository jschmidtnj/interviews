import React from 'react';
import { IntlProvider } from 'react-intl';
import { Route, Redirect } from 'react-router-dom';
import { AppLanguage } from 'i18n/const/app-languages';

import { LanguageStrings } from '../localizations/base-strings';

interface Props {
  RouterComponent: React.ComponentClass<any>;
  languages: { [k: number]: string };
  appStrings: { [prop: string]: LanguageStrings };
  defaultLanguage?: AppLanguage;
}

export const LocalizedRouter: React.FC<Props> = ({
  children,
  RouterComponent,
  appStrings,
  defaultLanguage,
}) => (
  <RouterComponent>
    <Route path="/:lang([a-zA-Z]{2})">
      {({ match, location }) => {
        /**
         * Get current language
         * Set default locale to en if base path is used without a language
         */
        const lang = match ? match.params.lang : defaultLanguage ? defaultLanguage : AppLanguage.English;

        /**
         * If language is not in route path, redirect to language root
         */
        const { pathname } = location;
        if (pathname !== '/service-worker.js' && !pathname.includes(`/${lang}/`)) {
          return <Redirect to={`/${lang}/`} />;
        }

        /**
         * Return Intl provider with default language set
         */
        return (
          <IntlProvider locale={lang} messages={appStrings[lang]}>
            {children}
          </IntlProvider>
        );
      }}
    </Route>
  </RouterComponent>
);
