import React from 'react';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';

import 'highlight.js/styles/github.css';
// import 'katex/dist/katex.min.css'; // Import KaTeX CSS
import Markdown from 'react-markdown';

type MarkdownRendererProps = {
  content: string;
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <Markdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeRaw, rehypeHighlight, rehypeKatex]}
      components={{
        ul: ({ children }) => <ul className="list-disc pl-6 mb-2">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-6 mb-2">{children}</ol>,
        table: ({ children }) => (
          <div className="my-3 overflow-x-auto">
            <table className="table-auto border-collapse border border-gray-300 dark:border-gray-700">
              {children}
            </table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border border-gray-300 px-2 py-1 font-semibold text-gray-900 dark:border-gray-700 dark:bg-[#2f2f2f] dark:text-gray-100">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-gray-300 px-2 py-1 text-gray-900 dark:border-gray-700 dark:text-gray-100">
            {children}
          </td>
        ),
      }}
    >
      {content}
    </Markdown>
  );
};

export default MarkdownRenderer;
