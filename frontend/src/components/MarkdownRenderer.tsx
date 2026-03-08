import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
}

const markdownComponents: Components = {
  p: ({ node, ...props }) => <p style={{ marginBottom: '1.2em' }} {...props} />,
  h1: ({ node, ...props }) => <h1 style={{ marginTop: '1.5em', marginBottom: '0.8em' }} {...props} />,
  h2: ({ node, ...props }) => <h2 style={{ marginTop: '1.4em', marginBottom: '0.7em' }} {...props} />,
  h3: ({ node, ...props }) => <h3 style={{ marginTop: '1.3em', marginBottom: '0.6em' }} {...props} />,
  h4: ({ node, ...props }) => <h4 style={{ marginTop: '1.2em', marginBottom: '0.5em' }} {...props} />,
  h5: ({ node, ...props }) => <h5 style={{ marginTop: '1.1em', marginBottom: '0.4em' }} {...props} />,
  h6: ({ node, ...props }) => <h6 style={{ marginTop: '1em', marginBottom: '0.3em' }} {...props} />,
  ul: ({ node, ...props }) => <ul style={{ marginBottom: '1em', paddingLeft: '1.5em' }} {...props} />,
  ol: ({ node, ...props }) => <ol style={{ marginBottom: '1em', paddingLeft: '1.5em' }} {...props} />,
  li: ({ node, ...props }) => <li style={{ marginBottom: '0.5em' }} {...props} />,
  hr: ({ node, ...props }) => <hr style={{ margin: '2em 0', borderColor: '#e0e0e0' }} {...props} />,
  blockquote: ({ node, ...props }) => (
    <blockquote
      style={{ margin: '1.5em 0', padding: '1em', backgroundColor: '#f9f9f9', borderLeft: '4px solid #d1d5db' }}
      {...props}
    />
  ),
  code: ({ node, inline, ...props }) =>
    inline ? (
      <code
        style={{ backgroundColor: '#f3f4f6', padding: '0.2em 0.4em', borderRadius: '3px', fontSize: '0.9em' }}
        {...props}
      />
    ) : (
      <code
        style={{ display: 'block', backgroundColor: '#1f2937', color: '#e5e7eb', padding: '1em', borderRadius: '6px', overflowX: 'auto' }}
        {...props}
      />
    ),
  pre: ({ node, ...props }) => <pre style={{ marginBottom: '1.5em' }} {...props} />,
  a: ({ node, ...props }) => (
    <a style={{ color: '#1677ff', textDecoration: 'none' }} {...props}>
      {props.children}
    </a>
  ),
  strong: ({ node, ...props }) => <strong style={{ fontWeight: '600' }} {...props} />,
  em: ({ node, ...props }) => <em style={{ fontStyle: 'italic' }} {...props} />,
};

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div style={{ fontSize: '16px', lineHeight: 1.8 }}>
      <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
    </div>
  );
}
