import React, { LegacyRef, FunctionComponent } from 'react';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import { LightAsync as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/cjs/styles/hljs';
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import ChakraUIRenderer from 'chakra-ui-markdown-renderer'
import { chakra } from '@chakra-ui/react';

interface MarkdownArgs {
  content: string;
}

const Markdown: FunctionComponent<MarkdownArgs> = (args) => {
  return (
    args.content.length === 0 ? (
      <chakra.div>{'<'}no content{'>'}</chakra.div>
    ) : (
      <ReactMarkdown
        components={{
          ...ChakraUIRenderer(),
          code({node, inline, className, children, ...props}) {
            const match = /language-(\w+)/.exec(className || '')
            return !inline && match ? (
              <SyntaxHighlighter
                children={String(children).replace(/\n$/, '')}
                style={docco}
                language={match[1]}
                PreTag="div"
                {...props}
                ref={props.ref as LegacyRef<SyntaxHighlighter> | undefined}
              />
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            )
          }
        }}
        plugins={[gfm]}
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {args.content}
      </ReactMarkdown>
    )
  );
};

export default Markdown;
