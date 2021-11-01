import { FunctionComponent, ReactNode, useEffect, useState } from 'react';
import { IntlProvider } from 'react-intl';
import Messages from 'locale/type';
import { useLocation } from 'react-router-dom';
import locales from 'locale/locales';
import React from 'react';

interface LayoutArgs {
  children: ReactNode;
}

const EmptyLayout: FunctionComponent<LayoutArgs> = (args) => {
  const location = useLocation();

  const defaultLocale = locales[0];

  const [locale, setLocale] = useState<string>(defaultLocale);
  useEffect(() => {
    const splitPath = location.pathname.toLowerCase().split('/');
    if (splitPath.length <= 1) {
      setLocale(defaultLocale);
      return;
    }
    const currLocale = splitPath[1];
    if (locales.includes(currLocale)) {
      setLocale(currLocale);
      return;
    }
  }, [location.pathname, defaultLocale]);

  const [messages, setMessages] = useState<Messages | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    (async () => {
      const importedMessages: Messages = (
        await import(`locale/${locale}`)
      ).default;
      setMessages(importedMessages);
      setLoading(false);
    })();
  }, [locale]);

  return loading ? null : (
    <IntlProvider
      locale={locale}
      messages={messages as unknown as Record<string, string>}
    >
      {args.children}
    </IntlProvider>
  );
};

export default EmptyLayout;
