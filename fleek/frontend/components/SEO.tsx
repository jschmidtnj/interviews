import React from 'react';
import { FunctionComponent } from 'react';
import Head from 'next/head'

interface SEOArgs {
  page: string;
}

const SEO: FunctionComponent<SEOArgs> = (args) => {
  return (
    <>
      <Head>
        <title>post it | {args.page}</title>
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}');
            `,
          }}
        />
      </Head>
    </>
  );
};

export default SEO;
