/**
 * Syntax Highlighter for Code Blocks
 * Provides simple terminal-style syntax highlighting for various programming languages
 */

// Keywords to highlight in bold (**keyword**)
const KEYWORDS = [
  'function', 'const', 'let', 'var', 'if', 'else', 'for', 'while',
  'return', 'import', 'export', 'from', 'class', 'interface', 'type',
  'async', 'await', 'try', 'catch', 'throw', 'new', 'this', 'true', 'false'
];

// Pre-compiled regex patterns for better performance
// Keywords: match whole words only to avoid partial matches
const KEYWORD_PATTERNS = KEYWORDS.map(
  keyword => ({ keyword, regex: new RegExp(`\\b${keyword}\\b`, 'g') })
);

/**
 * Highlights code with terminal-style formatting
 * @param code - The code to highlight
 * @param language - Programming language (reserved for future language-specific syntax)
 * @returns Formatted code with markdown syntax
 */
export function highlightCode(code: string, language: string = ''): string {
  // language parameter reserved for future language-specific highlighting rules
  let highlighted = code;

  // Highlight keywords in bold using pre-compiled patterns
  KEYWORD_PATTERNS.forEach(({ keyword, regex }) => {
    highlighted = highlighted.replace(regex, `**${keyword}**`);
  });

  // Highlight strings (single and double quotes)
  highlighted = highlighted.replace(
    /(["'`])(?:(?!\1|\\).|\\.)*\1/g,
    (match) => `__${match}__`
  );

  // Highlight line comments (//) with italic emphasis
  highlighted = highlighted.replace(
    /(\/\/.*$)/gm,
    (match) => `__${match}__`
  );

  // Highlight block comments (/* */) with italic emphasis
  highlighted = highlighted.replace(
    /(\/\*[\s\S]*?\*\/)/g,
    (match) => `__${match}__`
  );

  return highlighted;
}

/**
 * Formats markdown text with code block highlighting
 * @param text - Markdown text to format
 * @returns Formatted text with ASCII-bordered code blocks
 */
export function formatMarkdown(text: string): string {
  // Match code blocks: ```language\ncode\n```
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;

  let formatted = text.replace(codeBlockRegex, (match, language, code) => {
    const highlighted = highlightCode(code, language);
    const lines = highlighted.split('\n');

    // Calculate max line length for border
    const maxLength = Math.max(...lines.map(line => line.length));

    // Build ASCII border box
    const topBorder = '┌' + '─'.repeat(maxLength + 2) + '┐';
    const bottomBorder = '└' + '─'.repeat(maxLength + 2) + '┘';

    // Add padding to each line
    const paddedLines = lines.map(line => {
      const padding = ' '.repeat(maxLength - line.length);
      return `│ ${line}${padding} │`;
    });

    return [topBorder, ...paddedLines, bottomBorder].join('\n');
  });

  // Convert inline code `code` to __code__
  formatted = formatted.replace(/`([^`]+)`/g, '__$1__');

  // Keep bold (**text**) and italic (*text*) as-is

  return formatted;
}
