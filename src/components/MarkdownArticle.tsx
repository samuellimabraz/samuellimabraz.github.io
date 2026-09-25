import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import CodeBlock from './CodeBlock';

const MarkdownArticle: React.FC<{ content: string }> = ({ content }) => (
    <ReactMarkdown
        components={{
            code({ className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                return match ? (
                    <CodeBlock
                        language={match[1]}
                        customStyle={{
                            background: '#ffffff',
                            color: '#24292F',
                        }}
                        {...props}
                    >
                        {String(children).replace(/\n$/, '')}
                    </CodeBlock>
                ) : (
                    <code className={className} {...props}>
                        {children}
                    </code>
                );
            },
            img({ src, alt, ...props }: any) {
                // Ensure images are properly displayed
                return (
                    <img
                        src={src}
                        alt={alt || ''}
                        className="max-w-full rounded-lg my-6"
                        {...props}
                    />
                );
            },
            a({ node, children, href, ...props }: any) {
                // Handle links
                return (
                    <a
                        href={href}
                        target={href?.startsWith('http') ? '_blank' : undefined}
                        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                        {...props}
                    >
                        {children}
                    </a>
                );
            },
            table({ children }: any) {
                return (
                    <div className="overflow-x-auto my-6">
                        <table>{children}</table>
                    </div>
                );
            }
        }}
        rehypePlugins={[
            rehypeRaw, // Allow HTML in markdown
            rehypeSlug, // Add ids to headings
            [rehypeAutolinkHeadings, { behavior: 'wrap' }] // Make headings clickable
        ]}
    >
        {content}
    </ReactMarkdown>
);

export default MarkdownArticle;
