import React from 'react';
import { FunctionComponent } from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOArgs {
  page: string;
}

const SEO: FunctionComponent<SEOArgs> = (args) => {
  return (
    <>
      <Helmet>
        <title>post it | {args.page}</title>
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.GOOGLE_ANALYTICS_ID}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.GOOGLE_ANALYTICS_ID}');
            `,
          }}
        />
      </Helmet>
    </>
  );
};

export default SEO;
