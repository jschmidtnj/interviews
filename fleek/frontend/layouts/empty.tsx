import { FunctionComponent, ReactNode, useEffect, useState } from 'react';
import { IntlProvider } from 'react-intl';
import { useRouter } from 'next/dist/client/router';
import type Messages from 'locale/type';

interface LayoutArgs {
  children: ReactNode;
}

const EmptyLayout: FunctionComponent<LayoutArgs> = (args) => {
  const router = useRouter();

  const [messages, setMessages] = useState<Messages | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    (async () => {
      const importedMessages: Messages = (
        await import(`locale/${router.locale || 'en'}`)
      ).default;
      setMessages(importedMessages);
      setLoading(false);
    })();
  }, [router.locale]);

  return loading ? null : (
    <IntlProvider
      locale={router.locale || 'en'}
      messages={messages as unknown as Record<string, string>}
    >
      {args.children}
    </IntlProvider>
  );
};

export default EmptyLayout;
