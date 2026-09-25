import React from 'react';
import { PrismLight as SyntaxHighlighter, SyntaxHighlighterProps } from 'react-syntax-highlighter';
import oneLight from 'react-syntax-highlighter/dist/esm/styles/prism/one-light';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import c from 'react-syntax-highlighter/dist/esm/languages/prism/c';
import cpp from 'react-syntax-highlighter/dist/esm/languages/prism/cpp';
import docker from 'react-syntax-highlighter/dist/esm/languages/prism/docker';
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';

// Only the languages used by projects.ts and the PEFT article; others render as plain text.
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('c', c);
SyntaxHighlighter.registerLanguage('cpp', cpp);
SyntaxHighlighter.registerLanguage('docker', docker);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('python', python);

const CodeBlock: React.FC<SyntaxHighlighterProps> = (props) => (
    <SyntaxHighlighter style={oneLight} {...props} />
);

export default CodeBlock;
