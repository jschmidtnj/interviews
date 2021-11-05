import React from 'react';
import { Switch, RouteProps } from 'react-router';
import { useIntl } from 'react-intl';

export const LocalizedSwitch: React.FC = ({ children }) => {
  const { formatMessage, locale } = useIntl();

  const localizeRoutePath = (path?: string | string[]) => {
    switch (typeof path) {
      case 'undefined':
        return undefined;
      case 'object':
        return path.map((key) => `/${locale}` + formatMessage({ id: key }));
      default:
        const isFallbackRoute = path === '*';
        return isFallbackRoute
          ? path
          : `/${locale}` + formatMessage({ id: path });
    }
  }

  return (
    <Switch>
      {React.Children.map(children, (child) =>
        React.isValidElement<RouteProps>(child)
          ? React.cloneElement(child, {
              ...child.props,
              path: localizeRoutePath(child.props.path as string),
            })
          : child
      )}
    </Switch>
  );
};
